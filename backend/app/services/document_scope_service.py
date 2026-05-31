from typing import Optional

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.repositories.document_repository import DocumentRepository


class DocumentScopeService:
    """Resolve which document to scope retrieval to without requiring users to know IDs."""

    @staticmethod
    def resolve_document_id(
        db: Session,
        *,
        owner_id: int = 1,
        document_id: Optional[int] = None,
        filename: Optional[str] = None,
        search_all_documents: bool = False,
    ) -> Optional[int]:
        if search_all_documents:
            return None

        if document_id is not None:
            document = DocumentRepository.get_by_id(db, document_id)
            if document is None:
                raise HTTPException(
                    status_code=404,
                    detail=f"Document {document_id} not found.",
                )
            return document.id

        if filename:
            document = DocumentRepository.find_by_filename(
                db,
                filename=filename,
                owner_id=owner_id,
            )
            if document is None:
                raise HTTPException(
                    status_code=404,
                    detail=f"No document found matching filename '{filename}'.",
                )
            return document.id

        latest = DocumentRepository.get_latest_for_owner(db, owner_id)
        if latest is None:
            return None

        return latest.id

    @staticmethod
    def describe_scope(
        db: Session,
        document_id: Optional[int],
    ) -> Optional[dict]:
        if document_id is None:
            return None

        document = DocumentRepository.get_by_id(db, document_id)
        if document is None:
            return {"document_id": document_id}

        return {
            "document_id": document.id,
            "filename": document.filename,
            "file_type": document.file_type,
        }
