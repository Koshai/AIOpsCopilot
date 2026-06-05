from app.agents.planner_agent import PlannerAgent
from app.websocket.events import WorkflowEvents


def planner_node(state):
    WorkflowEvents.node_started(
        "planner",
        "Planner agent creating execution plan...",
    )

    plan = PlannerAgent.plan(state["question"])

    WorkflowEvents.node_completed("planner", "Execution plan ready")

    return {
        "plan": plan
    }
