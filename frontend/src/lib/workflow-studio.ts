import { formatFieldName } from "@/lib/extraction";
import type { FieldDefinition, WorkflowDefinition, WorkflowSchema } from "@/types/api";

export function buildDefaultWorkflowQuestion(
  definition: WorkflowDefinition,
  schema: WorkflowSchema | null
): string {
  const fields = schema?.fields ?? [];

  if (fields.length === 0) {
    return `Extract structured data for the ${definition.display_name} workflow.`;
  }

  const prioritized = [
    ...fields.filter((field) => field.required),
    ...fields.filter((field) => !field.required),
  ];

  const unique = prioritized.filter(
    (field, index, list) =>
      list.findIndex((item) => item.name === field.name) === index
  );

  const fieldLabels = unique.map((field) => formatFieldName(field.name));

  return `Extract ${fieldLabels.join(", ")} from the document.`;
}

export function getSchemaFields(
  schema: WorkflowSchema | null
): FieldDefinition[] {
  return schema?.fields ?? [];
}
