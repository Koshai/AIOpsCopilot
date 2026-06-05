import {
  isWorkflowMonitoringEventType,
  type WorkflowMonitoringEvent,
} from "@/types/workflow-monitoring-event";

function readString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function buildMonitoringEvent(
  parsed: Record<string, unknown>
): WorkflowMonitoringEvent | null {
  const type = parsed.type;
  if (!isWorkflowMonitoringEventType(type)) {
    return null;
  }

  const threadId = readString(parsed.thread_id);
  const timestamp = readString(parsed.timestamp);
  if (!threadId || !timestamp) {
    return null;
  }

  const base = {
    id: readString(parsed.id) ?? crypto.randomUUID(),
    workflow_type: readString(parsed.workflow_type) ?? "unknown",
    thread_id: threadId,
    timestamp,
  };

  const message = readString(parsed.message) ?? undefined;

  switch (type) {
    case "workflow_started":
      return {
        ...base,
        type,
        message,
      };

    case "node_started":
    case "node_completed": {
      const node = readString(parsed.node);
      if (!node) {
        return null;
      }

      return {
        ...base,
        type,
        node,
        message,
      };
    }

    case "approval_required":
      return {
        ...base,
        type,
        node: readString(parsed.node) ?? undefined,
        message,
      };

    case "workflow_completed": {
      const status = readString(parsed.status);
      if (!status) {
        return null;
      }

      return {
        ...base,
        type,
        status,
        message,
      };
    }

    case "workflow_failed":
      return {
        ...base,
        type,
        status: readString(parsed.status) ?? undefined,
        message,
        error: readString(parsed.error) ?? undefined,
      };
  }
}

export function parseWorkflowEventMessage(
  raw: string
): WorkflowMonitoringEvent | null {
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    return buildMonitoringEvent(parsed);
  } catch {
    return null;
  }
}
