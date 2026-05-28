from langgraph.types import interrupt

from app.graphs.invoice_state import (
    InvoiceWorkflowState
)


def human_review_node(
    state: InvoiceWorkflowState
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