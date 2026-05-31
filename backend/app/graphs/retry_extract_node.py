from app.extraction.schema_registry import DEFAULT_WORKFLOW_TYPE
from app.graphs.workflow_state import WorkflowState
from app.services.extraction_service import ExtractionService


MAX_RETRIES = 2


def retry_extract_node(state: WorkflowState):
    retry_count = state.get("retry_count", 0)
    workflow_type = state.get("workflow_type", DEFAULT_WORKFLOW_TYPE)

    extraction = ExtractionService.extract(
        context=state["context"],
        question=state["question"],
        workflow_type=workflow_type,
    )

    return {
        "extraction": extraction,
        "retry_count": retry_count + 1,
        "workflow_type": workflow_type,
    }
