"""remediate_sprint_1_schemas

Revision ID: bbfb38e14939
Revises: ecb2e43447fc
Create Date: 2026-09-18 21:15:00.166669

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import sqlmodel


# revision identifiers, used by Alembic.
revision: str = 'bbfb38e14939'
down_revision: Union[str, Sequence[str], None] = 'ecb2e43447fc'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


from sqlalchemy.dialects import postgresql

def upgrade() -> None:
    # 1. Create Event Table
    op.create_table('event',
        sa.Column('id', sa.Uuid(), nullable=False),
        sa.Column('client_id', sa.Uuid(), nullable=False),
        sa.Column('visit_id', sa.Uuid(), nullable=False),
        sa.Column('event_type', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column('properties', postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column('timestamp', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['client_id'], ['client.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['visit_id'], ['visit.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_event_client_id'), 'event', ['client_id'], unique=False)
    op.create_index(op.f('ix_event_event_type'), 'event', ['event_type'], unique=False)
    op.create_index(op.f('ix_event_id'), 'event', ['id'], unique=False)
    op.create_index(op.f('ix_event_timestamp'), 'event', ['timestamp'], unique=False)
    op.create_index(op.f('ix_event_visit_id'), 'event', ['visit_id'], unique=False)

    # 2. Add Composite Index to Visit
    op.create_index('ix_visit_client_aura_created', 'visit', ['client_id', 'aura_id', 'created_at'], unique=False)

    # 3. Add Unique Constraint to Company
    op.create_unique_constraint('uix_company_client_domain', 'company', ['client_id', 'domain'])

    # 4. Update Foreign Keys to Cascade
    op.drop_constraint('visit_client_id_fkey', 'visit', type_='foreignkey')
    op.drop_constraint('visit_company_id_fkey', 'visit', type_='foreignkey')
    op.create_foreign_key('visit_client_id_fkey', 'visit', 'client', ['client_id'], ['id'], ondelete='CASCADE')
    op.create_foreign_key('visit_company_id_fkey', 'visit', 'company', ['company_id'], ['id'], ondelete='CASCADE')

    op.drop_constraint('company_client_id_fkey', 'company', type_='foreignkey')
    op.create_foreign_key('company_client_id_fkey', 'company', 'client', ['client_id'], ['id'], ondelete='CASCADE')

    op.drop_constraint('prospect_client_id_fkey', 'prospect', type_='foreignkey')
    op.drop_constraint('prospect_company_id_fkey', 'prospect', type_='foreignkey')
    op.create_foreign_key('prospect_client_id_fkey', 'prospect', 'client', ['client_id'], ['id'], ondelete='CASCADE')
    op.create_foreign_key('prospect_company_id_fkey', 'prospect', 'company', ['company_id'], ['id'], ondelete='CASCADE')

    op.drop_constraint('page_view_client_id_fkey', 'page_view', type_='foreignkey')
    op.drop_constraint('page_view_visit_id_fkey', 'page_view', type_='foreignkey')
    op.create_foreign_key('page_view_client_id_fkey', 'page_view', 'client', ['client_id'], ['id'], ondelete='CASCADE')
    op.create_foreign_key('page_view_visit_id_fkey', 'page_view', 'visit', ['visit_id'], ['id'], ondelete='CASCADE')

def downgrade() -> None:
    # 4. Revert Foreign Keys
    op.drop_constraint('page_view_visit_id_fkey', 'page_view', type_='foreignkey')
    op.drop_constraint('page_view_client_id_fkey', 'page_view', type_='foreignkey')
    op.create_foreign_key('page_view_visit_id_fkey', 'page_view', 'visit', ['visit_id'], ['id'])
    op.create_foreign_key('page_view_client_id_fkey', 'page_view', 'client', ['client_id'], ['id'])

    op.drop_constraint('prospect_company_id_fkey', 'prospect', type_='foreignkey')
    op.drop_constraint('prospect_client_id_fkey', 'prospect', type_='foreignkey')
    op.create_foreign_key('prospect_company_id_fkey', 'prospect', 'company', ['company_id'], ['id'])
    op.create_foreign_key('prospect_client_id_fkey', 'prospect', 'client', ['client_id'], ['id'])

    op.drop_constraint('company_client_id_fkey', 'company', type_='foreignkey')
    op.create_foreign_key('company_client_id_fkey', 'company', 'client', ['client_id'], ['id'])

    op.drop_constraint('visit_company_id_fkey', 'visit', type_='foreignkey')
    op.drop_constraint('visit_client_id_fkey', 'visit', type_='foreignkey')
    op.create_foreign_key('visit_company_id_fkey', 'visit', 'company', ['company_id'], ['id'])
    op.create_foreign_key('visit_client_id_fkey', 'visit', 'client', ['client_id'], ['id'])

    # 3. Drop Unique Constraint
    op.drop_constraint('uix_company_client_domain', 'company', type_='unique')

    # 2. Drop Composite Index
    op.drop_index('ix_visit_client_aura_created', table_name='visit')

    # 1. Drop Event Table
    op.drop_index(op.f('ix_event_visit_id'), table_name='event')
    op.drop_index(op.f('ix_event_timestamp'), table_name='event')
    op.drop_index(op.f('ix_event_id'), table_name='event')
    op.drop_index(op.f('ix_event_event_type'), table_name='event')
    op.drop_index(op.f('ix_event_client_id'), table_name='event')
    op.drop_table('event')
