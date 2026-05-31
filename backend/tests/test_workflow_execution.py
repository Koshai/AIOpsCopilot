from app.services.workflow_execution_service import WorkflowExecutionService
from app.models.workflow_execution import WorkflowExecutionStatus


def test_derive_status_completed():
    status, requires_review = WorkflowExecutionService._derive_status(
        {"validation_passed": True, "anomaly_detected": False},
        supports_human_review=False,
    )
    assert status == WorkflowExecutionStatus.COMPLETED
    assert requires_review is False


def test_derive_status_failed():
    status, requires_review = WorkflowExecutionService._derive_status(
        {"validation_passed": False, "anomaly_detected": False},
        supports_human_review=False,
    )
    assert status == WorkflowExecutionStatus.FAILED
    assert requires_review is False


def test_derive_status_awaiting_review():
    status, requires_review = WorkflowExecutionService._derive_status(
        {
            "validation_passed": True,
            "anomaly_detected": True,
            "human_approved": False,
        },
        supports_human_review=True,
    )
    assert status == WorkflowExecutionStatus.AWAITING_REVIEW
    assert requires_review is True


def test_derive_status_completed_after_review():
    status, requires_review = WorkflowExecutionService._derive_status(
        {
            "validation_passed": True,
            "anomaly_detected": True,
            "human_approved": True,
        },
        supports_human_review=True,
    )
    assert status == WorkflowExecutionStatus.COMPLETED
    assert requires_review is True


def test_awaiting_review_is_not_terminal():
    assert (
        WorkflowExecutionStatus.AWAITING_REVIEW
        not in WorkflowExecutionService.TERMINAL_STATUSES
    )
