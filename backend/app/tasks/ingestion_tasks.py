from app.core.celery_app import celery_app

from app.db.session import SessionLocal

from app.ingestion.pipeline import IngestionPipeline


@celery_app.task
def process_pdf_task(
    document_id: int,
    file_path: str
):

    db = SessionLocal()

    try:

        IngestionPipeline.process_pdf(
            db=db,
            document_id=document_id,
            file_path=file_path
        )

    finally:
        db.close()