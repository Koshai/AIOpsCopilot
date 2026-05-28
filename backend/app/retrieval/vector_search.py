from sqlalchemy import text
from sqlalchemy.orm import Session

from app.ingestion.embedder import EmbeddingService


class VectorSearchService:
    @staticmethod
    def search_similar_chunks(
        db: Session,
        query: str,
        limit: int = 5
    ):

        query_embedding = EmbeddingService.embed_text(query)

        sql = text("""
            SELECT
                id,
                document_id,
                chunk_text,
                embedding <-> CAST(:embedding AS vector)
                    AS distance
            FROM embeddings
            ORDER BY distance
            LIMIT :limit
        """)

        result = db.execute(
            sql,
            {
                "embedding": str(query_embedding),
                "limit": limit
            }
        )

        return result.fetchall()