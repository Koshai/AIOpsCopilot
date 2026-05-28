from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.db.deps import get_db
from app.graphs.invoice_graph import build_invoice_graph
from app.graphs.tracing import traced_workflow
from app.core.metrics import Timer

router = APIRouter()


class WorkflowRequest(BaseModel):
    question: str
    thread_id: str


@router.post("/workflow/invoice")
async def invoice_workflow(
    request: WorkflowRequest,
    db: Session = Depends(get_db)
):

    graph = build_invoice_graph(db)

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