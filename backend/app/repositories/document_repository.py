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