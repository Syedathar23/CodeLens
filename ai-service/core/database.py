import os
import psycopg2
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")


def get_connection():
    """Create and return a new psycopg2 database connection."""
    return psycopg2.connect(DATABASE_URL)


def get_db():
    """Yield a database connection and close it after use."""
    conn = get_connection()
    try:
        yield conn
    finally:
        conn.close()


def create_tables():
    """Verify database connectivity on startup."""
    try:
        conn = get_connection()
        conn.close()
        print("Database connected successfully")
    except Exception as e:
        print(f"Database connection failed: {e}")
