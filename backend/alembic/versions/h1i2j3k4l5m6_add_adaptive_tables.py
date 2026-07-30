"""add concept_confidence, lesson_prerequisites tables + lesson prerequisite fields

Revision ID: h1i2j3k4l5m6
Revises: g0h1i2j3k4l5
Create Date: 2026-07-29 20:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


revision: str = "h1i2j3k4l5m6"
down_revision: Union[str, None] = "g0h1i2j3k4l5"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add prerequisite fields to lessons
    op.add_column("lessons", sa.Column("prerequisite_vocab_ids", sa.JSON(), nullable=True))
    op.add_column("lessons", sa.Column("prerequisite_grammar_topic_ids", sa.JSON(), nullable=True))

    # Create concept_confidence
    op.create_table(
        "concept_confidence",
        sa.Column("id", sa.Integer(), primary_key=True, index=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=False, index=True),
        sa.Column("concept_type", sa.String(20), nullable=False, index=True),
        sa.Column("vocab_entry_id", sa.Integer(), sa.ForeignKey("vocab_entries.id"), nullable=True),
        sa.Column("grammar_topic_id", sa.Integer(), sa.ForeignKey("grammar_topics.id"), nullable=True),
        sa.Column("confidence", sa.Float(), nullable=False, server_default="0.5"),
        sa.Column("easiness_factor", sa.Float(), nullable=False, server_default="2.5"),
        sa.Column("lapse_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("review_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("last_reviewed_at", sa.DateTime(), nullable=True),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(), server_default=sa.func.now(), onupdate=sa.func.now()),
    )

    # Create lesson_prerequisites
    op.create_table(
        "lesson_prerequisites",
        sa.Column("id", sa.Integer(), primary_key=True, index=True),
        sa.Column("lesson_id", sa.Integer(), sa.ForeignKey("lessons.id"), nullable=False, index=True),
        sa.Column("prereq_lesson_id", sa.Integer(), sa.ForeignKey("lessons.id"), nullable=True),
        sa.Column("prereq_vocab_entry_id", sa.Integer(), sa.ForeignKey("vocab_entries.id"), nullable=True),
        sa.Column("prereq_grammar_topic_id", sa.Integer(), sa.ForeignKey("grammar_topics.id"), nullable=True),
        sa.Column("min_confidence", sa.Float(), nullable=False, server_default="0.3"),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now()),
    )


def downgrade() -> None:
    op.drop_table("lesson_prerequisites")
    op.drop_table("concept_confidence")
    op.drop_column("lessons", "prerequisite_grammar_topic_ids")
    op.drop_column("lessons", "prerequisite_vocab_ids")
