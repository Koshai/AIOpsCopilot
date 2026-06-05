import { apiClient, unwrap } from "@/lib/api/client";
import type {
  ListReviewsParams,
  ReviewQueueResponse,
  WorkflowRunResponse,
} from "@/types/api";

export const reviewsApi = {
  /** GET /reviews */
  listPending(params?: ListReviewsParams): Promise<ReviewQueueResponse> {
    return unwrap(
      apiClient.get<ReviewQueueResponse>("/reviews", { params })
    );
  },

  /** POST /review/{threadId} — resume human review */
  approve(threadId: string): Promise<WorkflowRunResponse> {
    return unwrap(
      apiClient.post<WorkflowRunResponse>(
        `/review/${encodeURIComponent(threadId)}`
      )
    );
  },

  /** POST /review/{threadId}/reject — decline human review */
  reject(threadId: string): Promise<WorkflowRunResponse> {
    return unwrap(
      apiClient.post<WorkflowRunResponse>(
        `/review/${encodeURIComponent(threadId)}/reject`
      )
    );
  },
};
