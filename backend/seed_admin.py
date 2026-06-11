# backend/seed_admin.py
import asyncio
import uuid
from app.db import async_session_maker
from app.models.admin_user import AdminUser
from app.models.user import User, OAuthAccount, UserCreate
from app.core.users import UserManager
from fastapi_users.db import SQLAlchemyUserDatabase
from sqlmodel import select
from dotenv import load_dotenv

# Load local environment variables
load_dotenv()

async def seed_admin():
    username = "ReitumetseF"
    password = "SETHABELA.company"
    
    async with async_session_maker() as session:
        # Instantiate the database adapter and UserManager
        user_db = SQLAlchemyUserDatabase(session, User, OAuthAccount)
        user_manager = UserManager(user_db)
        
        # 1. Seed the FastAPI-Users User table
        stmt_user = select(User).where((User.email == username) | (User.username == username))
        res_user = await session.execute(stmt_user)
        existing_user = res_user.scalars().first()
        
        if existing_user:
            print(f"User {username} already exists in user table. Deleting first to recreate via UserManager...")
            await session.delete(existing_user)
            await session.commit()
            
        print(f"Creating default user {username} in user table via UserManager...")
        user_create = UserCreate(
            email=f"{username}@auraworks.co.za",
            username=username,
            password=password,
            is_active=True,
            is_verified=True,
            is_superuser=True
        )
        new_user = await user_manager.create(user_create)
        
        # 2. Seed the legacy AdminUser table
        stmt_admin = select(AdminUser).where((AdminUser.email == username) | (AdminUser.email == f"{username}@auraworks.co.za"))
        res_admin = await session.execute(stmt_admin)
        existing_admin = res_admin.scalars().first()
        
        # Hash the password for the legacy table using the user_manager's password_helper
        hashed_pwd = user_manager.password_helper.hash(password)
        
        if existing_admin:
            print(f"AdminUser {username} already exists in admin_user table. Updating password...")
            existing_admin.hashed_password = hashed_pwd
            existing_admin.email = f"{username}@auraworks.co.za"
            session.add(existing_admin)
        else:
            print(f"Creating default user {username} in admin_user table...")
            new_admin = AdminUser(
                id=uuid.uuid4(),
                email=f"{username}@auraworks.co.za",
                hashed_password=hashed_pwd
            )
            session.add(new_admin)
            
        await session.commit()
        print("Database seeded successfully.")
        print(f"Username/Email: {username} ({username}@auraworks.co.za)")
        print(f"Password: {password}")

if __name__ == "__main__":
    asyncio.run(seed_admin())
