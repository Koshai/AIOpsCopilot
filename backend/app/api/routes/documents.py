from typing import Optional

from fastapi import APIRouter, Depends, File, Form, UploadFile
from sqlalchemy.orm import Session

from app.db.deps import get_db
from app.extraction.schema_registry import SchemaRegistry
from app.schemas.document import DocumentResponse
from app.services.document_query_service import DocumentQueryService
from app.services.document_service import DocumentService

router = APIRouter()


@router.get("/documents", response_model=list[DocumentResponse])
async def list_documents(db: Session = Depends(get_db)):
    """List uploaded documents (newest first). Use filename in workflow requests."""
    return DocumentQueryService.list_for_owner(db, owner_id=1)


@router.post("/documents/upload", response_model=DocumentResponse)
async def upload_document(
    file: UploadFile = File(...),
    workflow_type: Optional[str] = Form(None),
    db: Session = Depends(get_db),
):
    """Upload a document with optional target workflow type context."""
    if workflow_type:
        SchemaRegistry.get(workflow_type)

    result = await DocumentService.upload_document(db=db, file=file)
    db.refresh(result["document"])
    return DocumentQueryService.to_response(db, result["document"])
