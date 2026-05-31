from app.extraction.anomaly import AnomalyService
from app.extraction.schema_registry import DEFAULT_WORKFLOW_TYPE
from app.graphs.workflow_state import WorkflowState


def anomaly_node(state: WorkflowState):
    extraction = state["extraction"]
    workflow_type = state.get("workflow_type", DEFAULT_WORKFLOW_TYPE)

    anomaly_detected = AnomalyService.detect(
        extraction,
        workflow_type=workflow_type,
    )

    return {
        "anomaly_detected": anomaly_detected,
    }
