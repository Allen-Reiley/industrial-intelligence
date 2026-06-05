"""fix_schema_drift

Revision ID: 1ac2f9ae2341
Revises: c2710675c8d5
Create Date: 2026-06-05 16:25:19.442555

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import sqlmodel


# revision identifiers, used by Alembic.
revision: str = '1ac2f9ae2341'
down_revision: Union[str, Sequence[str], None] = 'c2710675c8d5'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def table_exists(conn, table_name):
    res = conn.execute(sa.text(
        "SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = :t)"
    ), {"t": table_name}).scalar()
    return bool(res)


def column_exists(conn, table_name, column_name):
    res = conn.execute(sa.text(
        "SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = :t AND column_name = :c)"
    ), {"t": table_name, "c": column_name}).scalar()
    return bool(res)


def get_column_type(conn, table_name, column_name):
    return conn.execute(sa.text(
        "SELECT data_type FROM information_schema.columns WHERE table_name = :t AND column_name = :c"
    ), {"t": table_name, "c": column_name}).scalar()


def upgrade() -> None:
    """Upgrade schema to resolve legacy drift."""
    conn = op.get_bind()
    
    # 1. Drop all foreign keys pointing to client and company dynamically
    conn.execute(sa.text("""
        DO $$
        DECLARE
            r RECORD;
        BEGIN
            FOR r IN 
                SELECT tc.table_name, tc.constraint_name
                FROM information_schema.table_constraints tc
                JOIN information_schema.constraint_column_usage ccu ON tc.constraint_name = ccu.constraint_name
                WHERE tc.constraint_type = 'FOREIGN KEY' AND ccu.table_name IN ('client', 'company')
            LOOP
                EXECUTE 'ALTER TABLE "' || r.table_name || '" DROP CONSTRAINT IF EXISTS "' || r.constraint_name || '"';
            END LOOP;
        END $$;
    """))

    # Also drop parent company self-reference if it exists
    conn.execute(sa.text('ALTER TABLE company DROP CONSTRAINT IF EXISTS company_parent_company_id_fkey;'))

    # 2. Fix client table id type
    if table_exists(conn, "client"):
        col_type = get_column_type(conn, "client", "id")
        if col_type in ("character varying", "text", "varchar"):
            conn.execute(sa.text("ALTER TABLE client ALTER COLUMN id TYPE UUID USING id::uuid;"))
            
            # Alter referencing columns
            for t in ["visit", "page_view", "enrichment_queue", "failed_enrichment", "notification_throttle", "waitlist_lead"]:
                if table_exists(conn, t) and column_exists(conn, t, "client_id"):
                    conn.execute(sa.text(f"ALTER TABLE {t} ALTER COLUMN client_id TYPE UUID USING client_id::uuid;"))

    # 3. Fix company table unique index and column names/types
    if table_exists(conn, "company"):
        # Drop unique index/constraint ix_company_name
        conn.execute(sa.text("DROP INDEX IF EXISTS ix_company_name;"))
        conn.execute(sa.text("ALTER TABLE company DROP CONSTRAINT IF EXISTS ix_company_name;"))

        # Rename 'name' to 'company_name' if 'name' exists and 'company_name' does not
        if column_exists(conn, "company", "name") and not column_exists(conn, "company", "company_name"):
            conn.execute(sa.text("ALTER TABLE company RENAME COLUMN name TO company_name;"))

        # Fix company.id type if it is integer
        col_type = get_column_type(conn, "company", "id")
        if col_type in ("integer", "bigint", "smallint"):
            # Create extension for gen_random_uuid
            conn.execute(sa.text("CREATE EXTENSION IF NOT EXISTS pgcrypto;"))
            
            # Add new UUID column to company
            conn.execute(sa.text("ALTER TABLE company ADD COLUMN new_id UUID DEFAULT gen_random_uuid();"))
            conn.execute(sa.text("UPDATE company SET new_id = gen_random_uuid() WHERE new_id IS NULL;"))
            
            # Add new UUID columns to referencing tables
            if table_exists(conn, "visit"):
                conn.execute(sa.text("ALTER TABLE visit ADD COLUMN new_company_id UUID;"))
                conn.execute(sa.text("UPDATE visit v SET new_company_id = c.new_id FROM company c WHERE v.company_id::text = c.id::text;"))
            if table_exists(conn, "department"):
                conn.execute(sa.text("ALTER TABLE department ADD COLUMN new_company_id UUID;"))
                conn.execute(sa.text("UPDATE department d SET new_company_id = c.new_id FROM company c WHERE d.company_id::text = c.id::text;"))
            if table_exists(conn, "waitlist_lead"):
                conn.execute(sa.text("ALTER TABLE waitlist_lead ADD COLUMN new_company_id UUID;"))
                conn.execute(sa.text("UPDATE waitlist_lead wl SET new_company_id = c.new_id FROM company c WHERE wl.company_id::text = c.id::text;"))
                
            conn.execute(sa.text("ALTER TABLE company ADD COLUMN new_parent_company_id UUID;"))
            conn.execute(sa.text("UPDATE company c1 SET new_parent_company_id = c2.new_id FROM company c2 WHERE c1.parent_company_id::text = c2.id::text;"))
            
            # Drop old columns
            conn.execute(sa.text("ALTER TABLE company DROP CONSTRAINT IF EXISTS company_pkey;"))
            conn.execute(sa.text("ALTER TABLE company DROP COLUMN id;"))
            if table_exists(conn, "visit"):
                conn.execute(sa.text("ALTER TABLE visit DROP COLUMN IF EXISTS company_id;"))
            if table_exists(conn, "department"):
                conn.execute(sa.text("ALTER TABLE department DROP COLUMN IF EXISTS company_id;"))
            if table_exists(conn, "waitlist_lead"):
                conn.execute(sa.text("ALTER TABLE waitlist_lead DROP COLUMN IF EXISTS company_id;"))
            conn.execute(sa.text("ALTER TABLE company DROP COLUMN IF EXISTS parent_company_id;"))
            
            # Rename new columns to old names
            conn.execute(sa.text("ALTER TABLE company RENAME COLUMN new_id TO id;"))
            conn.execute(sa.text("ALTER TABLE company ADD PRIMARY KEY (id);"))
            
            if table_exists(conn, "visit"):
                conn.execute(sa.text("ALTER TABLE visit RENAME COLUMN new_company_id TO company_id;"))
            if table_exists(conn, "department"):
                conn.execute(sa.text("ALTER TABLE department RENAME COLUMN new_company_id TO company_id;"))
            if table_exists(conn, "waitlist_lead"):
                conn.execute(sa.text("ALTER TABLE waitlist_lead RENAME COLUMN new_company_id TO company_id;"))
            conn.execute(sa.text("ALTER TABLE company RENAME COLUMN new_parent_company_id TO parent_company_id;"))

    # 4. Fix visit connection_type column
    if table_exists(conn, "visit"):
        if not column_exists(conn, "visit", "connection_type"):
            conn.execute(sa.text("ALTER TABLE visit ADD COLUMN connection_type VARCHAR DEFAULT 'corporate' NOT NULL;"))

    # 5. Recreate foreign key constraints
    # Recreate client constraints
    if table_exists(conn, "visit") and table_exists(conn, "client"):
        conn.execute(sa.text("ALTER TABLE visit ADD CONSTRAINT visit_client_id_fkey FOREIGN KEY (client_id) REFERENCES client(id);"))
    if table_exists(conn, "page_view") and table_exists(conn, "client"):
        conn.execute(sa.text("ALTER TABLE page_view ADD CONSTRAINT page_view_client_id_fkey FOREIGN KEY (client_id) REFERENCES client(id);"))
    if table_exists(conn, "enrichment_queue") and table_exists(conn, "client"):
        conn.execute(sa.text("ALTER TABLE enrichment_queue ADD CONSTRAINT enrichment_queue_client_id_fkey FOREIGN KEY (client_id) REFERENCES client(id);"))
    if table_exists(conn, "failed_enrichment") and table_exists(conn, "client"):
        conn.execute(sa.text("ALTER TABLE failed_enrichment ADD CONSTRAINT failed_enrichment_client_id_fkey FOREIGN KEY (client_id) REFERENCES client(id);"))
    if table_exists(conn, "notification_throttle") and table_exists(conn, "client"):
        conn.execute(sa.text("ALTER TABLE notification_throttle ADD CONSTRAINT notification_throttle_client_id_fkey FOREIGN KEY (client_id) REFERENCES client(id);"))
    
    # Recreate company constraints
    if table_exists(conn, "visit") and table_exists(conn, "company"):
        conn.execute(sa.text("ALTER TABLE visit ADD CONSTRAINT visit_company_id_fkey FOREIGN KEY (company_id) REFERENCES company(id);"))
    if table_exists(conn, "department") and table_exists(conn, "company"):
        conn.execute(sa.text("ALTER TABLE department ADD CONSTRAINT department_company_id_fkey FOREIGN KEY (company_id) REFERENCES company(id);"))
    if table_exists(conn, "company"):
        conn.execute(sa.text("ALTER TABLE company ADD CONSTRAINT company_parent_company_id_fkey FOREIGN KEY (parent_company_id) REFERENCES company(id);"))
        
    if table_exists(conn, "waitlist_lead") and table_exists(conn, "client"):
        conn.execute(sa.text("ALTER TABLE waitlist_lead ADD CONSTRAINT waitlist_lead_client_id_fkey FOREIGN KEY (client_id) REFERENCES client(id);"))
    if table_exists(conn, "waitlist_lead") and table_exists(conn, "company"):
        conn.execute(sa.text("ALTER TABLE waitlist_lead ADD CONSTRAINT waitlist_lead_company_id_fkey FOREIGN KEY (company_id) REFERENCES company(id);"))


def downgrade() -> None:
    """Downgrade schema."""
    pass
