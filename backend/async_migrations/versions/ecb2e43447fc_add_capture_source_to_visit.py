"""add_capture_source_to_visit

Revision ID: ecb2e43447fc
Revises: a1b2c3d4e5f6
Create Date: 2026-09-18 20:04:33.765653

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import sqlmodel


# revision identifiers, used by Alembic.
revision: str = 'ecb2e43447fc'
down_revision: Union[str, Sequence[str], None] = 'a1b2c3d4e5f6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column('visit', sa.Column('capture_source', sqlmodel.sql.sqltypes.AutoString(), nullable=True, server_default='banner'))

def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('visit', 'capture_source')
