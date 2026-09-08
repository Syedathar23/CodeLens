import os
import psycopg2
from psycopg2.pool import ThreadedConnectionPool
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

_pool = None

def get_pool():
    global _pool
    if _pool is None:
        _pool = ThreadedConnectionPool(minconn=1, maxconn=15, dsn=DATABASE_URL)
    return _pool

class PooledConnection:
    """Wrapper that returns connection to pool on close() instead of dropping TCP socket."""
    def __init__(self, pool, conn):
        self._pool = pool
        self._conn = conn

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.close()

    def __getattr__(self, item):
        return getattr(self._conn, item)

    def close(self):
        if self._pool is not None and self._conn is not None:
            try:
                # If transaction left open/failed, rollback so connection is clean for next user
                if not self._conn.closed and self._conn.status == psycopg2.extensions.STATUS_IN_TRANSACTION:
                    self._conn.rollback()
            except Exception:
                pass
            try:
                self._pool.putconn(self._conn)
            except Exception:
                pass
            self._conn = None


def get_connection():
    """Obtain a pooled connection."""
    pool = get_pool()
    conn = pool.getconn()
    return PooledConnection(pool, conn)


def close_pool():
    global _pool
    if _pool:
        _pool.closeall()
        _pool = None


def create_tables():
    """Verify database connectivity on startup."""
    try:
        conn = get_connection()
        conn.close()
        print("Database connected successfully")
    except Exception as e:
        print(f"Database connection failed: {e}")
