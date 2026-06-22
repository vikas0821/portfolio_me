"""Database engine + session (SQLModel / Postgres, synchronous)."""
from sqlmodel import SQLModel, Session, create_engine
from .config import settings

engine = create_engine(settings.database_url, pool_pre_ping=True, echo=False)


def init_db() -> None:
    # Import models so SQLModel registers all tables before create_all.
    from . import models  # noqa: F401
    SQLModel.metadata.create_all(engine)


def get_session():
    with Session(engine) as session:
        yield session
