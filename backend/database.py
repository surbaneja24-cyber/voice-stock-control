# ==============================================================================
# ARCHIVO: database.py
# PROPÓSITO: Configuración del motor de persistencia Neon (PostgreSQL).
# ==============================================================================

import os
from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker
from dotenv import load_dotenv

# Carga de variables de entorno para desarrollo local desde archivo .env
load_dotenv()

# 1. Obtención y saneamiento de la URL de producción
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise ValueError("CRÍTICO: La variable de entorno DATABASE_URL no está configurada.")

# SQLAlchemy 2.0 exige estrictamente el dialecto 'postgresql://'
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# 2. Inicialización del motor optimizado para la nube (Neon)
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,  # Verifica si la conexión sigue viva antes de cada consulta
    pool_size=5,         # Límite seguro de conexiones simultáneas para la capa gratuita
    max_overflow=2       # Conexiones extra permitidas en picos de tráfico
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