from typing import Optional

from pydantic import BaseModel, Field


class WorkflowRunRequest(BaseModel):
    question: str
    thread_id: str
    workflow_type: str = Field(
        default="invoice",
        description="Registered extraction schema type (e.g. invoice).",
    )
    document_id: Optional[int] = Field(
        default=None,
        description="Optional. If omitted, the most recently uploaded document is used.",
    )
    filename: Optional[str] = Field(
        default=None,
        description="Optional. Match uploaded file by name (exact or partial) instead of document_id.",
    )
    search_all_documents: bool = Field(
        default=False,
        description="If true, search every indexed document (legacy behavior).",
    )
