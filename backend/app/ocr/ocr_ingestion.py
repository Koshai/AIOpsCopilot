from langchain.schema import Document

from app.ocr.tesseract_service import (
    TesseractOCRService
)


class OCRIngestionService:

    @staticmethod
    def process_image(image_path: str):

        text = TesseractOCRService.extract_text(
            image_path
        )

        print(text)

        return [
            Document(page_content=text)
        ]