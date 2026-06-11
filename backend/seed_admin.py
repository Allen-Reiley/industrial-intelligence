# backend/seed_admin.py
import asyncio
import uuid
from app.db import async_session_maker
from app.models.admin_user import AdminUser
from app.models.user import User
from app.core.security import get_password_hash
from sqlmodel import select
from dotenv import load_dotenv

# Load local environment variables
load_dotenv()

async def seed_admin():
    username = "ReitumetseF"
    password = "SETHABELA.company"
    
    hashed_pwd = get_password_hash(password)
    
    async with async_session_maker() as session:
        # 1. Seed the FastAPI-Users User table
        stmt_user = select(User).where(User.email == username)
        res_user = await session.execute(stmt_user)
        existing_user = res_user.scalars().first()
        
        if existing_user:
            print(f"User {username} already exists in user table. Updating password...")
            existing_user.hashed_password = hashed_pwd
            session.add(existing_user)
        else:
            print(f"Creating default user {username} in user table...")
            new_user = User(
                id=uuid.uuid4(),
                email=username,
                hashed_password=hashed_pwd,
                is_active=True,
                is_verified=True,
                is_superuser=True
            )
            session.add(new_user)
            
        # 2. Seed the legacy AdminUser table
        stmt_admin = select(AdminUser).where(AdminUser.email == username)
        res_admin = await session.execute(stmt_admin)
        existing_admin = res_admin.scalars().first()
        
        if existing_admin:
            print(f"AdminUser {username} already exists in admin_user table. Updating password...")
            existing_admin.hashed_password = hashed_pwd
            session.add(existing_admin)
        else:
            print(f"Creating default user {username} in admin_user table...")
            new_admin = AdminUser(
                id=uuid.uuid4(),
                email=username,
                hashed_password=hashed_pwd
            )
            session.add(new_admin)
            
        await session.commit()
        print("Database seeded successfully.")
        print(f"Username/Email: {username}")
        print(f"Password: {password}")

if __name__ == "__main__":
    asyncio.run(seed_admin())
