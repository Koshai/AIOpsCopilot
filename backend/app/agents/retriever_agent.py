from sqlalchemy.orm import Session

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
        query: str
    ):

        chunks = (
            HybridSearchService.hybrid_search(
                db=db,
                query=query
            )
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