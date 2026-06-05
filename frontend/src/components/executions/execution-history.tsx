"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Search,
} from "lucide-react";

import { ExecutionHistoryTable } from "@/components/executions/execution-history-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DEFAULT_EXECUTION_QUERY,
  filterExecutions,
  getStatusOptions,
  getWorkflowTypeOptions,
  paginateExecutions,
  sortExecutions,
  type ExecutionSortField,
} from "@/lib/executions";
import { workflowsApi } from "@/services/api/workflows";
import type { RecentExecutionItem } from "@/types/api";

export function ExecutionHistory() {
  const [executions, setExecutions] = useState<RecentExecutionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState(DEFAULT_EXECUTION_QUERY.search);
  const [status, setStatus] = useState(DEFAULT_EXECUTION_QUERY.status);
  const [workflowType, setWorkflowType] = useState(
    DEFAULT_EXECUTION_QUERY.workflowType
  );
  const [sortField, setSortField] = useState<ExecutionSortField>(
    DEFAULT_EXECUTION_QUERY.sortField
  );
  const [sortDirection, setSortDirection] = useState(
    DEFAULT_EXECUTION_QUERY.sortDirection
  );
  const [page, setPage] = useState(DEFAULT_EXECUTION_QUERY.page);
  const [pageSize, setPageSize] = useState(DEFAULT_EXECUTION_QUERY.pageSize);

  const loadExecutions = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await workflowsApi.listRecent();
      setExecutions(data);
    } catch (err) {
      setExecutions([]);
      setError(
        err instanceof Error ? err.message : "Failed to load execution history"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadExecutions();
  }, [loadExecutions]);

  useEffect(() => {
    setPage(1);
  }, [search, status, workflowType, pageSize]);

  const statusOptions = useMemo(
    () => getStatusOptions(executions),
    [executions]
  );
  const workflowTypeOptions = useMemo(
    () => getWorkflowTypeOptions(executions),
    [executions]
  );

  const processed = useMemo(() => {
    const filtered = filterExecutions(executions, {
      search,
      status,
      workflowType,
    });
    const sorted = sortExecutions(filtered, sortField, sortDirection);
    return paginateExecutions(sorted, { page, pageSize });
  }, [
    executions,
    search,
    status,
    workflowType,
    sortField,
    sortDirection,
    page,
    pageSize,
  ]);

  const handleSort = (field: ExecutionSortField) => {
    if (sortField === field) {
      setSortDirection((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }

    setSortField(field);
    setSortDirection(field === "created_at" ? "desc" : "asc");
  };

  const filters = (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <div className="space-y-2 xl:col-span-2">
        <Label htmlFor="execution-search">Search</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="execution-search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search workflow or status..."
            className="pl-9"
            disabled={loading || !!error}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="execution-status">Status</Label>
        <select
          id="execution-status"
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          disabled={loading || !!error}
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="all">All statuses</option>
          {statusOptions.map((option) => (
            <option key={option} value={option}>
              {option.replace(/_/g, " ")}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="execution-workflow-type">Workflow type</Label>
        <select
          id="execution-workflow-type"
          value={workflowType}
          onChange={(event) => setWorkflowType(event.target.value)}
          disabled={loading || !!error}
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="all">All workflows</option>
          {workflowTypeOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
    </div>
  );

  const pagination = (
    <div className="flex flex-col gap-4 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <span>
          Page{" "}
          <span className="font-medium text-foreground">{processed.page}</span>{" "}
          of{" "}
          <span className="font-medium text-foreground">
            {processed.totalPages}
          </span>
        </span>
        <span aria-hidden>·</span>
        <span>
          <span className="font-medium text-foreground">
            {processed.totalItems}
          </span>{" "}
          execution{processed.totalItems === 1 ? "" : "s"}
        </span>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2">
          <Label htmlFor="execution-page-size" className="sr-only">
            Rows per page
          </Label>
          <select
            id="execution-page-size"
            value={pageSize}
            onChange={(event) => setPageSize(Number(event.target.value))}
            disabled={loading || !!error || processed.totalItems === 0}
            className="flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {[10, 20, 50].map((size) => (
              <option key={size} value={size}>
                {size} / page
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={
              loading || !!error || processed.page <= 1 || processed.totalItems === 0
            }
            onClick={() => setPage((current) => Math.max(1, current - 1))}
          >
            <ChevronLeft className="size-4" />
            Previous
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={
              loading ||
              !!error ||
              processed.page >= processed.totalPages ||
              processed.totalItems === 0
            }
            onClick={() =>
              setPage((current) => Math.min(processed.totalPages, current + 1))
            }
          >
            Next
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );

  if (error) {
    return (
      <div className="space-y-6">
        {filters}
        <div
          role="alert"
          className="flex flex-col gap-4 rounded-xl border border-destructive/30 bg-destructive/5 p-5 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex gap-3">
            <AlertCircle className="size-5 shrink-0 text-destructive" />
            <div>
              <p className="text-sm font-medium text-foreground">
                Could not load executions
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{error}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => void loadExecutions()}>
            <RefreshCw className="size-4" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!loading && executions.length === 0) {
    return (
      <div className="space-y-6">
        {filters}
        <div className="rounded-xl border border-dashed border-border py-16 text-center">
          <p className="text-sm font-medium text-foreground">
            No executions yet
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Run a workflow to populate execution history.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {filters}

      {!loading && processed.totalItems === 0 ? (
        <div className="rounded-xl border border-dashed border-border py-16 text-center">
          <p className="text-sm font-medium text-foreground">
            No executions match your filters
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Adjust search or filter criteria to see results.
          </p>
        </div>
      ) : (
        <>
          <ExecutionHistoryTable
            items={processed.items}
            loading={loading}
            sortField={sortField}
            sortDirection={sortDirection}
            onSort={handleSort}
          />
          {pagination}
        </>
      )}
    </div>
  );
}
