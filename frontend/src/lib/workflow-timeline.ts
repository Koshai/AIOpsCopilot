import { formatWorkflowType } from "@/lib/format";
import type { WorkflowExecutionResult } from "@/types/api/workflow-execution-result";
import type {
  WorkflowEvent,
  WorkflowTimelineEvent,
  WorkflowTimelineItem,
} from "@/types/workflow-timeline";

const DEFAULT_PIPELINE_NODES = [
  "retrieve",
  "extract",
  "validate",
  "anomaly",
] as const;

export function formatWorkflowNodeName(node: string): string {
  return node
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function normalizeWorkflowTimelineEvents(
  events: WorkflowEvent[]
): WorkflowTimelineItem[] {
  const items: WorkflowTimelineItem[] = [];
  const openNodes = new Map<string, WorkflowTimelineItem>();

  for (const event of events) {
    switch (event.type) {
      case "workflow_started":
        items.push({
          id: event.id,
          kind: "workflow_started",
          title: "Workflow started",
          description: event.message,
          status: "running",
          timestamp: event.timestamp,
        });
        break;

      case "node_started": {
        const node = event.node ?? "node";
        const item: WorkflowTimelineItem = {
          id: event.id,
          kind: "node",
          node,
          title: formatWorkflowNodeName(node),
          description: event.message ?? "Executing node...",
          status: "running",
          timestamp: event.timestamp,
        };
        items.push(item);
        openNodes.set(node, item);
        break;
      }

      case "node_completed": {
        const node = event.node ?? "node";
        const existing = openNodes.get(node);

        if (existing) {
          existing.status = "completed";
          existing.description = event.message ?? "Node completed";
          if (event.timestamp) {
            existing.timestamp = event.timestamp;
          }
        } else {
          items.push({
            id: event.id,
            kind: "node",
            node,
            title: formatWorkflowNodeName(node),
            description: event.message ?? "Node completed",
            status: "completed",
            timestamp: event.timestamp,
          });
        }

        openNodes.delete(node);
        break;
      }

      case "approval_required":
        items.push({
          id: event.id,
          kind: "approval_required",
          title: "Approval required",
          description:
            event.message ?? "Human review is required before continuing.",
          status: "approval",
          timestamp: event.timestamp,
        });
        break;

      case "workflow_completed": {
        const started = items.find((item) => item.kind === "workflow_started");
        if (started) {
          started.status = "completed";
        }

        items.push({
          id: event.id,
          kind: "workflow_completed",
          title: "Workflow completed",
          description: event.message,
          status: "completed",
          timestamp: event.timestamp,
        });
        break;
      }

      case "workflow_failed": {
        const started = items.find((item) => item.kind === "workflow_started");
        if (started) {
          started.status = "failed";
        }

        items.push({
          id: event.id,
          kind: "workflow_failed",
          title: "Workflow failed",
          description: event.message ?? event.error ?? "Workflow execution failed.",
          status: "failed",
          timestamp: event.timestamp,
        });
        break;
      }
    }
  }

  return items;
}

/** Normalize raw workflow events into timeline display items. */
export const normalizeWorkflowEvents = normalizeWorkflowTimelineEvents;

export function createRunningTimeline(
  workflowType: string,
  threadId: string = crypto.randomUUID()
): WorkflowTimelineEvent[] {
  const timestamp = new Date().toISOString();

  return [
    {
      id: "workflow-started",
      type: "workflow_started",
      workflow_type: workflowType,
      thread_id: threadId,
      timestamp,
      message: `${formatWorkflowType(workflowType)} workflow is running...`,
    },
  ];
}

export function buildTimelineFromExecution(
  result: WorkflowExecutionResult,
  nodes: readonly string[] = DEFAULT_PIPELINE_NODES
): WorkflowTimelineEvent[] {
  const threadId = result.thread_id;
  const workflowType = result.execution.workflow_type;
  const startedAt = result.execution.started_at;
  const completedAt = result.execution.completed_at ?? new Date().toISOString();

  const events: WorkflowTimelineEvent[] = [
    {
      id: "workflow-started",
      type: "workflow_started",
      workflow_type: workflowType,
      thread_id: threadId,
      timestamp: startedAt,
      message: `${formatWorkflowType(workflowType)} workflow started`,
    },
  ];

  for (const node of nodes) {
    events.push({
      id: `${node}-started`,
      type: "node_started",
      workflow_type: workflowType,
      thread_id: threadId,
      timestamp: startedAt,
      node,
      message: `${formatWorkflowNodeName(node)} started`,
    });
    events.push({
      id: `${node}-completed`,
      type: "node_completed",
      workflow_type: workflowType,
      thread_id: threadId,
      timestamp: completedAt,
      node,
      message: `${formatWorkflowNodeName(node)} completed`,
    });
  }

  if (
    result.status === "awaiting_review" ||
    result.requires_human_review === true
  ) {
    events.push({
      id: "approval-required",
      type: "approval_required",
      workflow_type: workflowType,
      thread_id: threadId,
      timestamp: completedAt,
      message: "Human approval required before workflow can finish",
    });
    return events;
  }

  if (result.status === "failed") {
    events.push({
      id: "workflow-failed",
      type: "workflow_failed",
      workflow_type: workflowType,
      thread_id: threadId,
      timestamp: completedAt,
      status: result.status,
      message: `Workflow finished with status ${result.status}`,
    });
    return events;
  }

  events.push({
    id: "workflow-completed",
    type: "workflow_completed",
    workflow_type: workflowType,
    thread_id: threadId,
    timestamp: completedAt,
    status: result.status,
    message: `Workflow finished with status ${result.status}`,
  });

  return events;
}
