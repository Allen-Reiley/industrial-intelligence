import asyncio
import asyncpg

async def main():
    try:
        conn = await asyncpg.connect("postgresql://postgres:dtmmeywQXXcslTCGLACxInbEQinZyTgg@centerbeam.proxy.rlwy.net:18143/railway")
        await conn.execute("DROP SCHEMA public CASCADE; CREATE SCHEMA public;")
        print("Dropped public schema successfully")
        await conn.close()
    except Exception as e:
        print(f"Error: {e}")

asyncio.run(main())
