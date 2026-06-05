import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";

import { ExecutionStatusBadge } from "@/components/dashboard/execution-status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import {
  formatDateTime,
  formatExecutionTime,
  formatWorkflowType,
} from "@/lib/format";
import type { ExecutionSortField, SortDirection } from "@/lib/executions";
import type { RecentExecutionItem } from "@/types/api";

type SortableHeaderProps = {
  label: string;
  field: ExecutionSortField;
  activeField: ExecutionSortField;
  direction: SortDirection;
  onSort: (field: ExecutionSortField) => void;
};

function SortableHeader({
  label,
  field,
  activeField,
  direction,
  onSort,
}: SortableHeaderProps) {
  const isActive = activeField === field;
  const Icon = !isActive
    ? ArrowUpDown
    : direction === "asc"
      ? ArrowUp
      : ArrowDown;

  return (
    <button
      type="button"
      onClick={() => onSort(field)}
      className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground"
    >
      {label}
      <Icon className={cn("size-3.5", isActive && "text-primary")} />
    </button>
  );
}

function ExecutionMobileCard({ item }: { item: RecentExecutionItem }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4 md:hidden">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-foreground">
            {formatWorkflowType(item.workflow_type)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {formatDateTime(item.created_at)}
          </p>
        </div>
        <ExecutionStatusBadge status={item.status} />
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        Duration{" "}
        <span className="font-medium tabular-nums text-foreground">
          {formatExecutionTime(item.execution_time)}
        </span>
      </p>
    </div>
  );
}

function ExecutionTableRow({ item }: { item: RecentExecutionItem }) {
  return (
    <TableRow>
      <TableCell className="font-medium">
        {formatWorkflowType(item.workflow_type)}
      </TableCell>
      <TableCell>
        <ExecutionStatusBadge status={item.status} />
      </TableCell>
      <TableCell className="tabular-nums text-muted-foreground">
        {formatExecutionTime(item.execution_time)}
      </TableCell>
      <TableCell className="text-muted-foreground">
        {formatDateTime(item.created_at)}
      </TableCell>
    </TableRow>
  );
}

function ExecutionTableSkeleton() {
  return (
    <>
      <div className="space-y-3 md:hidden" aria-hidden>
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="animate-pulse rounded-lg border border-border p-4"
          >
            <div className="h-4 w-32 rounded bg-muted" />
            <div className="mt-2 h-3 w-24 rounded bg-muted" />
          </div>
        ))}
      </div>
      <div className="hidden overflow-hidden rounded-xl border border-border md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Workflow</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 6 }).map((_, index) => (
              <TableRow key={index}>
                <TableCell colSpan={4}>
                  <div className="h-5 animate-pulse rounded bg-muted" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}

type ExecutionHistoryTableProps = {
  items: RecentExecutionItem[];
  loading?: boolean;
  sortField: ExecutionSortField;
  sortDirection: SortDirection;
  onSort: (field: ExecutionSortField) => void;
};

export function ExecutionHistoryTable({
  items,
  loading = false,
  sortField,
  sortDirection,
  onSort,
}: ExecutionHistoryTableProps) {
  if (loading) {
    return <ExecutionTableSkeleton />;
  }

  return (
    <>
      <div className="space-y-3 md:hidden">
        {items.map((item, index) => (
          <ExecutionMobileCard
            key={`${item.workflow_type}-${item.created_at}-${index}`}
            item={item}
          />
        ))}
      </div>

      <div className="hidden overflow-hidden rounded-xl border border-border md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <SortableHeader
                  label="Workflow"
                  field="workflow_type"
                  activeField={sortField}
                  direction={sortDirection}
                  onSort={onSort}
                />
              </TableHead>
              <TableHead>
                <SortableHeader
                  label="Status"
                  field="status"
                  activeField={sortField}
                  direction={sortDirection}
                  onSort={onSort}
                />
              </TableHead>
              <TableHead>
                <SortableHeader
                  label="Duration"
                  field="execution_time"
                  activeField={sortField}
                  direction={sortDirection}
                  onSort={onSort}
                />
              </TableHead>
              <TableHead>
                <SortableHeader
                  label="Created"
                  field="created_at"
                  activeField={sortField}
                  direction={sortDirection}
                  onSort={onSort}
                />
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item, index) => (
              <ExecutionTableRow
                key={`${item.workflow_type}-${item.created_at}-${index}`}
                item={item}
              />
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
