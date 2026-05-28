from sqlalchemy import String, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base_class import Base


class Document(Base):
    __tablename__ = "documents"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    filename: Mapped[str] = mapped_column(String)

    file_type: Mapped[str] = mapped_column(String)

    owner_id: Mapped[int] = mapped_column(
        ForeignKey("users.id")
    )