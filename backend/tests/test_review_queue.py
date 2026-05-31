from datetime import datetime, timezone

from app.models.workflow_execution import WorkflowExecutionStatus
from app.services.review_queue_service import ReviewQueueService


class _FakeExecution:
    def __init__(self):
        self.id = 7
        self.workflow_type = "invoice"
        self.thread_id = "thread-abc"
        self.status = WorkflowExecutionStatus.AWAITING_REVIEW
        self.document_id = 3
        self.started_at = datetime(2026, 5, 28, 12, 0, tzinfo=timezone.utc)


def test_to_review_queue_item():
    item = ReviewQueueService._to_item(
        _FakeExecution(),
        "sample_invoice.pdf",
    )

    assert item.id == 7
    assert item.workflow_type == "invoice"
    assert item.thread_id == "thread-abc"
    assert item.status == WorkflowExecutionStatus.AWAITING_REVIEW
    assert item.document_name == "sample_invoice.pdf"
    assert item.created_at == datetime(2026, 5, 28, 12, 0, tzinfo=timezone.utc)
