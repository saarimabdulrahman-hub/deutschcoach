"""add lesson session, checkpoint result, stage progress tables + stages_config

Revision ID: f0e1d2c3b4a5
Revises: e9f8d7c6b5a4
Create Date: 2026-07-29 18:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


revision: str = "f0e1d2c3b4a5"
down_revision: Union[str, None] = "e9f8d7c6b5a4"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add stages_config to lessons
    op.add_column("lessons", sa.Column("stages_config", sa.JSON(), nullable=True))

    # Create lesson_sessions
    op.create_table(
        "lesson_sessions",
        sa.Column("id", sa.Integer(), primary_key=True, index=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=False, index=True),
        sa.Column("lesson_id", sa.Integer(), sa.ForeignKey("lessons.id"), nullable=False, index=True),
        sa.Column("status", sa.String(20), nullable=False, server_default="in_progress"),
        sa.Column("score", sa.Float(), nullable=True),
        sa.Column("started_at", sa.DateTime(), server_default=sa.func.now()),
        sa.Column("completed_at", sa.DateTime(), nullable=True),
    )

    # Create checkpoint_results
    op.create_table(
        "checkpoint_results",
        sa.Column("id", sa.Integer(), primary_key=True, index=True),
        sa.Column("session_id", sa.Integer(), sa.ForeignKey("lesson_sessions.id"), nullable=False, index=True),
        sa.Column("checkpoint_id", sa.String(50), nullable=False),
        sa.Column("correct", sa.Integer(), nullable=False),
        sa.Column("total", sa.Integer(), nullable=False),
        sa.Column("pct", sa.Float(), nullable=False),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now()),
    )

    # Create lesson_stage_progress
    op.create_table(
        "lesson_stage_progress",
        sa.Column("id", sa.Integer(), primary_key=True, index=True),
        sa.Column("session_id", sa.Integer(), sa.ForeignKey("lesson_sessions.id"), nullable=False, index=True),
        sa.Column("stage_key", sa.String(50), nullable=False),
        sa.Column("status", sa.String(20), nullable=False, server_default="completed"),
        sa.Column("completed_at", sa.DateTime(), server_default=sa.func.now()),
    )


def downgrade() -> None:
    op.drop_table("lesson_stage_progress")
    op.drop_table("checkpoint_results")
    op.drop_table("lesson_sessions")
    op.drop_column("lessons", "stages_config")
