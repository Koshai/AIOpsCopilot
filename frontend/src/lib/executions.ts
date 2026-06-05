import type { RecentExecutionItem } from "@/types/api";

export type ExecutionSortField =
  | "created_at"
  | "workflow_type"
  | "status"
  | "execution_time";

export type SortDirection = "asc" | "desc";

export type ExecutionFilters = {
  search: string;
  status: string;
  workflowType: string;
};

export type ExecutionPagination = {
  page: number;
  pageSize: number;
};

export type ExecutionQuery = ExecutionFilters &
  ExecutionPagination & {
    sortField: ExecutionSortField;
    sortDirection: SortDirection;
  };

export const DEFAULT_EXECUTION_QUERY: ExecutionQuery = {
  search: "",
  status: "all",
  workflowType: "all",
  page: 1,
  pageSize: 10,
  sortField: "created_at",
  sortDirection: "desc",
};

export function filterExecutions(
  items: RecentExecutionItem[],
  filters: ExecutionFilters
): RecentExecutionItem[] {
  const search = filters.search.trim().toLowerCase();

  return items.filter((item) => {
    if (filters.status !== "all" && item.status !== filters.status) {
      return false;
    }

    if (
      filters.workflowType !== "all" &&
      item.workflow_type !== filters.workflowType
    ) {
      return false;
    }

    if (!search) {
      return true;
    }

    return (
      item.workflow_type.toLowerCase().includes(search) ||
      item.status.toLowerCase().includes(search)
    );
  });
}

export function sortExecutions(
  items: RecentExecutionItem[],
  sortField: ExecutionSortField,
  sortDirection: SortDirection
): RecentExecutionItem[] {
  const sorted = [...items].sort((left, right) => {
    switch (sortField) {
      case "workflow_type":
        return left.workflow_type.localeCompare(right.workflow_type);
      case "status":
        return left.status.localeCompare(right.status);
      case "execution_time":
        return (left.execution_time ?? -1) - (right.execution_time ?? -1);
      case "created_at":
      default:
        return (
          new Date(left.created_at).getTime() -
          new Date(right.created_at).getTime()
        );
    }
  });

  return sortDirection === "asc" ? sorted : sorted.reverse();
}

export function paginateExecutions<T>(
  items: T[],
  pagination: ExecutionPagination
): {
  items: T[];
  totalItems: number;
  totalPages: number;
  page: number;
  pageSize: number;
} {
  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pagination.pageSize));
  const page = Math.min(Math.max(1, pagination.page), totalPages);
  const start = (page - 1) * pagination.pageSize;

  return {
    items: items.slice(start, start + pagination.pageSize),
    totalItems,
    totalPages,
    page,
    pageSize: pagination.pageSize,
  };
}

export function getWorkflowTypeOptions(
  items: RecentExecutionItem[]
): string[] {
  return [...new Set(items.map((item) => item.workflow_type))].sort();
}

export function getStatusOptions(items: RecentExecutionItem[]): string[] {
  return [...new Set(items.map((item) => item.status))].sort();
}
