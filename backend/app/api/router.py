from fastapi import APIRouter

from app.api.routes import health, upload, rag, extraction, workflow, multi_agent, review, ws

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