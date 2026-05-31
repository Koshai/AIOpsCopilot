from typing import List

from sqlalchemy.orm import Session

from app.models.workflow_execution import WorkflowExecution
from app.repositories.workflow_execution_repository import (
    WorkflowExecutionRepository,
)
from app.schemas.workflow_execution import RecentExecutionItem

RECENT_ACTIVITY_LIMIT = 20


class ExecutionActivityService:
    @staticmethod
    def list_recent(db: Session) -> List[RecentExecutionItem]:
        executions = WorkflowExecutionRepository.list_recent(
            db,
            limit=RECENT_ACTIVITY_LIMIT,
        )
        return [
            ExecutionActivityService._to_item(execution)
            for execution in executions
        ]

    @staticmethod
    def _to_item(execution: WorkflowExecution) -> RecentExecutionItem:
        return RecentExecutionItem(
            workflow_type=execution.workflow_type,
            status=execution.status,
            execution_time=execution.execution_time,
            created_at=execution.started_at,
        )
