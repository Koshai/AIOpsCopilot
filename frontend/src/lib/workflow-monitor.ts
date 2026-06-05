import type { WorkflowExecution } from "@/types/api/workflow-execution";
import type { WorkflowEvent } from "@/types/workflow-timeline";

export interface MonitoredExecution {
  threadId: string;
  workflowType: string;
  status: string;
  currentNode: string | null;
  events: WorkflowEvent[];
  startedAt?: string;
  lastEventAt?: string;
}

const ACTIVE_STATUSES = new Set(["running", "awaiting_review"]);

function createExecution(
  threadId: string,
  partial: Partial<MonitoredExecution> = {}
): MonitoredExecution {
  return {
    threadId,
    workflowType: partial.workflowType ?? "unknown",
    status: partial.status ?? "running",
    currentNode: partial.currentNode ?? null,
    events: partial.events ?? [],
    startedAt: partial.startedAt,
    lastEventAt: partial.lastEventAt,
  };
}

function resolveThreadId(
  event: WorkflowEvent,
  fallbackThreadId: string | null
): string | null {
  return event.thread_id ?? fallbackThreadId;
}

function applyEvent(execution: MonitoredExecution, event: WorkflowEvent): void {
  execution.events.push(event);
  execution.lastEventAt = event.timestamp ?? execution.lastEventAt;

  if (event.workflow_type) {
    execution.workflowType = event.workflow_type;
  }

  switch (event.type) {
    case "workflow_started":
      execution.status = "running";
      execution.startedAt = event.timestamp ?? execution.startedAt;
      execution.currentNode = null;
      break;
    case "node_started":
      execution.status = "running";
      execution.currentNode = event.node ?? execution.currentNode;
      break;
    case "node_completed":
      if (execution.currentNode === event.node) {
        execution.currentNode = null;
      }
      break;
    case "approval_required":
      execution.status = "awaiting_review";
      execution.currentNode = event.node ?? "human_review";
      break;
    case "workflow_completed":
      execution.status = event.status ?? "completed";
      execution.currentNode = null;
      break;
    case "workflow_failed":
      execution.status = event.status ?? "failed";
      execution.currentNode = null;
      break;
  }
}

export function buildMonitoredExecutions(
  events: WorkflowEvent[],
  apiExecutions: WorkflowExecution[] = []
): MonitoredExecution[] {
  const byThread = new Map<string, MonitoredExecution>();
  let openThreadId: string | null = null;

  for (const execution of apiExecutions) {
    byThread.set(
      execution.thread_id,
      createExecution(execution.thread_id, {
        workflowType: execution.workflow_type,
        status: execution.status,
        startedAt: execution.started_at,
      })
    );
  }

  for (const event of events) {
    if (event.type === "workflow_started" && event.thread_id) {
      openThreadId = event.thread_id;
    }

    const threadId = resolveThreadId(event, openThreadId);
    if (!threadId) {
      continue;
    }

    const existing =
      byThread.get(threadId) ??
      createExecution(threadId, {
        workflowType: event.workflow_type,
      });

    applyEvent(existing, event);
    byThread.set(threadId, existing);

    if (event.type === "workflow_completed" || event.type === "workflow_failed") {
      if (openThreadId === threadId) {
        openThreadId = null;
      }
    }
  }

  return Array.from(byThread.values()).sort((left, right) => {
    const leftTime = left.lastEventAt ?? left.startedAt ?? "";
    const rightTime = right.lastEventAt ?? right.startedAt ?? "";
    return rightTime.localeCompare(leftTime);
  });
}

export function getActiveExecutions(
  executions: MonitoredExecution[]
): MonitoredExecution[] {
  return executions.filter((execution) => ACTIVE_STATUSES.has(execution.status));
}

export function getEventsForThread(
  events: WorkflowEvent[],
  threadId: string
): WorkflowEvent[] {
  let openThreadId: string | null = null;

  return events.filter((event) => {
    if (event.type === "workflow_started" && event.thread_id) {
      openThreadId = event.thread_id;
    }

    const eventThreadId = resolveThreadId(event, openThreadId);
    const matches = eventThreadId === threadId;

    if (
      (event.type === "workflow_completed" || event.type === "workflow_failed") &&
      event.thread_id === threadId
    ) {
      openThreadId = null;
    }

    return matches;
  });
}

export function findMonitoredExecution(
  executions: MonitoredExecution[],
  threadId: string | null
): MonitoredExecution | null {
  if (!threadId) {
    return null;
  }

  return executions.find((execution) => execution.threadId === threadId) ?? null;
}

export function getLatestThreadId(events: WorkflowEvent[]): string | null {
  for (let index = events.length - 1; index >= 0; index -= 1) {
    const event = events[index];
    if (event.thread_id) {
      return event.thread_id;
    }
  }

  return null;
}
