"""Cascade delete secondary tables, performance indexing, and schema harmonization

Revision ID: e3f4a5b6c7d8
Revises: d2e3f4a5b6c7
Create Date: 2026-10-16 12:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'e3f4a5b6c7d8'
down_revision: Union[str, Sequence[str], None] = 'd2e3f4a5b6c7'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    tables = inspector.get_table_names()

    # -------------------------------------------------------------
    # 1. CASCADE DELETIONS ACROSS SECONDARY ENTITIES (Task 33.2)
    # -------------------------------------------------------------
    target_fk_tables = [
        ('transaction', 'transaction_client_id_fkey'),
        ('checkout_session', 'checkout_session_client_id_fkey'),
        ('crm_dead_letter', 'crm_dead_letter_client_id_fkey'),
        ('enrichment_queue', 'enrichment_queue_client_id_fkey'),
        ('failed_enrichment', 'failed_enrichment_client_id_fkey'),
        ('notification_throttle', 'notification_throttle_client_id_fkey'),
    ]

    for table_name, constraint_name in target_fk_tables:
        if table_name in tables:
            existing_fks = {fk['name']: fk for fk in inspector.get_foreign_keys(table_name)}
            if constraint_name in existing_fks:
                op.drop_constraint(constraint_name, table_name, type_='foreignkey')
            # Recreate with ondelete CASCADE
            op.create_foreign_key(
                constraint_name,
                source_table=table_name,
                referent_table='client',
                local_cols=['client_id'],
                remote_cols=['id'],
                ondelete='CASCADE'
            )

    # -------------------------------------------------------------
    # 2. SCHEMA HARMONIZATION: user_agent, hostname, and client config
    # -------------------------------------------------------------
    if 'visit' in tables:
        visit_cols = {c['name'] for c in inspector.get_columns('visit')}
        if 'user_agent' not in visit_cols:
            op.add_column('visit', sa.Column('user_agent', sa.String(length=500), nullable=True))
        if 'hostname' not in visit_cols:
            op.add_column('visit', sa.Column('hostname', sa.String(), nullable=True))
        if 'duration_seconds' not in visit_cols:
            op.add_column('visit', sa.Column('duration_seconds', sa.Integer(), nullable=True))
        if 'exited_at' not in visit_cols:
            op.add_column('visit', sa.Column('exited_at', sa.DateTime(timezone=True), nullable=True))
        
        if 'client_user_agent' in visit_cols:
            op.execute("UPDATE visit SET user_agent = client_user_agent WHERE user_agent IS NULL AND client_user_agent IS NOT NULL")
            op.drop_column('visit', 'client_user_agent')

    if 'client' in tables:
        client_cols = {c['name'] for c in inspector.get_columns('client')}
        if 'integrations' not in client_cols:
            op.add_column('client', sa.Column('integrations', sa.JSON(), nullable=True))
        if 'notification_config' not in client_cols:
            op.add_column('client', sa.Column('notification_config', sa.JSON(), nullable=True))

    # -------------------------------------------------------------
    # 3. HIGH-FREQUENCY COMPOSITE INDEXES (Task 33.3)
    # -------------------------------------------------------------
    # A. event table: ensure created_at column and create composite index
    if 'event' in tables:
        event_cols = {c['name'] for c in inspector.get_columns('event')}
        if 'created_at' not in event_cols:
            op.add_column('event', sa.Column('created_at', sa.DateTime(timezone=True), nullable=True))
            if 'timestamp' in event_cols:
                op.execute("UPDATE event SET created_at = timestamp WHERE created_at IS NULL")
            else:
                op.execute("UPDATE event SET created_at = NOW() WHERE created_at IS NULL")
        op.execute("""
            CREATE INDEX IF NOT EXISTS ix_events_client_id_event_type_created_at 
            ON event (client_id, event_type, created_at DESC)
        """)

    # B. visit table: composite index on ip_address, created_at DESC
    if 'visit' in tables:
        op.execute("""
            CREATE INDEX IF NOT EXISTS ix_visits_ip_address_created_at 
            ON visit (ip_address, created_at DESC)
        """)

    # C. prospect table: ensure phone column and create composite index
    if 'prospect' in tables:
        prospect_cols = {c['name'] for c in inspector.get_columns('prospect')}
        if 'phone' not in prospect_cols:
            op.add_column('prospect', sa.Column('phone', sa.String(), nullable=True))
        op.execute("""
            CREATE INDEX IF NOT EXISTS ix_prospects_client_id_phone 
            ON prospect (client_id, phone)
        """)
        if 'phone_encrypted' in prospect_cols:
            op.execute("""
                CREATE INDEX IF NOT EXISTS ix_prospects_client_id_phone_encrypted 
                ON prospect (client_id, phone_encrypted)
            """)

    # D. company table: ensure status column and create composite index
    if 'company' in tables:
        company_cols = {c['name'] for c in inspector.get_columns('company')}
        if 'status' not in company_cols:
            op.add_column('company', sa.Column('status', sa.String(), server_default='active', nullable=True))
            op.execute("UPDATE company SET status = 'active' WHERE status IS NULL")
        op.execute("""
            CREATE INDEX IF NOT EXISTS ix_companies_client_id_status 
            ON company (client_id, status)
        """)

    # E. transaction table: composite index on client_id, created_at DESC
    if 'transaction' in tables:
        op.execute("""
            CREATE INDEX IF NOT EXISTS ix_transactions_client_id_created_at 
            ON transaction (client_id, created_at DESC)
        """)


def downgrade() -> None:
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    tables = inspector.get_table_names()

    # Drop composite indexes
    op.execute("DROP INDEX IF EXISTS ix_events_client_id_event_type_created_at")
    op.execute("DROP INDEX IF EXISTS ix_visits_ip_address_created_at")
    op.execute("DROP INDEX IF EXISTS ix_prospects_client_id_phone")
    op.execute("DROP INDEX IF EXISTS ix_prospects_client_id_phone_encrypted")
    op.execute("DROP INDEX IF EXISTS ix_companies_client_id_status")
    op.execute("DROP INDEX IF EXISTS ix_transactions_client_id_created_at")

    # Revert foreign key cascade
    target_fk_tables = [
        ('transaction', 'transaction_client_id_fkey'),
        ('checkout_session', 'checkout_session_client_id_fkey'),
        ('crm_dead_letter', 'crm_dead_letter_client_id_fkey'),
        ('enrichment_queue', 'enrichment_queue_client_id_fkey'),
        ('failed_enrichment', 'failed_enrichment_client_id_fkey'),
        ('notification_throttle', 'notification_throttle_client_id_fkey'),
    ]

    for table_name, constraint_name in target_fk_tables:
        if table_name in tables:
            existing_fks = {fk['name']: fk for fk in inspector.get_foreign_keys(table_name)}
            if constraint_name in existing_fks:
                op.drop_constraint(constraint_name, table_name, type_='foreignkey')
            # Recreate without cascade
            op.create_foreign_key(
                constraint_name,
                source_table=table_name,
                referent_table='client',
                local_cols=['client_id'],
                remote_cols=['id']
            )
