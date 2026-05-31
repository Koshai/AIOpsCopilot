from typing import List, Optional

from sqlalchemy import desc, func
from sqlalchemy.orm import Session

from app.models.document import Document


class DocumentRepository:
    @staticmethod
    def create_document(
        db: Session,
        filename: str,
        file_type: str,
        owner_id: int
    ) -> Document:

        document = Document(
            filename=filename,
            file_type=file_type,
            owner_id=owner_id
        )

        db.add(document)
        db.commit()
        db.refresh(document)

        return document

    @staticmethod
    def get_by_id(db: Session, document_id: int) -> Optional[Document]:
        return db.get(Document, document_id)

    @staticmethod
    def get_latest_for_owner(
        db: Session,
        owner_id: int,
    ) -> Optional[Document]:
        return (
            db.query(Document)
            .filter(Document.owner_id == owner_id)
            .order_by(desc(Document.id))
            .first()
        )

    @staticmethod
    def find_by_filename(
        db: Session,
        filename: str,
        owner_id: int,
    ) -> Optional[Document]:
        exact = (
            db.query(Document)
            .filter(
                Document.owner_id == owner_id,
                Document.filename == filename,
            )
            .order_by(desc(Document.id))
            .first()
        )
        if exact:
            return exact

        return (
            db.query(Document)
            .filter(
                Document.owner_id == owner_id,
                Document.filename.ilike(f"%{filename}%"),
            )
            .order_by(desc(Document.id))
            .first()
        )

    @staticmethod
    def list_for_owner(db: Session, owner_id: int) -> List[Document]:
        return (
            db.query(Document)
            .filter(Document.owner_id == owner_id)
            .order_by(desc(Document.id))
            .all()
        )

    @staticmethod
    def count_for_owner(db: Session, owner_id: int) -> int:
        return (
            db.query(func.count(Document.id))
            .filter(Document.owner_id == owner_id)
            .scalar()
            or 0
        )