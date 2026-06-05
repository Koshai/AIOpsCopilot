import { apiClient, unwrap } from "@/lib/api/client";
import type { DashboardSummary, RecentExecutionItem } from "@/types/api";

export const dashboardApi = {
  /** GET /dashboard/summary */
  getSummary(): Promise<DashboardSummary> {
    return unwrap(apiClient.get<DashboardSummary>("/dashboard/summary"));
  },

  /** GET /executions/recent */
  getRecentActivity(): Promise<RecentExecutionItem[]> {
    return unwrap(apiClient.get<RecentExecutionItem[]>("/executions/recent"));
  },
};
