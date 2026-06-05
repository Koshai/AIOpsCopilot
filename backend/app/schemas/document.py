from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict

DocumentProcessingStatus = Literal["pending", "indexed"]


class DocumentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    filename: str
    file_type: str
    created_at: datetime
    processing_status: DocumentProcessingStatus
