"""add emma_cache table

Revision ID: g0h1i2j3k4l5
Revises: f0e1d2c3b4a5
Create Date: 2026-07-29 19:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


revision: str = "g0h1i2j3k4l5"
down_revision: Union[str, None] = "f0e1d2c3b4a5"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "emma_cache",
        sa.Column("id", sa.Integer(), primary_key=True, index=True),
        sa.Column("cache_key", sa.String(255), unique=True, nullable=False, index=True),
        sa.Column("response_type", sa.String(20), nullable=False, index=True),
        sa.Column("response_text", sa.Text(), nullable=False),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(), server_default=sa.func.now(), onupdate=sa.func.now()),
    )


def downgrade() -> None:
    op.drop_table("emma_cache")
