from app.agents.verifier_agent import VerifierAgent
from app.graphs.workflow_state import WorkflowState
from app.websocket.events import WorkflowEvents


def verifier_node(state: WorkflowState):
    WorkflowEvents.node_started(
        "verifier",
        "Verifier agent validating extraction...",
    )

    passed = VerifierAgent.verify(state["extraction"])

    WorkflowEvents.node_completed(
        "verifier",
        "Verification passed" if passed else "Verification failed",
    )

    return {
        "verifier_passed": passed
    }
