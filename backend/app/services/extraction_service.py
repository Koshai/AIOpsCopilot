import instructor

from openai import OpenAI

from app.core.config import settings
from app.schemas.extraction import InvoiceExtraction


client = instructor.from_openai(
    OpenAI(api_key=settings.OPENAI_API_KEY)
)


class ExtractionService:

    @staticmethod
    def extract_invoice_data(
        context: str
    ) -> InvoiceExtraction:

        response = client.chat.completions.create(
            model="gpt-4.1-mini",

            response_model=InvoiceExtraction,

            messages=[
                {
                    "role": "system",
                    "content": """
You are an invoice extraction AI.

Extract structured invoice information
from the provided text.

Return valid structured data only.
"""
                },

                {
                    "role": "user",
                    "content": context
                }
            ]
        )

        return response