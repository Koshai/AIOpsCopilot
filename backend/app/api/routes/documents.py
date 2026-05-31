from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.deps import get_db
from app.repositories.document_repository import DocumentRepository
from app.schemas.document import DocumentResponse

router = APIRouter()


@router.get("/documents", response_model=list[DocumentResponse])
async def list_documents(db: Session = Depends(get_db)):
    """List uploaded documents (newest first). Use filename in workflow requests."""
    documents = DocumentRepository.list_for_owner(db, owner_id=1)
    return documents
