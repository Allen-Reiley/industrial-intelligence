# backend/seed_admin.py
import asyncio
import uuid
import sys
from datetime import datetime, timezone
from sqlmodel import select
from dotenv import load_dotenv

from app.db import async_session_maker
from app.models.user import User, UserRole

load_dotenv()

async def seed_admin(email: str = "admin@auraworks.co.za", name: str = "System Administrator"):
    async with async_session_maker() as session:
        stmt = select(User).where(User.email == email)
        res = await session.execute(stmt)
        existing_user = res.scalars().first()

        if existing_user:
            print(f"User {email} already exists. Updating role to ADMIN and is_active to True...")
            existing_user.role = UserRole.ADMIN
            existing_user.is_active = True
            existing_user.name = name
            existing_user.updated_at = datetime.now(timezone.utc)
            session.add(existing_user)
        else:
            print(f"Creating new Admin user {email}...")
            new_user = User(
                id=f"admin_{uuid.uuid4().hex[:12]}",
                email=email,
                name=name,
                role=UserRole.ADMIN,
                is_active=True,
                created_at=datetime.now(timezone.utc),
                updated_at=datetime.now(timezone.utc)
            )
            session.add(new_user)

        await session.commit()
        print(f"Successfully seeded admin account: {email} (Role: ADMIN)")

if __name__ == "__main__":
    target_email = sys.argv[1] if len(sys.argv) > 1 else "admin@auraworks.co.za"
    target_name = sys.argv[2] if len(sys.argv) > 2 else "System Administrator"
    asyncio.run(seed_admin(target_email, target_name))
