from sqlalchemy.orm import Session

from app.graphs.workflow_state import WorkflowState
from app.agents.retriever_agent import RetrieverAgent


def retrieve_node(state: WorkflowState, db: Session):

    context = RetrieverAgent.retrieve(
        db=db,
        query=state["question"],
        document_id=state.get("document_id"),
    )

    return {
        "context": context
    }