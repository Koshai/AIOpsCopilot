from typing import TypedDict, Optional

from app.schemas.extraction import InvoiceExtraction


class InvoiceWorkflowState(TypedDict):

    question: str

    plan: str

    context: str

    extraction: Optional[InvoiceExtraction]

    validation_passed: bool

    retry_count: int

    anomaly_detected: bool

    verifier_passed: bool

    human_approved: bool

    requires_human_review: bool