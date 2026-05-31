from sqlalchemy import Boolean, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base_class import Base


class WorkflowDefinition(Base):
    __tablename__ = "workflow_definitions"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    workflow_type: Mapped[str] = mapped_column(
        String,
        unique=True,
        index=True,
    )

    display_name: Mapped[str] = mapped_column(String)

    description: Mapped[str] = mapped_column(Text)

    icon: Mapped[str] = mapped_column(String)

    schema_name: Mapped[str] = mapped_column(String, index=True)

    enabled: Mapped[bool] = mapped_column(Boolean, default=True)
