from app.extraction.schema_registry import DEFAULT_WORKFLOW_TYPE
from app.extraction.validation import ExtractionValidationService
from app.graphs.workflow_state import WorkflowState
from app.websocket.events import WorkflowEvents


def validate_node(state: WorkflowState):
    extraction = state["extraction"]
    workflow_type = state.get("workflow_type", DEFAULT_WORKFLOW_TYPE)

    WorkflowEvents.node_started("validate", "Validating extracted fields...")

    extraction, valid = ExtractionValidationService.validate(
        extraction,
        workflow_type=workflow_type,
    )
    missing_fields = ExtractionValidationService.get_missing_fields(
        extraction,
        workflow_type=workflow_type,
    )

    WorkflowEvents.node_completed(
        "validate",
        "Validation passed" if valid else "Validation failed",
    )

    return {
        "validation_passed": valid,
        "extraction": extraction,
        "missing_fields": missing_fields,
    }
