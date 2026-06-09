"""add_total_visits_to_company

Revision ID: 435521306afe
Revises: 18e8afd302da
Create Date: 2026-06-09 22:37:32.612841

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import sqlmodel


# revision identifiers, used by Alembic.
revision: str = '435521306afe'
down_revision: Union[str, Sequence[str], None] = '18e8afd302da'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    conn = op.get_bind()
    
    # Check if total_visits column exists in company table
    res = conn.execute(sa.text(
        "SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'company' AND column_name = 'total_visits')"
    )).scalar()
    
    if not bool(res):
        op.add_column('company', sa.Column('total_visits', sa.Integer(), nullable=False, server_default='0'))
        op.create_index(op.f('ix_company_total_visits'), 'company', ['total_visits'], unique=False)

    # Ensure the default integration client is active and whitelists auraworks.co.za
    client_exists = conn.execute(sa.text(
        "SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'client')"
    )).scalar()
    
    if bool(client_exists):
        conn.execute(sa.text(
            "UPDATE client SET "
            "whitelisted_domains = ARRAY['testclient.co.za', 'auraworks.co.za', 'www.auraworks.co.za']::varchar[], "
            "is_active = true, "
            "subscription_status = 'ACTIVE' "
            "WHERE id = 'c4a6c9b1-8355-4de2-985d-a04f4dcd63a0'"
        ))


def downgrade() -> None:
    """Downgrade schema."""
    conn = op.get_bind()
    
    # Check if total_visits column exists
    res = conn.execute(sa.text(
        "SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'company' AND column_name = 'total_visits')"
    )).scalar()
    
    if bool(res):
        op.drop_index(op.f('ix_company_total_visits'), table_name='company')
        op.drop_column('company', 'total_visits')
