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