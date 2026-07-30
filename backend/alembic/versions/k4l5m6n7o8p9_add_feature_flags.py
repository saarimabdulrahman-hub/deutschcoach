"""add feature_flags table

Revision ID: k4l5m6n7o8p9
Revises: j3k4l5m6n7o8
Create Date: 2026-07-29 23:30:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


revision: str = "k4l5m6n7o8p9"
down_revision: Union[str, None] = "j3k4l5m6n7o8"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


FLAGS = [
    {"key": "interactive-dialogue", "desc": "Interactive dialogue blocks in lessons"},
    {"key": "stage-based-lessons", "desc": "Stage-based lesson progression"},
    {"key": "emma-in-lesson", "desc": "Emma AI tutor integrated into lessons"},
    {"key": "adaptive-vocab", "desc": "Adaptive vocabulary injection"},
    {"key": "native-audio", "desc": "Native-quality audio playback"},
]


def upgrade() -> None:
    op.create_table(
        "feature_flags",
        sa.Column("id", sa.Integer(), primary_key=True, index=True),
        sa.Column("flag_key", sa.String(100), unique=True, nullable=False, index=True),
        sa.Column("enabled", sa.Boolean(), nullable=False, server_default="0"),
        sa.Column("rollout_pct", sa.Float(), nullable=False, server_default="0.0"),
        sa.Column("description", sa.String(500), nullable=True),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(), server_default=sa.func.now(), onupdate=sa.func.now()),
    )

    # Seed required flags
    for flag in FLAGS:
        op.execute(
            f"INSERT INTO feature_flags (flag_key, enabled, rollout_pct, description) "
            f"VALUES ('{flag['key']}', 1, 100.0, '{flag['desc']}')"
        )


def downgrade() -> None:
    op.drop_table("feature_flags")
