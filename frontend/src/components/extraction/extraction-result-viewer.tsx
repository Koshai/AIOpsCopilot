import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  formatFieldName,
  formatScalar,
  getExtractionFieldEntries,
} from "@/lib/extraction";
import { formatWorkflowType } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { ExtractionResult } from "@/types/api";

type ExtractionResultViewerProps = {
  result?: ExtractionResult | null;
  className?: string;
  title?: string;
  description?: string;
  emptyMessage?: string;
};

type FieldValueProps = {
  value: unknown;
  compact?: boolean;
};

type FieldEntriesProps = {
  entries: Array<[string, unknown]>;
  compact?: boolean;
};

function FieldEntries({ entries, compact = false }: FieldEntriesProps) {
  if (entries.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No extracted fields.</p>
    );
  }

  return (
    <dl className={cn("divide-y divide-border", compact && "rounded-md border border-border")}>
      {entries.map(([key, value]) => (
        <div
          key={key}
          className={cn(
            "grid gap-1 py-3",
            compact ? "px-3 first:pt-3 last:pb-3" : "first:pt-0 last:pb-0",
            "sm:grid-cols-3 sm:gap-4"
          )}
        >
          <dt className="text-sm font-medium text-muted-foreground">
            {formatFieldName(key)}
          </dt>
          <dd className="min-w-0 sm:col-span-2">
            <FieldValue value={value} compact={compact} />
          </dd>
        </div>
      ))}
    </dl>
  );
}

function FieldValue({ value, compact = false }: FieldValueProps) {
  if (value == null) {
    return <span className="text-sm text-muted-foreground">—</span>;
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return <span className="text-sm text-muted-foreground">—</span>;
    }

    if (value.every((item) => item == null || typeof item !== "object")) {
      return (
        <span className="break-words text-sm text-foreground">
          {value.map((item) => formatScalar(item)).join(", ")}
        </span>
      );
    }

    return (
      <div className="space-y-3">
        {value.map((item, index) => (
          <div
            key={index}
            className={cn(
              "rounded-md border border-border bg-muted/20",
              compact ? "p-3" : "p-4"
            )}
          >
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Item {index + 1}
            </p>
            {typeof item === "object" && item !== null ? (
              <FieldEntries
                entries={getExtractionFieldEntries(
                  item as Record<string, unknown>
                )}
                compact
              />
            ) : (
              <span className="text-sm text-foreground">
                {formatScalar(item)}
              </span>
            )}
          </div>
        ))}
      </div>
    );
  }

  if (typeof value === "object") {
    return (
      <FieldEntries
        entries={getExtractionFieldEntries(value as Record<string, unknown>)}
        compact
      />
    );
  }

  return (
    <span className="break-words text-sm text-foreground">
      {formatScalar(value)}
    </span>
  );
}

export function ExtractionResultViewer({
  result,
  className,
  title = "Extraction result",
  description,
  emptyMessage = "Run a workflow to view structured extraction output here.",
}: ExtractionResultViewerProps) {
  if (!result) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-base">{title}</CardTitle>
          <CardDescription>
            {description ?? "Structured extraction output from the latest run."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-dashed border-border bg-muted/10 px-4 py-10 text-center">
            <p className="text-sm font-medium text-foreground">
              No results yet
            </p>
            <p className="mt-1 text-sm text-muted-foreground">{emptyMessage}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const entries = getExtractionFieldEntries(result.fields);
  const fieldCount = entries.length;

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <CardTitle className="text-base">{title}</CardTitle>
            <CardDescription>
              {description ??
                `${fieldCount} extracted field${fieldCount === 1 ? "" : "s"}`}
            </CardDescription>
          </div>
          <Badge variant="outline" className="font-mono text-[11px]">
            {formatWorkflowType(result.workflow_type)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {fieldCount === 0 ? (
          <div className="rounded-lg border border-dashed border-border px-4 py-8 text-center">
            <p className="text-sm font-medium text-foreground">
              No fields extracted
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              The workflow completed without structured field output.
            </p>
          </div>
        ) : (
          <FieldEntries entries={entries} />
        )}
      </CardContent>
    </Card>
  );
}
