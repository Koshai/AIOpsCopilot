from typing import Any, Dict, Optional, Tuple

from sqlalchemy.orm import Session

from app.core.metrics import Timer
from app.graphs.tracing import traced_workflow
from app.models.workflow_execution import (
    WorkflowExecution,
    WorkflowExecutionStatus,
)
from app.repositories.workflow_execution_repository import (
    WorkflowExecutionRepository,
)
from app.schemas.workflow_execution import WorkflowExecutionResponse
from app.websocket.context import current_thread_id
from app.websocket.events import WorkflowEvents


class WorkflowExecutionService:
    TERMINAL_STATUSES = {
        WorkflowExecutionStatus.COMPLETED,
        WorkflowExecutionStatus.FAILED,
    }

    @staticmethod
    def start(
        db: Session,
        *,
        workflow_type: str,
        thread_id: str,
        document_id: Optional[int],
    ) -> WorkflowExecution:
        return WorkflowExecutionRepository.create(
            db,
            workflow_type=workflow_type,
            thread_id=thread_id,
            document_id=document_id,
        )

    @staticmethod
    def run_tracked(
        db: Session,
        *,
        graph,
        initial_state: Dict[str, Any],
        thread_id: str,
        workflow_type: str,
        document_id: Optional[int],
        supports_human_review: bool = False,
    ) -> Tuple[Dict[str, Any], WorkflowExecution]:
        WorkflowExecutionService.start(
            db,
            workflow_type=workflow_type,
            thread_id=thread_id,
            document_id=document_id,
        )

        WorkflowEvents.workflow_started(
            thread_id=thread_id,
            workflow_type=workflow_type,
        )

        thread_token = current_thread_id.set(thread_id)

        with Timer() as timer:
            try:
                result = traced_workflow(
                    graph,
                    initial_state,
                    config={
                        "configurable": {
                            "thread_id": thread_id,
                        }
                    },
                )
            except Exception:
                WorkflowExecutionService.mark_failed(
                    db,
                    thread_id=thread_id,
                    execution_time=timer.duration,
                )
                WorkflowEvents.workflow_completed(
                    thread_id=thread_id,
                    status=WorkflowExecutionStatus.FAILED,
                )
                raise
            finally:
                current_thread_id.reset(thread_token)

        execution = WorkflowExecutionService.complete_from_result(
            db,
            thread_id=thread_id,
            result=result,
            execution_time=timer.duration,
            supports_human_review=supports_human_review,
        )

        if execution is not None:
            WorkflowExecutionService._emit_terminal_event(execution)

        return result, execution

    @staticmethod
    def resume_tracked(
        db: Session,
        *,
        graph,
        thread_id: str,
        resume_command: Any,
        supports_human_review: bool = True,
    ) -> Tuple[Dict[str, Any], Optional[WorkflowExecution]]:
        execution = WorkflowExecutionRepository.get_by_thread_id(db, thread_id)
        prior_time = execution.execution_time if execution else 0.0

        thread_token = current_thread_id.set(thread_id)

        with Timer() as timer:
            try:
                result = graph.invoke(
                    resume_command,
                    config={
                        "configurable": {
                            "thread_id": thread_id,
                        }
                    },
                )
            except Exception:
                WorkflowExecutionService.mark_failed(
                    db,
                    thread_id=thread_id,
                    execution_time=(prior_time or 0.0) + timer.duration,
                )
                WorkflowEvents.workflow_completed(
                    thread_id=thread_id,
                    status=WorkflowExecutionStatus.FAILED,
                )
                raise
            finally:
                current_thread_id.reset(thread_token)

        updated = WorkflowExecutionService.complete_from_result(
            db,
            thread_id=thread_id,
            result=result,
            execution_time=(prior_time or 0.0) + timer.duration,
            supports_human_review=supports_human_review,
        )

        if updated is not None:
            WorkflowExecutionService._emit_terminal_event(updated)

        return result, updated

    @staticmethod
    def complete_from_result(
        db: Session,
        *,
        thread_id: str,
        result: Dict[str, Any],
        execution_time: float,
        supports_human_review: bool = False,
    ) -> Optional[WorkflowExecution]:
        execution = WorkflowExecutionRepository.get_by_thread_id(db, thread_id)
        if execution is None:
            return None

        status, requires_review = WorkflowExecutionService._derive_status(
            result,
            supports_human_review=supports_human_review,
        )

        return WorkflowExecutionRepository.update(
            db,
            execution,
            status=status,
            execution_time=execution_time,
            requires_review=requires_review,
            finished=status in WorkflowExecutionService.TERMINAL_STATUSES,
        )

    @staticmethod
    def mark_failed(
        db: Session,
        *,
        thread_id: str,
        execution_time: float,
    ) -> Optional[WorkflowExecution]:
        execution = WorkflowExecutionRepository.get_by_thread_id(db, thread_id)
        if execution is None:
            return None

        return WorkflowExecutionRepository.update(
            db,
            execution,
            status=WorkflowExecutionStatus.FAILED,
            execution_time=execution_time,
            requires_review=False,
            finished=True,
        )

    @staticmethod
    def _emit_terminal_event(execution: WorkflowExecution) -> None:
        if execution.status == WorkflowExecutionStatus.AWAITING_REVIEW:
            WorkflowEvents.approval_required(
                thread_id=execution.thread_id,
                message="Workflow paused for human approval",
            )
            return

        WorkflowEvents.workflow_completed(
            thread_id=execution.thread_id,
            status=execution.status,
        )

    @staticmethod
    def to_response(
        execution: Optional[WorkflowExecution],
    ) -> Optional[WorkflowExecutionResponse]:
        if execution is None:
            return None
        return WorkflowExecutionResponse.model_validate(execution)

    @staticmethod
    def attach_to_result(
        result: Dict[str, Any],
        execution: Optional[WorkflowExecution],
    ) -> Dict[str, Any]:
        summary = WorkflowExecutionService.to_response(execution)
        if summary is not None:
            result["execution"] = summary.model_dump(mode="json")
        return result

    @staticmethod
    def _derive_status(
        result: Dict[str, Any],
        *,
        supports_human_review: bool,
    ) -> tuple[str, bool]:
        anomaly_detected = bool(result.get("anomaly_detected"))
        validation_passed = result.get("validation_passed", True)
        human_approved = bool(result.get("human_approved"))
        human_review_completed = bool(result.get("human_review_completed"))

        if supports_human_review and anomaly_detected:
            if human_review_completed:
                if human_approved:
                    return WorkflowExecutionStatus.COMPLETED, True
                return WorkflowExecutionStatus.FAILED, False

            return WorkflowExecutionStatus.AWAITING_REVIEW, True

        if validation_passed is False:
            return WorkflowExecutionStatus.FAILED, anomaly_detected

        return WorkflowExecutionStatus.COMPLETED, anomaly_detected
