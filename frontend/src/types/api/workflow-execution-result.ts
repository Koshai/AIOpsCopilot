import type {
  WorkflowExecution,
  WorkflowExecutionStatus,
} from "@/types/api/workflow-execution";
import type { DocumentScope } from "@/types/api/workflow-run";

/** Request body for POST /workflow/execute via the execution service. */
export interface WorkflowExecuteRequest {
  question: string;
  workflow_type: string;
  document_id?: number | null;
  search_all_documents?: boolean;
}

export interface ExtractionResult {
  workflow_type: string;
  fields: Record<string, unknown>;
}

/** Normalized response from POST /workflow/execute. */
export interface WorkflowExecutionResult {
  execution: WorkflowExecution;
  execution_time: number | null;
  document_scope: DocumentScope;
  extraction: ExtractionResult | null;
  validation_passed: boolean | null;
  anomaly_detected: boolean | null;
  verifier_passed: boolean | null;
  human_approved: boolean | null;
  requires_human_review: boolean | null;
  thread_id: string;
  status: WorkflowExecutionStatus | string;
}

export type WorkflowExecutionErrorCode =
  | "VALIDATION"
  | "NETWORK"
  | "API"
  | "PARSE"
  | "UNKNOWN";

export class WorkflowExecutionError extends Error {
  readonly code: WorkflowExecutionErrorCode;
  readonly statusCode?: number;

  constructor(
    message: string,
    options?: {
      code?: WorkflowExecutionErrorCode;
      statusCode?: number;
      cause?: unknown;
    }
  ) {
    super(message, { cause: options?.cause });
    this.name = "WorkflowExecutionError";
    this.code = options?.code ?? "UNKNOWN";
    this.statusCode = options?.statusCode;
  }
}
