"""add_wrong_answers_to_quiz_result

Revision ID: 805fe4c28732
Revises: a4b5c6d7e8f9
Create Date: 2026-07-21 10:18:07.885977

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '805fe4c28732'
down_revision: Union[str, Sequence[str], None] = 'a4b5c6d7e8f9'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column('quiz_results', sa.Column('wrong_answers', sa.JSON(), nullable=True))


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('quiz_results', 'wrong_answers')
