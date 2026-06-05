import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { WorkflowExecutionStatus } from "@/types/api";

const STATUS_LABELS: Record<string, string> = {
  running: "Running",
  completed: "Completed",
  failed: "Failed",
  awaiting_review: "Awaiting review",
};

const STATUS_STYLES: Record<string, string> = {
  running:
    "border-sky-500/20 bg-sky-500/10 text-sky-400",
  completed:
    "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
  failed:
    "border-destructive/30 bg-destructive/10 text-destructive",
  awaiting_review:
    "border-amber-500/20 bg-amber-500/10 text-amber-400",
};

type ExecutionStatusBadgeProps = {
  status: WorkflowExecutionStatus | string;
  className?: string;
};

export function ExecutionStatusBadge({
  status,
  className,
}: ExecutionStatusBadgeProps) {
  const label =
    STATUS_LABELS[status] ??
    status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <Badge
      variant="outline"
      className={cn(
        "font-medium capitalize",
        STATUS_STYLES[status] ?? "border-border bg-muted/50 text-muted-foreground",
        className
      )}
    >
      {label}
    </Badge>
  );
}
