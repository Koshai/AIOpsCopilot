from fastapi import APIRouter, UploadFile, File, Depends
from sqlalchemy.orm import Session

from app.db.deps import get_db
from app.schemas.document import DocumentResponse
from app.services.document_service import DocumentService

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

    return result["document"]