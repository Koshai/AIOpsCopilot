from app.graphs.invoice_state import InvoiceWorkflowState

from app.agents.verifier_agent import VerifierAgent

from app.websocket.events import (
    WorkflowEvents
)

def verifier_node(state: InvoiceWorkflowState):

    WorkflowEvents.emit_from_sync(
        "Verifier agent validating extraction..."
    )
    
    passed = VerifierAgent.verify(
        state["extraction"]
    )

    return {
        "verifier_passed": passed
    }