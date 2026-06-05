export interface WorkflowDefinition {
  id: number;
  workflow_type: string;
  display_name: string;
  description: string;
  icon: string;
  schema_name: string;
  enabled: boolean;
}
