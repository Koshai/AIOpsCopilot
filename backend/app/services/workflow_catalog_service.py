from typing import Optional

from fastapi import HTTPException

from app.extraction.schema_registry import SchemaRegistry
from app.schemas.workflow_catalog import WorkflowCatalogEntry, WorkflowCatalogSummary


class WorkflowCatalogService:
    """Frontend-facing catalog built from SchemaRegistry."""

    @staticmethod
    def list_workflow_types() -> list[str]:
        return SchemaRegistry.list_types()

    @staticmethod
    def list_summaries() -> list[WorkflowCatalogSummary]:
        return [
            WorkflowCatalogSummary(
                workflow_type=schema.workflow_type,
                display_name=schema.display_name,
                description=schema.description,
                icon=schema.icon,
            )
            for schema in WorkflowCatalogService._all_schemas()
        ]

    @staticmethod
    def get_entry(workflow_type: str) -> WorkflowCatalogEntry:
        try:
            schema = SchemaRegistry.get(workflow_type)
        except ValueError as exc:
            raise HTTPException(status_code=404, detail=str(exc)) from exc

        return WorkflowCatalogService._to_entry(schema)

    @staticmethod
    def list_catalog() -> list[WorkflowCatalogEntry]:
        return [
            WorkflowCatalogService._to_entry(schema)
            for schema in WorkflowCatalogService._all_schemas()
        ]

    @staticmethod
    def get_validation_capabilities(workflow_type: str):
        return WorkflowCatalogService.get_entry(workflow_type).validation

    @staticmethod
    def _all_schemas():
        for name in SchemaRegistry.list_types():
            yield SchemaRegistry.get(name)

    @staticmethod
    def _to_entry(schema) -> WorkflowCatalogEntry:
        return WorkflowCatalogEntry(
            workflow_type=schema.workflow_type,
            display_name=schema.display_name,
            description=schema.description,
            icon=schema.icon,
            fields=schema.fields,
            validation=schema.validation,
        )
