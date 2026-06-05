from typing import Optional

from sqlalchemy import text
from sqlalchemy.orm import Session

from app.ingestion.embedder import EmbeddingService


class VectorSearchService:
    @staticmethod
    def search_similar_chunks(
        db: Session,
        query: str,
        limit: int = 5,
        document_id: Optional[int] = None,
    ):

        query_embedding = EmbeddingService.embed_text(query)

        document_filter = (
            "WHERE document_id = :document_id" if document_id is not None else ""
        )

        sql = text(f"""
            SELECT
                id,
                document_id,
                chunk_text,
                embedding <-> CAST(:embedding AS vector)
                    AS distance
            FROM embeddings
            {document_filter}
            ORDER BY distance
            LIMIT :limit
        """)

        params = {
            "embedding": str(query_embedding),
            "limit": limit,
        }

        if document_id is not None:
            params["document_id"] = document_id

        result = db.execute(sql, params)

        return result.fetchall()