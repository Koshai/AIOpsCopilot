export type {
  ApprovalRequiredEvent,
  NodeCompletedEvent,
  NodeStartedEvent,
  WorkflowCompletedEvent,
  WorkflowEvent,
  WorkflowFailedEvent,
  WorkflowMonitoringEvent,
  WorkflowMonitoringEventBase,
  WorkflowMonitoringEventType,
  WorkflowStartedEvent,
} from "@/types/workflow-monitoring-event";
export {
  isWorkflowMonitoringEvent,
  isWorkflowMonitoringEventType,
  WORKFLOW_MONITORING_EVENT_TYPES,
} from "@/types/workflow-monitoring-event";

import type {
  WorkflowMonitoringEvent,
  WorkflowMonitoringEventType,
} from "@/types/workflow-monitoring-event";

/** Alias for timeline and websocket consumers. */
export type WorkflowTimelineEvent = WorkflowMonitoringEvent;

export type WorkflowTimelineEventType = WorkflowMonitoringEventType;

export type WorkflowTimelineItemStatus =
  | "completed"
  | "running"
  | "approval"
  | "pending"
  | "failed";

export interface WorkflowTimelineItem {
  id: string;
  kind: WorkflowTimelineEventType | "node";
  node?: string;
  title: string;
  description?: string;
  status: WorkflowTimelineItemStatus;
  timestamp?: string;
}
