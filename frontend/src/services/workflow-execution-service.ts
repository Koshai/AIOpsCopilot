import { getApiBaseUrl } from "@/lib/api/client";
import { getApiErrorMessage, getApiErrorStatusCode } from "@/lib/api/errors";
import { workflowsApi } from "@/services/api/workflows";
import type { WorkflowExecution } from "@/types/api/workflow-execution";
import type {
  ExtractionResult,
  WorkflowExecuteRequest,
  WorkflowExecutionErrorCode,
  WorkflowExecutionResult,
} from "@/types/api/workflow-execution-result";
import { WorkflowExecutionError } from "@/types/api/workflow-execution-result";
import type { DocumentScope, WorkflowRunResponse } from "@/types/api/workflow-run";

const EMPTY_DOCUMENT_SCOPE: DocumentScope = {
  document_id: null,
  filename: null,
  file_type: null,
};

function validateExecuteRequest(
  request: WorkflowExecuteRequest
): WorkflowExecuteRequest {
  const question = request.question?.trim();
  const workflowType = request.workflow_type?.trim();

  if (!question) {
    throw new WorkflowExecutionError("Question is required.", {
      code: "VALIDATION",
    });
  }

  if (!workflowType) {
    throw new WorkflowExecutionError("Workflow type is required.", {
      code: "VALIDATION",
    });
  }

  if (
    request.document_id != null &&
    (!Number.isInteger(request.document_id) || request.document_id <= 0)
  ) {
    throw new WorkflowExecutionError("Document id must be a positive integer.", {
      code: "VALIDATION",
    });
  }

  return {
    question,
    workflow_type: workflowType,
    document_id: request.document_id ?? null,
    search_all_documents: request.search_all_documents ?? false,
  };
}

function parseExtraction(payload: WorkflowRunResponse): ExtractionResult | null {
  const raw = payload.extraction;

  if (!raw || typeof raw !== "object") {
    return null;
  }

  const record = raw as Record<string, unknown>;
  const workflowType =
    typeof record.workflow_type === "string" ? record.workflow_type : "unknown";

  if (record.fields && typeof record.fields === "object") {
    return {
      workflow_type: workflowType,
      fields: record.fields as Record<string, unknown>,
    };
  }

  const { workflow_type: _workflowType, fields: _fields, ...rest } = record;

  if (Object.keys(rest).length === 0) {
    return null;
  }

  return {
    workflow_type: workflowType,
    fields: rest,
  };
}

function parseExecutionSummary(
  payload: WorkflowRunResponse
): WorkflowExecution {
  const execution = payload.execution;

  if (!execution) {
    throw new WorkflowExecutionError(
      "Workflow response did not include execution metadata.",
      { code: "PARSE" }
    );
  }

  return {
    id: execution.id,
    workflow_type: execution.workflow_type,
    thread_id: execution.thread_id,
    status: execution.status,
    document_id: execution.document_id ?? null,
    started_at: execution.started_at,
    completed_at: execution.completed_at ?? null,
    execution_time:
      execution.execution_time ??
      (typeof payload.execution_time === "number" ? payload.execution_time : null),
    requires_review: execution.requires_review,
  };
}

function parseWorkflowExecutionResult(
  payload: WorkflowRunResponse
): WorkflowExecutionResult {
  const execution = parseExecutionSummary(payload);

  return {
    execution,
    execution_time:
      typeof payload.execution_time === "number"
        ? payload.execution_time
        : execution.execution_time,
    document_scope: payload.document_scope ?? EMPTY_DOCUMENT_SCOPE,
    extraction: parseExtraction(payload),
    validation_passed:
      typeof payload.validation_passed === "boolean"
        ? payload.validation_passed
        : null,
    anomaly_detected:
      typeof payload.anomaly_detected === "boolean"
        ? payload.anomaly_detected
        : null,
    verifier_passed:
      typeof payload.verifier_passed === "boolean"
        ? payload.verifier_passed
        : null,
    human_approved:
      typeof payload.human_approved === "boolean" ? payload.human_approved : null,
    requires_human_review:
      typeof payload.requires_human_review === "boolean"
        ? payload.requires_human_review
        : null,
    thread_id: execution.thread_id,
    status: execution.status,
  };
}

function toWorkflowExecutionError(
  error: unknown,
  fallbackMessage: string
): WorkflowExecutionError {
  if (error instanceof WorkflowExecutionError) {
    return error;
  }

  const message = getApiErrorMessage(error, fallbackMessage);
  const statusCode = getApiErrorStatusCode(error);
  const code = inferErrorCode(error, message);

  return new WorkflowExecutionError(message, {
    code,
    statusCode,
    cause: error,
  });
}

function inferErrorCode(
  error: unknown,
  message: string
): WorkflowExecutionErrorCode {
  if (
    message.includes("Cannot reach API") ||
    message.toLowerCase().includes("network")
  ) {
    return "NETWORK";
  }

  const statusCode = getApiErrorStatusCode(error);
  if (statusCode != null) {
    return "API";
  }

  return "UNKNOWN";
}

export function getWorkflowExecutionErrorMessage(error: unknown): string {
  if (error instanceof WorkflowExecutionError) {
    return error.message;
  }

  return getApiErrorMessage(error, "Could not execute workflow.");
}

export const workflowExecutionService = {
  /**
   * Execute a workflow via POST /workflow/execute.
   * Generates a thread id server-side in the request payload.
   */
  async execute(request: WorkflowExecuteRequest): Promise<WorkflowExecutionResult> {
    const validated = validateExecuteRequest(request);

    try {
      const response = await workflowsApi.execute({
        question: validated.question,
        workflow_type: validated.workflow_type,
        document_id: validated.search_all_documents
          ? null
          : validated.document_id,
        search_all_documents: validated.search_all_documents,
        thread_id: crypto.randomUUID(),
      });

      return parseWorkflowExecutionResult(response);
    } catch (error) {
      throw toWorkflowExecutionError(
        error,
        `Failed to execute ${validated.workflow_type} workflow at ${getApiBaseUrl()}.`
      );
    }
  },
};
