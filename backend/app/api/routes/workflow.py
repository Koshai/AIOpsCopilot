from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.deps import get_db
from app.graphs.workflow_graph import build_workflow_graph
from app.schemas.workflow import WorkflowRunRequest
from app.extraction.schema_registry import SchemaRegistry
from app.services.document_scope_service import DocumentScopeService
from app.services.workflow_execution_service import WorkflowExecutionService

router = APIRouter()


@router.post("/workflow/execute")
async def execute_workflow(
    request: WorkflowRunRequest,
    db: Session = Depends(get_db),
):
    SchemaRegistry.get(request.workflow_type)

    graph = build_workflow_graph(db)

    document_id = DocumentScopeService.resolve_document_id(
        db,
        document_id=request.document_id,
        filename=request.filename,
        search_all_documents=request.search_all_documents,
    )

    initial_state = {
        "question": request.question,
        "workflow_type": request.workflow_type,
        "retry_count": 0,
    }

    if document_id is not None:
        initial_state["document_id"] = document_id

    result, execution = WorkflowExecutionService.run_tracked(
        db,
        graph=graph,
        initial_state=initial_state,
        thread_id=request.thread_id,
        workflow_type=request.workflow_type,
        document_id=document_id,
    )

    result["document_scope"] = DocumentScopeService.describe_scope(
        db,
        document_id,
    )

    return WorkflowExecutionService.attach_to_result(result, execution)
