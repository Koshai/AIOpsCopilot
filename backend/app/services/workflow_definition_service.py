from typing import List

from sqlalchemy.orm import Session

from app.repositories.workflow_definition_repository import (
    WorkflowDefinitionRepository,
)
from app.schemas.workflow_definition import WorkflowDefinitionResponse


class WorkflowDefinitionService:
    @staticmethod
    def list_all(db: Session) -> List[WorkflowDefinitionResponse]:
        definitions = WorkflowDefinitionRepository.list_all(db)
        return [
            WorkflowDefinitionResponse.model_validate(definition)
            for definition in definitions
        ]
