from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

from app.api.router import api_router
from app.core.config import settings
from app.db.session import SessionLocal
from app.models.user import User
from dotenv import load_dotenv
from app.checkpointing.init_checkpointing import (
    initialize_checkpointing
)

load_dotenv(os.getenv("ENV_FILE", ".env.local"))

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        origin.strip()
        for origin in settings.CORS_ORIGINS.split(",")
        if origin.strip()
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)

@app.on_event("startup")
async def startup():

    initialize_checkpointing()

    db = SessionLocal()

    try:
        if db.get(User, 1) is None:
            db.add(
                User(
                    id=1,
                    email="dev@local.test",
                    full_name="Default User",
                )
            )
            db.commit()

    finally:
        db.close()