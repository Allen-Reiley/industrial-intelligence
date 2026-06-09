# backend/seed_admin.py
import asyncio
import secrets
from app.db import async_session_maker
from app.models.admin_user import AdminUser
from app.core.security import get_password_hash
from sqlmodel import select
from dotenv import load_dotenv

# Load local environment variables
load_dotenv()

async def seed_admin():
    email = "allenreileyventures@gmail.com"
    # Generate a secure 16-character temporary password
    temp_password = secrets.token_urlsafe(16)
    
    async with async_session_maker() as session:
        # Check if already exists
        stmt = select(AdminUser).where(AdminUser.email == email)
        res = await session.execute(stmt)
        existing_user = res.scalars().first()
        
        hashed = get_password_hash(temp_password)
        if existing_user:
            print(f"Admin user {email} already exists. Updating password...")
            existing_user.hashed_password = hashed
            session.add(existing_user)
        else:
            print(f"Creating default admin user {email}...")
            new_user = AdminUser(
                email=email,
                hashed_password=hashed
            )
            session.add(new_user)
            
        await session.commit()
        print("Database seeded successfully.")
        print(f"Username/Email: {email}")
        print(f"Temporary Password: {temp_password}")

if __name__ == "__main__":
    asyncio.run(seed_admin())
