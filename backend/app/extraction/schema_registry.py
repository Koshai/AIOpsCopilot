from typing import Optional

from app.extraction.field_types import WorkflowSchema
from app.extraction.schemas.contract import CONTRACT_SCHEMA
from app.extraction.schemas.invoice import INVOICE_SCHEMA
from app.extraction.schemas.resume import RESUME_SCHEMA

DEFAULT_WORKFLOW_TYPE = "invoice"

_REGISTRY: dict[str, WorkflowSchema] = {
    INVOICE_SCHEMA.workflow_type: INVOICE_SCHEMA,
    RESUME_SCHEMA.workflow_type: RESUME_SCHEMA,
    CONTRACT_SCHEMA.workflow_type: CONTRACT_SCHEMA,
}


class SchemaRegistry:
    @staticmethod
    def register(schema: WorkflowSchema) -> None:
        _REGISTRY[schema.workflow_type] = schema

    @staticmethod
    def get(workflow_type: Optional[str] = None) -> WorkflowSchema:
        key = workflow_type or DEFAULT_WORKFLOW_TYPE
        schema = _REGISTRY.get(key)
        if schema is None:
            raise ValueError(
                f"Unknown workflow_type '{key}'. "
                f"Registered types: {', '.join(sorted(_REGISTRY))}"
            )
        return schema

    @staticmethod
    def get_schema(workflow_type: str) -> WorkflowSchema:
        """Return the registered schema for a workflow type."""
        return SchemaRegistry.get(workflow_type)

    @staticmethod
    def list_types() -> list[str]:
        return sorted(_REGISTRY.keys())
