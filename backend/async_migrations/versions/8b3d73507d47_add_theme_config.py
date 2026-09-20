"""add theme_config to client

Revision ID: 8b3d73507d47
Revises: 8f10321a5b81
Create Date: 2026-09-20 21:30:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import sqlmodel


# revision identifiers, used by Alembic.
revision: str = '8b3d73507d47'
down_revision: Union[str, Sequence[str], None] = '8f10321a5b81'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('client', sa.Column('theme_config', sa.JSON(), nullable=True))


def downgrade() -> None:
    op.drop_column('client', 'theme_config')
