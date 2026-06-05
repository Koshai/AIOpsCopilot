from app.extraction.anomaly import AnomalyService
from app.extraction.schema_registry import DEFAULT_WORKFLOW_TYPE
from app.graphs.workflow_state import WorkflowState
from app.websocket.events import WorkflowEvents


def anomaly_node(state: WorkflowState):
    extraction = state["extraction"]
    workflow_type = state.get("workflow_type", DEFAULT_WORKFLOW_TYPE)

    WorkflowEvents.node_started("anomaly", "Running anomaly detection...")

    anomaly_detected = AnomalyService.detect(
        extraction,
        workflow_type=workflow_type,
    )

    WorkflowEvents.node_completed(
        "anomaly",
        "Anomaly detected" if anomaly_detected else "No anomalies detected",
    )

    return {
        "anomaly_detected": anomaly_detected,
    }
