from app.graphs.invoice_state import InvoiceWorkflowState


def anomaly_node(state: InvoiceWorkflowState):

    extraction = state["extraction"]

    anomaly_detected = False

    if extraction.total_amount > 100000:
        anomaly_detected = True

    if extraction.currency not in ["USD", "EUR", "GBP"]:
        anomaly_detected = True

    return {
        "anomaly_detected": anomaly_detected
    }