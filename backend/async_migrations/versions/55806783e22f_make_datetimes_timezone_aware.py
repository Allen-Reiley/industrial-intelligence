"""make_datetimes_timezone_aware

Revision ID: 55806783e22f
Revises: 43306783e22e
Create Date: 2026-06-05 11:15:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import sqlmodel


# revision identifiers, used by Alembic.
revision: str = '55806783e22f'
down_revision: Union[str, Sequence[str], None] = '43306783e22e'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema to support timezone-aware columns and add new Visit columns."""
    # 1. Add new columns to 'visit' table
    op.add_column('visit', sa.Column('email', sa.String(), nullable=True))
    op.add_column('visit', sa.Column('visitor_name', sa.String(), nullable=True))
    op.add_column('visit', sa.Column('canvas_hash', sa.String(), nullable=True))
    op.add_column('visit', sa.Column('webgl_renderer', sa.String(), nullable=True))
    op.add_column('visit', sa.Column('clock_drift', sa.String(), nullable=True))
    
    op.create_index(op.f('ix_visit_email'), 'visit', ['email'], unique=False)

    # 2. Alter naive datetime columns across all tables to TIMESTAMP WITH TIME ZONE
    op.execute('ALTER TABLE "client" ALTER COLUMN "created_at" TYPE TIMESTAMP WITH TIME ZONE USING "created_at" AT TIME ZONE \'UTC\';')
    op.execute('ALTER TABLE "client" ALTER COLUMN "contract_signed_at" TYPE TIMESTAMP WITH TIME ZONE USING "contract_signed_at" AT TIME ZONE \'UTC\';')
    op.execute('ALTER TABLE "client" ALTER COLUMN "auto_classified_at" TYPE TIMESTAMP WITH TIME ZONE USING "auto_classified_at" AT TIME ZONE \'UTC\';')
    
    op.execute('ALTER TABLE "company" ALTER COLUMN "created_at" TYPE TIMESTAMP WITH TIME ZONE USING "created_at" AT TIME ZONE \'UTC\';')
    op.execute('ALTER TABLE "company" ALTER COLUMN "last_enrichment_attempt" TYPE TIMESTAMP WITH TIME ZONE USING "last_enrichment_attempt" AT TIME ZONE \'UTC\';')
    
    op.execute('ALTER TABLE "department" ALTER COLUMN "created_at" TYPE TIMESTAMP WITH TIME ZONE USING "created_at" AT TIME ZONE \'UTC\';')
    
    op.execute('ALTER TABLE "visit" ALTER COLUMN "created_at" TYPE TIMESTAMP WITH TIME ZONE USING "created_at" AT TIME ZONE \'UTC\';')
    op.execute('ALTER TABLE "visit" ALTER COLUMN "updated_at" TYPE TIMESTAMP WITH TIME ZONE USING "updated_at" AT TIME ZONE \'UTC\';')
    
    op.execute('ALTER TABLE "page_view" ALTER COLUMN "created_at" TYPE TIMESTAMP WITH TIME ZONE USING "created_at" AT TIME ZONE \'UTC\';')
    
    op.execute('ALTER TABLE "waitlist_lead" ALTER COLUMN "created_at" TYPE TIMESTAMP WITH TIME ZONE USING "created_at" AT TIME ZONE \'UTC\';')
    op.execute('ALTER TABLE "waitlist_lead" ALTER COLUMN "updated_at" TYPE TIMESTAMP WITH TIME ZONE USING "updated_at" AT TIME ZONE \'UTC\';')
    
    op.execute('ALTER TABLE "enrichment_queue" ALTER COLUMN "created_at" TYPE TIMESTAMP WITH TIME ZONE USING "created_at" AT TIME ZONE \'UTC\';')
    op.execute('ALTER TABLE "enrichment_queue" ALTER COLUMN "last_attempt_at" TYPE TIMESTAMP WITH TIME ZONE USING "last_attempt_at" AT TIME ZONE \'UTC\';')
    op.execute('ALTER TABLE "enrichment_queue" ALTER COLUMN "next_attempt_at" TYPE TIMESTAMP WITH TIME ZONE USING "next_attempt_at" AT TIME ZONE \'UTC\';')
    
    op.execute('ALTER TABLE "failed_enrichment" ALTER COLUMN "failed_at" TYPE TIMESTAMP WITH TIME ZONE USING "failed_at" AT TIME ZONE \'UTC\';')
    
    op.execute('ALTER TABLE "notification_throttle" ALTER COLUMN "created_at" TYPE TIMESTAMP WITH TIME ZONE USING "created_at" AT TIME ZONE \'UTC\';')
    op.execute('ALTER TABLE "notification_throttle" ALTER COLUMN "last_notification_sent_at" TYPE TIMESTAMP WITH TIME ZONE USING "last_notification_sent_at" AT TIME ZONE \'UTC\';')


def downgrade() -> None:
    """Downgrade schema."""
    # 1. Revert datetime columns to TIMESTAMP WITHOUT TIME ZONE
    op.execute('ALTER TABLE "client" ALTER COLUMN "created_at" TYPE TIMESTAMP WITHOUT TIME ZONE USING "created_at" AT TIME ZONE \'UTC\';')
    op.execute('ALTER TABLE "client" ALTER COLUMN "contract_signed_at" TYPE TIMESTAMP WITHOUT TIME ZONE USING "contract_signed_at" AT TIME ZONE \'UTC\';')
    op.execute('ALTER TABLE "client" ALTER COLUMN "auto_classified_at" TYPE TIMESTAMP WITHOUT TIME ZONE USING "auto_classified_at" AT TIME ZONE \'UTC\';')
    
    op.execute('ALTER TABLE "company" ALTER COLUMN "created_at" TYPE TIMESTAMP WITHOUT TIME ZONE USING "created_at" AT TIME ZONE \'UTC\';')
    op.execute('ALTER TABLE "company" ALTER COLUMN "last_enrichment_attempt" TYPE TIMESTAMP WITHOUT TIME ZONE USING "last_enrichment_attempt" AT TIME ZONE \'UTC\';')
    
    op.execute('ALTER TABLE "department" ALTER COLUMN "created_at" TYPE TIMESTAMP WITHOUT TIME ZONE USING "created_at" AT TIME ZONE \'UTC\';')
    
    op.execute('ALTER TABLE "visit" ALTER COLUMN "created_at" TYPE TIMESTAMP WITHOUT TIME ZONE USING "created_at" AT TIME ZONE \'UTC\';')
    op.execute('ALTER TABLE "visit" ALTER COLUMN "updated_at" TYPE TIMESTAMP WITHOUT TIME ZONE USING "updated_at" AT TIME ZONE \'UTC\';')
    
    op.execute('ALTER TABLE "page_view" ALTER COLUMN "created_at" TYPE TIMESTAMP WITHOUT TIME ZONE USING "created_at" AT TIME ZONE \'UTC\';')
    
    op.execute('ALTER TABLE "waitlist_lead" ALTER COLUMN "created_at" TYPE TIMESTAMP WITHOUT TIME ZONE USING "created_at" AT TIME ZONE \'UTC\';')
    op.execute('ALTER TABLE "waitlist_lead" ALTER COLUMN "updated_at" TYPE TIMESTAMP WITHOUT TIME ZONE USING "updated_at" AT TIME ZONE \'UTC\';')
    
    op.execute('ALTER TABLE "enrichment_queue" ALTER COLUMN "created_at" TYPE TIMESTAMP WITHOUT TIME ZONE USING "created_at" AT TIME ZONE \'UTC\';')
    op.execute('ALTER TABLE "enrichment_queue" ALTER COLUMN "last_attempt_at" TYPE TIMESTAMP WITHOUT TIME ZONE USING "last_attempt_at" AT TIME ZONE \'UTC\';')
    op.execute('ALTER TABLE "enrichment_queue" ALTER COLUMN "next_attempt_at" TYPE TIMESTAMP WITHOUT TIME ZONE USING "next_attempt_at" AT TIME ZONE \'UTC\';')
    
    op.execute('ALTER TABLE "failed_enrichment" ALTER COLUMN "failed_at" TYPE TIMESTAMP WITHOUT TIME ZONE USING "failed_at" AT TIME ZONE \'UTC\';')
    
    op.execute('ALTER TABLE "notification_throttle" ALTER COLUMN "created_at" TYPE TIMESTAMP WITHOUT TIME ZONE USING "created_at" AT TIME ZONE \'UTC\';')
    op.execute('ALTER TABLE "notification_throttle" ALTER COLUMN "last_notification_sent_at" TYPE TIMESTAMP WITHOUT TIME ZONE USING "last_notification_sent_at" AT TIME ZONE \'UTC\';')

    # 2. Drop visit index and columns
    op.drop_index(op.f('ix_visit_email'), table_name='visit')
    op.drop_column('visit', 'email')
    op.drop_column('visit', 'visitor_name')
    op.drop_column('visit', 'canvas_hash')
    op.drop_column('visit', 'webgl_renderer')
    op.drop_column('visit', 'clock_drift')
