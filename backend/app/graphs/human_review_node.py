from langgraph.types import interrupt

from app.graphs.workflow_state import WorkflowState
from app.websocket.events import WorkflowEvents


def human_review_node(state: WorkflowState):
    extraction = state["extraction"]

    WorkflowEvents.node_started("human_review", "Waiting for human review...")
    WorkflowEvents.approval_required(message="Human approval required")

    approval = interrupt(
        {
            "message": "Human approval required",
            "extraction": extraction.model_dump(),
        }
    )

    WorkflowEvents.node_completed(
        "human_review",
        "Human review approved" if approval else "Human review rejected",
    )

    return {
        "human_approved": approval,
        "human_review_completed": True,
    }
