from app.graphs.workflow_state import WorkflowState

from app.agents.verifier_agent import VerifierAgent

from app.websocket.events import (
    WorkflowEvents
)

def verifier_node(state: WorkflowState):

    WorkflowEvents.emit_from_sync(
        "Verifier agent validating extraction..."
    )

    passed = VerifierAgent.verify(
        state["extraction"]
    )

    return {
        "verifier_passed": passed
    }