from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.db.deps import get_db
from app.retrieval.vector_search import VectorSearchService
from app.services.rag_service import RAGService

router = APIRouter()


class QuestionRequest(BaseModel):
    question: str


@router.post("/ask")
async def ask_question(
    request: QuestionRequest,
    db: Session = Depends(get_db)
):

    chunks = VectorSearchService.search_similar_chunks(
        db=db,
        query=request.question
    )

    answer = RAGService.generate_answer(
        question=request.question,
        chunks=chunks
    )

    citations = [
        {
            "document_id": chunk.document_id,
            "preview": chunk.chunk_text[:200]
        }
        for chunk in chunks
    ]

    return {
        "answer": answer,
        "citations": citations
    }