import pytest
from seed_admin import seed_admin
from app.db import get_async_session
from app.models.user import User
from sqlmodel import select

@pytest.mark.asyncio
async def test_seed_admin_execution():
    """
    Asserts that the seed_admin script executes successfully, hashes the password
    correctly, and registers the superuser user in the User database table.
    """
    # 1. Execute the seed script
    await seed_admin()
    
    # 2. Query the database using a fresh async session to assert the user state
    username = "ReitumetseF"
    async for session in get_async_session():
        stmt = select(User).where(User.username == username)
        res = await session.execute(stmt)
        user = res.unique().scalars().first()
        
        assert user is not None, f"Seeded user {username} was not found in database."
        assert user.email == f"{username}@auraworks.co.za", "Seeded user email is incorrect."
        assert user.is_superuser is True, "Seeded user is not marked as a superuser."
        assert user.is_active is True, "Seeded user is not active."
        assert user.is_verified is True, "Seeded user is not marked as verified."
        
        # 3. Verify password hash checks using UserManager's password_helper
        from app.core.users import UserManager
        from fastapi_users.db import SQLAlchemyUserDatabase
        from app.models.user import OAuthAccount
        
        user_db = SQLAlchemyUserDatabase(session, User, OAuthAccount)
        user_manager = UserManager(user_db)
        
        # Check password correctness
        verified, _ = user_manager.password_helper.verify_and_update("SETHABELA.company", user.hashed_password)
        assert verified is True, "Seeded user password verification failed."
        break
