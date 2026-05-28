from sqlalchemy.orm import Session

from app.graphs.invoice_state import InvoiceWorkflowState
from app.retrieval.vector_search import VectorSearchService


def retrieve_node(state: InvoiceWorkflowState, db: Session):

    chunks = VectorSearchService.search_similar_chunks(
        db=db,
        query=state["question"],
        limit=10
    )

    context = "\n\n".join(
        [chunk.chunk_text for chunk in chunks]
    )

    return {
        "context": context
    }