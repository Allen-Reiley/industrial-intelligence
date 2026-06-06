"""rename_waitlist_lead_to_prospect

Revision ID: 2fd7136b9308
Revises: 1ac2f9ae2341
Create Date: 2026-06-06 15:48:24.022591

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import sqlmodel
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '2fd7136b9308'
down_revision: Union[str, Sequence[str], None] = '1ac2f9ae2341'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # 1. Drop old indexes on waitlist_lead
    op.drop_index('ix_waitlist_lead_aura_id', table_name='waitlist_lead')
    op.drop_index('ix_waitlist_lead_client_id', table_name='waitlist_lead')
    op.drop_index('ix_waitlist_lead_company_id', table_name='waitlist_lead')
    op.drop_index('ix_waitlist_lead_email', table_name='waitlist_lead')
    op.drop_index('ix_waitlist_lead_id', table_name='waitlist_lead')

    # 2. Rename the table
    op.rename_table('waitlist_lead', 'prospect')

    # 3. Add status and calendly_event_uuid columns
    op.add_column('prospect', sa.Column('status', sa.String(), nullable=False, server_default='demo_requested'))
    op.add_column('prospect', sa.Column('calendly_event_uuid', sa.String(), nullable=True))

    # 4. Rename constraints
    op.execute("ALTER TABLE prospect RENAME CONSTRAINT waitlist_lead_pkey TO prospect_pkey")
    op.execute("ALTER TABLE prospect RENAME CONSTRAINT waitlist_lead_client_id_fkey TO prospect_client_id_fkey")
    op.execute("ALTER TABLE prospect RENAME CONSTRAINT waitlist_lead_company_id_fkey TO prospect_company_id_fkey")

    # 5. Create new indexes on prospect
    op.create_index(op.f('ix_prospect_id'), 'prospect', ['id'], unique=False)
    op.create_index(op.f('ix_prospect_client_id'), 'prospect', ['client_id'], unique=False)
    op.create_index(op.f('ix_prospect_company_id'), 'prospect', ['company_id'], unique=False)
    op.create_index(op.f('ix_prospect_email'), 'prospect', ['email'], unique=False)
    op.create_index(op.f('ix_prospect_aura_id'), 'prospect', ['aura_id'], unique=False)
    op.create_index(op.f('ix_prospect_status'), 'prospect', ['status'], unique=False)
    op.create_index(op.f('ix_prospect_calendly_event_uuid'), 'prospect', ['calendly_event_uuid'], unique=False)


def downgrade() -> None:
    """Downgrade schema."""
    # 1. Drop new indexes on prospect
    op.drop_index('ix_prospect_id', table_name='prospect')
    op.drop_index('ix_prospect_client_id', table_name='prospect')
    op.drop_index('ix_prospect_company_id', table_name='prospect')
    op.drop_index('ix_prospect_email', table_name='prospect')
    op.drop_index('ix_prospect_aura_id', table_name='prospect')
    op.drop_index('ix_prospect_status', table_name='prospect')
    op.drop_index('ix_prospect_calendly_event_uuid', table_name='prospect')

    # 2. Drop the status and calendly_event_uuid columns
    op.drop_column('prospect', 'status')
    op.drop_column('prospect', 'calendly_event_uuid')

    # 3. Rename table back to waitlist_lead
    op.rename_table('prospect', 'waitlist_lead')

    # 4. Rename constraints back
    op.execute("ALTER TABLE waitlist_lead RENAME CONSTRAINT prospect_pkey TO waitlist_lead_pkey")
    op.execute("ALTER TABLE waitlist_lead RENAME CONSTRAINT prospect_client_id_fkey TO waitlist_lead_client_id_fkey")
    op.execute("ALTER TABLE waitlist_lead RENAME CONSTRAINT prospect_company_id_fkey TO waitlist_lead_company_id_fkey")

    # 5. Recreate old indexes
    op.create_index('ix_waitlist_lead_id', 'waitlist_lead', ['id'], unique=False)
    op.create_index('ix_waitlist_lead_email', 'waitlist_lead', ['email'], unique=False)
    op.create_index('ix_waitlist_lead_company_id', 'waitlist_lead', ['company_id'], unique=False)
    op.create_index('ix_waitlist_lead_client_id', 'waitlist_lead', ['client_id'], unique=False)
    op.create_index('ix_waitlist_lead_aura_id', 'waitlist_lead', ['aura_id'], unique=False)

