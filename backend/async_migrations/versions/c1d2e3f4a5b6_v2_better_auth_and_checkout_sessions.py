"""V2 Better Auth, RBAC, and Dynamic Checkout Sessions

Revision ID: c1d2e3f4a5b6
Revises: 3e1dcbe2d096
Create Date: 2026-10-10 03:30:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import sqlmodel


# revision identifiers, used by Alembic.
revision: str = 'c1d2e3f4a5b6'
down_revision: Union[str, Sequence[str], None] = '3e1dcbe2d096'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    tables = inspector.get_table_names()

    # 1. Cleanly migrate from legacy auth: drop legacy oauth_account and legacy user table if it has UUID id
    if 'oauth_account' in tables:
        op.drop_table('oauth_account')

    if 'user' in tables:
        user_cols = {c['name']: str(c['type']) for c in inspector.get_columns('user')}
        if 'UUID' in user_cols.get('id', ''):
            op.drop_table('user')
            tables = [t for t in tables if t != 'user']

    if 'user' not in tables:
        op.create_table(
            'user',
            sa.Column('id', sa.String(), nullable=False, primary_key=True),
            sa.Column('name', sa.String(), nullable=False, server_default='AuraWorks User'),
            sa.Column('email', sa.String(), nullable=False),
            sa.Column('emailVerified', sa.Boolean(), nullable=False, server_default=sa.text('false')),
            sa.Column('image', sa.String(), nullable=True),
            sa.Column('role', sa.String(), nullable=False, server_default='sales'),
            sa.Column('is_active', sa.Boolean(), nullable=False, server_default=sa.text('true')),
            sa.Column('client_id', sa.UUID(), nullable=True),
            sa.Column('createdAt', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
            sa.Column('updatedAt', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
            sa.PrimaryKeyConstraint('id')
        )
        op.create_index(op.f('ix_user_email'), 'user', ['email'], unique=True)
        op.create_index(op.f('ix_user_role'), 'user', ['role'], unique=False)
        op.create_index(op.f('ix_user_is_active'), 'user', ['is_active'], unique=False)
        op.create_index(op.f('ix_user_client_id'), 'user', ['client_id'], unique=False)

    if 'session' not in tables:
        op.create_table(
            'session',
            sa.Column('id', sa.String(), nullable=False, primary_key=True),
            sa.Column('userId', sa.String(), nullable=False),
            sa.Column('token', sa.String(), nullable=False),
            sa.Column('expiresAt', sa.DateTime(timezone=True), nullable=False),
            sa.Column('ipAddress', sa.String(), nullable=True),
            sa.Column('userAgent', sa.String(), nullable=True),
            sa.Column('createdAt', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
            sa.Column('updatedAt', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
            sa.ForeignKeyConstraint(['userId'], ['user.id'], ondelete='CASCADE'),
            sa.PrimaryKeyConstraint('id')
        )
        op.create_index(op.f('ix_session_token'), 'session', ['token'], unique=True)
        op.create_index(op.f('ix_session_userId'), 'session', ['userId'], unique=False)

    if 'account' not in tables:
        op.create_table(
            'account',
            sa.Column('id', sa.String(), nullable=False, primary_key=True),
            sa.Column('userId', sa.String(), nullable=False),
            sa.Column('accountId', sa.String(), nullable=False),
            sa.Column('providerId', sa.String(), nullable=False),
            sa.Column('accessToken', sa.String(), nullable=True),
            sa.Column('refreshToken', sa.String(), nullable=True),
            sa.Column('accessTokenExpiresAt', sa.DateTime(timezone=True), nullable=True),
            sa.Column('refreshTokenExpiresAt', sa.DateTime(timezone=True), nullable=True),
            sa.Column('scope', sa.String(), nullable=True),
            sa.Column('idToken', sa.String(), nullable=True),
            sa.Column('password', sa.String(), nullable=True),
            sa.Column('createdAt', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
            sa.Column('updatedAt', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
            sa.ForeignKeyConstraint(['userId'], ['user.id'], ondelete='CASCADE'),
            sa.PrimaryKeyConstraint('id')
        )
        op.create_index(op.f('ix_account_userId'), 'account', ['userId'], unique=False)

    if 'verification' not in tables:
        op.create_table(
            'verification',
            sa.Column('id', sa.String(), nullable=False, primary_key=True),
            sa.Column('identifier', sa.String(), nullable=False),
            sa.Column('value', sa.String(), nullable=False),
            sa.Column('expiresAt', sa.DateTime(timezone=True), nullable=False),
            sa.Column('createdAt', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
            sa.Column('updatedAt', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
            sa.PrimaryKeyConstraint('id')
        )
        op.create_index(op.f('ix_verification_identifier'), 'verification', ['identifier'], unique=False)

    # 2. Add sales_rep_id and contact_phone to client if missing
    client_columns = [c['name'] for c in inspector.get_columns('client')]
    if 'sales_rep_id' not in client_columns:
        op.add_column('client', sa.Column('sales_rep_id', sa.String(), nullable=True))
        op.create_index(op.f('ix_client_sales_rep_id'), 'client', ['sales_rep_id'], unique=False)
    if 'contact_phone' not in client_columns:
        op.add_column('client', sa.Column('contact_phone', sa.String(), nullable=True))

    # 3. Create checkout_session table
    if 'checkout_session' not in tables:
        op.create_table(
            'checkout_session',
            sa.Column('id', sa.UUID(), nullable=False, primary_key=True),
            sa.Column('client_id', sa.UUID(), nullable=False),
            sa.Column('sales_rep_id', sa.String(), nullable=False),
            sa.Column('status', sa.String(), nullable=False, server_default='pending'),
            sa.Column('expires_at', sa.DateTime(timezone=True), nullable=False),
            sa.Column('amount', sa.Integer(), nullable=False, server_default='1000000'),
            sa.Column('plan', sa.String(), nullable=False, server_default='monthly'),
            sa.Column('business_name', sa.String(), nullable=True),
            sa.Column('contact_email', sa.String(), nullable=True),
            sa.Column('contact_phone', sa.String(), nullable=True),
            sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
            sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
            sa.ForeignKeyConstraint(['client_id'], ['client.id'], ondelete='CASCADE'),
            sa.PrimaryKeyConstraint('id')
        )
        op.create_index(op.f('ix_checkout_session_client_id'), 'checkout_session', ['client_id'], unique=False)
        op.create_index(op.f('ix_checkout_session_sales_rep_id'), 'checkout_session', ['sales_rep_id'], unique=False)
        op.create_index(op.f('ix_checkout_session_status'), 'checkout_session', ['status'], unique=False)

    # 4. Add sales_rep_id and checkout_session_id to transaction
    tx_columns = [c['name'] for c in inspector.get_columns('transaction')]
    if 'sales_rep_id' not in tx_columns:
        op.add_column('transaction', sa.Column('sales_rep_id', sa.String(), nullable=True))
        op.create_index(op.f('ix_transaction_sales_rep_id'), 'transaction', ['sales_rep_id'], unique=False)
    if 'checkout_session_id' not in tx_columns:
        op.add_column('transaction', sa.Column('checkout_session_id', sa.UUID(), nullable=True))
        op.create_index(op.f('ix_transaction_checkout_session_id'), 'transaction', ['checkout_session_id'], unique=False)


def downgrade() -> None:
    op.drop_table('checkout_session')
    op.drop_table('verification')
    op.drop_table('account')
    op.drop_table('session')
    op.drop_table('user')
