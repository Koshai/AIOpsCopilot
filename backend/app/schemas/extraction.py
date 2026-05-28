from pydantic import BaseModel
from typing import Optional


class InvoiceExtraction(BaseModel):
    vendor_name: str

    invoice_number: str

    invoice_date: str

    total_amount: float

    currency: str

    tax_amount: Optional[float] = None