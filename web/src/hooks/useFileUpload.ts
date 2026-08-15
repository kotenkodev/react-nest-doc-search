import { useIsMutating } from "@tanstack/react-query";
import { useUploadDocumentMutation } from "./useDocuments";

const ACCEPTED_FILE_TYPES =
  ".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document";

export const useFileUpload = () => {
  const uploadMutation = useUploadDocumentMutation();
  const isMutating = useIsMutating({ mutationKey: ["uploadDocument"] }) > 0;

  const openFileDialog = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ACCEPTED_FILE_TYPES;
    input.onchange = (e) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];
      if (file) {
        uploadMutation.mutate(file);
      }
    };
    input.click();
  };

  return {
    openFileDialog,
    isUploading: isMutating || uploadMutation.isPending,
    progress: uploadMutation.progress,
  };
};
