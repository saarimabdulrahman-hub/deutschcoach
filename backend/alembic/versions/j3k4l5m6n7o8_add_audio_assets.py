"""add audio_assets table

Revision ID: j3k4l5m6n7o8
Revises: i2j3k4l5m6n7
Create Date: 2026-07-29 23:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


revision: str = "j3k4l5m6n7o8"
down_revision: Union[str, None] = "i2j3k4l5m6n7"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "audio_assets",
        sa.Column("id", sa.Integer(), primary_key=True, index=True),
        sa.Column("word", sa.String(255), nullable=False, index=True),
        sa.Column("filename", sa.String(500), nullable=False),
        sa.Column("slow_filename", sa.String(500), nullable=True),
        sa.Column("cefr_level", sa.String(10), nullable=True),
        sa.Column("has_normal", sa.Boolean(), nullable=False, server_default="1"),
        sa.Column("has_slow", sa.Boolean(), nullable=False, server_default="0"),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now()),
    )


def downgrade() -> None:
    op.drop_table("audio_assets")
