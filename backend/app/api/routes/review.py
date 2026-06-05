from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from langgraph.types import Command

from app.db.deps import get_db
from app.graphs.multi_agent_workflow_graph import (
    build_multi_agent_workflow_graph,
)
from app.schemas.review import ReviewQueueResponse
from app.services.review_queue_service import ReviewQueueService
from app.services.workflow_execution_service import WorkflowExecutionService

router = APIRouter()


@router.get("/reviews", response_model=ReviewQueueResponse)
async def list_pending_reviews(
    limit: int = 50,
    db: Session = Depends(get_db),
):
    """Return workflows awaiting human approval for the Review Queue page."""
    return ReviewQueueService.list_pending(db, limit=limit)


@router.post("/review/{thread_id}")
async def approve_review(
    thread_id: str,
    db: Session = Depends(get_db),
):
    graph = build_multi_agent_workflow_graph(None)

    result, execution = WorkflowExecutionService.resume_tracked(
        db,
        graph=graph,
        thread_id=thread_id,
        resume_command=Command(resume=True),
    )

    return WorkflowExecutionService.attach_to_result(result, execution)


@router.post("/review/{thread_id}/reject")
async def reject_review(
    thread_id: str,
    db: Session = Depends(get_db),
):
    graph = build_multi_agent_workflow_graph(None)

    result, execution = WorkflowExecutionService.resume_tracked(
        db,
        graph=graph,
        thread_id=thread_id,
        resume_command=Command(resume=False),
    )

    return WorkflowExecutionService.attach_to_result(result, execution)
