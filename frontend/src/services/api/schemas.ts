import { apiClient, unwrap } from "@/lib/api/client";
import type { WorkflowSchema } from "@/types/api";

export const schemasApi = {
  /** GET /schemas */
  list(): Promise<WorkflowSchema[]> {
    return unwrap(apiClient.get<WorkflowSchema[]>("/schemas"));
  },

  /** GET /workflows/{workflowType} */
  getByWorkflowType(workflowType: string): Promise<WorkflowSchema> {
    return unwrap(
      apiClient.get<WorkflowSchema>(`/workflows/${encodeURIComponent(workflowType)}`)
    );
  },
};
