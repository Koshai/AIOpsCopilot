import { apiClient, unwrap } from "@/lib/api/client";
import type {
  ListExecutionsParams,
  RecentExecutionItem,
  WorkflowCatalogSummary,
  WorkflowDefinition,
  WorkflowExecution,
  WorkflowRunRequest,
  WorkflowRunResponse,
} from "@/types/api";

export const workflowsApi = {
  /** GET /workflow-definitions */
  listDefinitions(): Promise<WorkflowDefinition[]> {
    return unwrap(apiClient.get<WorkflowDefinition[]>("/workflow-definitions"));
  },

  /** GET /workflows — catalog summaries from schema registry */
  listCatalogSummaries(): Promise<WorkflowCatalogSummary[]> {
    return unwrap(apiClient.get<WorkflowCatalogSummary[]>("/workflows"));
  },

  /** GET /executions/recent */
  listRecent(): Promise<RecentExecutionItem[]> {
    return unwrap(apiClient.get<RecentExecutionItem[]>("/executions/recent"));
  },

  /** GET /executions */
  listExecutions(params?: ListExecutionsParams): Promise<WorkflowExecution[]> {
    return unwrap(
      apiClient.get<WorkflowExecution[]>("/executions", { params })
    );
  },

  /** GET /executions/{executionId} */
  getExecution(executionId: number): Promise<WorkflowExecution> {
    return unwrap(
      apiClient.get<WorkflowExecution>(`/executions/${executionId}`)
    );
  },

  /** GET /executions/thread/{threadId} */
  getExecutionByThread(threadId: string): Promise<WorkflowExecution> {
    return unwrap(
      apiClient.get<WorkflowExecution>(`/executions/thread/${threadId}`)
    );
  },

  /** POST /workflow/execute */
  execute(request: WorkflowRunRequest): Promise<WorkflowRunResponse> {
    return unwrap(
      apiClient.post<WorkflowRunResponse>("/workflow/execute", request)
    );
  },

  /** POST /workflow/multi-agent */
  executeMultiAgent(request: WorkflowRunRequest): Promise<WorkflowRunResponse> {
    return unwrap(
      apiClient.post<WorkflowRunResponse>("/workflow/multi-agent", request)
    );
  },
};
