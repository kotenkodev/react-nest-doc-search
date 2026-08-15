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
    mutationFn: (id: string) => {
      deleteDocument(id);
    },
    onSuccess: () => {
      toast.success("Document deleted");
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete document");
    },
  });
};
