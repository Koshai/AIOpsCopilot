import { ChevronDown } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { FieldDefinition } from "@/types/api";

type SchemaFieldListProps = {
  fields: FieldDefinition[];
  defaultOpen?: boolean;
  className?: string;
};

export function SchemaFieldList({
  fields,
  defaultOpen = false,
  className,
}: SchemaFieldListProps) {
  return (
    <details
      className={cn("group rounded-lg border border-border bg-muted/20", className)}
      open={defaultOpen}
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-medium text-foreground [&::-webkit-details-marker]:hidden">
        <span>
          Fields{" "}
          <span className="font-normal text-muted-foreground">
            ({fields.length})
          </span>
        </span>
        <ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
      </summary>

      <ul className="space-y-0 border-t border-border px-4 py-2">
        {fields.map((field) => (
          <li
            key={field.name}
            className="border-b border-border/60 py-3 last:border-0"
          >
            <div className="flex flex-wrap items-center gap-2">
              <code className="text-sm font-medium text-foreground">
                {field.name}
              </code>
              <Badge variant="outline" className="font-mono text-[10px]">
                {field.type}
              </Badge>
              {field.required ? (
                <Badge variant="secondary" className="text-[10px]">
                  Required
                </Badge>
              ) : (
                <Badge variant="muted" className="text-[10px]">
                  Optional
                </Badge>
              )}
            </div>
            {field.description ? (
              <p className="mt-1.5 text-sm text-muted-foreground">
                {field.description}
              </p>
            ) : null}
          </li>
        ))}
      </ul>
    </details>
  );
}
