from typing import Optional

from sqlalchemy.orm import Session

from app.models.workflow_execution import WorkflowExecution
from app.repositories.workflow_execution_repository import (
    WorkflowExecutionRepository,
)
from app.schemas.review import ReviewQueueItem, ReviewQueueResponse


class ReviewQueueService:
    @staticmethod
    def list_pending(
        db: Session,
        *,
        limit: int = 50,
    ) -> ReviewQueueResponse:
        rows = WorkflowExecutionRepository.list_pending_reviews(
            db,
            limit=limit,
        )
        items = [
            ReviewQueueService._to_item(execution, document_name)
            for execution, document_name in rows
        ]
        return ReviewQueueResponse(
            pending_approvals=items,
            total=len(items),
        )

    @staticmethod
    def _to_item(
        execution: WorkflowExecution,
        document_name: Optional[str],
    ) -> ReviewQueueItem:
        return ReviewQueueItem(
            id=execution.id,
            workflow_type=execution.workflow_type,
            thread_id=execution.thread_id,
            status=execution.status,
            document_id=execution.document_id,
            document_name=document_name,
            created_at=execution.started_at,
        )
