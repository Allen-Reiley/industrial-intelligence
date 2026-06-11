"""add_username_to_user_table

Revision ID: a8b27c34ef56
Revises: 269208b2884a
Create Date: 2026-06-11 17:50:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a8b27c34ef56'
down_revision: Union[str, Sequence[str], None] = '269208b2884a'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Check if the username column already exists to prevent errors
    conn = op.get_bind()
    res = conn.execute(sa.text(
        "SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user' AND column_name = 'username')"
    )).scalar()
    if not res:
        op.add_column('user', sa.Column('username', sa.String(length=255), nullable=True))
        op.create_index(op.f('ix_user_username'), 'user', ['username'], unique=True)


def downgrade() -> None:
    op.drop_index(op.f('ix_user_username'), table_name='user')
    op.drop_column('user', 'username')
