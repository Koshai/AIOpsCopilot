from fastapi import APIRouter

from langgraph.types import Command

from app.graphs.multi_agent_invoice_graph import (
    build_multi_agent_graph
)

router = APIRouter()


@router.post("/review/{thread_id}")
async def approve_review(
    thread_id: str
):

    graph = build_multi_agent_graph(None)

    result = graph.invoke(

        Command(resume=True),

        config={
            "configurable": {
                "thread_id": thread_id
            }
        }
    )

    return result