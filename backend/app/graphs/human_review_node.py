from langgraph.types import interrupt

from app.graphs.workflow_state import (
    WorkflowState
)


def human_review_node(
    state: WorkflowState
):

    extraction = state["extraction"]

    approval = interrupt(
        {
            "message": "Human approval required",

            "extraction": extraction.model_dump()
        }
    )

    return {
        "human_approved": approval
    }