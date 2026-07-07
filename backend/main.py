import asyncio
import re
from datetime import datetime, timedelta
from typing import Literal, List

from fastapi import FastAPI, UploadFile, File, HTTPException, Depends, Form, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr, Field
from passlib.context import CryptContext
from jose import JWTError, jwt

from database import engine, Base, get_db
from models import Producto, Movimiento, Usuario, LeadPiloto
import servicios_ia

# Inicialización de DB
Base.metadata.create_all(bind=engine)

app = FastAPI(title="VoxStock IA Motor - Secure Edition")

# --- CONFIGURACIÓN DE SEGURIDAD Y JWT ---
SECRET_KEY = "09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7" # Mover a .env en producción
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7 # Token válido por 7 días

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/login") # El frontend usará esto

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://voice-stock-control.vercel.app"], # La URL exacta de tu frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- VALIDACIONES PYDANTIC ---
class UsuarioRegistro(BaseModel):
    nombre: str = Field(..., min_length=2)
    email: str
    password: str = Field(..., min_length=6)

class UsuarioLogin(BaseModel):
    email: str
    password: str

class NuevoProducto(BaseModel):
    nombre: str
    stock: int = 0
    sector: str
    # ELIMINADO: usuario_id. El servidor lo deducirá por seguridad a través del Token.

class LeadCreate(BaseModel):
    nombre: str = Field(..., min_length=2)
    empresa: str = Field(..., min_length=2)
    email: str 
    volumen: Literal["0-50", "51-200", "201-500", "500+"]

# --- FUNCIONES CORE DE SEGURIDAD ---
def verificar_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def obtener_password_hash(password):
    return pwd_context.hash(password)

def crear_token_acceso(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    """Extrae, valida el JWT y devuelve el usuario dueño de la petición."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Credenciales no válidas o token expirado",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = db.query(Usuario).filter(Usuario.email == email).first()
    if user is None:
        raise credentials_exception
    return user

# --- SEMILLA DE CATÁLOGO ---
def sembrar_catalogo_para_usuario(db: Session, usuario_id: int):
    productos_seed = [
        {"nombre": "Leche entera", "stock": 250, "sector": "alimentacion"},
        {"nombre": "Tornillos galvanizados", "stock": 1000, "sector": "ferreteria"},
        {"nombre": "Paracetamol 500mg", "stock": 500, "sector": "farmacia"},
        {"nombre": "Palets de madera", "stock": 80, "sector": "logistica"},
        {"nombre": "Material general", "stock": 10, "sector": "universal"}
    ] # Recortado por eficiencia, añade los que falten.
    nuevos_productos = [Producto(**p, usuario_id=usuario_id) for p in productos_seed]
    db.add_all(nuevos_productos)

# ==========================================
# ENDPOINTS PÚBLICOS (Sin Token)
# ==========================================

@app.post("/api/registro")
def registrar_usuario(user: UsuarioRegistro, db: Session = Depends(get_db)):
    db_user = db.query(Usuario).filter(Usuario.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="El correo electrónico ya está registrado.")
    
    try:
        nuevo_usuario = Usuario(
            nombre=user.nombre,
            email=user.email,
            password_hash=obtener_password_hash(user.password),
            rol="operario",
            plan="lite" 
        )
        db.add(nuevo_usuario)
        db.flush() 
        sembrar_catalogo_para_usuario(db, nuevo_usuario.id)
        db.commit() 
        db.refresh(nuevo_usuario)        
        
        return {
            "status": "success",
            "usuario": {"nombre": nuevo_usuario.nombre, "email": nuevo_usuario.email, "rol": nuevo_usuario.rol}
        }
    except Exception as e:
        db.rollback() 
        raise HTTPException(status_code=500, detail=f"Fallo crítico en la creación de cuenta: {str(e)}")

@app.post("/api/login")
def login_usuario(user: UsuarioLogin, db: Session = Depends(get_db)):
    db_user = db.query(Usuario).filter(Usuario.email == user.email).first()
    if not db_user or not verificar_password(user.password, db_user.password_hash):
        raise HTTPException(status_code=400, detail="Credenciales incorrectas. Verifique correo y contraseña.")
    
    # Emitimos el Token de acceso
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = crear_token_acceso(data={"sub": db_user.email}, expires_delta=access_token_expires)
    
    return {
        "status": "success",
        "access_token": access_token,
        "token_type": "bearer",
        "usuario": {
            "id": db_user.id,
            "nombre": db_user.nombre,
            "email": db_user.email,
            "rol": db_user.rol,
            "plan": db_user.plan
        }
    }

@app.post("/api/leads")
def registrar_lead_piloto(lead: LeadCreate, db: Session = Depends(get_db)):
    existe_lead = db.query(LeadPiloto).filter(LeadPiloto.email == lead.email).first()
    if existe_lead:
        raise HTTPException(status_code=400, detail="Este correo ya se encuentra inscrito.")
    
    nuevo_lead = LeadPiloto(**lead.dict())
    try:
        db.add(nuevo_lead)
        db.commit()
        return {"status": "success", "mensaje": "Solicitud procesada correctamente."}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Error interno al guardar prospecto.")

@app.get("/api/pricing")
def obtener_planes_monetizacion():
    return [
        {"name": "VoxStock Lite", "price": "Gratis", "period": "", "description": "Para pequeños negocios.", "features": ["Hasta 50 productos", "Reconocimiento básico", "1 Usuario"], "icon_type": "user", "buttonText": "Empezar Gratis", "popular": False},
        {"name": "VoxStock Pro", "price": "$49", "period": "/mes", "description": "Para almacenes en crecimiento.", "features": ["Productos ilimitados", "Alta prioridad", "Hasta 5 usuarios"], "icon_type": "star", "buttonText": "Probar Gratis", "popular": True},
        {"name": "VoxStock Industrial", "price": "Custom", "period": "", "description": "Grandes centros logísticos.", "features": ["Sedes múltiples", "Integración ERP", "Usuarios ilimitados"], "icon_type": "building", "buttonText": "Contactar", "popular": False}
    ]

# ==========================================
# ENDPOINTS PRIVADOS (Requieren Token JWT)
# ==========================================

@app.get("/api/history")
def obtener_historial(db: Session = Depends(get_db), current_user: Usuario = Depends(get_current_user)):
    return db.query(Movimiento).filter(Movimiento.usuario_id == current_user.id).all()

@app.get("/api/catalogo")
def obtener_catalogo(sector: str = "universal", db: Session = Depends(get_db), current_user: Usuario = Depends(get_current_user)):
    query_base = db.query(Producto).filter(Producto.usuario_id == current_user.id)
    if sector != "universal":
        productos = query_base.filter((Producto.sector == sector.lower()) | (Producto.sector == "universal")).all()
    else:
        productos = query_base.all()
    return [{"id": p.id, "nombre": p.nombre, "stock": p.stock, "sector": p.sector} for p in productos]

@app.post("/api/catalogo/item")
def agregar_producto_personalizado(producto: NuevoProducto, db: Session = Depends(get_db), current_user: Usuario = Depends(get_current_user)):
    if current_user.plan == "lite":
        conteo_actual = db.query(Producto).filter(Producto.usuario_id == current_user.id).count()
        if conteo_actual >= 50:
            raise HTTPException(status_code=400, detail="Límite del plan Lite alcanzado (Máx 50).")

    producto_existente = db.query(Producto).filter(
        Producto.usuario_id == current_user.id,
        Producto.nombre.ilike(producto.nombre)
    ).first()
    
    if producto_existente:
        raise HTTPException(status_code=400, detail=f"Ya tienes un producto llamado '{producto.nombre}'.")
    
    nuevo_item = Producto(
        nombre=producto.nombre,
        stock=producto.stock,
        sector=producto.sector.lower(),
        usuario_id=current_user.id
    )
    db.add(nuevo_item)
    db.commit()
    return {"status": "success", "mensaje": f"Producto '{nuevo_item.nombre}' añadido."}

@app.delete("/api/catalogo/item/{producto_id}")
def eliminar_producto_personalizado(producto_id: int, db: Session = Depends(get_db), current_user: Usuario = Depends(get_current_user)):
    producto_db = db.query(Producto).filter(Producto.id == producto_id, Producto.usuario_id == current_user.id).first()
    if not producto_db:
        raise HTTPException(status_code=404, detail="Producto no encontrado.")
    
    nombre_borrado = producto_db.nombre
    db.delete(producto_db)
    db.commit()
    return {"status": "success", "mensaje": f"Producto '{nombre_borrado}' eliminado."}

@app.post("/api/transcribir")
async def endpoint_transcribir(
    audio: UploadFile = File(...), 
    sector: str = Form("universal"), 
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    if not audio.filename:
        raise HTTPException(status_code=400, detail="Archivo inválido.")
    
    contenido_audio = await audio.read()
    if len(contenido_audio) < 1000: # Reducido temporalmente por seguridad, mejorar esto luego
        raise HTTPException(status_code=400, detail="Audio demasiado corto o corrupto.")
    
    try:
        texto_extraido = await asyncio.to_thread(servicios_ia.extraer_texto_de_audio, contenido_audio)
        productos_filtrados = db.query(Producto).filter(Producto.usuario_id == current_user.id).filter(
            (Producto.sector == sector.lower()) | (Producto.sector == "universal")
        ).all()
        
        nombres_catalogo = [p.nombre for p in productos_filtrados]
        coincidencia, porcentaje = servicios_ia.evaluar_coincidencia(texto_extraido, nombres_catalogo)
        
        if coincidencia:
            producto_db = db.query(Producto).filter(Producto.nombre == coincidencia, Producto.usuario_id == current_user.id).first()
            accion, cantidad, unidad = servicios_ia.interpretar_orden(texto_extraido)
            
            if accion == "suma":
                producto_db.stock += cantidad
                accion_str = f"Entrada registrada: +{cantidad} {unidad}(s)"
            elif accion == "resta":
                if producto_db.stock >= cantidad:
                    producto_db.stock -= cantidad
                    accion_str = f"Salida registrada: -{cantidad} {unidad}(s)"
                else:
                    raise HTTPException(status_code=400, detail=f"Stock insuficiente.")
            else:
                accion_str = "Consulta de stock"
                
            if accion != "leer":
                nuevo_movimiento = Movimiento(
                    user=current_user.nombre, 
                    action=accion, 
                    product=producto_db.nombre,
                    quantity=cantidad, 
                    unit=unidad, 
                    method="Voz",
                    usuario_id=current_user.id 
                )
                db.add(nuevo_movimiento)
                db.commit() 
                db.refresh(producto_db)
            
            return {
                "transcripcion": texto_extraido,
                "mensaje": f"[EXITO] {producto_db.nombre}\n{accion_str}\nStock: {producto_db.stock}\nPrecisión: {porcentaje}%", 
                "estado": "completado", "accion": accion, "producto": producto_db.nombre, "cantidad": cantidad, "unidad": unidad
            }
        else:
            return {
                "transcripcion": texto_extraido, 
                "mensaje": "Producto no identificado.", 
                "estado": "error"
            }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Fallo del motor: {str(e)}")