from typing import List, Optional

from sqlalchemy.orm import Session

from app.models.workflow_definition import WorkflowDefinition


class WorkflowDefinitionRepository:
    @staticmethod
    def get_by_workflow_type(
        db: Session,
        workflow_type: str,
    ) -> Optional[WorkflowDefinition]:
        return (
            db.query(WorkflowDefinition)
            .filter(WorkflowDefinition.workflow_type == workflow_type)
            .first()
        )

    @staticmethod
    def list_enabled(db: Session) -> List[WorkflowDefinition]:
        return (
            db.query(WorkflowDefinition)
            .filter(WorkflowDefinition.enabled.is_(True))
            .order_by(WorkflowDefinition.workflow_type)
            .all()
        )

    @staticmethod
    def list_all(db: Session) -> List[WorkflowDefinition]:
        return (
            db.query(WorkflowDefinition)
            .order_by(WorkflowDefinition.workflow_type)
            .all()
        )
