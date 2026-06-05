from fastapi import APIRouter, UploadFile, File, Depends
from sqlalchemy.orm import Session

from app.db.deps import get_db
from app.schemas.document import DocumentResponse
from app.services.document_service import DocumentService
from app.services.document_query_service import DocumentQueryService

router = APIRouter()


@router.post(
    "/upload",
    response_model=DocumentResponse
)
async def upload_file(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    result = await DocumentService.upload_document(
        db=db,
        file=file
    )

    db.refresh(result["document"])
    return DocumentQueryService.to_response(db, result["document"])