from app.extraction.schema_registry import DEFAULT_WORKFLOW_TYPE
from app.extraction.validation import ExtractionValidationService
from app.graphs.workflow_state import WorkflowState


def validate_node(state: WorkflowState):
    extraction = state["extraction"]
    workflow_type = state.get("workflow_type", DEFAULT_WORKFLOW_TYPE)

    extraction, valid = ExtractionValidationService.validate(
        extraction,
        workflow_type=workflow_type,
    )

    return {
        "validation_passed": valid,
        "extraction": extraction,
    }
