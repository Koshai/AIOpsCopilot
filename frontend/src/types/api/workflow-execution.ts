export type WorkflowExecutionStatus =
  | "running"
  | "completed"
  | "failed"
  | "awaiting_review";

export interface WorkflowExecution {
  id: number;
  workflow_type: string;
  thread_id: string;
  status: WorkflowExecutionStatus | string;
  document_id: number | null;
  started_at: string;
  completed_at: string | null;
  execution_time: number | null;
  requires_review: boolean;
}

export interface RecentExecutionItem {
  workflow_type: string;
  status: WorkflowExecutionStatus | string;
  execution_time: number | null;
  created_at: string;
}

export interface ListExecutionsParams {
  workflow_type?: string;
  status?: string;
  requires_review?: boolean;
  limit?: number;
}
