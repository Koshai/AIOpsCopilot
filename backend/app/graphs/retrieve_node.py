from sqlalchemy.orm import Session

from app.agents.retriever_agent import RetrieverAgent
from app.extraction.schema_registry import DEFAULT_WORKFLOW_TYPE, SchemaRegistry
from app.graphs.workflow_state import WorkflowState
from app.websocket.events import WorkflowEvents


def retrieve_node(state: WorkflowState, db: Session):
    WorkflowEvents.node_started("retrieve", "Searching documents...")

    workflow_type = state.get("workflow_type", DEFAULT_WORKFLOW_TYPE)
    schema = SchemaRegistry.get(workflow_type)
    field_hints = ", ".join(field.name for field in schema.fields)
    query = (
        f"{state['question']}\n"
        f"Relevant schema fields: {field_hints}"
    )

    context = RetrieverAgent.retrieve(
        db=db,
        query=query,
        document_id=state.get("document_id"),
    )

    WorkflowEvents.node_completed("retrieve", "Document context retrieved")

    return {
        "context": context,
    }
