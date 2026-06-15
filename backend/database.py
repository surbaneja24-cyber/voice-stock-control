# ==============================================================================
# ARCHIVO: database.py
# PROPÓSITO: Gestionar la conexión física con la base de datos (SQLite).
# ==============================================================================

from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

SQLALCHEMY_DATABASE_URL = "sqlite:///./inventario.db"

# connect_args={"check_same_thread": False} es obligatorio en SQLite 
# para permitir que FastAPI maneje múltiples peticiones a la vez.
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()