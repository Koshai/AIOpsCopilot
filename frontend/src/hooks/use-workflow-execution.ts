"use client";

import { useCallback, useState } from "react";

import { workflowExecutionService } from "@/services/workflow-execution-service";
import type { WorkflowExecutionResult } from "@/types/api/workflow-execution-result";
import { WorkflowExecutionError } from "@/types/api/workflow-execution-result";

export type WorkflowExecuteInput = {
  workflow_type: string;
  question: string;
  document_id?: number | null;
};

export function useWorkflowExecution() {
  const [result, setResult] = useState<WorkflowExecutionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<WorkflowExecutionError | null>(null);

  const execute = useCallback(async (input: WorkflowExecuteInput) => {
    const question = input.question.trim();
    const workflowType = input.workflow_type.trim();
    const documentId = input.document_id ?? null;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const executionResult = await workflowExecutionService.execute({
        question,
        workflow_type: workflowType,
        document_id: documentId,
        search_all_documents: documentId == null,
      });

      setResult(executionResult);
      return executionResult;
    } catch (err) {
      const executionError =
        err instanceof WorkflowExecutionError
          ? err
          : new WorkflowExecutionError(
              err instanceof Error ? err.message : "Could not execute workflow.",
              { code: "UNKNOWN", cause: err }
            );

      setError(executionError);
      throw executionError;
    } finally {
      setLoading(false);
    }
  }, []);

  return { execute, result, loading, error };
}
