from sqlalchemy.orm import Session

from app.graphs.workflow_state import WorkflowState

from app.agents.retriever_agent import RetrieverAgent

from app.websocket.events import (
    WorkflowEvents
)

def retriever_node(
    state: WorkflowState,
    db: Session
):

    WorkflowEvents.emit_from_sync(
        "Retriever agent searching documents..."
    )

    context = RetrieverAgent.retrieve(
        db=db,
        query=state["question"],
        document_id=state.get("document_id"),
    )

    return {
        "context": context
    }