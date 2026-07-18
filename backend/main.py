import asyncio
from datetime import datetime, timedelta
from typing import Literal, List
from pydantic import BaseModel, Field, EmailStr
from fastapi import FastAPI, HTTPException, Depends, status, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from jose import JWTError, jwt
import re
from thefuzz import process

from database import engine, Base, get_db
from models import Producto, Movimiento, Usuario, LeadPiloto

# Inicialización de DB
Base.metadata.create_all(bind=engine)

app = FastAPI(title="MyStock IA Motor - Secure Edition")

# --- CONFIGURACIÓN DE SEGURIDAD Y JWT ---
SECRET_KEY = "09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7" # Mover a .env en producción
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7 

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
# Mantenemos oauth2_scheme para compatibilidad con la documentación de Swagger, aunque usemos cookies
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/login", auto_error=False) 

# REFACTOR: Soporte dual para producción y entorno de desarrollo local
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://voice-stock-control.vercel.app",
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- VALIDACIONES PYDANTIC ---
class UsuarioRegistro(BaseModel):
    nombre: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=6, max_length=72)

class UsuarioLogin(BaseModel):
    email: str
    password: str

class NuevoProducto(BaseModel):
    nombre: str
    stock: int = 0
    sector: str

class LeadCreate(BaseModel):
    nombre: str = Field(..., min_length=2)
    empresa: str = Field(..., min_length=2)
    email: str 
    volumen: Literal["0-50", "51-200", "201-500", "500+"]

class ComandoPayload(BaseModel):
    comando: str = Field(..., max_length=200)
    sector: str

# --- DICCIONARIO DE NÚMEROS ---
MAPEO_NUMEROS = {
    "un": 1, "uno": 1, "una": 1, "dos": 2, "tres": 3, "cuatro": 4, 
    "cinco": 5, "seis": 6, "siete": 7, "ocho": 8, "nueve": 9, "diez": 10,
    "once": 11, "doce": 12, "veinte": 20, "cincuenta": 50, "cien": 100
}

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

def get_current_user(request: Request, db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Credenciales no válidas o sesión expirada",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    # 1. Leer la cookie directamente
    token = request.cookies.get("access_token")
    
    # 2. Fallback a cabeceras (por si viene de una app móvil futura)
    if not token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]
            
    if not token:
        raise credentials_exception

    try:
        # Como quitamos "Bearer" de la cookie, el token viene limpio.
        # Si por algún motivo residual viene con "Bearer ", lo limpiamos:
        if token.startswith("Bearer "):
            token = token.replace("Bearer ", "")
            
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError as e:
        print(f"[ERROR JWT]: {str(e)}") # Esto te saldrá en la terminal del backend si falla
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
    ] 
    nuevos_productos = [Producto(**p, usuario_id=usuario_id) for p in productos_seed]
    db.add_all(nuevos_productos)

# ==========================================
# ENDPOINTS PÚBLICOS
# ==========================================

@app.post("/api/registro")
def registrar_usuario(user: UsuarioRegistro, db: Session = Depends(get_db)):
    if not user.password or len(user.password) > 72:
        raise HTTPException(status_code=400, detail="La contraseña no puede exceder los 72 caracteres de seguridad.")

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
        print(f"[ERROR CRÍTICO REGISTRO]: {str(e)}") 
        raise HTTPException(status_code=500, detail="Error interno al procesar el registro.")

# REFACTOR: Set-Cookie de alta seguridad
@app.post("/api/login")
def login_usuario(user: UsuarioLogin, response: Response, db: Session = Depends(get_db)):
    db_user = db.query(Usuario).filter(Usuario.email == user.email).first()
    if not db_user or not verificar_password(user.password, db_user.password_hash):
        raise HTTPException(status_code=400, detail="Credenciales incorrectas. Verifique correo y contraseña.")
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = crear_token_acceso(data={"sub": db_user.email}, expires_delta=access_token_expires)
    
    # ELIMINAMOS EL PREFIJO "Bearer " PARA NO ROMPER EL PARSER HTTP
    response.set_cookie(
        key="access_token",
        value=access_token, # Envío del JWT crudo
        httponly=True,
        secure=True,        # OBLIGATORIO para Vercel
        samesite="none",    # OBLIGATORIO para peticiones entre distintos dominios
        max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60
    )
    
    return {
        "status": "success",
        "mensaje": "Autenticación segura completada",
        "usuario": {
            "id": db_user.id,
            "nombre": db_user.nombre,
            "email": db_user.email,
            "rol": db_user.rol,
            "plan": db_user.plan
        }
    }

# REFACTOR: Endpoint para destrucción segura de cookie
@app.post("/api/logout")
def logout_usuario(response: Response):
    response.delete_cookie(
        key="access_token",
        secure=True,
        samesite="none",
        httponly=True
    )
    return {"status": "success", "mensaje": "Sesión finalizada"}

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
        {"name": "MyStock Lite", "price": "Gratis", "period": "", "description": "Para pequeños negocios.", "features": ["Hasta 50 productos", "Reconocimiento básico", "1 Usuario"], "icon_type": "user", "buttonText": "Empezar Gratis", "popular": False},
        {"name": "MyStock Pro", "price": "$49", "period": "/mes", "description": "Para almacenes en crecimiento.", "features": ["Productos ilimitados", "Alta prioridad", "Hasta 5 usuarios"], "icon_type": "star", "buttonText": "Probar Gratis", "popular": True},
        {"name": "MyStock Industrial", "price": "Custom", "period": "", "description": "Grandes centros logísticos.", "features": ["Sedes múltiples", "Integración ERP", "Usuarios ilimitados"], "icon_type": "building", "buttonText": "Contactar", "popular": False}
    ]

# ==========================================
# ENDPOINTS PRIVADOS
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

@app.post("/api/procesar-comando")
def procesar_comando(payload: ComandoPayload, db: Session = Depends(get_db), current_user: Usuario = Depends(get_current_user)):
    texto = payload.comando.lower()
    
    palabras_ingreso = ["añadir", "añade", "suma", "sumar", "entrar", "entrada", "agrega", "agregar"]
    palabras_salida = ["quitar", "quita", "resta", "restar", "sacar", "saca", "elimina", "salida"]
    
    es_ingreso = any(p in texto for p in palabras_ingreso)
    es_salida = any(p in texto for p in palabras_salida)
    
    if es_ingreso and es_salida:
        return {"estado": "error", "mensaje": "Comando confuso: indica entrada o salida, no ambas."}
    if not es_ingreso and not es_salida:
        return {"estado": "error", "mensaje": "No entendí la acción. Di 'añadir' o 'quitar'."}
        
    accion = "suma" if es_ingreso else "resta"
    
    cantidad = 0
    match_digito = re.search(r'\d+', texto)
    if match_digito:
        cantidad = int(match_digito.group())
    else:
        for palabra, valor in MAPEO_NUMEROS.items():
            if re.search(rf'\b{palabra}\b', texto):
                cantidad = valor
                break
                
    if cantidad <= 0:
        return {"estado": "error", "mensaje": "No escuché una cantidad válida."}

    texto_limpio = re.sub(r'\d+', '', texto)
    for palabra in palabras_ingreso + palabras_salida + list(MAPEO_NUMEROS.keys()):
        texto_limpio = re.sub(rf'\b{palabra}\b', '', texto_limpio)
    texto_limpio = texto_limpio.strip()

    productos_db = db.query(Producto).filter(
        Producto.usuario_id == current_user.id,
        ((Producto.sector == payload.sector.lower()) | (Producto.sector == 'universal'))
    ).all()
    
    if not productos_db:
        return {"estado": "error", "mensaje": f"No hay productos registrados en este sector."}
        
    nombres_productos = [p.nombre.lower() for p in productos_db]
    mejor_coincidencia, puntuacion = process.extractOne(texto_limpio, nombres_productos)
    
    if puntuacion < 65:
        return {"estado": "error", "mensaje": f"No encontré el producto. Lo más parecido es '{mejor_coincidencia}' pero no estoy seguro."}
        
    producto_objetivo = next(p for p in productos_db if p.nombre.lower() == mejor_coincidencia)
    
    try:
        if accion == "resta":
            if producto_objetivo.stock < cantidad:
                return {"estado": "error", "mensaje": f"Stock insuficiente. Solo hay {producto_objetivo.stock} de {producto_objetivo.nombre}."}
            producto_objetivo.stock -= cantidad
            accion_str = f"Salida registrada: -{cantidad} ud(s)"
        else:
            producto_objetivo.stock += cantidad
            accion_str = f"Entrada registrada: +{cantidad} ud(s)"
            
        nuevo_movimiento = Movimiento(
            user=current_user.nombre, 
            action=accion, 
            product=producto_objetivo.nombre,
            quantity=cantidad, 
            unit="ud", 
            method="Voz",
            usuario_id=current_user.id 
        )
        
        db.add(nuevo_movimiento)
        db.commit()
        db.refresh(producto_objetivo)
        
        return {
            "estado": "completado",
            "mensaje": f"[ÉXITO] {producto_objetivo.nombre}\n{accion_str}\nStock actual: {producto_objetivo.stock}\nPrecisión: {puntuacion}%",
            "accion": "entrada" if accion == "suma" else "salida",
            "producto": producto_objetivo.nombre,
            "cantidad": cantidad,            
            "unidad": "ud"
        }
    except Exception as e:
        db.rollback()
        print(f"[ERROR MOTOR NLP]: {str(e)}")
        return {"estado": "error", "mensaje": "Error interno al actualizar el inventario."}