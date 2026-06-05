import { Check, FileText, X } from "lucide-react";

import { ExecutionStatusBadge } from "@/components/dashboard/execution-status-badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDateTime, formatWorkflowType } from "@/lib/format";
import type { ReviewItem } from "@/types/api";

type ReviewRowActions = {
  onApprove: (item: ReviewItem) => void;
  onReject: (item: ReviewItem) => void;
  pendingThreadId: string | null;
};

function ReviewMobileCard({
  item,
  actions,
}: {
  item: ReviewItem;
  actions: ReviewRowActions;
}) {
  const isPending = actions.pendingThreadId === item.thread_id;

  return (
    <div className="rounded-lg border border-border bg-card p-4 md:hidden">
      <div className="flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
          <FileText className="size-5 text-muted-foreground" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-foreground">
            {item.document_name ?? "Unknown document"}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {formatWorkflowType(item.workflow_type)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {formatDateTime(item.created_at)}
          </p>
        </div>
        <ExecutionStatusBadge status={item.status} />
      </div>
      <div className="mt-4 flex gap-2">
        <Button
          size="sm"
          className="flex-1"
          disabled={isPending}
          onClick={() => actions.onApprove(item)}
        >
          <Check className="size-4" />
          Approve
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="flex-1"
          disabled={isPending}
          onClick={() => actions.onReject(item)}
        >
          <X className="size-4" />
          Reject
        </Button>
      </div>
    </div>
  );
}

function ReviewTableRow({
  item,
  actions,
}: {
  item: ReviewItem;
  actions: ReviewRowActions;
}) {
  const isPending = actions.pendingThreadId === item.thread_id;

  return (
    <TableRow className="hidden md:table-row">
      <TableCell className="font-medium text-foreground">
        {formatWorkflowType(item.workflow_type)}
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted">
            <FileText className="size-4 text-muted-foreground" />
          </div>
          <span className="max-w-md truncate">
            {item.document_name ?? "Unknown document"}
          </span>
        </div>
      </TableCell>
      <TableCell className="text-muted-foreground">
        {formatDateTime(item.created_at)}
      </TableCell>
      <TableCell>
        <ExecutionStatusBadge status={item.status} />
      </TableCell>
      <TableCell>
        <div className="flex justify-end gap-2">
          <Button
            size="sm"
            disabled={isPending}
            onClick={() => actions.onApprove(item)}
          >
            <Check className="size-4" />
            Approve
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={isPending}
            onClick={() => actions.onReject(item)}
          >
            <X className="size-4" />
            Reject
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

function ReviewTableSkeleton() {
  return (
    <>
      <div className="space-y-3 md:hidden" aria-hidden>
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="animate-pulse rounded-lg border border-border p-4"
          >
            <div className="h-4 w-40 rounded bg-muted" />
            <div className="mt-2 h-3 w-28 rounded bg-muted" />
            <div className="mt-4 h-8 w-full rounded bg-muted" />
          </div>
        ))}
      </div>
      <div className="hidden overflow-hidden rounded-xl border border-border md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Workflow</TableHead>
              <TableHead>Document</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, index) => (
              <TableRow key={index}>
                <TableCell colSpan={5}>
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

type ReviewTableProps = {
  reviews: ReviewItem[];
  loading?: boolean;
  pendingThreadId: string | null;
  onApprove: (item: ReviewItem) => void;
  onReject: (item: ReviewItem) => void;
};

export function ReviewTable({
  reviews,
  loading = false,
  pendingThreadId,
  onApprove,
  onReject,
}: ReviewTableProps) {
  const actions: ReviewRowActions = {
    onApprove,
    onReject,
    pendingThreadId,
  };

  if (loading) {
    return <ReviewTableSkeleton />;
  }

  return (
    <>
      <div className="space-y-3 md:hidden">
        {reviews.map((item) => (
          <ReviewMobileCard key={item.id} item={item} actions={actions} />
        ))}
      </div>

      <div className="hidden overflow-hidden rounded-xl border border-border md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Workflow</TableHead>
              <TableHead>Document</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reviews.map((item) => (
              <ReviewTableRow key={item.id} item={item} actions={actions} />
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
