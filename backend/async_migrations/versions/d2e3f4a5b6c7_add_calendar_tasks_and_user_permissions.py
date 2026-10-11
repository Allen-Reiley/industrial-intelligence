"""Add calendar, tasks, and user permissions

Revision ID: d2e3f4a5b6c7
Revises: c1d2e3f4a5b6
Create Date: 2026-10-11 20:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'd2e3f4a5b6c7'
down_revision: Union[str, Sequence[str], None] = 'c1d2e3f4a5b6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    tables = inspector.get_table_names()

    # 1. Add jobTitle and permissions to user table if missing
    if 'user' in tables:
        user_cols = {c['name'] for c in inspector.get_columns('user')}
        if 'jobTitle' not in user_cols:
            op.add_column('user', sa.Column('jobTitle', sa.String(), nullable=True))
        if 'permissions' not in user_cols:
            op.add_column('user', sa.Column('permissions', sa.JSON(), nullable=True))

    # 2. Create calendar_event table
    if 'calendar_event' not in tables:
        op.create_table(
            'calendar_event',
            sa.Column('id', sa.String(), nullable=False, primary_key=True),
            sa.Column('title', sa.String(), nullable=False),
            sa.Column('start_time', sa.DateTime(timezone=True), nullable=False),
            sa.Column('end_time', sa.DateTime(timezone=True), nullable=True),
            sa.Column('all_day', sa.Boolean(), nullable=False, server_default=sa.text('false')),
            sa.Column('category', sa.String(), nullable=False, server_default='primary'),
            sa.Column('user_id', sa.String(), nullable=False),
            sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
            sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
            sa.ForeignKeyConstraint(['user_id'], ['user.id'], ondelete='CASCADE'),
            sa.PrimaryKeyConstraint('id')
        )
        op.create_index(op.f('ix_calendar_event_user_id'), 'calendar_event', ['user_id'], unique=False)

    # 3. Create task table
    if 'task' not in tables:
        op.create_table(
            'task',
            sa.Column('id', sa.String(), nullable=False, primary_key=True),
            sa.Column('title', sa.String(), nullable=False),
            sa.Column('description', sa.String(), nullable=True),
            sa.Column('status', sa.String(), nullable=False, server_default='todo'),
            sa.Column('priority', sa.String(), nullable=False, server_default='medium'),
            sa.Column('due_date', sa.DateTime(timezone=True), nullable=True),
            sa.Column('assigned_to_id', sa.String(), nullable=True),
            sa.Column('created_by_id', sa.String(), nullable=False),
            sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
            sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
            sa.ForeignKeyConstraint(['assigned_to_id'], ['user.id'], ondelete='SET NULL'),
            sa.ForeignKeyConstraint(['created_by_id'], ['user.id'], ondelete='CASCADE'),
            sa.PrimaryKeyConstraint('id')
        )
        op.create_index(op.f('ix_task_status'), 'task', ['status'], unique=False)
        op.create_index(op.f('ix_task_assigned_to_id'), 'task', ['assigned_to_id'], unique=False)
        op.create_index(op.f('ix_task_created_by_id'), 'task', ['created_by_id'], unique=False)


def downgrade() -> None:
    op.drop_table('task')
    op.drop_table('calendar_event')
    op.drop_column('user', 'permissions')
    op.drop_column('user', 'jobTitle')
