from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.db.deps import get_db
from app.retrieval.vector_search import VectorSearchService
from app.extraction.schema_registry import SchemaRegistry
from app.services.extraction_service import ExtractionService

router = APIRouter()


class ExtractionRequest(BaseModel):
    question: str
    workflow_type: str = "invoice"


@router.post("/extract/invoice")
async def extract_invoice(
    request: ExtractionRequest,
    db: Session = Depends(get_db)
):

    chunks = VectorSearchService.search_similar_chunks(
        db=db,
        query=request.question,
        limit=10
    )

    context = "\n\n".join(
        [chunk.chunk_text for chunk in chunks]
    )

    SchemaRegistry.get(request.workflow_type)

    result = ExtractionService.extract(
        context=context,
        question=request.question,
        workflow_type=request.workflow_type,
    )

    return result