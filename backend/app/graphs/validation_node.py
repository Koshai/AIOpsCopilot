from app.graphs.invoice_state import InvoiceWorkflowState
from app.services.normalizer_service import NormalizerService


def validate_node(state: InvoiceWorkflowState):

    extraction = state["extraction"]

    extraction.currency = (
        NormalizerService.normalize_currency(
            extraction.currency
        )
    )

    valid = True

    if extraction.total_amount <= 0:
        valid = False

    if not extraction.vendor_name:
        valid = False

    return {
        "validation_passed": valid,
        "extraction": extraction
    }