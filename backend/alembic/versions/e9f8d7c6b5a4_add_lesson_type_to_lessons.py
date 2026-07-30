"""add lesson_type to lessons

Revision ID: e9f8d7c6b5a4
Revises: d9e8f7c6b5a4
Create Date: 2026-07-29 14:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


revision: str = "e9f8d7c6b5a4"
down_revision: Union[str, None] = "d9e8f7c6b5a4"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("lessons", sa.Column(
        "lesson_type",
        sa.Enum("dialogue", "grammar", "vocabulary", "mixed", name="lessontype"),
        nullable=False,
        server_default="mixed",
    ))


def downgrade() -> None:
    op.drop_column("lessons", "lesson_type")
