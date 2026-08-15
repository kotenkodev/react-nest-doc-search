import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, type SubmitHandler } from "react-hook-form";
import { z } from "zod";
import {
  Button,
  Flash,
  FormControl,
  Spinner,
  Stack,
  TextInput,
} from "@primer/react";
import { MailIcon } from "@primer/octicons-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type AuthFormValues = z.infer<typeof loginSchema>;

export default function AuthForm() {
  const { setEmail } = useAuthStore();

  const navigate = useNavigate();
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<AuthFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit: SubmitHandler<AuthFormValues> = async (data) => {
    setIsSubmitting(true);
    try {
      setEmail(data.email);
      navigate("/");
    } catch (error) {
      console.error(error);
      setAuthError("Failed to login. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full">
      {authError && (
        <div className="mb-4">
          <Flash variant="danger">{authError}</Flash>
        </div>
      )}

      <div className="rounded-xl border border-(--borderColor-default,#d0d7de) bg-(--bgColor-default,#ffffff) p-5 shadow-sm">
        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack direction="vertical" gap="normal">
            <FormControl required>
              <FormControl.Label>Email address</FormControl.Label>
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <TextInput
                    block
                    type="email"
                    placeholder="name@example.com"
                    leadingVisual={MailIcon}
                    validationStatus={errors.email ? "error" : undefined}
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    ref={field.ref}
                  />
                )}
              />
              {errors.email && (
                <FormControl.Validation variant="error">
                  {errors.email.message || "Email is required"}
                </FormControl.Validation>
              )}
            </FormControl>

            <Button
              type="submit"
              variant="primary"
              block
              disabled={isSubmitting}
              className="mt-1"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <Spinner size="small" />
                  Signing in…
                </span>
              ) : (
                "Sign in"
              )}
            </Button>
          </Stack>
        </form>
      </div>
    </div>
  );
}
