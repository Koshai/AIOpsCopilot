from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.db.deps import get_db

from app.graphs.multi_agent_invoice_graph import (
    build_multi_agent_graph
)

from app.graphs.tracing import traced_workflow

from app.core.metrics import Timer

router = APIRouter()


class MultiAgentRequest(BaseModel):

    question: str

    thread_id: str


@router.post("/multi-agent/invoice")
async def multi_agent_invoice(
    request: MultiAgentRequest,
    db: Session = Depends(get_db)
):

    graph = build_multi_agent_graph(db)

    with Timer() as timer:

        result = traced_workflow(
            graph,

            {
                "question": request.question,
                "retry_count": 0
            },

            config={
                "configurable": {
                    "thread_id": request.thread_id
                }
            }
        )

    result["execution_time"] = timer.duration

    return result