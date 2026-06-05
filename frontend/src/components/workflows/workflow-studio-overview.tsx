import { SchemaFieldList } from "@/components/schemas/schema-field-list";
import { SchemaIcon } from "@/components/schemas/schema-icon";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { FieldDefinition, WorkflowDefinition } from "@/types/api";

type WorkflowStudioOverviewProps = {
  definition: WorkflowDefinition;
  fields: FieldDefinition[];
};

export function WorkflowStudioOverview({
  definition,
  fields,
}: WorkflowStudioOverviewProps) {
  return (
    <Card className="h-fit">
      <CardHeader>
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <SchemaIcon icon={definition.icon} className="size-5" />
          </div>
          <div className="min-w-0 space-y-1">
            <CardTitle>{definition.display_name}</CardTitle>
            <CardDescription>{definition.description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="font-mono text-[11px]">
            {definition.workflow_type}
          </Badge>
          <Badge variant="outline" className="font-mono text-[11px]">
            schema: {definition.schema_name}
          </Badge>
        </div>

        {fields.length > 0 ? (
          <SchemaFieldList fields={fields} defaultOpen />
        ) : (
          <div className="rounded-lg border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">
            Schema fields are not available for this workflow.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
