from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.deps import get_db
from app.repositories.workflow_execution_repository import (
    WorkflowExecutionRepository,
)
from app.schemas.workflow_execution import (
    RecentExecutionItem,
    WorkflowExecutionResponse,
)
from app.services.execution_activity_service import ExecutionActivityService

router = APIRouter()


@router.get("/executions", response_model=list[WorkflowExecutionResponse])
async def list_executions(
    workflow_type: Optional[str] = None,
    status: Optional[str] = None,
    requires_review: Optional[bool] = None,
    limit: int = 50,
    db: Session = Depends(get_db),
):
    """List workflow runs for dashboard and execution history views."""
    return WorkflowExecutionRepository.list_recent(
        db,
        workflow_type=workflow_type,
        status=status,
        requires_review=requires_review,
        limit=limit,
    )


@router.get("/executions/recent", response_model=list[RecentExecutionItem])
async def list_recent_executions(db: Session = Depends(get_db)):
    """Latest workflow runs for the dashboard activity feed."""
    return ExecutionActivityService.list_recent(db)


@router.get(
    "/executions/thread/{thread_id}",
    response_model=WorkflowExecutionResponse,
)
async def get_execution_by_thread(
    thread_id: str,
    db: Session = Depends(get_db),
):
    execution = WorkflowExecutionRepository.get_by_thread_id(db, thread_id)
    if execution is None:
        raise HTTPException(status_code=404, detail="Execution not found")
    return execution


@router.get(
    "/executions/{execution_id}",
    response_model=WorkflowExecutionResponse,
)
async def get_execution(
    execution_id: int,
    db: Session = Depends(get_db),
):
    execution = WorkflowExecutionRepository.get_by_id(db, execution_id)
    if execution is None:
        raise HTTPException(status_code=404, detail="Execution not found")
    return execution
