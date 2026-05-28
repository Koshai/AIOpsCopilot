from sqlalchemy.orm import Session

from app.retrieval.vector_search import (
    VectorSearchService
)

from app.retrieval.bm25_search import (
    BM25SearchService
)


class HybridSearchService:

    @staticmethod
    def hybrid_search(
        db: Session,
        query: str
    ):

        semantic_results = (
            VectorSearchService.search_similar_chunks(
                db=db,
                query=query,
                limit=5
            )
        )

        keyword_results = (
            BM25SearchService.keyword_search(
                db=db,
                query=query,
                limit=5
            )
        )

        combined = []

        seen = set()

        for result in semantic_results:

            if result.chunk_text not in seen:

                combined.append(result)

                seen.add(result.chunk_text)

        for result in keyword_results:

            if result.chunk_text not in seen:

                combined.append(result)

                seen.add(result.chunk_text)

        return combined[:8]