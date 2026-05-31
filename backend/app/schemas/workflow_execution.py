from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class WorkflowExecutionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    workflow_type: str
    thread_id: str
    status: str
    document_id: Optional[int]
    started_at: datetime
    completed_at: Optional[datetime]
    execution_time: Optional[float]
    requires_review: bool


class RecentExecutionItem(BaseModel):
    workflow_type: str
    status: str
    execution_time: Optional[float]
    created_at: datetime
