from sqlalchemy.orm import Session

from typing import Optional

from app.retrieval.filtering import MetadataFilterService
from app.retrieval.hybrid_search import (
    HybridSearchService
)

from app.retrieval.reranker import (
    RerankerService
)


class RetrieverAgent:

    @staticmethod
    def retrieve(
        db: Session,
        query: str,
        document_id: Optional[int] = None,
    ):

        chunks = (
            HybridSearchService.hybrid_search(
                db=db,
                query=query
            )
        )

        if document_id is not None:
            chunks = MetadataFilterService.filter_by_document(
                chunks,
                document_id,
            )

        reranked = (
            RerankerService.rerank(
                query=query,
                chunks=chunks
            )
        )

        context = "\n\n".join(
            [chunk.chunk_text for chunk in reranked]
        )

        return context