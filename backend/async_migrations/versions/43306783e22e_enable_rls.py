"""enable_rls

Revision ID: 43306783e22e
Revises: ae0287cd9a1c
Create Date: 2026-06-03 00:01:29.369842

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import sqlmodel


# revision identifiers, used by Alembic.
revision: str = '43306783e22e'
down_revision: Union[str, Sequence[str], None] = 'ae0287cd9a1c'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema to enable RLS and set isolation policies."""
    # 1. Enable and Force Row-Level Security on target multi-tenant interaction tables
    op.execute('ALTER TABLE "visit" ENABLE ROW LEVEL SECURITY;')
    op.execute('ALTER TABLE "visit" FORCE ROW LEVEL SECURITY;')
    op.execute('ALTER TABLE "page_view" ENABLE ROW LEVEL SECURITY;')
    op.execute('ALTER TABLE "page_view" FORCE ROW LEVEL SECURITY;')
    op.execute('ALTER TABLE "waitlist_lead" ENABLE ROW LEVEL SECURITY;')
    op.execute('ALTER TABLE "waitlist_lead" FORCE ROW LEVEL SECURITY;')

    # 2. Establish RLS policies restricting operations to the current_client_id setting
    op.execute(
        'CREATE POLICY visit_tenant_policy ON "visit" '
        'FOR ALL '
        'USING (client_id = nullif(current_setting(\'app.current_client_id\', true), \'\')::uuid) '
        'WITH CHECK (client_id = nullif(current_setting(\'app.current_client_id\', true), \'\')::uuid);'
    )
    op.execute(
        'CREATE POLICY page_view_tenant_policy ON "page_view" '
        'FOR ALL '
        'USING (client_id = nullif(current_setting(\'app.current_client_id\', true), \'\')::uuid) '
        'WITH CHECK (client_id = nullif(current_setting(\'app.current_client_id\', true), \'\')::uuid);'
    )
    op.execute(
        'CREATE POLICY waitlist_lead_tenant_policy ON "waitlist_lead" '
        'FOR ALL '
        'USING (client_id = nullif(current_setting(\'app.current_client_id\', true), \'\')::uuid) '
        'WITH CHECK (client_id = nullif(current_setting(\'app.current_client_id\', true), \'\')::uuid);'
    )


def downgrade() -> None:
    """Downgrade schema to disable RLS and drop isolation policies."""
    # 1. Drop RLS policies
    op.execute('DROP POLICY IF EXISTS visit_tenant_policy ON "visit";')
    op.execute('DROP POLICY IF EXISTS page_view_tenant_policy ON "page_view";')
    op.execute('DROP POLICY IF EXISTS waitlist_lead_tenant_policy ON "waitlist_lead";')

    # 2. Disable Row-Level Security
    op.execute('ALTER TABLE "visit" NO FORCE ROW LEVEL SECURITY;')
    op.execute('ALTER TABLE "visit" DISABLE ROW LEVEL SECURITY;')
    op.execute('ALTER TABLE "page_view" NO FORCE ROW LEVEL SECURITY;')
    op.execute('ALTER TABLE "page_view" DISABLE ROW LEVEL SECURITY;')
    op.execute('ALTER TABLE "waitlist_lead" NO FORCE ROW LEVEL SECURITY;')
    op.execute('ALTER TABLE "waitlist_lead" DISABLE ROW LEVEL SECURITY;')
