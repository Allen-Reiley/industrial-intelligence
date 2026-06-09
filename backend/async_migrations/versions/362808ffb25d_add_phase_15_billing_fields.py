"""add_phase_15_billing_fields

Revision ID: 362808ffb25d
Revises: 85d9ac140ea0
Create Date: 2026-06-09 17:18:17.901959

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import sqlmodel


# revision identifiers, used by Alembic.
revision: str = '362808ffb25d'
down_revision: Union[str, Sequence[str], None] = '85d9ac140ea0'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Alter the custom enum type to add TRIAL and CANCELLATION_PENDING
    # Note: ALTER TYPE ... ADD VALUE cannot run inside a transaction block in some postgres setups,
    # but Alembic runs it fine if we do it here or disable transaction for this migration.
    # Alternatively, we can use a workaround or run it as raw SQL.
    op.execute("COMMIT") # Commit current transaction to allow ALTER TYPE
    op.execute("ALTER TYPE subscriptionstatus ADD VALUE IF NOT EXISTS 'TRIAL'")
    op.execute("ALTER TYPE subscriptionstatus ADD VALUE IF NOT EXISTS 'CANCELLATION_PENDING'")
    
    # Re-adjust auto-generated columns
    op.add_column('client', sa.Column('billing_cycle', sqlmodel.sql.sqltypes.AutoString(), nullable=False, server_default='monthly'))
    op.add_column('client', sa.Column('trial_ends_at', sa.DateTime(timezone=True), nullable=True))
    op.add_column('client', sa.Column('tc_accepted_at', sa.DateTime(timezone=True), nullable=True))
    op.add_column('client', sa.Column('tc_accepted_ip', sqlmodel.sql.sqltypes.AutoString(), nullable=True))
    op.add_column('client', sa.Column('cancellation_requested', sa.Boolean(), nullable=False, server_default='false'))
    op.add_column('client', sa.Column('trial_warning_sent', sa.Boolean(), nullable=False, server_default='false'))


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('client', 'trial_warning_sent')
    op.drop_column('client', 'cancellation_requested')
    op.drop_column('client', 'tc_accepted_ip')
    op.drop_column('client', 'tc_accepted_at')
    op.drop_column('client', 'trial_ends_at')
    op.drop_column('client', 'billing_cycle')
