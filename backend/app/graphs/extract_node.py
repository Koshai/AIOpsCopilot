from app.extraction.schema_registry import DEFAULT_WORKFLOW_TYPE
from app.graphs.workflow_state import WorkflowState
from app.services.extraction_service import ExtractionService
from app.websocket.events import WorkflowEvents


def extract_node(state: WorkflowState):
    workflow_type = state.get("workflow_type", DEFAULT_WORKFLOW_TYPE)

    WorkflowEvents.emit_from_sync(
        f"Extraction agent extracting {workflow_type} data..."
    )

    extraction = ExtractionService.extract(
        context=state["context"],
        question=state["question"],
        workflow_type=workflow_type,
    )

    return {
        "extraction": extraction,
        "workflow_type": workflow_type,
    }
