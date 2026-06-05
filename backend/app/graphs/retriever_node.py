from sqlalchemy.orm import Session

from app.agents.retriever_agent import RetrieverAgent
from app.graphs.workflow_state import WorkflowState
from app.websocket.events import WorkflowEvents


def retriever_node(state: WorkflowState, db: Session):
    WorkflowEvents.node_started(
        "retriever",
        "Retriever agent searching documents...",
    )

    context = RetrieverAgent.retrieve(
        db=db,
        query=state["question"],
        document_id=state.get("document_id"),
    )

    WorkflowEvents.node_completed("retriever", "Document context retrieved")

    return {
        "context": context
    }
