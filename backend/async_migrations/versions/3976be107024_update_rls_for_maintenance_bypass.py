"""Update RLS for maintenance bypass

Revision ID: 3976be107024
Revises: bbfb38e14939
Create Date: 2026-09-20 19:31:57.066291

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import sqlmodel


# revision identifiers, used by Alembic.
revision: str = '3976be107024'
down_revision: Union[str, Sequence[str], None] = 'bbfb38e14939'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.execute("""
    ALTER POLICY visit_tenant_policy ON "visit"
    USING (
        current_setting('app.bypass_rls', true) = 'on'
        OR client_id = nullif(current_setting('app.current_client_id', true), '')::uuid
    );
    """)
    op.execute("""
    ALTER POLICY company_tenant_policy ON "company"
    USING (
        current_setting('app.bypass_rls', true) = 'on'
        OR client_id = nullif(current_setting('app.current_client_id', true), '')::uuid
    );
    """)
    op.execute("""
    ALTER POLICY prospect_tenant_policy ON "prospect"
    USING (
        current_setting('app.bypass_rls', true) = 'on'
        OR client_id = nullif(current_setting('app.current_client_id', true), '')::uuid
    );
    """)
    op.execute("""
    ALTER POLICY page_view_tenant_policy ON "page_view"
    USING (
        current_setting('app.bypass_rls', true) = 'on'
        OR client_id = nullif(current_setting('app.current_client_id', true), '')::uuid
    );
    """)

def downgrade() -> None:
    """Downgrade schema."""
    pass
