from psycopg.rows import dict_row
from psycopg_pool import ConnectionPool

from langgraph.checkpoint.postgres import PostgresSaver

from app.core.config import settings


# psycopg expects a libpq URL (postgresql://), not SQLAlchemy's postgresql+psycopg://
DB_URI = settings.DATABASE_URL

pool = ConnectionPool(
    conninfo=DB_URI,
    max_size=20,
    kwargs={
        "autocommit": True,
        "row_factory": dict_row,
        "prepare_threshold": 0,
    },
)

checkpointer = PostgresSaver(pool)
