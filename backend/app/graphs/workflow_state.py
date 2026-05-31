from typing import Optional, TypedDict

from typing_extensions import NotRequired

from app.schemas.extraction import ExtractionResult


class WorkflowState(TypedDict):

    question: str

    workflow_type: NotRequired[str]

    document_id: NotRequired[Optional[int]]

    plan: str

    context: str

    extraction: Optional[ExtractionResult]

    validation_passed: bool

    retry_count: int

    anomaly_detected: bool

    verifier_passed: bool

    human_approved: bool

    requires_human_review: bool
