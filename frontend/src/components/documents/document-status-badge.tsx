import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { DocumentProcessingStatus } from "@/types/api";

const STATUS_LABELS: Record<DocumentProcessingStatus, string> = {
  indexed: "Indexed",
  pending: "Pending",
};

const STATUS_STYLES: Record<DocumentProcessingStatus, string> = {
  indexed: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
  pending: "border-amber-500/20 bg-amber-500/10 text-amber-400",
};

export function DocumentStatusBadge({
  status,
  className,
}: {
  status: DocumentProcessingStatus;
  className?: string;
}) {
  return (
    <Badge
      variant="outline"
      className={cn("font-medium", STATUS_STYLES[status], className)}
    >
      {STATUS_LABELS[status]}
    </Badge>
  );
}

export function formatDocumentType(fileType: string): string {
  const normalized = fileType.toLowerCase();

  if (normalized === "application/pdf") {
    return "PDF";
  }

  if (normalized.startsWith("image/")) {
    return normalized.replace("image/", "").toUpperCase();
  }

  if (normalized.includes("/")) {
    return normalized.split("/").pop()?.toUpperCase() ?? fileType;
  }

  return fileType.toUpperCase();
}
