import os

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    APP_NAME: str = "AI Ops Copilot"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True

    # When true, PDF ingestion runs in-process (no Celery worker required).
    INGESTION_SYNC: bool = False

    OPENAI_API_KEY: str = ""

    DATABASE_URL: str

    REDIS_URL: str

    LANGCHAIN_TRACING_V2: bool = False

    LANGCHAIN_API_KEY: str = ""

    LANGCHAIN_PROJECT: str = ""

    CORS_ORIGINS: str = "http://localhost:3000,http://localhost:3001"

    model_config = SettingsConfigDict(
        env_file=os.getenv("ENV_FILE", ".env.local"),
        extra="ignore",
    )


settings = Settings()