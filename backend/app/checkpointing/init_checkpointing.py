from langgraph.checkpoint.postgres import PostgresSaver

from app.checkpointing.checkpointer import DB_URI, checkpointer, pool


def initialize_checkpointing():
    """Run migrations with autocommit (required for CREATE INDEX CONCURRENTLY)."""
    with PostgresSaver.from_conn_string(DB_URI) as setup_saver:
        setup_saver.setup()

    with pool.connection():
        pass
