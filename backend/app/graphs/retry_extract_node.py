from app.graphs.invoice_state import InvoiceWorkflowState
from app.services.extraction_service import ExtractionService


MAX_RETRIES = 2


def retry_extract_node(state: InvoiceWorkflowState):

    retry_count = state.get("retry_count", 0)

    extraction = ExtractionService.extract_invoice_data(
        context=state["context"]
    )

    return {
        "extraction": extraction,
        "retry_count": retry_count + 1
    }