import asyncio
from fastapi import FastAPI, UploadFile, File, HTTPException, Depends, Form
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field
from passlib.context import CryptContext
from typing import Literal
from database import engine, Base, get_db, SessionLocal
from models import Producto, Movimiento, Usuario
import servicios_ia

# Inicialización de las tablas en la Base de Datos
Base.metadata.create_all(bind=engine)

app = FastAPI(title="VoxStock IA Motor")

# Configuración de seguridad para contraseñas (Bcrypt)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Nota de QA: Cambiar por dominios específicos en producción
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
    usuario_id: int

# --- FUNCIONES AUXILIARES ---
def verificar_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def obtener_password_hash(password):
    return pwd_context.hash(password)

def sembrar_catalogo_para_usuario(db: Session, usuario_id: int):
    """Inyecta el catálogo inicial parametrizado para un usuario específico de forma interna."""
    productos_semilla = [
        {"nombre": "Leche entera", "stock": 250, "sector": "alimentacion"},
        {"nombre": "Leche desnatada", "stock": 180, "sector": "alimentacion"},
        {"nombre": "Huevos docena", "stock": 120, "sector": "alimentacion"},
        {"nombre": "Pan de molde", "stock": 90, "sector": "alimentacion"},
        {"nombre": "Arroz blanco 1kg", "stock": 200, "sector": "alimentacion"},
        {"nombre": "Atún en conserva", "stock": 200, "sector": "alimentacion"},
        {"nombre": "Tornillos galvanizados", "stock": 1000, "sector": "ferreteria"},
        {"nombre": "Tuercas metálicas", "stock": 1200, "sector": "ferreteria"},
        {"nombre": "Martillo de carpintero", "stock": 50, "sector": "ferreteria"},
        {"nombre": "Destornillador estrella", "stock": 90, "sector": "ferreteria"},
        {"nombre": "Paracetamol 500mg", "stock": 500, "sector": "farmacia"},
        {"nombre": "Ibuprofeno 400mg", "stock": 450, "sector": "farmacia"},
        {"nombre": "Alcohol antiséptico 1L", "stock": 120, "sector": "farmacia"},
        {"nombre": "Palets de madera", "stock": 80, "sector": "logistica"},
        {"nombre": "Cajas de cartón medianas", "stock": 350, "sector": "logistica"},
        {"nombre": "Precinto de embalaje", "stock": 300, "sector": "logistica"},
        {"nombre": "Materiales varios", "stock": 100, "sector": "universal"},
        {"nombre": "Cosas generales", "stock": 100, "sector": "universal"}
    ]
    
    nuevos_productos = [Producto(**p, usuario_id=usuario_id) for p in productos_semilla]
    db.add_all(nuevos_productos)
    # Nota de QA: No hacemos commit aquí para permitir transacciones atómicas desde la ruta padre

# --- ENDPOINTS ---
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
            rol="operario"
        )
        db.add(nuevo_usuario)
        db.flush() # Genera el id del usuario de forma intermedia sin guardarlo permanentemente aún
        
        # Flujo Atómico: Sembrar el catálogo bajo la misma transacción
        sembrar_catalogo_para_usuario(db, nuevo_usuario.id)
        
        db.commit() # Si todo sale bien, confirmamos usuario + catálogo al mismo tiempo
        db.refresh(nuevo_usuario)
        
        return {
            "status": "success",
            "usuario": {"nombre": nuevo_usuario.nombre, "email": nuevo_usuario.email, "rol": nuevo_usuario.rol}
        }
    except Exception as e:
        db.rollback() # Si algo falla (ej. la siembra), revertimos todo para evitar datos huérfanos
        raise HTTPException(status_code=500, detail=f"Fallo crítico en la creación de cuenta: {str(e)}")

@app.post("/api/login")
def login_usuario(user: UsuarioLogin, db: Session = Depends(get_db)):
    db_user = db.query(Usuario).filter(Usuario.email == user.email).first()
    if not db_user or not verificar_password(user.password, db_user.password_hash):
        raise HTTPException(status_code=400, detail="Credenciales incorrectas. Verifique correo y contraseña.")
    
    return {
        "status": "success",
        "usuario": {
            "id": db_user.id,
            "nombre": db_user.nombre,
            "email": db_user.email,
            "rol": db_user.rol
        }
    }

@app.get("/api/history")
def obtener_historial(usuario_id: int, db: Session = Depends(get_db)):
    return db.query(Movimiento).filter(Movimiento.usuario_id == usuario_id).all()

@app.get("/api/catalogo")
def obtener_catalogo(usuario_id: int, sector: str = "universal", db: Session = Depends(get_db)):
    query_base = db.query(Producto).filter(Producto.usuario_id == usuario_id)
    
    if sector != "universal":
        productos = query_base.filter(
            (Producto.sector == sector.lower()) | (Producto.sector == "universal")
        ).all()
    else:
        productos = query_base.all()
        
    # CORREGIDO POR QA: Se reincorpora el campo 'id' para evitar errores 'undefined' en el borrado frontend
    return [{"id": p.id, "nombre": p.nombre, "stock": p.stock, "sector": p.sector} for p in productos]


# --- ENDPOINTS DE GESTIÓN DE CATÁLOGO ---
@app.post("/api/catalogo/item")
def agregar_producto_personalizado(producto: NuevoProducto, db: Session = Depends(get_db)):
    producto_existente = db.query(Producto).filter(
        Producto.usuario_id == producto.usuario_id,
        Producto.nombre.ilike(producto.nombre)
    ).first()
    
    if producto_existente:
        raise HTTPException(status_code=400, detail=f"Ya tienes un producto llamado '{producto.nombre}' en tu catálogo.")
    
    nuevo_item = Producto(
        nombre=producto.nombre,
        stock=producto.stock,
        sector=producto.sector.lower(),
        usuario_id=producto.usuario_id
    )
    
    db.add(nuevo_item)
    db.commit()
    db.refresh(nuevo_item)
    
    return {"status": "success", "mensaje": f"Producto '{nuevo_item.nombre}' añadido correctamente."}

@app.delete("/api/catalogo/item/{producto_id}")
def eliminar_producto_personalizado(producto_id: int, usuario_id: int, db: Session = Depends(get_db)):
    producto_db = db.query(Producto).filter(
        Producto.id == producto_id,
        Producto.usuario_id == usuario_id
    ).first()
    
    if not producto_db:
        raise HTTPException(status_code=404, detail="Producto no encontrado o no tienes permisos para borrarlo.")
    
    nombre_borrado = producto_db.nombre
    db.delete(producto_db)
    db.commit()
    
    return {"status": "success", "mensaje": f"Producto '{nombre_borrado}' eliminado de tu catálogo."}

# --- NUEVO ENDPOINT DE CONFIGURACIÓN DE MONETIZACIÓN (BACKEND-DRIVEN UI) ---
@app.get("/api/pricing")
def obtener_planes_monetizacion():
    return [
        {
            "name": "VoxStock Lite", 
            "price": "Gratis", 
            "period": "", 
            "description": "Para pequeños negocios.", 
            "features": ["Hasta 50 productos", "Reconocimiento básico", "1 Usuario"], 
            "icon_type": "user", 
            "buttonText": "Empezar Gratis", 
            "popular": False
        },
        {
            "name": "VoxStock Pro", 
            "price": "$49", 
            "period": "/mes", 
            "description": "Para almacenes en crecimiento.", 
            "features": ["Productos ilimitados", "Alta prioridad", "Hasta 5 usuarios"], 
            "icon_type": "star", 
            "buttonText": "Probar Gratis", 
            "popular": True
        },
        {
            "name": "VoxStock Industrial", 
            "price": "Custom", 
            "period": "", 
            "description": "Grandes centros logísticos.", 
            "features": ["Sedes múltiples", "Integración ERP", "Usuarios ilimitados"], 
            "icon_type": "building", 
            "buttonText": "Contactar", 
            "popular": False
        }
    ]
    
import asyncio
import re
from fastapi import FastAPI, UploadFile, File, HTTPException, Depends, Form
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import datetime
from pydantic import BaseModel, Field
from passlib.context import CryptContext

from database import engine, Base, get_db
from models import Producto, Movimiento, Usuario, LeadPiloto  # NUEVO: Importamos LeadPiloto
import servicios_ia

# Inicialización de las tablas en la Base de Datos
Base.metadata.create_all(bind=engine)

app = FastAPI(title="VoxStock IA Motor")

# Configuración de seguridad para contraseñas (Bcrypt)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
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
    usuario_id: int

# NUEVO: Validación para la captura de leads del Programa Piloto
class LeadCreate(BaseModel):
    nombre: str = Field(..., min_length=2)
    empresa: str = Field(..., min_length=2)
    email: EmailStr # Requiere validación estricta de regex interna
    volumen: Literal["0-50", "51-200", "201-500", "500+"]

# --- FUNCIONES AUXILIARES ---
def verificar_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def obtener_password_hash(password):
    return pwd_context.hash(password)

def sembrar_catalogo_para_usuario(db: Session, usuario_id: int):
    """Inyecta el catálogo inicial parametrizado para un usuario específico de forma interna."""
    productos_seed = [
        {"nombre": "Leche entera", "stock": 250, "sector": "alimentacion"},
        {"nombre": "Leche desnatada", "stock": 180, "sector": "alimentacion"},
        {"nombre": "Huevos docena", "stock": 120, "sector": "alimentacion"},
        {"nombre": "Pan de molde", "stock": 90, "sector": "alimentacion"},
        {"nombre": "Arroz blanco 1kg", "stock": 200, "sector": "alimentacion"},
        {"nombre": "Atún en conserva", "stock": 200, "sector": "alimentacion"},
        {"nombre": "Tornillos galvanizados", "stock": 1000, "sector": "ferreteria"},
        {"nombre": "Tuercas metálicas", "stock": 1200, "sector": "ferreteria"},
        {"nombre": "Martillo de carpintero", "stock": 50, "sector": "ferreteria"},
        {"nombre": "Destornillador estrella", "stock": 90, "sector": "ferreteria"},
        {"nombre": "Paracetamol 500mg", "stock": 500, "sector": "farmacia"},
        {"nombre": "Ibuprofeno 400mg", "stock": 450, "sector": "farmacia"},
        {"nombre": "Alcohol antiséptico 1L", "stock": 120, "sector": "farmacia"},
        {"nombre": "Palets de madera", "stock": 80, "sector": "logistica"},
        {"nombre": "Cajas de cartón medianas", "stock": 350, "sector": "logistica"},
        {"nombre": "Precinto de embalaje", "stock": 300, "sector": "logistica"},
        {"nombre": "Materiales varios", "stock": 100, "sector": "universal"},
        {"nombre": "Cosas generales", "stock": 100, "sector": "universal"}
    ]
    
    nuevos_productos = [Producto(**p, usuario_id=usuario_id) for p in productos_seed]
    db.add_all(nuevos_productos)

# --- ENDPOINTS DE AUTENTICACIÓN ---
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
            plan="lite"  # MODIFICADO: Todo usuario nuevo inicia en el plan gratuito bajo control de cuotas
        )
        db.add(nuevo_usuario)
        db.flush() 
        
        sembrar_catalogo_para_usuario(db, nuevo_usuario.id)
        
        db.commit() 
        db.refresh(nuevo_usuario)         
        return {
            "status": "success",
            "usuario": {"nombre": nuevo_usuario.nombre, "email": nuevo_usuario.email, "rol": nuevo_usuario.rol, "plan": nuevo_usuario.plan}
        }
    except Exception as e:
        db.rollback() 
        raise HTTPException(status_code=500, detail=f"Fallo crítico en la creación de cuenta: {str(e)}")

@app.post("/api/login")
def login_usuario(user: UsuarioLogin, db: Session = Depends(get_db)):
    db_user = db.query(Usuario).filter(Usuario.email == user.email).first()
    if not db_user or not verificar_password(user.password, db_user.password_hash):
        raise HTTPException(status_code=400, detail="Credenciales incorrectas. Verifique correo y contraseña.")
    
    return {
        "status": "success",
        "usuario": {
            "id": db_user.id,
            "nombre": db_user.nombre,
            "email": db_user.email,
            "rol": db_user.rol,
            "plan": db_user.plan
        }
    }

# --- ENDPOINTS DE NEGOCIO Y CAPTACIÓN ---
@app.post("/api/leads")
def registrar_lead_piloto(lead: LeadCreate, db: Session = Depends(get_db)):
    """Recibe y persiste los prospectos comerciales del formulario Early Adopters."""
    if not re.match(r"[^@]+@[^@]+\.[^@]+", lead.email):
        raise HTTPException(status_code=400, detail="El formato del correo electrónico es inválido.")
        
    existe_lead = db.query(LeadPiloto).filter(LeadPiloto.email == lead.email).first()
    if existe_lead:
        raise HTTPException(status_code=400, detail="Este correo ya se encuentra inscrito en el programa piloto.")
    
    nuevo_lead = LeadPiloto(
        nombre=lead.nombre,
        empresa=lead.empresa,
        email=lead.email,
        volumen=lead.volumen
    )
    try:
        db.add(nuevo_lead)
        db.commit()
        return {"status": "success", "mensaje": "Solicitud procesada correctamente."}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error interno al guardar prospecto: {str(e)}")

@app.get("/api/pricing")
def obtener_planes_monetizacion():
    return [
        {"name": "VoxStock Lite", "price": "Gratis", "period": "", "description": "Para pequeños negocios.", "features": ["Hasta 50 productos", "Reconocimiento básico", "1 Usuario"], "icon_type": "user", "buttonText": "Empezar Gratis", "popular": False},
        {"name": "VoxStock Pro", "price": "$49", "period": "/mes", "description": "Para almacenes en crecimiento.", "features": ["Productos ilimitados", "Alta prioridad", "Hasta 5 usuarios"], "icon_type": "star", "buttonText": "Probar Gratis", "popular": True},
        {"name": "VoxStock Industrial", "price": "Custom", "period": "", "description": "Grandes centros logísticos.", "features": ["Sedes múltiples", "Integración ERP", "Usuarios ilimitados"], "icon_type": "building", "buttonText": "Contactar", "popular": False}
    ]

@app.get("/api/history")
def obtener_historial(usuario_id: int, db: Session = Depends(get_db)):
    return db.query(Movimiento).filter(Movimiento.usuario_id == usuario_id).all()

@app.get("/api/catalogo")
def obtener_catalogo(usuario_id: int, sector: str = "universal", db: Session = Depends(get_db)):
    query_base = db.query(Producto).filter(Producto.usuario_id == usuario_id)
    if sector != "universal":
        productos = query_base.filter((Producto.sector == sector.lower()) | (Producto.sector == "universal")).all()
    else:
        productos = query_base.all()
    return [{"id": p.id, "nombre": p.nombre, "stock": p.stock, "sector": p.sector} for p in productos]

@app.post("/api/catalogo/item")
def agregar_producto_personalizado(producto: NuevoProducto, db: Session = Depends(get_db)):
    # 1. Validar existencia del usuario y verificar cuotas de su plan SaaS
    usuario = db.query(Usuario).filter(Usuario.id == producto.usuario_id).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado.")
        
    if usuario.plan == "lite":
        conteo_actual = db.query(Producto).filter(Producto.usuario_id == producto.usuario_id).count()
        if conteo_actual >= 50:
            raise HTTPException(
                status_code=400, 
                detail="Límite del plan Lite alcanzado (Máx 50 productos). Actualice su cuenta a nivel Pro."
            )

    producto_existente = db.query(Producto).filter(
        Producto.usuario_id == producto.usuario_id,
        Producto.nombre.ilike(producto.nombre)
    ).first()
    
    if producto_existente:
        raise HTTPException(status_code=400, detail=f"Ya tienes un producto llamado '{producto.nombre}' en tu catálogo.")
    
    nuevo_item = Producto(
        nombre=producto.nombre,
        stock=producto.stock,
        sector=producto.sector.lower(),
        usuario_id=producto.usuario_id
    )
    db.add(nuevo_item)
    db.commit()
    return {"status": "success", "mensaje": f"Producto '{nuevo_item.nombre}' añadido correctamente."}

@app.delete("/api/catalogo/item/{producto_id}")
def eliminar_producto_personalizado(producto_id: int, usuario_id: int, db: Session = Depends(get_db)):
    producto_db = db.query(Producto).filter(Producto.id == producto_id, Producto.usuario_id == usuario_id).first()
    if not producto_db:
        raise HTTPException(status_code=404, detail="Producto no encontrado o sin permisos.")
    nombre_borrado = producto_db.nombre
    db.delete(producto_db)
    db.commit()
    return {"status": "success", "mensaje": f"Producto '{nombre_borrado}' eliminado de tu catálogo."}

# --- MOTOR DE INFERENCIA DE VOZ ---
@app.post("/api/transcribir")
async def endpoint_transcribir(
    audio: UploadFile = File(...), 
    sector: str = Form("universal"), 
    usuario_id: int = Form(...), 
    usuario_nombre: str = Form("Operario Desconocido"), 
    db: Session = Depends(get_db)
):
    if not audio.filename:
        raise HTTPException(status_code=400, detail="Archivo invalido.")
    
    contenido_audio = await audio.read()
    if len(contenido_audio) < 5000:
        raise HTTPException(status_code=400, detail="Audio muy corto. Manten presionado.")
    
    try:
        texto_extraido = await asyncio.to_thread(servicios_ia.extraer_texto_de_audio, contenido_audio)
        
        productos_filtrados = db.query(Producto).filter(Producto.usuario_id == usuario_id).filter(
            (Producto.sector == sector.lower()) | (Producto.sector == "universal")
        ).all()
        
        nombres_catalogo = [p.nombre for p in productos_filtrados]
        coincidencia, porcentaje = servicios_ia.evaluar_coincidencia(texto_extraido, nombres_catalogo)
        
        if coincidencia:
            producto_db = db.query(Producto).filter(Producto.nombre == coincidencia, Producto.usuario_id == usuario_id).first()
            accion, cantidad, unidad = servicios_ia.interpretar_orden(texto_extraido)
            
            if accion == "suma":
                producto_db.stock += cantidad
                accion_str = f"Entrada registrada: +{cantidad} {unidad}(s)"
            elif accion == "resta":
                if producto_db.stock >= cantidad:
                    producto_db.stock -= cantidad
                    accion_str = f"Salida registrada: -{cantidad} {unidad}(s)"
                else:
                    raise HTTPException(status_code=400, detail=f"Stock insuficiente. Hay {producto_db.stock} y quieres sacar {cantidad}.")
            else:
                accion_str = "Consulta de stock (Sin cambios)"
                
            if accion != "leer":
                try:
                    nuevo_movimiento = Movimiento(
                        # CORREGIDO: Se remueve el string manual. El campo DateTime nativo usa func.now() automáticamente.
                        user=usuario_nombre, 
                        action=accion, 
                        product=producto_db.nombre,
                        quantity=cantidad, 
                        unit=unidad, 
                        method="Voz",
                        usuario_id=usuario_id 
                    )
                    db.add(nuevo_movimiento)
                    db.commit() 
                    db.refresh(producto_db)
                except Exception as db_error:
                    db.rollback()
                    raise HTTPException(status_code=500, detail=f"Error de integridad al guardar transaccion: {str(db_error)}")
            
            return {
                "transcripcion": texto_extraido,
                "mensaje": f"[EXITO] {producto_db.nombre}\n{accion_str}\nStock actual: {producto_db.stock} unidades\nPrecision: {porcentaje}%", 
                "estado": "completado", "accion": accion, "producto": producto_db.nombre, "cantidad": cantidad, "unidad": unidad
            }
        else:
            return {
                "transcripcion": texto_extraido, 
                "mensaje": f"[ERROR] Producto no identificado en tu inventario del sector '{sector.upper()}'.", 
                "estado": "error"
            }
            
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Fallo del motor: {str(e)}")