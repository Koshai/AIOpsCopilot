import { SchemaFieldList } from "@/components/schemas/schema-field-list";
import { SchemaIcon } from "@/components/schemas/schema-icon";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { WorkflowSchema } from "@/types/api";

type SchemaCardProps = {
  schema: WorkflowSchema;
  className?: string;
};

export function SchemaCard({ schema, className }: SchemaCardProps) {
  return (
    <article
      className={cn(
        "flex flex-col rounded-xl border border-border bg-card p-5 shadow-sm",
        className
      )}
    >
      <div className="flex items-start gap-4">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <SchemaIcon icon={schema.icon} className="size-5" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-semibold tracking-tight text-foreground">
            {schema.display_name}
          </h3>
          <Badge variant="outline" className="mt-2 font-mono text-[11px]">
            {schema.workflow_type}
          </Badge>
        </div>
      </div>

      <p className="mt-4 flex-1 text-sm leading-relaxed text-muted-foreground">
        {schema.description}
      </p>

      <SchemaFieldList fields={schema.fields} className="mt-5" />
    </article>
  );
}

function SchemaCardSkeleton() {
  return (
    <div
      className="animate-pulse rounded-xl border border-border bg-card p-5"
      aria-hidden
    >
      <div className="flex gap-4">
        <div className="size-11 rounded-lg bg-muted" />
        <div className="flex-1 space-y-2">
          <div className="h-5 w-40 rounded bg-muted" />
          <div className="h-4 w-20 rounded bg-muted" />
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <div className="h-3 w-full rounded bg-muted" />
        <div className="h-3 w-4/5 rounded bg-muted" />
      </div>
      <div className="mt-5 h-12 rounded-lg bg-muted" />
    </div>
  );
}

export function SchemaCardSkeletonGrid({ count = 2 }: { count?: number }) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {Array.from({ length: count }).map((_, index) => (
        <SchemaCardSkeleton key={index} />
      ))}
    </div>
  );
}
