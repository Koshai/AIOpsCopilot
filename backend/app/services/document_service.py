from fastapi import UploadFile
from sqlalchemy.orm import Session

from app.core.config import settings
from app.ingestion.pipeline import IngestionPipeline
from app.repositories.document_repository import DocumentRepository
from app.storage.local_storage import LocalStorage

from app.tasks.ingestion_tasks import process_pdf_task

from app.ingestion.chunker import ChunkingService
from app.ingestion.embedder import EmbeddingService
from app.repositories.embedding_repository import (
    EmbeddingRepository
)

from app.ocr.ocr_ingestion import OCRIngestionService



class DocumentService:
    @staticmethod
    async def upload_document(
        db: Session,
        file: UploadFile,
        owner_id: int = 1
    ):

        saved_path = await LocalStorage.save_file(file)

        document = DocumentRepository.create_document(
            db=db,
            filename=file.filename,
            file_type=file.content_type,
            owner_id=owner_id
        )

        if file.content_type == "application/pdf":

            if settings.INGESTION_SYNC:
                IngestionPipeline.process_pdf(
                    db=db,
                    document_id=document.id,
                    file_path=saved_path,
                )
            else:
                process_pdf_task.delay(
                    document_id=document.id,
                    file_path=saved_path,
                )
        elif file.content_type.startswith("image/"):

            documents = OCRIngestionService.process_image(
                saved_path
            )

            chunks = ChunkingService.chunk_documents(
                documents
            )

            for chunk in chunks:

                vector = EmbeddingService.embed_text(
                    chunk.page_content
                )

                EmbeddingRepository.create_embedding(
                    db=db,
                    document_id=document.id,
                    chunk_text=chunk.page_content,
                    embedding_vector=vector
                )

        return {
            "document": document,
            "path": saved_path
        }