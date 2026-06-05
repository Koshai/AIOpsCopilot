import { ExecutionStatusBadge } from "@/components/dashboard/execution-status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatWorkflowType } from "@/lib/format";
import { formatWorkflowNodeName } from "@/lib/workflow-timeline";
import { cn } from "@/lib/utils";
import type { MonitoredExecution } from "@/lib/workflow-monitor";

type ActiveExecutionsTableProps = {
  executions: MonitoredExecution[];
  selectedThreadId: string | null;
  onSelect: (threadId: string) => void;
  loading?: boolean;
};

function ActiveExecutionsTableSkeleton() {
  return (
    <div className="space-y-3" aria-hidden>
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="h-10 animate-pulse rounded bg-muted" />
      ))}
    </div>
  );
}

export function ActiveExecutionsTable({
  executions,
  selectedThreadId,
  onSelect,
  loading = false,
}: ActiveExecutionsTableProps) {
  if (loading) {
    return <ActiveExecutionsTableSkeleton />;
  }

  if (executions.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border px-4 py-10 text-center">
        <p className="text-sm font-medium text-foreground">
          No active executions
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Running and awaiting-review workflows will appear here in real time.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3 md:hidden">
        {executions.map((execution) => {
          const isSelected = selectedThreadId === execution.threadId;

          return (
            <button
              key={execution.threadId}
              type="button"
              onClick={() => onSelect(execution.threadId)}
              className={cn(
                "w-full rounded-lg border border-border bg-card p-4 text-left transition-colors",
                isSelected && "border-primary/40 bg-primary/5"
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {formatWorkflowType(execution.workflowType)}
                  </p>
                  <p className="mt-1 truncate font-mono text-xs text-muted-foreground">
                    {execution.threadId}
                  </p>
                </div>
                <ExecutionStatusBadge status={execution.status} />
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                Current node:{" "}
                <span className="font-medium text-foreground">
                  {execution.currentNode
                    ? formatWorkflowNodeName(execution.currentNode)
                    : "—"}
                </span>
              </p>
            </button>
          );
        })}
      </div>

      <div className="hidden overflow-hidden rounded-xl border border-border md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Workflow</TableHead>
              <TableHead>Thread ID</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Current node</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {executions.map((execution) => {
              const isSelected = selectedThreadId === execution.threadId;

              return (
                <TableRow
                  key={execution.threadId}
                  className={cn(
                    "cursor-pointer",
                    isSelected && "bg-primary/5"
                  )}
                  onClick={() => onSelect(execution.threadId)}
                >
                  <TableCell className="font-medium">
                    {formatWorkflowType(execution.workflowType)}
                  </TableCell>
                  <TableCell className="max-w-xs truncate font-mono text-xs text-muted-foreground">
                    {execution.threadId}
                  </TableCell>
                  <TableCell>
                    <ExecutionStatusBadge status={execution.status} />
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {execution.currentNode
                      ? formatWorkflowNodeName(execution.currentNode)
                      : "—"}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
