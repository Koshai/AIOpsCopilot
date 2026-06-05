"""add contract workflow definition

Revision ID: e9f2c4d81a03
Revises: d7a3b5c91e12
Create Date: 2026-05-28 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "e9f2c4d81a03"
down_revision: Union[str, Sequence[str], None] = "d7a3b5c91e12"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

CONTRACT_DEFINITION = {
    "workflow_type": "contract",
    "display_name": "Contract Review",
    "description": "Extract contract metadata and clauses.",
    "icon": "file-text",
    "schema_name": "contract",
    "enabled": True,
}


def upgrade() -> None:
    workflow_definitions = sa.table(
        "workflow_definitions",
        sa.column("workflow_type", sa.String),
        sa.column("display_name", sa.String),
        sa.column("description", sa.Text),
        sa.column("icon", sa.String),
        sa.column("schema_name", sa.String),
        sa.column("enabled", sa.Boolean),
    )

    bind = op.get_bind()
    existing = bind.execute(
        sa.text(
            "SELECT workflow_type FROM workflow_definitions "
            "WHERE workflow_type = :workflow_type"
        ),
        {"workflow_type": CONTRACT_DEFINITION["workflow_type"]},
    ).fetchone()

    if existing is None:
        op.bulk_insert(workflow_definitions, [CONTRACT_DEFINITION])


def downgrade() -> None:
    op.execute(
        sa.text(
            "DELETE FROM workflow_definitions "
            "WHERE workflow_type = :workflow_type"
        ),
        {"workflow_type": CONTRACT_DEFINITION["workflow_type"]},
    )
