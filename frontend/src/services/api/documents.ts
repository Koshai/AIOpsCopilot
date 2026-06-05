import type { Document } from "@/types/api";
import { apiClient, unwrap } from "@/lib/api/client";

export type UploadDocumentOptions = {
  file: File;
  workflowType: string;
  onProgress?: (progress: number) => void;
};

export const documentsApi = {
  /** GET /documents */
  list(): Promise<Document[]> {
    return unwrap(apiClient.get<Document[]>("/documents"));
  },

  /** POST /documents/upload */
  upload({
    file,
    workflowType,
    onProgress,
  }: UploadDocumentOptions): Promise<Document> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("workflow_type", workflowType);

    return unwrap(
      apiClient.post<Document>("/documents/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (event) => {
          if (!event.total || !onProgress) {
            return;
          }
          onProgress(Math.round((event.loaded * 100) / event.total));
        },
      })
    );
  },
};
