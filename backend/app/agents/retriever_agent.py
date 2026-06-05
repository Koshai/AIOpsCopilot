from typing import Optional

from sqlalchemy.orm import Session

from app.models.embedding import Embedding
from app.retrieval.hybrid_search import HybridSearchService
from app.retrieval.reranker import RerankerService

MAX_FULL_DOCUMENT_CHUNKS = 20


class RetrieverAgent:
    @staticmethod
    def retrieve(
        db: Session,
        query: str,
        document_id: Optional[int] = None,
    ):
        if document_id is not None:
            document_chunks = (
                db.query(Embedding)
                .filter(Embedding.document_id == document_id)
                .order_by(Embedding.id)
                .all()
            )

            if document_chunks and len(document_chunks) <= MAX_FULL_DOCUMENT_CHUNKS:
                return "\n\n".join(chunk.chunk_text for chunk in document_chunks)

        chunks = HybridSearchService.hybrid_search(
            db=db,
            query=query,
            document_id=document_id,
        )

        reranked = RerankerService.rerank(
            query=query,
            chunks=chunks,
        )

        return "\n\n".join(chunk.chunk_text for chunk in reranked)
