import AuthForm from "../components/AuthForm";
import { Heading, Text } from "@primer/react";
import logo from "@/assets/logo.svg";

export function Auth() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-(--bgColor-inset,#f6f8fa) px-4 py-10">
      <div className="flex w-full max-w-95 flex-col items-center gap-6 animate-[fadeInUp_0.5s_ease-out]">
        <div className="flex flex-col items-center gap-3">
          <img
            src={logo}
            alt="DocSearch logo"
            width={64}
            height={64}
            className="drop-shadow-md"
          />
          <Heading
            as="h1"
            className="text-[26px] font-semibold tracking-tight text-center"
          >
            Sign in to DocSearch
          </Heading>
          <Text className="text-sm text-(--fgColor-muted,#656d76)">
            Welcome to DocSearch. Enter your details to get started.
          </Text>
        </div>

        <AuthForm />
      </div>
    </div>
  );
}
