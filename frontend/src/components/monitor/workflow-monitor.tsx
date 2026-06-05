"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Activity, AlertCircle, RefreshCw, Wifi, WifiOff } from "lucide-react";

import { ActiveExecutionsTable } from "@/components/monitor/active-executions-table";
import { RealtimeEventsFeed } from "@/components/monitor/realtime-events-feed";
import { SelectedExecutionPanel } from "@/components/monitor/selected-execution-panel";
import { WorkflowTimeline } from "@/components/workflows/workflow-timeline";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useWorkflowEvents } from "@/hooks/use-workflow-events";
import {
  buildMonitoredExecutions,
  findMonitoredExecution,
  getActiveExecutions,
  getEventsForThread,
  getLatestThreadId,
} from "@/lib/workflow-monitor";
import { workflowsApi } from "@/services/api";
import type { WorkflowExecution } from "@/types/api";

const CONNECTION_STATUS_LABELS = {
  idle: "Offline",
  connecting: "Connecting",
  connected: "Live",
  disconnected: "Disconnected",
  reconnecting: "Reconnecting",
  error: "Connection error",
} as const;

const POLL_INTERVAL_MS = 5_000;

export function WorkflowMonitor() {
  const { events, connectionStatus } = useWorkflowEvents({ maxEvents: 500 });
  const [apiExecutions, setApiExecutions] = useState<WorkflowExecution[]>([]);
  const [loadingExecutions, setLoadingExecutions] = useState(true);
  const [executionError, setExecutionError] = useState<string | null>(null);
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);

  const loadActiveExecutions = useCallback(async () => {
    setExecutionError(null);

    try {
      const [running, awaitingReview] = await Promise.all([
        workflowsApi.listExecutions({ status: "running", limit: 25 }),
        workflowsApi.listExecutions({
          status: "awaiting_review",
          limit: 25,
        }),
      ]);

      const merged = new Map<string, WorkflowExecution>();
      for (const execution of [...running, ...awaitingReview]) {
        merged.set(execution.thread_id, execution);
      }

      setApiExecutions(Array.from(merged.values()));
    } catch (err) {
      setApiExecutions([]);
      setExecutionError(
        err instanceof Error ? err.message : "Failed to load active executions"
      );
    } finally {
      setLoadingExecutions(false);
    }
  }, []);

  useEffect(() => {
    void loadActiveExecutions();
    const interval = setInterval(() => {
      void loadActiveExecutions();
    }, POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [loadActiveExecutions]);

  const monitoredExecutions = useMemo(
    () => buildMonitoredExecutions(events, apiExecutions),
    [events, apiExecutions]
  );

  const activeExecutions = useMemo(
    () => getActiveExecutions(monitoredExecutions),
    [monitoredExecutions]
  );

  useEffect(() => {
    if (
      selectedThreadId &&
      monitoredExecutions.some(
        (execution) => execution.threadId === selectedThreadId
      )
    ) {
      return;
    }

    const preferred =
      activeExecutions[0]?.threadId ??
      monitoredExecutions[0]?.threadId ??
      getLatestThreadId(events);

    setSelectedThreadId(preferred);
  }, [activeExecutions, events, monitoredExecutions, selectedThreadId]);

  const selectedExecution = useMemo(
    () => findMonitoredExecution(monitoredExecutions, selectedThreadId),
    [monitoredExecutions, selectedThreadId]
  );

  const selectedTimelineEvents = useMemo(() => {
    if (!selectedThreadId) {
      return [];
    }

    return getEventsForThread(events, selectedThreadId);
  }, [events, selectedThreadId]);

  const connectionBadgeVariant =
    connectionStatus === "connected" ? "outline" : "muted";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={connectionBadgeVariant} className="gap-1.5">
            {connectionStatus === "connected" ? (
              <Wifi className="size-3.5" />
            ) : (
              <WifiOff className="size-3.5" />
            )}
            {CONNECTION_STATUS_LABELS[connectionStatus]}
          </Badge>
          <Badge variant="outline">
            {activeExecutions.length} active execution
            {activeExecutions.length === 1 ? "" : "s"}
          </Badge>
          <Badge variant="outline">
            {events.length} streamed event{events.length === 1 ? "" : "s"}
          </Badge>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => void loadActiveExecutions()}
        >
          <RefreshCw className="size-4" />
          Refresh executions
        </Button>
      </div>

      {executionError ? (
        <div
          role="alert"
          className="flex flex-col gap-4 rounded-xl border border-destructive/30 bg-destructive/5 p-5 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex gap-3">
            <AlertCircle className="size-5 shrink-0 text-destructive" />
            <div>
              <p className="text-sm font-medium text-foreground">
                Could not refresh active executions
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {executionError}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => void loadActiveExecutions()}
          >
            Retry
          </Button>
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Activity className="size-4" />
              Active executions
            </CardTitle>
            <CardDescription>
              Running and awaiting-review workflows updated from WebSocket
              events and periodic API sync.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ActiveExecutionsTable
              executions={activeExecutions}
              selectedThreadId={selectedThreadId}
              onSelect={setSelectedThreadId}
              loading={loadingExecutions}
            />
          </CardContent>
        </Card>

        <RealtimeEventsFeed
          events={events}
          selectedThreadId={selectedThreadId}
        />
      </div>

      <SelectedExecutionPanel execution={selectedExecution} />

      <WorkflowTimeline
        events={selectedTimelineEvents}
        title="Execution timeline"
        description={
          selectedThreadId
            ? `Node progress for thread ${selectedThreadId}`
            : "Select an execution to inspect its timeline."
        }
        emptyMessage="Select an active execution or run a workflow to view its timeline."
      />
    </div>
  );
}
