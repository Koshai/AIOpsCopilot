import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatFieldName } from "@/lib/extraction";
import { formatWorkflowType } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { ExtractionResult } from "@/types/api";

type GenericExtractionResultProps = {
  result: ExtractionResult;
  className?: string;
  title?: string;
  description?: string;
};

type FieldValueProps = {
  value: unknown;
  nested?: boolean;
};

function FieldValue({ value, nested = false }: FieldValueProps) {
  if (value == null) {
    return <span className="text-sm text-muted-foreground">—</span>;
  }

  if (typeof value === "boolean") {
    return (
      <Badge
        variant="outline"
        className={cn(
          "font-normal",
          value
            ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
            : "border-border bg-muted/30 text-muted-foreground"
        )}
      >
        {value ? "Yes" : "No"}
      </Badge>
    );
  }

  if (typeof value === "number") {
    return (
      <span className="break-words font-mono text-sm text-foreground">
        {value}
      </span>
    );
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    return (
      <span className="break-words text-sm text-foreground">
        {trimmed || "—"}
      </span>
    );
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return <span className="text-sm text-muted-foreground">—</span>;
    }

    if (value.every((item) => item == null || typeof item !== "object")) {
      return (
        <ul className="space-y-1 text-sm text-foreground">
          {value.map((item, index) => (
            <li key={index} className="break-words">
              {typeof item === "boolean" ? (item ? "Yes" : "No") : String(item)}
            </li>
          ))}
        </ul>
      );
    }

    return (
      <div className="space-y-3">
        {value.map((item, index) => (
          <div
            key={index}
            className={cn(
              "rounded-md border border-border bg-muted/20",
              nested ? "p-3" : "p-4"
            )}
          >
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Item {index + 1}
            </p>
            {typeof item === "object" && item !== null ? (
              <FieldEntries
                fields={item as Record<string, unknown>}
                nested
              />
            ) : (
              <FieldValue value={item} nested />
            )}
          </div>
        ))}
      </div>
    );
  }

  if (typeof value === "object") {
    return (
      <FieldEntries fields={value as Record<string, unknown>} nested />
    );
  }

  return (
    <span className="break-words text-sm text-foreground">{String(value)}</span>
  );
}

type FieldEntriesProps = {
  fields: Record<string, unknown>;
  nested?: boolean;
};

function FieldEntries({ fields, nested = false }: FieldEntriesProps) {
  const entries = Object.entries(fields);

  if (entries.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No extracted fields.</p>
    );
  }

  return (
    <dl
      className={cn(
        "divide-y divide-border",
        nested && "rounded-md border border-border"
      )}
    >
      {entries.map(([key, value]) => (
        <div
          key={key}
          className={cn(
            "grid gap-1 py-3 sm:grid-cols-3 sm:gap-4",
            nested ? "px-3 first:pt-3 last:pb-3" : "first:pt-0 last:pb-0"
          )}
        >
          <dt className="text-sm font-medium text-muted-foreground">
            {formatFieldName(key)}
          </dt>
          <dd className="min-w-0 sm:col-span-2">
            <FieldValue value={value} nested={nested} />
          </dd>
        </div>
      ))}
    </dl>
  );
}

export function GenericExtractionResult({
  result,
  className,
  title = "Extraction result",
  description,
}: GenericExtractionResultProps) {
  const entries = Object.entries(result.fields);
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
          <FieldEntries fields={result.fields} />
        )}
      </CardContent>
    </Card>
  );
}
