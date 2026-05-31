from langgraph.graph import StateGraph, END

from app.checkpointing.checkpointer import (
    checkpointer
)

from app.graphs.workflow_state import (
    WorkflowState
)

from app.graphs.planner_node import (
    planner_node
)

from app.graphs.retriever_node import (
    retriever_node
)

from app.graphs.extract_node import (
    extract_node
)

from app.graphs.validation_node import (
    validate_node
)

from app.graphs.verifier_node import (
    verifier_node
)

from app.graphs.anomaly_node import (
    anomaly_node
)

from app.graphs.human_review_node import (
    human_review_node
)

from app.graphs.review_router import (
    review_router
)


def build_multi_agent_workflow_graph(db):

    workflow = StateGraph(
        WorkflowState
    )

    # Planner Agent
    workflow.add_node(
        "planner",
        planner_node
    )

    # Retriever Agent
    workflow.add_node(
        "retriever",
        lambda state: retriever_node(
            state,
            db
        )
    )

    # Extraction Agent
    workflow.add_node(
        "extract",
        extract_node
    )

    # Validation Node
    workflow.add_node(
        "validate",
        validate_node
    )

    # Verifier Agent
    workflow.add_node(
        "verifier",
        verifier_node
    )

    # Anomaly Detection Node
    workflow.add_node(
        "anomaly",
        anomaly_node
    )

    # Human Review Node
    workflow.add_node(
        "human_review",
        human_review_node
    )

    # Entry Point
    workflow.set_entry_point(
        "planner"
    )

    # Workflow Edges

    workflow.add_edge(
        "planner",
        "retriever"
    )

    workflow.add_edge(
        "retriever",
        "extract"
    )

    workflow.add_edge(
        "extract",
        "validate"
    )

    workflow.add_edge(
        "validate",
        "verifier"
    )

    workflow.add_edge(
        "verifier",
        "anomaly"
    )

    # Human Review Routing
    workflow.add_conditional_edges(
        "anomaly",
        review_router,
        {
            "human_review": "human_review",
            "complete": END
        }
    )

    workflow.add_edge(
        "human_review",
        END
    )

    return workflow.compile(
        checkpointer=checkpointer
    )
