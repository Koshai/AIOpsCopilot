from contextvars import ContextVar
from typing import Optional

current_thread_id: ContextVar[Optional[str]] = ContextVar(
    "current_thread_id",
    default=None,
)
