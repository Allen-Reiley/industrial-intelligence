"""enable_client_consent_banner

Revision ID: a1b2c3d4e5f6
Revises: 90cdb20cc080
Create Date: 2026-09-18 16:45:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = 'a1b2c3d4e5f6'
down_revision: Union[str, Sequence[str], None] = '90cdb20cc080'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    # Update default value of column require_consent_banner to True
    op.alter_column('client', 'require_consent_banner', server_default=sa.text('true'))
    # Update existing client records to have require_consent_banner = True
    op.execute(sa.text("UPDATE client SET require_consent_banner = TRUE WHERE require_consent_banner = FALSE OR id = 'c4a6c9b1-8355-4de2-985d-a04f4dcd63a0'"))

def downgrade() -> None:
    op.alter_column('client', 'require_consent_banner', server_default=sa.text('false'))
