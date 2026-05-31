from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field


class ReviewQueueItem(BaseModel):
    id: int
    workflow_type: str
    thread_id: str
    status: str
    document_id: Optional[int] = None
    document_name: Optional[str] = None
    created_at: datetime = Field(
        description="When the workflow run was started.",
    )


class ReviewQueueResponse(BaseModel):
    pending_approvals: List[ReviewQueueItem]
    total: int
