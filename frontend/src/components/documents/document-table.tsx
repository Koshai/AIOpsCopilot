import { FileText } from "lucide-react";

import {
  DocumentStatusBadge,
  formatDocumentType,
} from "@/components/documents/document-status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDateTime } from "@/lib/format";
import type { Document } from "@/types/api";

function DocumentMobileCard({ document }: { document: Document }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4 md:hidden">
      <div className="flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
          <FileText className="size-5 text-muted-foreground" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-foreground">
            {document.filename}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {formatDateTime(document.created_at)}
          </p>
        </div>
        <DocumentStatusBadge status={document.processing_status} />
      </div>
      <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
        <span>Type: {formatDocumentType(document.file_type)}</span>
        <span>ID {document.id}</span>
      </div>
    </div>
  );
}

function DocumentTableRow({ document }: { document: Document }) {
  return (
    <TableRow className="hidden md:table-row">
      <TableCell>
        <div className="flex items-center gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted">
            <FileText className="size-4 text-muted-foreground" />
          </div>
          <span className="max-w-md truncate font-medium text-foreground">
            {document.filename}
          </span>
        </div>
      </TableCell>
      <TableCell className="text-muted-foreground">
        {formatDateTime(document.created_at)}
      </TableCell>
      <TableCell>{formatDocumentType(document.file_type)}</TableCell>
      <TableCell>
        <DocumentStatusBadge status={document.processing_status} />
      </TableCell>
    </TableRow>
  );
}

function DocumentTableSkeleton() {
  return (
    <>
      <div className="space-y-3 md:hidden" aria-hidden>
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="animate-pulse rounded-lg border border-border p-4"
          >
            <div className="h-4 w-40 rounded bg-muted" />
            <div className="mt-2 h-3 w-28 rounded bg-muted" />
          </div>
        ))}
      </div>
      <div className="hidden overflow-hidden rounded-xl border border-border md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Filename</TableHead>
              <TableHead>Uploaded</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, index) => (
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

type DocumentTableProps = {
  documents: Document[];
  loading?: boolean;
};

export function DocumentTable({ documents, loading = false }: DocumentTableProps) {
  if (loading) {
    return <DocumentTableSkeleton />;
  }

  return (
    <>
      <div className="space-y-3 md:hidden">
        {documents.map((document) => (
          <DocumentMobileCard key={document.id} document={document} />
        ))}
      </div>

      <div className="hidden overflow-hidden rounded-xl border border-border md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Filename</TableHead>
              <TableHead>Uploaded</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {documents.map((document) => (
              <DocumentTableRow key={document.id} document={document} />
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
