export type FieldType =
  | "string"
  | "number"
  | "integer"
  | "boolean"
  | "list[string]";

export interface FieldDefinition {
  name: string;
  type: FieldType;
  required: boolean;
  description: string;
}

export interface ValidationRule {
  name: string;
  description: string;
  field?: string | null;
}

export interface ValidationCapabilities {
  supports_validation: boolean;
  supports_anomaly_detection: boolean;
  supports_verifier: boolean;
  rules: ValidationRule[];
}

/** Full extraction schema with fields and validation (GET /schemas, GET /workflows/{type}). */
export interface WorkflowSchema {
  workflow_type: string;
  display_name: string;
  description: string;
  icon: string;
  fields: FieldDefinition[];
  validation: ValidationCapabilities;
}

export interface WorkflowCatalogSummary {
  workflow_type: string;
  display_name: string;
  description: string;
  icon: string;
}
