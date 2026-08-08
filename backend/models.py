# ==============================================================================
# ARCHIVO: models.py
# PROPÓSITO: Definir la estructura (Esquemas) de las tablas con Soporte SaaS.
# ==============================================================================

from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base

class Usuario(Base):
    __tablename__ = "usuarios"
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    rol = Column(String, default="operario")

    # NUEVO: Control de cuotas de monetización (lite, pro, industrial)
    plan = Column(String, default="lite", nullable=False)

    # Nullable: los usuarios existentes no tienen valor hasta su próximo login.
    last_login = Column(DateTime(timezone=True), nullable=True)

    # Relaciones
    productos = relationship("Producto", back_populates="dueno", cascade="all, delete-orphan")
    movimientos = relationship("Movimiento", back_populates="operario", cascade="all, delete-orphan")


class Producto(Base):
    __tablename__ = "productos"
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, index=True, nullable=False) 
    stock = Column(Integer, default=0, nullable=False)
    sector = Column(String, index=True, nullable=False) 
    
    # Enlace crítico: Aislamiento por usuario (Multi-tenancy)
    usuario_id = Column(Integer, ForeignKey("usuarios.id", ondelete="CASCADE"), nullable=False)
    dueno = relationship("Usuario", back_populates="productos")


class Movimiento(Base):
    __tablename__ = "historial_movimientos"
    id = Column(Integer, primary_key=True, index=True)
    
    # CORREGIDO: De String a DateTime nativo indexable para optimizar el Dashboard analítico
    dateTime = Column(DateTime(timezone=True), server_default=func.now(), index=True) 
    
    user = Column(String, nullable=False) 
    action = Column(String, nullable=False) 
    product = Column(String, nullable=False) 
    quantity = Column(Integer, nullable=False) 
    unit = Column(String, default="unidad", nullable=False) 
    method = Column(String, default="Voz", nullable=False)
    
    # Enlace crítico de auditoría
    usuario_id = Column(Integer, ForeignKey("usuarios.id", ondelete="CASCADE"), nullable=False)
    operario = relationship("Usuario", back_populates="movimientos") 


# NUEVO: Entidad para el almacenamiento seguro de prospectos comerciales (BETA)
class LeadPiloto(Base):
    __tablename__ = "leads_piloto"
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, nullable=False)
    empresa = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False) # Evita duplicados de bots
    volumen = Column(String, nullable=False) # Rango de productos declarado en el formulario
    fecha_registro = Column(DateTime(timezone=True), server_default=func.now())