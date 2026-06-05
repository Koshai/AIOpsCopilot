from typing import List, Set

from sqlalchemy.orm import Session

from app.models.embedding import Embedding


class EmbeddingRepository:
    @staticmethod
    def create_embedding(
        db: Session,
        document_id: int,
        chunk_text: str,
        embedding_vector
    ):

        embedding = Embedding(
            document_id=document_id,
            chunk_text=chunk_text,
            embedding=embedding_vector
        )

        db.add(embedding)
        db.commit()

        return embedding

    @staticmethod
    def get_indexed_document_ids(
        db: Session,
        document_ids: List[int],
    ) -> Set[int]:
        if not document_ids:
            return set()

        rows = (
            db.query(Embedding.document_id)
            .filter(Embedding.document_id.in_(document_ids))
            .distinct()
            .all()
        )
        return {row[0] for row in rows}