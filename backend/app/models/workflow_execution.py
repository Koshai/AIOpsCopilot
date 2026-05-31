from datetime import datetime
from typing import Optional

from sqlalchemy import Boolean, DateTime, Float, ForeignKey, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base_class import Base


class WorkflowExecutionStatus:
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    AWAITING_REVIEW = "awaiting_review"


class WorkflowExecution(Base):
    __tablename__ = "workflow_executions"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    workflow_type: Mapped[str] = mapped_column(String, index=True)

    thread_id: Mapped[str] = mapped_column(String, unique=True, index=True)

    status: Mapped[str] = mapped_column(String, index=True)

    document_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("documents.id"),
        nullable=True,
        index=True,
    )

    started_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
    )

    completed_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    execution_time: Mapped[Optional[float]] = mapped_column(Float, nullable=True)

    requires_review: Mapped[bool] = mapped_column(Boolean, default=False)
