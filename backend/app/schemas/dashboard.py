from pydantic import BaseModel


class DashboardSummaryResponse(BaseModel):
    workflow_count: int
    document_count: int
    pending_reviews: int
    available_schemas: int
