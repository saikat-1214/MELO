import asyncio
import asyncpg
import subprocess
import sys

async def main():
    print("Checking connection to PostgreSQL...")
    conn = await asyncpg.connect(
        user="postgres",
        password="Saikat@2005",
        host="127.0.0.1",
        port=5432,
        database="postgres",
    )
    print("Connected to PostgreSQL successfully!")
    
    # Check if socialconnect_db exists
    dbs = await conn.fetch("SELECT datname FROM pg_database WHERE datname = 'socialconnect_db'")
    if not dbs:
        print("Database 'socialconnect_db' does not exist. Creating it now...")
        await conn.execute("CREATE DATABASE socialconnect_db")
        print("Database 'socialconnect_db' created successfully!")
    else:
        print("Database 'socialconnect_db' already exists.")
        
    await conn.close()

if __name__ == "__main__":
    asyncio.run(main())

