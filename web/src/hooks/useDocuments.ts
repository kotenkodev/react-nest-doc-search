import {
  deleteDocument,
  getDocuments,
  uploadDocument,
} from "@/services/documentService";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

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
    mutationFn: (file: File) => {
      setProgress(0);
      return uploadDocument(file, (percent) => setProgress(percent));
    },
    onSuccess: (newDoc) => {
      toast.success(`"${newDoc.userFilename}" uploaded successfully!`);
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || error.message || "Upload failed";
      toast.error(message);
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
