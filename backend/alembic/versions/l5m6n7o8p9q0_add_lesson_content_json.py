"""add lesson_content_json to lessons

Revision ID: l5m6n7o8p9q0
Revises: k4l5m6n7o8p9
Create Date: 2026-07-30 00:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


revision: str = "l5m6n7o8p9q0"
down_revision: Union[str, None] = "k4l5m6n7o8p9"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("lessons", sa.Column("lesson_content_json", sa.JSON(), nullable=True))


def downgrade() -> None:
    op.drop_column("lessons", "lesson_content_json")
