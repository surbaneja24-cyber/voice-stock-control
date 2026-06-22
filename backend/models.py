# ==============================================================================
# ARCHIVO: models.py
# PROPÓSITO: Definir la estructura (Esquemas) de las tablas de inventario.
# ==============================================================================

from sqlalchemy import Column, Integer, String
from database import Base

class Producto(Base):
    __tablename__ = "productos"
    
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, unique=True, index=True)
    stock = Column(Integer, default=0)
    sector = Column(String, index=True) # <-- NUEVO: Identificador de sector logístico

class Movimiento(Base):
    __tablename__ = "historial_movimientos"
    
    id = Column(Integer, primary_key=True, index=True)
    dateTime = Column(String, index=True) 
    user = Column(String)                 
    action = Column(String)               
    product = Column(String)              
    quantity = Column(Integer)            
    unit = Column(String, default="unidad")                 
    method = Column(String)