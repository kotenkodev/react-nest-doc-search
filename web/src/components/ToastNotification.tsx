import { ProgressBar, Text } from "@primer/react";
import {
  CheckCircleIcon,
  SyncIcon,
  UploadIcon,
  XCircleIcon,
} from "@primer/octicons-react";
import { Card } from "@primer/react/experimental";

export interface ToastNotificationProps {
  userFilename: string;
  progress?: number;
  status: "uploading" | "pending" | "success" | "error";
  errorMessage?: string;
  successMessage?: string;
}

export default function ToastNotification({
  userFilename,
  progress = 0,
  status,
  errorMessage,
  successMessage = "Success",
}: ToastNotificationProps) {
  return (
    <Card>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          {status === "uploading" && (
            <UploadIcon className="text-blue-500 shrink-0" size={16} />
          )}
          {status === "pending" && (
            <SyncIcon
              className="text-amber-500 animate-spin shrink-0"
              size={16}
            />
          )}
          {status === "success" && (
            <CheckCircleIcon className="text-green-500 shrink-0" size={16} />
          )}
          {status === "error" && (
            <XCircleIcon className="text-red-500 shrink-0" size={16} />
          )}

          <Text className="font-semibold text-sm truncate">{userFilename}</Text>
        </div>

        {status === "uploading" && (
          <Text className="text-xs font-mono text-gray-500 shrink-0">
            {progress}%
          </Text>
        )}
      </div>

      {status === "uploading" && (
        <div className="w-full">
          <ProgressBar animated progress={progress} />
        </div>
      )}

      {status === "pending" && (
        <Text className="text-xs text-amber-500">Uploading document...</Text>
      )}

      {status === "success" && (
        <Text className="text-xs text-green-500">{successMessage}</Text>
      )}

      {status === "error" && (
        <Text className="text-xs text-red-500 font-medium">
          {errorMessage || "Failed to process document"}
        </Text>
      )}
    </Card>
  );
}
