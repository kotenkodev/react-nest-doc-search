import { ProgressBar, Text, useTheme } from "@primer/react";
import { useEffect } from "react";
import type { DocumentItem } from "../types/document.type";
import { Card } from "@primer/react/experimental";
import {
  CheckCircleIcon,
  SyncIcon,
  UploadIcon,
  XCircleIcon,
} from "@primer/octicons-react";

export interface DocumentNotificationProps {
  userFilename: string;
  progress?: number; // 0 - 100 for S3 upload
  status: "uploading" | "pending" | "success" | "error";
  errorMessage?: string;
}

export default function Notification({
  userFilename,
  progress = 0,
  status,
  errorMessage,
}: DocumentNotificationProps) {
  return (
    <Card>
      {status === "uploading" && (
        <UploadIcon className="text-blue-500 shrink-0" />
      )}
      {status === "pending" && (
        <SyncIcon className="text-amber-500 animate-spin shrink-0" />
      )}
      {status === "success" && (
        <CheckCircleIcon className="text-green-500 shrink-0" />
      )}
      {status === "error" && <XCircleIcon className="text-red-500 shrink-0" />}

      <Text>{userFilename}</Text>

      {status === "uploading" && <ProgressBar animated progress={progress} />}
      {status === "error" && <Text>{errorMessage}</Text>}
      {status === "success" && <Text>Successfully indexed.</Text>}
    </Card>
  );
}

// toast.custom(
//   () => <DocumentNotification filename={file.name} status="uploading" progress={percent} />,
//   { id: toastId, duration: Infinity }
// );

// toast.custom(
//   () => <DocumentNotification filename={file.name} status="pending" />,
//   { id: toastId, duration: Infinity }
// );

// toast.custom(
//   () => <DocumentNotification filename={file.name} status="success" />,
//   { id: toastId, duration: 4000 }
// );
