# backend/tests/test_seed_admin.py
import pytest
from seed_admin import seed_admin
from app.db import get_async_session
from app.models.user import User, UserRole
from sqlmodel import select

@pytest.mark.asyncio
async def test_seed_admin_execution():
    """
    Asserts that the seed_admin script executes successfully and registers/updates
    the ADMIN user in the Better Auth User database table.
    """
    admin_email = "admin@auraworks.co.za"
    admin_name = "Super Administrator"

    # 1. Execute the seed script
    await seed_admin(email=admin_email, name=admin_name)

    # 2. Query the database using a fresh async session to assert the user state
    async for session in get_async_session():
        stmt = select(User).where(User.email == admin_email)
        res = await session.execute(stmt)
        user = res.scalars().first()

        assert user is not None, f"Seeded user {admin_email} was not found in database."
        assert user.email == admin_email
        assert user.name == admin_name
        assert user.role == UserRole.ADMIN
        assert user.is_superuser is True
        assert user.is_active is True
        break
