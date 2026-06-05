export type DocumentProcessingStatus = "pending" | "indexed";

export interface Document {
  id: number;
  filename: string;
  file_type: string;
  created_at: string;
  processing_status: DocumentProcessingStatus;
}
