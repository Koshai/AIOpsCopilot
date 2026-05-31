from langgraph.graph import StateGraph, END

from app.graphs.workflow_state import WorkflowState

from app.graphs.retrieve_node import retrieve_node
from app.graphs.extract_node import extract_node
from app.graphs.retry_extract_node import retry_extract_node
from app.graphs.validation_node import validate_node
from app.graphs.anomaly_node import anomaly_node
from app.graphs.router import validation_router
from app.checkpointing.checkpointer import checkpointer


def build_workflow_graph(db):

    workflow = StateGraph(WorkflowState)

    workflow.add_node(
        "retrieve",
        lambda state: retrieve_node(state, db)
    )

    workflow.add_node(
        "extract",
        extract_node
    )

    workflow.add_node(
        "retry_extract",
        retry_extract_node
    )

    workflow.add_node(
        "validate",
        validate_node
    )

    workflow.add_node(
        "anomaly",
        anomaly_node
    )

    workflow.set_entry_point("retrieve")

    workflow.add_edge("retrieve", "extract")

    workflow.add_edge("extract", "validate")

    workflow.add_edge("retry_extract", "validate")

    workflow.add_conditional_edges(
        "validate",
        validation_router,
        {
            "retry": "retry_extract",
            "anomaly": "anomaly",
            "failed": END
        }
    )

    workflow.add_edge("anomaly", END)

    return workflow.compile(
        checkpointer=checkpointer
    )
