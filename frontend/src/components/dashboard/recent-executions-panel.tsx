"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertCircle, History, RefreshCw } from "lucide-react";

import { ExecutionStatusBadge } from "@/components/dashboard/execution-status-badge";
import { Button } from "@/components/ui/button";
import {
  formatDateTime,
  formatExecutionTime,
  formatWorkflowType,
} from "@/lib/format";
import { cn } from "@/lib/utils";
import { dashboardApi } from "@/services/api";
import type { RecentExecutionItem } from "@/types/api";

function LoadingSkeleton() {
  return (
    <div className="space-y-3" aria-hidden>
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className="flex animate-pulse items-center gap-4 rounded-lg border border-border/60 bg-muted/20 p-4"
        >
          <div className="h-4 w-24 rounded bg-muted" />
          <div className="h-5 w-20 rounded bg-muted" />
          <div className="ml-auto h-4 w-12 rounded bg-muted" />
        </div>
      ))}
    </div>
  );
}

function executionKey(item: RecentExecutionItem, index: number) {
  return `${item.workflow_type}-${item.created_at}-${index}`;
}

function ExecutionMobileCard({ item }: { item: RecentExecutionItem }) {
  return (
    <div className="rounded-lg border border-border bg-card/50 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-foreground">
            {formatWorkflowType(item.workflow_type)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {formatDateTime(item.created_at)}
          </p>
        </div>
        <ExecutionStatusBadge status={item.status} />
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        Duration{" "}
        <span className="font-medium tabular-nums text-foreground">
          {formatExecutionTime(item.execution_time)}
        </span>
      </p>
    </div>
  );
}

function ExecutionTableRow({ item }: { item: RecentExecutionItem }) {
  return (
    <tr className="border-b border-border/60 last:border-0">
      <td className="py-3 pr-4 text-sm font-medium text-foreground">
        {formatWorkflowType(item.workflow_type)}
      </td>
      <td className="py-3 pr-4">
        <ExecutionStatusBadge status={item.status} />
      </td>
      <td className="py-3 pr-4 text-sm tabular-nums text-muted-foreground">
        {formatExecutionTime(item.execution_time)}
      </td>
      <td className="py-3 text-sm text-muted-foreground">
        {formatDateTime(item.created_at)}
      </td>
    </tr>
  );
}

export function RecentExecutionsPanel({ className }: { className?: string }) {
  const [items, setItems] = useState<RecentExecutionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadActivity = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await dashboardApi.getRecentActivity();
      setItems(data);
    } catch (err) {
      setItems([]);
      setError(
        err instanceof Error ? err.message : "Failed to load recent executions"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadActivity();
  }, [loadActivity]);

  return (
    <section
      className={cn(
        "rounded-xl border border-border bg-card shadow-sm",
        className
      )}
    >
      <div className="flex items-center justify-between gap-4 border-b border-border px-5 py-4">
        <div className="flex items-center gap-2">
          <History className="size-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">
            Recent executions
          </h3>
        </div>
        {!loading && !error ? (
          <span className="text-xs text-muted-foreground">
            Latest {items.length} runs
          </span>
        ) : null}
      </div>

      <div className="p-5">
        {loading ? <LoadingSkeleton /> : null}

        {error ? (
          <div
            role="alert"
            className="flex flex-col gap-4 rounded-lg border border-destructive/30 bg-destructive/5 p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex gap-3">
              <AlertCircle className="size-5 shrink-0 text-destructive" />
              <div>
                <p className="text-sm font-medium text-foreground">
                  Could not load recent activity
                </p>
                <p className="mt-1 text-sm text-muted-foreground">{error}</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => void loadActivity()}
            >
              <RefreshCw className="size-4" />
              Retry
            </Button>
          </div>
        ) : null}

        {!loading && !error && items.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border py-10 text-center">
            <p className="text-sm font-medium text-foreground">
              No executions yet
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Run a workflow to see activity here.
            </p>
          </div>
        ) : null}

        {!loading && !error && items.length > 0 ? (
          <>
            <div className="space-y-3 md:hidden">
              {items.map((item, index) => (
                <ExecutionMobileCard
                  key={executionKey(item, index)}
                  item={item}
                />
              ))}
            </div>

            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[520px] text-left">
                <thead>
                  <tr className="border-b border-border text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    <th className="pb-3 pr-4 font-medium">Workflow</th>
                    <th className="pb-3 pr-4 font-medium">Status</th>
                    <th className="pb-3 pr-4 font-medium">Duration</th>
                    <th className="pb-3 font-medium">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => (
                    <ExecutionTableRow
                      key={executionKey(item, index)}
                      item={item}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : null}
      </div>
    </section>
  );
}
