import os
os.environ["DATABASE_URL"] = "sqlite+aiosqlite:///./test.db"
os.environ["SECRET_KEY"] = "test-secret"
os.environ["ENVIRONMENT"] = "development"

from app.db import init_db
print("Creating tables...")
try:
    init_db()
    print("Tables created.")
except Exception as e:
    print(f"Error creating tables: {e}")
