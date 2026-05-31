from datetime import datetime, timezone

from app.models.workflow_execution import WorkflowExecutionStatus
from app.services.execution_activity_service import ExecutionActivityService


class _FakeExecution:
    def __init__(self):
        self.workflow_type = "invoice"
        self.status = WorkflowExecutionStatus.COMPLETED
        self.execution_time = 3.5
        self.started_at = datetime(2026, 5, 28, 12, 0, tzinfo=timezone.utc)


def test_to_recent_execution_item():
    item = ExecutionActivityService._to_item(_FakeExecution())

    assert item.workflow_type == "invoice"
    assert item.status == WorkflowExecutionStatus.COMPLETED
    assert item.execution_time == 3.5
    assert item.created_at == datetime(2026, 5, 28, 12, 0, tzinfo=timezone.utc)
