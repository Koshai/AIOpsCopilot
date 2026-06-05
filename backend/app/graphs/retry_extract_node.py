from app.extraction.schema_registry import DEFAULT_WORKFLOW_TYPE
from app.graphs.workflow_state import WorkflowState
from app.services.extraction_service import ExtractionService
from app.websocket.events import WorkflowEvents


MAX_RETRIES = 2


def retry_extract_node(state: WorkflowState):
    retry_count = state.get("retry_count", 0)
    workflow_type = state.get("workflow_type", DEFAULT_WORKFLOW_TYPE)
    missing_fields = state.get("missing_fields", [])
    question = ExtractionService.build_retry_question(
        state["question"],
        workflow_type=workflow_type,
        missing_fields=missing_fields,
    )

    WorkflowEvents.node_started(
        "retry_extract",
        f"Retrying extraction (attempt {retry_count + 1})...",
    )

    extraction = ExtractionService.extract(
        context=state["context"],
        question=question,
        workflow_type=workflow_type,
    )

    WorkflowEvents.node_completed("retry_extract", "Retry extraction finished")

    return {
        "extraction": extraction,
        "retry_count": retry_count + 1,
        "workflow_type": workflow_type,
    }
