"""add workflow_executions table

Revision ID: b8f4c2a91d03
Revises: 373162fa7f87
Create Date: 2026-05-28 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "b8f4c2a91d03"
down_revision: Union[str, Sequence[str], None] = "373162fa7f87"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "workflow_executions",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("workflow_type", sa.String(), nullable=False),
        sa.Column("thread_id", sa.String(), nullable=False),
        sa.Column("status", sa.String(), nullable=False),
        sa.Column("document_id", sa.Integer(), nullable=True),
        sa.Column(
            "started_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("execution_time", sa.Float(), nullable=True),
        sa.Column(
            "requires_review",
            sa.Boolean(),
            server_default=sa.text("false"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["document_id"], ["documents.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("thread_id"),
    )
    op.create_index(
        op.f("ix_workflow_executions_id"),
        "workflow_executions",
        ["id"],
        unique=False,
    )
    op.create_index(
        op.f("ix_workflow_executions_workflow_type"),
        "workflow_executions",
        ["workflow_type"],
        unique=False,
    )
    op.create_index(
        op.f("ix_workflow_executions_thread_id"),
        "workflow_executions",
        ["thread_id"],
        unique=False,
    )
    op.create_index(
        op.f("ix_workflow_executions_status"),
        "workflow_executions",
        ["status"],
        unique=False,
    )
    op.create_index(
        op.f("ix_workflow_executions_document_id"),
        "workflow_executions",
        ["document_id"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index(
        op.f("ix_workflow_executions_document_id"),
        table_name="workflow_executions",
    )
    op.drop_index(
        op.f("ix_workflow_executions_status"),
        table_name="workflow_executions",
    )
    op.drop_index(
        op.f("ix_workflow_executions_thread_id"),
        table_name="workflow_executions",
    )
    op.drop_index(
        op.f("ix_workflow_executions_workflow_type"),
        table_name="workflow_executions",
    )
    op.drop_index(
        op.f("ix_workflow_executions_id"),
        table_name="workflow_executions",
    )
    op.drop_table("workflow_executions")
