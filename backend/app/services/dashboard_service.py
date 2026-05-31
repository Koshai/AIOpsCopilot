from sqlalchemy.orm import Session

from app.extraction.schema_registry import SchemaRegistry
from app.repositories.document_repository import DocumentRepository
from app.repositories.workflow_execution_repository import (
    WorkflowExecutionRepository,
)
from app.schemas.dashboard import DashboardSummaryResponse

DEFAULT_OWNER_ID = 1


class DashboardService:
    @staticmethod
    def get_summary(db: Session) -> DashboardSummaryResponse:
        return DashboardSummaryResponse(
            workflow_count=WorkflowExecutionRepository.count_all(db),
            document_count=DocumentRepository.count_for_owner(
                db,
                owner_id=DEFAULT_OWNER_ID,
            ),
            pending_reviews=WorkflowExecutionRepository.count_pending_reviews(
                db
            ),
            available_schemas=len(SchemaRegistry.list_types()),
        )
