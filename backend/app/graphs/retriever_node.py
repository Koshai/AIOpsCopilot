from sqlalchemy.orm import Session

from app.graphs.invoice_state import InvoiceWorkflowState

from app.agents.retriever_agent import RetrieverAgent

from app.websocket.events import (
    WorkflowEvents
)

def retriever_node(
    state: InvoiceWorkflowState,
    db: Session
):

    WorkflowEvents.emit_from_sync(
        "Retriever agent searching documents..."
    )

    context = RetrieverAgent.retrieve(
        db=db,
        query=state["question"]
    )

    return {
        "context": context
    }