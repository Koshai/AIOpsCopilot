from typing import Optional

from rank_bm25 import BM25Okapi

from sqlalchemy.orm import Session

from app.models.embedding import Embedding


class BM25SearchService:

    @staticmethod
    def keyword_search(
        db: Session,
        query: str,
        limit: int = 5,
        document_id: Optional[int] = None,
    ):

        query_builder = db.query(Embedding)

        if document_id is not None:
            query_builder = query_builder.filter(
                Embedding.document_id == document_id
            )

        embeddings = query_builder.all()

        documents = [
            embedding.chunk_text
            for embedding in embeddings
        ]

        tokenized_docs = [
            doc.split()
            for doc in documents
        ]

        bm25 = BM25Okapi(tokenized_docs)

        tokenized_query = query.split()

        scores = bm25.get_scores(
            tokenized_query
        )

        ranked = sorted(
            zip(embeddings, scores),
            key=lambda x: x[1],
            reverse=True
        )

        return [
            item[0]
            for item in ranked[:limit]
        ]