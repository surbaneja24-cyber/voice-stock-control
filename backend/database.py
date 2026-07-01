# ==============================================================================
# ARCHIVO: database.py
# PROPÓSITO: Configuración del motor de persistencia y control de concurrencia.
# ==============================================================================

import os
from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

# 1. Determinación estricta de la ruta del archivo de base de datos
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATABASE_FILE = os.path.join(BASE_DIR, 'inventario.db')
SQLALCHEMY_DATABASE_URL = f"sqlite:///{DATABASE_FILE}"

# 2. Inicialización del motor con programación defensiva contra bloqueos concurrentes
# Se inyecta 'timeout': 15 para forzar a SQLite a esperar en cola antes de fallar con 'database is locked'.
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, 
    connect_args={
        "check_same_thread": False,
        "timeout": 15
    }
)

# 3. Fábrica de sesiones aisladas
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 4. Declaración del modelo base alineado al estándar moderno de SQLAlchemy 2.0
class Base(DeclarativeBase):
    """Clase base nativa que sustituye al método obsoleto declarative_base()"""
    pass

# 5. Generador del ciclo de vida de la conexión (Inyección de dependencias)
def get_db():
    """Inicializa una sesión de base de datos por petición y garantiza su cierre."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()