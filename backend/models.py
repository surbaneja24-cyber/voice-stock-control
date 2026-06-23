# ==============================================================================
# ARCHIVO: models.py
# PROPÓSITO: Definir la estructura (Esquemas) de las tablas con Aislamiento.
# ==============================================================================

from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class Usuario(Base):
    __tablename__ = "usuarios"
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    password_hash = Column(String)
    rol = Column(String, default="operario")

    # Relaciones: Un usuario tiene muchos productos y muchos movimientos
    productos = relationship("Producto", back_populates="dueno", cascade="all, delete-orphan")
    movimientos = relationship("Movimiento", back_populates="operario", cascade="all, delete-orphan")


class Producto(Base):
    __tablename__ = "productos"
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, index=True) # REMOVIDO: unique=True (el nombre es único SOLO para ese usuario)
    stock = Column(Integer, default=0)
    sector = Column(String, index=True) 
    
    # Enlace crítico: A qué usuario le pertenece este stock
    usuario_id = Column(Integer, ForeignKey("usuarios.id", ondelete="CASCADE"), nullable=False)
    
    dueno = relationship("Usuario", back_populates="productos")


class Movimiento(Base):
    __tablename__ = "historial_movimientos"
    id = Column(Integer, primary_key=True, index=True)
    dateTime = Column(String, index=True) 
    user = Column(String) # Mantenemos el string por legibilidad visual en UI
    action = Column(String) 
    product = Column(String) 
    quantity = Column(Integer) 
    unit = Column(String, default="unidad") 
    method = Column(String)
    
    # Enlace crítico: Quién ejecutó el movimiento por voz
    usuario_id = Column(Integer, ForeignKey("usuarios.id", ondelete="CASCADE"), nullable=False)
    
    operario = relationship("Usuario", back_populates="movimientos")