import type { WorkflowExecutionStatus } from "@/types/api/workflow-execution";

export interface ReviewItem {
  id: number;
  workflow_type: string;
  thread_id: string;
  status: WorkflowExecutionStatus | string;
  document_id: number | null;
  document_name: string | null;
  created_at: string;
}

export interface ReviewQueueResponse {
  pending_approvals: ReviewItem[];
  total: number;
}

export interface ListReviewsParams {
  limit?: number;
}
