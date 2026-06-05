import { ExecutionStatusBadge } from "@/components/dashboard/execution-status-badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatDateTime, formatWorkflowType } from "@/lib/format";
import { formatWorkflowNodeName } from "@/lib/workflow-timeline";
import type { MonitoredExecution } from "@/lib/workflow-monitor";

type SelectedExecutionPanelProps = {
  execution: MonitoredExecution | null;
};

export function SelectedExecutionPanel({ execution }: SelectedExecutionPanelProps) {
  if (!execution) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Selected execution</CardTitle>
          <CardDescription>
            Choose an active workflow to inspect status and node progress.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-dashed border-border px-4 py-8 text-center">
            <p className="text-sm text-muted-foreground">
              No execution selected.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Selected execution</CardTitle>
        <CardDescription>
          Live status from WebSocket events for the selected thread.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <dl className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="space-y-1">
            <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Workflow type
            </dt>
            <dd className="text-sm font-medium text-foreground">
              {formatWorkflowType(execution.workflowType)}
            </dd>
          </div>

          <div className="space-y-1">
            <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Thread ID
            </dt>
            <dd className="truncate font-mono text-sm text-foreground">
              {execution.threadId}
            </dd>
          </div>

          <div className="space-y-1">
            <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Status
            </dt>
            <dd>
              <ExecutionStatusBadge status={execution.status} />
            </dd>
          </div>

          <div className="space-y-1">
            <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Current node
            </dt>
            <dd className="text-sm text-foreground">
              {execution.currentNode
                ? formatWorkflowNodeName(execution.currentNode)
                : "—"}
            </dd>
          </div>

          {execution.startedAt ? (
            <div className="space-y-1 sm:col-span-2">
              <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Started
              </dt>
              <dd className="text-sm text-muted-foreground">
                {formatDateTime(execution.startedAt)}
              </dd>
            </div>
          ) : null}

          {execution.lastEventAt ? (
            <div className="space-y-1 sm:col-span-2">
              <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Last event
              </dt>
              <dd className="text-sm text-muted-foreground">
                {formatDateTime(execution.lastEventAt)}
              </dd>
            </div>
          ) : null}
        </dl>
      </CardContent>
    </Card>
  );
}
