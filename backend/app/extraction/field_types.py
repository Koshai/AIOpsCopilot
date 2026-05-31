from __future__ import annotations

from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field


class FieldType(str, Enum):
    STRING = "string"
    NUMBER = "number"
    INTEGER = "integer"
    BOOLEAN = "boolean"
    STRING_LIST = "list[string]"


class FieldDefinition(BaseModel):
    name: str
    type: FieldType
    required: bool = True
    description: str = ""


class ValidationRule(BaseModel):
    name: str
    description: str
    field: Optional[str] = None


class ValidationCapabilities(BaseModel):
    supports_validation: bool = True
    supports_anomaly_detection: bool = False
    supports_verifier: bool = True
    rules: list[ValidationRule] = Field(default_factory=list)


class WorkflowSchema(BaseModel):
    workflow_type: str
    display_name: str
    description: str = ""
    icon: str = "workflow"
    fields: list[FieldDefinition]
    validation: ValidationCapabilities = Field(default_factory=ValidationCapabilities)
    system_prompt: str = Field(
        default="""
You are a structured data extraction AI.

Extract information from the provided text according to the schema.

Rules:
- Follow the task instructions exactly.
- If multiple records appear in the context, extract ONLY the one that matches the task.
- Never merge fields from different records.
- Use null only when a field is truly missing for that record.

Return valid structured data only.
"""
    )
