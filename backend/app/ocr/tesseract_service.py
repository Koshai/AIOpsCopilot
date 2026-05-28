import pytesseract

from PIL import Image

pytesseract.pytesseract.tesseract_cmd = (
    r"C:\Program Files\Tesseract-OCR\tesseract.exe"
)

class TesseractOCRService:

    @staticmethod
    def extract_text(image_path: str):

        image = Image.open(image_path)

        text = pytesseract.image_to_string(image)

        return text