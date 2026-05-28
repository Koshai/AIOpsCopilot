import sys

from celery import Celery
from kombu import Queue

from app.core.config import settings


celery_app = Celery(
    "ai_ops_worker",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL,
    include=["app.tasks.ingestion_tasks"],
)

celery_app.conf.task_queues = (Queue("ai_pipeline"),)
celery_app.conf.task_default_queue = "ai_pipeline"
celery_app.conf.task_routes = {
    "app.tasks.*": {"queue": "ai_pipeline"},
}

# Prefork/spawn pools use billiard semaphores that fail on Windows (WinError 5).
if sys.platform == "win32":
    celery_app.conf.worker_pool = "solo"

celery_app.autodiscover_tasks(["app.tasks"])
