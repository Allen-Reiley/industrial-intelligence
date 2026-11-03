"""add client webhook urls

Revision ID: 8f10321a5b81
Revises: 3976be107024
Create Date: 2026-09-20 20:30:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import sqlmodel


# revision identifiers, used by Alembic.
revision: str = '8f10321a5b81'
down_revision: Union[str, Sequence[str], None] = '3976be107024'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('client', sa.Column('slack_webhook_url', sqlmodel.sql.sqltypes.AutoString(), nullable=True))
    op.add_column('client', sa.Column('crm_webhook_url', sqlmodel.sql.sqltypes.AutoString(), nullable=True))
    op.add_column('client', sa.Column('airtable_base_id', sqlmodel.sql.sqltypes.AutoString(), nullable=True))
    op.add_column('client', sa.Column('airtable_api_key', sqlmodel.sql.sqltypes.AutoString(), nullable=True))

def downgrade() -> None:
    op.drop_column('client', 'airtable_api_key')
    op.drop_column('client', 'airtable_base_id')
    op.drop_column('client', 'crm_webhook_url')
    op.drop_column('client', 'slack_webhook_url')
