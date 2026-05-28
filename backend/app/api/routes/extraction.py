from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.db.deps import get_db
from app.retrieval.vector_search import VectorSearchService
from app.services.extraction_service import ExtractionService

router = APIRouter()


class ExtractionRequest(BaseModel):
    question: str


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

    result = ExtractionService.extract_invoice_data(
        context=context
    )

    return result