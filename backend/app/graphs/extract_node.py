from app.graphs.invoice_state import InvoiceWorkflowState
from app.services.extraction_service import ExtractionService

from app.websocket.events import (
    WorkflowEvents
)

def extract_node(state: InvoiceWorkflowState):
    WorkflowEvents.emit_from_sync(
        "Extraction agent extracting invoice data..."
    )

    extraction = ExtractionService.extract_invoice_data(
        context=state["context"]
    )

    return {
        "extraction": extraction
    }