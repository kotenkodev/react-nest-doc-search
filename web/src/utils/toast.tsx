import { toast } from "sonner";
import ToastNotification from "@/components/ToastNotification";

export const documentToast = {
  uploading: (userFilename: string, progress: number, toastId?: string) => {
    const id = toastId || `upload-${Date.now()}`;
    toast.custom(
      () => (
        <ToastNotification
          userFilename={userFilename}
          status="uploading"
          progress={progress}
        />
      ),
      { id, duration: Infinity },
    );
    return id;
  },

  pending: (userFilename: string, toastId: string) => {
    toast.custom(
      () => <ToastNotification userFilename={userFilename} status="pending" />,
      { id: toastId, duration: Infinity },
    );
  },

  success: (userFilename: string, message?: string, toastId?: string) => {
    toast.custom(
      () => (
        <ToastNotification
          userFilename={userFilename}
          status="success"
          successMessage={message || "Successfully uploaded."}
        />
      ),
      { id: toastId, duration: 4000 },
    );
  },

  error: (userFilename: string, errorMessage?: string, toastId?: string) => {
    toast.custom(
      () => (
        <ToastNotification
          userFilename={userFilename}
          status="error"
          errorMessage={errorMessage}
        />
      ),
      { id: toastId, duration: 5000 },
    );
  },
};
