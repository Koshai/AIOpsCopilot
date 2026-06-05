import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatDateTime } from "@/lib/format";
import { formatWorkflowNodeName } from "@/lib/workflow-timeline";
import { cn } from "@/lib/utils";
import type { WorkflowEvent } from "@/types/workflow-timeline";

const EVENT_LABELS: Record<WorkflowEvent["type"], string> = {
  workflow_started: "Workflow started",
  node_started: "Node started",
  node_completed: "Node completed",
  approval_required: "Approval required",
  workflow_completed: "Workflow completed",
  workflow_failed: "Workflow failed",
};

type RealtimeEventsFeedProps = {
  events: WorkflowEvent[];
  selectedThreadId?: string | null;
  className?: string;
};

function getEventNode(event: WorkflowEvent): string | null {
  if (
    event.type === "node_started" ||
    event.type === "node_completed" ||
    (event.type === "approval_required" && event.node)
  ) {
    return event.node ?? null;
  }

  return null;
}

function EventRow({ event }: { event: WorkflowEvent }) {
  const node = getEventNode(event);

  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline" className="font-mono text-[10px]">
          {EVENT_LABELS[event.type]}
        </Badge>
        <Badge variant="muted" className="font-mono text-[10px]">
          {event.workflow_type}
        </Badge>
        {node ? (
          <Badge variant="secondary" className="font-mono text-[10px]">
            {formatWorkflowNodeName(node)}
          </Badge>
        ) : null}
      </div>
      {event.message ? (
        <p className="mt-2 text-sm text-foreground">{event.message}</p>
      ) : null}
      {"error" in event && event.error ? (
        <p className="mt-2 text-sm text-destructive">{event.error}</p>
      ) : null}
      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
        <span className="truncate font-mono">{event.thread_id}</span>
        <span>{formatDateTime(event.timestamp)}</span>
      </div>
    </div>
  );
}

export function RealtimeEventsFeed({
  events,
  selectedThreadId,
  className,
}: RealtimeEventsFeedProps) {
  const filtered = selectedThreadId
    ? events.filter(
        (event) => !event.thread_id || event.thread_id === selectedThreadId
      )
    : events;

  const visible = [...filtered].reverse().slice(0, 30);

  return (
    <Card className={cn("flex flex-col", className)}>
      <CardHeader>
        <CardTitle className="text-base">Realtime events</CardTitle>
        <CardDescription>
          Latest workflow events from the WebSocket stream.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {visible.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border px-4 py-10 text-center">
            <p className="text-sm font-medium text-foreground">
              Waiting for events
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Run a workflow to populate the live operations feed.
            </p>
          </div>
        ) : (
          <div className="max-h-[32rem] space-y-3 overflow-y-auto pr-1">
            {visible.map((event) => (
              <EventRow key={event.id} event={event} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
