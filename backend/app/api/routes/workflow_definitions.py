from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.deps import get_db
from app.schemas.workflow_definition import WorkflowDefinitionResponse
from app.services.workflow_definition_service import WorkflowDefinitionService

router = APIRouter()


@router.get(
    "/workflow-definitions",
    response_model=list[WorkflowDefinitionResponse],
)
async def list_workflow_definitions(db: Session = Depends(get_db)):
    """Return all workflow definitions for dynamic frontend workflow cards."""
    return WorkflowDefinitionService.list_all(db)
