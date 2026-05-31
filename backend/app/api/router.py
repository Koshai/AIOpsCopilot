from fastapi import APIRouter

from app.api.routes import (
    health,
    upload,
    documents,
    dashboard,
    schemas,
    workflow_definitions,
    executions,
    rag,
    extraction,
    workflow,
    multi_agent,
    review,
    ws,
)

api_router = APIRouter()

api_router.include_router(
    health.router,
    tags=["Health"]
)

api_router.include_router(
    upload.router,
    tags=["Upload"]
)

api_router.include_router(
    documents.router,
    tags=["Documents"]
)

api_router.include_router(
    dashboard.router,
    tags=["Dashboard"]
)

api_router.include_router(
    schemas.router,
    tags=["Workflow Catalog"]
)

api_router.include_router(
    workflow_definitions.router,
    tags=["Workflow Definitions"]
)

api_router.include_router(
    executions.router,
    tags=["Executions"]
)

api_router.include_router(
    rag.router,
    tags=["RAG"]
)

api_router.include_router(
    extraction.router,
    tags=["Extraction"]
)

api_router.include_router(
    workflow.router,
    tags=["Workflow"]
)

api_router.include_router(
    multi_agent.router,
    tags=["Multi-Agent"]
)

api_router.include_router(
    review.router,
    tags=["Review"]
)

api_router.include_router(ws.router)