from app.extraction.field_types import FieldDefinition, ValidationCapabilities
from pydantic import BaseModel


class WorkflowCatalogEntry(BaseModel):
    workflow_type: str
    display_name: str
    description: str
    icon: str
    fields: list[FieldDefinition]
    validation: ValidationCapabilities


class WorkflowCatalogSummary(BaseModel):
    workflow_type: str
    display_name: str
    description: str
    icon: str
