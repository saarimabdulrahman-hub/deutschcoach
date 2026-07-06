"""widen gender column from 1 to 10 chars

Revision ID: e1f2a3b4c5d6
Revises: d8e9f0a1b2c3
Create Date: 2026-07-06

The vocab_entries.gender column was String(1) which only allowed 'm', 'f', 'n'.
Curriculum data includes 'pl' (plural) for nouns like 'die Eltern' that exist
only in plural form. Widen to String(10) to be safe for future values.
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "e1f2a3b4c5d6"
down_revision: Union[str, None] = "d8e9f0a1b2c3"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.alter_column(
        "vocab_entries",
        "gender",
        existing_type=sa.String(1),
        type_=sa.String(10),
        existing_nullable=True,
    )


def downgrade() -> None:
    op.alter_column(
        "vocab_entries",
        "gender",
        existing_type=sa.String(10),
        type_=sa.String(1),
        existing_nullable=True,
    )
