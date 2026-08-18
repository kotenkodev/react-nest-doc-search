import {
  deleteDocument,
  getDocuments,
  uploadDocument,
} from "@/services/documentService";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

import { documentToast } from "@/utils/toast";

export const useDocumentsQuery = (searchText?: string) => {
  return useQuery({
    queryKey: ["documents", searchText],
    queryFn: () => getDocuments(searchText),
  });
};

export const useUploadDocumentMutation = () => {
  const queryClient = useQueryClient();
  const [progress, setProgress] = useState<number>(0);
  const mutation = useMutation({
    mutationKey: ["uploadDocument"],
    mutationFn: async (file: File) => {
      const toastId = `upload-${Date.now()}`;

      const MAX_SIZE = 10 * 1024 * 1024;
      if (file.size > MAX_SIZE) {
        const errorMsg = "File size must not exceed 10MB";
        documentToast.error(file.name, errorMsg, toastId);
        throw new Error(errorMsg);
      }

      const isAllowedExt = /\.(pdf|docx)$/i.test(file.name);
      if (!isAllowedExt) {
        const errorMsg = "Invalid file type. Only .pdf and .docx files are allowed";
        documentToast.error(file.name, errorMsg, toastId);
        throw new Error(errorMsg);
      }

      documentToast.uploading(file.name, 0, toastId);

      try {
        const newDoc = await uploadDocument(file, (percent) => {
          setProgress(percent);
          if (percent >= 100) {
            documentToast.pending(file.name, toastId);
          } else {
            documentToast.uploading(file.name, percent, toastId);
          }
        });

        documentToast.success(file.name, "Successfully uploaded.", toastId);
        return newDoc;
      } catch (error: any) {
        const message =
          error.response?.data?.message || error.message || "Upload failed";
        documentToast.error(file.name, message, toastId);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
    onSettled: () => {
      setTimeout(() => setProgress(0), 1000);
    },
  });
  return {
    ...mutation,
    progress,
  };
};

export const useDeleteDocumentMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteDocument(id),
    onSuccess: () => {
      toast.success("Document deleted");
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete document");
    },
  });
};
