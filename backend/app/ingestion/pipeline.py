from sqlalchemy.orm import Session

from app.ingestion.pdf_loader import PDFLoaderService
from app.ingestion.chunker import ChunkingService
from app.ingestion.embedder import EmbeddingService
from app.repositories.embedding_repository import EmbeddingRepository


class IngestionPipeline:
    @staticmethod
    def process_pdf(
        db: Session,
        document_id: int,
        file_path: str
    ):

        documents = PDFLoaderService.load_pdf(file_path)

        chunks = ChunkingService.chunk_documents(documents)

        for chunk in chunks:

            vector = EmbeddingService.embed_text(
                chunk.page_content
            )

            EmbeddingRepository.create_embedding(
                db=db,
                document_id=document_id,
                chunk_text=chunk.page_content,
                embedding_vector=vector
            )