from app.graphs.invoice_state import InvoiceWorkflowState

from app.agents.planner_agent import PlannerAgent

from app.websocket.events import (
    WorkflowEvents
)


def planner_node(state):

    WorkflowEvents.emit_from_sync(
        "Planner agent creating execution plan..."
    )

    plan = PlannerAgent.plan(
        state["question"]
    )

    return {
        "plan": plan
    }