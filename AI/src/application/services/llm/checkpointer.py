"""
PostgreSQL Checkpointer for LangGraph
"""

from langgraph.checkpoint.postgres import PostgresSaver
from psycopg_pool import ConnectionPool
from src.infrastructure.config import get_settings
import time

settings = get_settings()

_checkpointer = None


def get_checkpointer() -> PostgresSaver:
    """
    Singleton pattern - tạo PostgresSaver 1 lần duy nhất
    
    Returns:
        PostgresSaver instance với connection pool
    """
    global _checkpointer
    
    if _checkpointer is None:
        # Create connection pool and OPEN it
        pool = ConnectionPool(
            conninfo=settings.postgres_chat_url,
            max_size=10,
            min_size=1,
            timeout=30.0,
        )
        
        print("success")
        # MUST open pool before use
        pool.open()
        
        # Initialize PostgresSaver
        _checkpointer = PostgresSaver(pool)
        
        # Setup tables
        _checkpointer.setup()
    
    return _checkpointer