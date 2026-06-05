from typing import List

from sqlalchemy.orm import Session

from app.models.document import Document
from app.repositories.document_repository import DocumentRepository
from app.repositories.embedding_repository import EmbeddingRepository
from app.schemas.document import DocumentResponse


class DocumentQueryService:
    @staticmethod
    def list_for_owner(
        db: Session,
        owner_id: int = 1,
    ) -> List[DocumentResponse]:
        documents = DocumentRepository.list_for_owner(db, owner_id)
        return DocumentQueryService.to_responses(db, documents)

    @staticmethod
    def to_response(db: Session, document: Document) -> DocumentResponse:
        return DocumentQueryService.to_responses(db, [document])[0]

    @staticmethod
    def to_responses(
        db: Session,
        documents: List[Document],
    ) -> List[DocumentResponse]:
        indexed_ids = EmbeddingRepository.get_indexed_document_ids(
            db,
            [document.id for document in documents],
        )

        return [
            DocumentResponse(
                id=document.id,
                filename=document.filename,
                file_type=document.file_type,
                created_at=document.created_at,
                processing_status=(
                    "indexed" if document.id in indexed_ids else "pending"
                ),
            )
            for document in documents
        ]
