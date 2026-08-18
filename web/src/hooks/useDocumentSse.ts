import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/useAuthStore";
import { documentToast } from "@/utils/toast";

export interface DocumentSsePayload {
  type: "document.created" | "document.updated" | "document.deleted";
  ownerEmail: string;
  data: {
    id: string;
    userFilename?: string;
    status?: "pending" | "success" | "error";
    error?: string | null;
    [key: string]: unknown;
  };
}

export const useDocumentSse = () => {
  const queryClient = useQueryClient();
  const email = useAuthStore((state) => state.email);

  useEffect(() => {
    if (!email) return;

    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
    const eventSource = new EventSource(
      `${apiUrl}/sse?email=${encodeURIComponent(email)}`,
    );

    eventSource.onmessage = (event) => {
      try {
        const payload: DocumentSsePayload = JSON.parse(event.data);

        if (payload.type === "document.updated") {
          queryClient.invalidateQueries({ queryKey: ["documents"] });

          const filename = payload.data.userFilename || "Document";
          if (payload.data.status === "success") {
            documentToast.success(
              filename,
              "Processing complete and indexed for search.",
            );
          } else if (payload.data.status === "error") {
            documentToast.error(
              filename,
              payload.data.error || "Failed to process document",
            );
          }
        }
      } catch (error) {
        console.error("Failed to parse SSE event:", error);
      }
    };

    eventSource.onerror = (error) => {
      console.error("SSE connection error:", error);
    };

    return () => {
      eventSource.close();
    };
  }, [email, queryClient]);
};
