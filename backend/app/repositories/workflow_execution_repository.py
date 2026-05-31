from datetime import datetime, timezone
from typing import List, Optional, Tuple

from sqlalchemy import desc, func
from sqlalchemy.orm import Session

from app.models.document import Document
from app.models.workflow_execution import (
    WorkflowExecution,
    WorkflowExecutionStatus,
)


class WorkflowExecutionRepository:
    @staticmethod
    def create(
        db: Session,
        *,
        workflow_type: str,
        thread_id: str,
        document_id: Optional[int],
    ) -> WorkflowExecution:
        execution = WorkflowExecution(
            workflow_type=workflow_type,
            thread_id=thread_id,
            status=WorkflowExecutionStatus.RUNNING,
            document_id=document_id,
            requires_review=False,
        )
        db.add(execution)
        db.commit()
        db.refresh(execution)
        return execution

    @staticmethod
    def get_by_id(
        db: Session,
        execution_id: int,
    ) -> Optional[WorkflowExecution]:
        return db.get(WorkflowExecution, execution_id)

    @staticmethod
    def get_by_thread_id(
        db: Session,
        thread_id: str,
    ) -> Optional[WorkflowExecution]:
        return (
            db.query(WorkflowExecution)
            .filter(WorkflowExecution.thread_id == thread_id)
            .first()
        )

    @staticmethod
    def list_recent(
        db: Session,
        *,
        workflow_type: Optional[str] = None,
        status: Optional[str] = None,
        requires_review: Optional[bool] = None,
        limit: int = 50,
    ) -> List[WorkflowExecution]:
        query = db.query(WorkflowExecution)

        if workflow_type:
            query = query.filter(
                WorkflowExecution.workflow_type == workflow_type
            )

        if status:
            query = query.filter(WorkflowExecution.status == status)

        if requires_review is not None:
            query = query.filter(
                WorkflowExecution.requires_review == requires_review
            )

        return (
            query.order_by(desc(WorkflowExecution.started_at))
            .limit(limit)
            .all()
        )

    @staticmethod
    def list_pending_reviews(
        db: Session,
        *,
        limit: int = 50,
    ) -> List[Tuple[WorkflowExecution, Optional[str]]]:
        rows = (
            db.query(WorkflowExecution, Document.filename)
            .outerjoin(Document, WorkflowExecution.document_id == Document.id)
            .filter(
                WorkflowExecution.status
                == WorkflowExecutionStatus.AWAITING_REVIEW
            )
            .order_by(desc(WorkflowExecution.started_at))
            .limit(limit)
            .all()
        )
        return [(execution, filename) for execution, filename in rows]

    @staticmethod
    def count_all(db: Session) -> int:
        return db.query(func.count(WorkflowExecution.id)).scalar() or 0

    @staticmethod
    def count_pending_reviews(db: Session) -> int:
        return (
            db.query(func.count(WorkflowExecution.id))
            .filter(
                WorkflowExecution.status
                == WorkflowExecutionStatus.AWAITING_REVIEW
            )
            .scalar()
            or 0
        )

    @staticmethod
    def update(
        db: Session,
        execution: WorkflowExecution,
        *,
        status: str,
        execution_time: float,
        requires_review: bool,
        finished: bool,
    ) -> WorkflowExecution:
        execution.status = status
        execution.execution_time = execution_time
        execution.requires_review = requires_review

        if finished:
            execution.completed_at = datetime.now(timezone.utc)
        else:
            execution.completed_at = None

        db.commit()
        db.refresh(execution)
        return execution
