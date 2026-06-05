export const WORKFLOW_MONITORING_EVENT_TYPES = [
  "workflow_started",
  "node_started",
  "node_completed",
  "approval_required",
  "workflow_completed",
  "workflow_failed",
] as const;

export type WorkflowMonitoringEventType =
  (typeof WORKFLOW_MONITORING_EVENT_TYPES)[number];

/** Shared fields present on every workflow monitoring event. */
export interface WorkflowMonitoringEventBase {
  id: string;
  type: WorkflowMonitoringEventType;
  workflow_type: string;
  thread_id: string;
  timestamp: string;
}

export interface WorkflowStartedEvent extends WorkflowMonitoringEventBase {
  type: "workflow_started";
  message?: string;
}

export interface NodeStartedEvent extends WorkflowMonitoringEventBase {
  type: "node_started";
  node: string;
  message?: string;
}

export interface NodeCompletedEvent extends WorkflowMonitoringEventBase {
  type: "node_completed";
  node: string;
  message?: string;
}

export interface ApprovalRequiredEvent extends WorkflowMonitoringEventBase {
  type: "approval_required";
  node?: string;
  message?: string;
}

export interface WorkflowCompletedEvent extends WorkflowMonitoringEventBase {
  type: "workflow_completed";
  status: string;
  message?: string;
}

export interface WorkflowFailedEvent extends WorkflowMonitoringEventBase {
  type: "workflow_failed";
  status?: string;
  message?: string;
  error?: string;
}

export type WorkflowMonitoringEvent =
  | WorkflowStartedEvent
  | NodeStartedEvent
  | NodeCompletedEvent
  | ApprovalRequiredEvent
  | WorkflowCompletedEvent
  | WorkflowFailedEvent;

/** Alias for timeline and monitoring UI consumers. */
export type WorkflowEvent = WorkflowMonitoringEvent;

export function isWorkflowMonitoringEventType(
  value: unknown
): value is WorkflowMonitoringEventType {
  return (
    typeof value === "string" &&
    WORKFLOW_MONITORING_EVENT_TYPES.includes(value as WorkflowMonitoringEventType)
  );
}

export function isWorkflowMonitoringEvent(
  value: unknown
): value is WorkflowMonitoringEvent {
  if (!value || typeof value !== "object") {
    return false;
  }

  const record = value as Record<string, unknown>;

  if (!isWorkflowMonitoringEventType(record.type)) {
    return false;
  }

  if (typeof record.id !== "string" || !record.id.trim()) {
    return false;
  }

  if (typeof record.workflow_type !== "string" || !record.workflow_type.trim()) {
    return false;
  }

  if (typeof record.thread_id !== "string" || !record.thread_id.trim()) {
    return false;
  }

  if (typeof record.timestamp !== "string" || !record.timestamp.trim()) {
    return false;
  }

  switch (record.type) {
    case "node_started":
    case "node_completed":
      return typeof record.node === "string" && record.node.trim().length > 0;
    case "workflow_completed":
      return typeof record.status === "string" && record.status.trim().length > 0;
    default:
      return true;
  }
}
