from fastapi import APIRouter

from app.schemas.workflow_catalog import WorkflowCatalogEntry, WorkflowCatalogSummary
from app.services.workflow_catalog_service import WorkflowCatalogService

router = APIRouter()


@router.get("/workflows", response_model=list[WorkflowCatalogSummary])
async def list_workflow_summaries():
    return WorkflowCatalogService.list_summaries()


@router.get("/workflows/{workflow_type}", response_model=WorkflowCatalogEntry)
async def get_workflow_catalog_entry(workflow_type: str):
    return WorkflowCatalogService.get_entry(workflow_type)


@router.get("/schemas", response_model=list[WorkflowCatalogEntry])
async def list_schemas():
    return WorkflowCatalogService.list_catalog()
