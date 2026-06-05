/** Request body for POST /workflow/execute and POST /workflow/multi-agent. */
export interface WorkflowRunRequest {
  question: string;
  thread_id: string;
  workflow_type?: string;
  document_id?: number | null;
  filename?: string | null;
  search_all_documents?: boolean;
}

export interface DocumentScope {
  document_id: number | null;
  filename: string | null;
  file_type: string | null;
}

export interface WorkflowRunExecutionSummary {
  id: number;
  workflow_type: string;
  thread_id: string;
  status: string;
  document_id: number | null;
  started_at: string;
  completed_at: string | null;
  execution_time: number | null;
  requires_review: boolean;
}

/** Workflow graph response shape (varies by workflow_type; not fully typed yet). */
export interface WorkflowRunResponse {
  execution?: WorkflowRunExecutionSummary;
  execution_time?: number;
  document_scope?: DocumentScope;
  [key: string]: unknown;
}
