"""add workflow_definitions table

Revision ID: c4e8a1f92b07
Revises: b8f4c2a91d03
Create Date: 2026-05-31 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

from app.data.workflow_definition_seeds import WORKFLOW_DEFINITION_SEEDS


revision: str = "c4e8a1f92b07"
down_revision: Union[str, Sequence[str], None] = "b8f4c2a91d03"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "workflow_definitions",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("workflow_type", sa.String(), nullable=False),
        sa.Column("display_name", sa.String(), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("icon", sa.String(), nullable=False),
        sa.Column("schema_name", sa.String(), nullable=False),
        sa.Column(
            "enabled",
            sa.Boolean(),
            server_default=sa.text("true"),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("workflow_type"),
    )
    op.create_index(
        op.f("ix_workflow_definitions_id"),
        "workflow_definitions",
        ["id"],
        unique=False,
    )
    op.create_index(
        op.f("ix_workflow_definitions_workflow_type"),
        "workflow_definitions",
        ["workflow_type"],
        unique=False,
    )
    op.create_index(
        op.f("ix_workflow_definitions_schema_name"),
        "workflow_definitions",
        ["schema_name"],
        unique=False,
    )

    workflow_definitions = sa.table(
        "workflow_definitions",
        sa.column("workflow_type", sa.String),
        sa.column("display_name", sa.String),
        sa.column("description", sa.Text),
        sa.column("icon", sa.String),
        sa.column("schema_name", sa.String),
        sa.column("enabled", sa.Boolean),
    )
    op.bulk_insert(workflow_definitions, WORKFLOW_DEFINITION_SEEDS)


def downgrade() -> None:
    op.drop_index(
        op.f("ix_workflow_definitions_schema_name"),
        table_name="workflow_definitions",
    )
    op.drop_index(
        op.f("ix_workflow_definitions_workflow_type"),
        table_name="workflow_definitions",
    )
    op.drop_index(
        op.f("ix_workflow_definitions_id"),
        table_name="workflow_definitions",
    )
    op.drop_table("workflow_definitions")
