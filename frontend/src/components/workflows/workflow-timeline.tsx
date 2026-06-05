import {
  AlertTriangle,
  Check,
  Circle,
  Clock,
  Loader2,
  X,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatDateTime } from "@/lib/format";
import { normalizeWorkflowEvents } from "@/lib/workflow-timeline";
import { cn } from "@/lib/utils";
import type {
  WorkflowEvent,
  WorkflowTimelineItem,
  WorkflowTimelineItemStatus,
} from "@/types/workflow-timeline";

type WorkflowTimelineProps = {
  events: WorkflowEvent[];
  className?: string;
  title?: string;
  description?: string;
  emptyMessage?: string;
};

const STATUS_LABELS: Record<WorkflowTimelineItemStatus, string> = {
  completed: "Completed",
  running: "Running",
  approval: "Approval required",
  pending: "Pending",
  failed: "Failed",
};

const STATUS_SYMBOLS: Record<WorkflowTimelineItemStatus, string | null> = {
  completed: "✓",
  running: "⏳",
  approval: "⚠",
  pending: null,
  failed: "✗",
};

function TimelineStatusIcon({
  status,
  className,
}: {
  status: WorkflowTimelineItemStatus;
  className?: string;
}) {
  switch (status) {
    case "completed":
      return (
        <span
          className={cn(
            "flex size-8 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
            className
          )}
          aria-hidden
        >
          <Check className="size-4" />
        </span>
      );
    case "running":
      return (
        <span
          className={cn(
            "flex size-8 items-center justify-center rounded-full border border-sky-500/30 bg-sky-500/10 text-sky-400",
            className
          )}
          aria-hidden
        >
          <Loader2 className="size-4 animate-spin" />
        </span>
      );
    case "approval":
      return (
        <span
          className={cn(
            "flex size-8 items-center justify-center rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-400",
            className
          )}
          aria-hidden
        >
          <AlertTriangle className="size-4" />
        </span>
      );
    case "failed":
      return (
        <span
          className={cn(
            "flex size-8 items-center justify-center rounded-full border border-destructive/30 bg-destructive/10 text-destructive",
            className
          )}
          aria-hidden
        >
          <X className="size-4" />
        </span>
      );
    default:
      return (
        <span
          className={cn(
            "flex size-8 items-center justify-center rounded-full border border-border bg-muted text-muted-foreground",
            className
          )}
          aria-hidden
        >
          <Circle className="size-3.5" />
        </span>
      );
  }
}

function TimelineEntryCard({ item }: { item: WorkflowTimelineItem }) {
  const statusSymbol = STATUS_SYMBOLS[item.status];

  return (
    <Card
      className={cn(
        "border shadow-none",
        item.status === "completed" && "border-emerald-500/20 bg-emerald-500/5",
        item.status === "running" && "border-sky-500/20 bg-sky-500/5",
        item.status === "approval" && "border-amber-500/20 bg-amber-500/5",
        item.status === "failed" && "border-destructive/20 bg-destructive/5"
      )}
    >
      <CardHeader className="gap-2 p-4 pb-2">
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="text-sm font-medium">{item.title}</CardTitle>
          <span
            className={cn(
              "shrink-0 text-xs font-medium",
              item.status === "completed" && "text-emerald-400",
              item.status === "running" && "text-sky-400",
              item.status === "approval" && "text-amber-400",
              item.status === "pending" && "text-muted-foreground",
              item.status === "failed" && "text-destructive"
            )}
          >
            {statusSymbol ? `${statusSymbol} ` : null}
            {STATUS_LABELS[item.status]}
          </span>
        </div>
        {item.description ? (
          <CardDescription className="text-sm">{item.description}</CardDescription>
        ) : null}
      </CardHeader>
      {item.timestamp ? (
        <CardContent className="p-4 pt-0">
          <time
            className="text-xs text-muted-foreground"
            dateTime={item.timestamp}
          >
            {formatDateTime(item.timestamp)}
          </time>
        </CardContent>
      ) : null}
    </Card>
  );
}

function TimelineRow({
  item,
  isLast,
}: {
  item: WorkflowTimelineItem;
  isLast: boolean;
}) {
  return (
    <li className="relative flex gap-4 pb-6 last:pb-0">
      {!isLast ? (
        <span
          className="absolute left-4 top-8 h-[calc(100%-1rem)] w-px -translate-x-1/2 bg-border"
          aria-hidden
        />
      ) : null}

      <div className="relative z-10 shrink-0">
        <TimelineStatusIcon status={item.status} />
      </div>

      <div className="min-w-0 flex-1 pt-0.5">
        <TimelineEntryCard item={item} />
      </div>
    </li>
  );
}

/**
 * Visualize workflow execution progress from a stream of workflow events.
 */
export function WorkflowTimeline({
  events,
  className,
  title = "Execution timeline",
  description = "LangGraph node progress and workflow lifecycle events.",
  emptyMessage = "Run a workflow to see execution progress.",
}: WorkflowTimelineProps) {
  const items = normalizeWorkflowEvents(events);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Clock className="size-4" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-muted/10 px-4 py-10 text-center">
            <p className="text-sm font-medium text-foreground">
              No timeline events yet
            </p>
            <p className="mt-1 text-sm text-muted-foreground">{emptyMessage}</p>
          </div>
        ) : (
          <ol className="relative" aria-label="Workflow execution timeline">
            {items.map((item, index) => (
              <TimelineRow
                key={item.id}
                item={item}
                isLast={index === items.length - 1}
              />
            ))}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}
