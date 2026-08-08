import os
import html
from datetime import datetime, timedelta
from typing import Literal
from pydantic import BaseModel, Field, EmailStr, field_validator
from fastapi import FastAPI, HTTPException, Depends, status, Request, Response
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func
from sqlalchemy.exc import IntegrityError
from passlib.context import CryptContext
from jose import JWTError, jwt
import re
from thefuzz import process
from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
import resend

from database import engine, Base, get_db
from models import Producto, Movimiento, Usuario, LeadPiloto

# Inicialización de DB
Base.metadata.create_all(bind=engine)

app = FastAPI(title="MyStock IA Motor - Secure Edition")

# --- RATE LIMITING (fuerza bruta en login/registro) ---
def obtener_ip_cliente(request: Request) -> str:
    # El frontend en Vercel actúa de proxy hacia este backend (ver vercel.json),
    # así que la conexión TCP real siempre llega desde la IP de Vercel, no la
    # del usuario. Sin esto, el límite se compartiría entre TODOS los usuarios
    # de la app en vez de aplicarse por persona.
    #
    # Tomamos el ÚLTIMO valor de X-Forwarded-For, no el primero: los proxies
    # AÑADEN al final de la cadena la IP que ellos observaron, así que el
    # último valor es el que puso Vercel (el único hop en el que confiamos),
    # no lo que un atacante haya podido escribir en la cabecera antes de que
    # nos llegue. Con esto, alguien que llame directo al backend (sin pasar
    # por Vercel) ya no puede rotar un X-Forwarded-For propio para saltarse
    # el límite simplemente añadiendo un valor cualquiera delante.
    #
    # LIMITACIÓN CONOCIDA (residual, aceptada para el tamaño actual del
    # proyecto): esto asume que Vercel efectivamente añade/establece su propio
    # valor como último elemento de la cadena, cosa que no se ha podido
    # verificar contra la infraestructura real desplegada. Y sigue sin cerrar
    # del todo el caso de llamar directo a la URL pública de Render: ahí no
    # hay ningún proxy de confianza en absoluto, así que cualquier valor que
    # el propio atacante escriba en X-Forwarded-For pasaría como "el último".
    # Cerrar esto de verdad requeriría bloquear el acceso directo a Render o
    # validar un secreto compartido entre Vercel y el backend.
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[-1].strip()
    return get_remote_address(request)

limiter = Limiter(key_func=obtener_ip_cliente)
app.state.limiter = limiter

@app.exception_handler(RateLimitExceeded)
async def manejador_limite_excedido(request: Request, exc: RateLimitExceeded):
    # slowapi devuelve por defecto {"error": "..."} en vez de {"detail": "..."},
    # inconsistente con el resto de la API (400/422/413 usan "detail"), lo que
    # hacía que el frontend no supiera leer el motivo real del 429 y mostrara
    # un mensaje genérico o incluso "Credenciales inválidas" en el login.
    return JSONResponse(
        status_code=429,
        content={"detail": "Demasiados intentos. Espera un minuto e inténtalo de nuevo."},
    )

# --- CONFIGURACIÓN DE SEGURIDAD Y JWT ---
SECRET_KEY = os.getenv("SECRET_KEY")
if not SECRET_KEY:
    raise RuntimeError(
        "No se encontró SECRET_KEY. Defínela en tu entorno (Render/Vercel) o en backend/.env. "
        "Nunca la hardcodees: cualquiera con acceso al repo podría forjar tokens válidos."
    )
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7

# --- EMAIL TRANSACCIONAL (confirmación de solicitud al programa piloto) ---
RESEND_API_KEY = os.getenv("RESEND_API_KEY")
if RESEND_API_KEY:
    resend.api_key = RESEND_API_KEY

def _plantilla_email_confirmacion_piloto(nombre: str) -> str:
    # html.escape evita inyección de HTML/markup: "nombre" lo escribe el
    # usuario en el formulario público y se interpola directo en el email.
    nombre_seguro = html.escape(nombre)
    anio = datetime.utcnow().year
    return f"""\
<div style="font-family: -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #1e293b;">
  <div style="background-color: #2563eb; padding: 24px 32px; border-radius: 12px 12px 0 0;">
    <span style="color: #ffffff; font-size: 20px; font-weight: 800; letter-spacing: 0.5px;">MY<span style="color: #bfdbfe;">STOCK</span></span>
  </div>
  <div style="background-color: #ffffff; border: 1px solid #e2e8f0; border-top: none; padding: 32px; border-radius: 0 0 12px 12px;">
    <h1 style="font-size: 18px; margin: 0 0 16px;">Hola {nombre_seguro},</h1>
    <p style="font-size: 14px; line-height: 1.6; color: #334155; margin: 0 0 16px;">
      Hemos recibido tu solicitud para unirte al <strong>programa piloto de MyStock</strong>.
      Nuestro equipo la revisará y se pondrá en contacto contigo en los próximos días
      hábiles a través de este mismo correo.
    </p>
    <p style="font-size: 14px; line-height: 1.6; color: #334155; margin: 0 0 24px;">
      Mientras tanto, si tienes cualquier pregunta puedes responder directamente a
      este correo.
    </p>
    <p style="font-size: 14px; line-height: 1.6; color: #334155; margin: 0;">
      — El equipo de MyStock
    </p>
  </div>
  <div style="padding: 20px 8px; text-align: center;">
    <p style="font-size: 11px; color: #94a3b8; line-height: 1.6; margin: 0;">
      © {anio} MyStock. Todos los derechos reservados.<br>
      Recibes este correo porque solicitaste información sobre el programa piloto
      de MyStock a través de nuestro sitio web.
    </p>
  </div>
</div>"""

def enviar_email_confirmacion_piloto(destinatario: str, nombre: str) -> None:
    if not RESEND_API_KEY:
        # No es un error fatal: el lead ya quedó guardado en la base de datos,
        # el correo es un plus. Sin la key configurada, simplemente se omite
        # (útil en desarrollo local, donde no hace falta tener Resend a mano).
        print("[AVISO] RESEND_API_KEY no configurada, se omite el email de confirmación.")
        return
    try:
        resend.Emails.send({
            "from": "Equipo de MyStock <onboarding@resend.dev>",
            "to": [destinatario],
            "subject": "Hemos recibido tu solicitud para el piloto de MyStock",
            "html": _plantilla_email_confirmacion_piloto(nombre),
        })
    except Exception as e:
        # Un fallo al enviar el correo no debe tumbar el registro del lead: los
        # datos ya están guardados, el email es un aviso adicional, no un
        # requisito para que el registro cuente como éxito.
        print(f"[ERROR EMAIL CONFIRMACIÓN PILOTO]: {str(e)}")

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

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

# --- LÍMITE DE TAMAÑO DE PAYLOAD (evita DoS de memoria con bodies enormes) ---
MAX_BODY_SIZE_BYTES = 1 * 1024 * 1024  # 1 MB, de sobra para JSON de texto/comandos de voz

@app.middleware("http")
async def limitar_tamano_body(request: Request, call_next):
    # Comprobar solo la cabecera Content-Length no basta: con
    # Transfer-Encoding: chunked el cliente no manda esa cabecera y el body
    # pasaría sin límite. Leemos el stream real byte a byte y cortamos en
    # cuanto se supera el límite, sin depender de lo que el cliente declare.
    cuerpo = bytearray()
    async for chunk in request.stream():
        cuerpo.extend(chunk)
        if len(cuerpo) > MAX_BODY_SIZE_BYTES:
            return JSONResponse(status_code=413, content={"detail": "Cuerpo de la petición demasiado grande."})
    # Starlette cachea el body en request._body; si no lo dejamos ya puesto,
    # el endpoint no podría releerlo porque el stream ya quedó consumido aquí.
    request._body = bytes(cuerpo)
    return await call_next(request)

# --- CABECERAS DE SEGURIDAD HTTP ---
RUTAS_SIN_CSP_ESTRICTA = {"/docs", "/redoc", "/openapi.json", "/docs/oauth2-redirect"}

@app.middleware("http")
async def anadir_cabeceras_seguridad(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "geolocation=(), camera=(), microphone=(self)"
    response.headers["Strict-Transport-Security"] = "max-age=63072000; includeSubDomains"
    # Swagger UI (/docs) carga su JS/CSS desde cdn.jsdelivr.net y usa scripts
    # inline: con "default-src 'none'" quedaría en blanco. Esta API no sirve
    # HTML propio salvo esas rutas de documentación, así que ahí relajamos el
    # CSP lo justo para que Swagger funcione; el resto de la API mantiene la
    # política estricta (no sirve HTML, no hay nada que ejecutar de todas formas).
    if request.url.path in RUTAS_SIN_CSP_ESTRICTA:
        response.headers["Content-Security-Policy"] = (
            "default-src 'self'; "
            "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; "
            "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; "
            "img-src 'self' data: https://cdn.jsdelivr.net; "
            "connect-src 'self'; "
            "frame-ancestors 'none'"
        )
    else:
        response.headers["Content-Security-Policy"] = "default-src 'none'; frame-ancestors 'none'"
    return response

# --- VALIDACIONES PYDANTIC ---
class UsuarioRegistro(BaseModel):
    nombre: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=72)

    @field_validator("password")
    @classmethod
    def password_no_supera_limite_bcrypt(cls, v: str) -> str:
        # bcrypt trunca en silencio a 72 BYTES, no caracteres: con acentos/emoji
        # una contraseña de "72 caracteres" puede pesar más y perder entropía sin avisar.
        if len(v.encode("utf-8")) > 72:
            raise ValueError("La contraseña no puede exceder los 72 bytes (los acentos/emoji cuentan más de 1 byte).")
        return v

class UsuarioLogin(BaseModel):
    email: EmailStr
    password: str = Field(..., max_length=72)

class NuevoProducto(BaseModel):
    nombre: str = Field(..., min_length=1, max_length=150)
    stock: int = 0
    sector: str = Field(..., min_length=1, max_length=50)

class LeadCreate(BaseModel):
    nombre: str = Field(..., min_length=2, max_length=100)
    empresa: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    volumen: Literal["0-50", "51-200", "201-500", "500+"]
    # Honeypot anti-spam: campo invisible para humanos en el formulario real.
    # Los bots que rellenan todos los campos automáticamente lo completan;
    # cualquier valor no vacío aquí descarta la petición como spam.
    sitio_web: str = Field(default="", max_length=200)

class ComandoPayload(BaseModel):
    comando: str = Field(..., max_length=200)
    sector: str = Field(..., min_length=1, max_length=50)

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
@limiter.limit("5/minute")
def registrar_usuario(request: Request, user: UsuarioRegistro, db: Session = Depends(get_db)):
    db_user = db.query(Usuario).filter(Usuario.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="No se pudo completar el registro con estos datos. Si ya tienes cuenta, inicia sesión.")
    
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
@limiter.limit("10/minute")
def login_usuario(request: Request, user: UsuarioLogin, response: Response, db: Session = Depends(get_db)):
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
        secure=True,
        # Lax en vez de None: el frontend llama a /api/* en su propio origen
        # (proxy de Vercel hacia este backend), por lo que ya no es cross-site.
        # Con samesite=None, Safari (ITP) y varios WebViews de Android bloquean
        # o purgan la cookie por considerarla de terceros.
        samesite="lax",
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
        samesite="lax",
        httponly=True
    )
    return {"status": "success", "mensaje": "Sesión finalizada"}

@app.post("/api/leads")
@limiter.limit("5/minute")
def registrar_lead_piloto(request: Request, lead: LeadCreate, db: Session = Depends(get_db)):
    if lead.sitio_web:
        # Honeypot activado: casi seguro es un bot. Cualquier contenido cuenta,
        # incluidos espacios en blanco — el campo es invisible e inalcanzable
        # para un humano, así que no hay caso legítimo de "espacios accidentales"
        # que tolerar. (Antes se usaba .strip(), que reducía "   " a "" y dejaba
        # pasar exactamente el relleno más simple que probaría un bot.)
        return {"status": "success", "mensaje": "Solicitud procesada correctamente."}

    existe_lead = db.query(LeadPiloto).filter(LeadPiloto.email == lead.email).first()
    if existe_lead:
        raise HTTPException(status_code=400, detail="Este correo ya se encuentra inscrito.")

    nuevo_lead = LeadPiloto(**lead.dict(exclude={"sitio_web"}))
    try:
        db.add(nuevo_lead)
        db.commit()
    except IntegrityError:
        # Dos solicitudes casi simultáneas con el mismo email pueden pasar
        # ambas el chequeo de arriba (TOCTOU); el UNIQUE de la columna email
        # frena la segunda aquí. La convertimos en el mismo 400 amigable en
        # vez de dejar que caiga en el 500 genérico de abajo.
        db.rollback()
        raise HTTPException(status_code=400, detail="Este correo ya se encuentra inscrito.")
    except Exception:
        db.rollback()
        raise HTTPException(status_code=500, detail="Error interno al guardar prospecto.")

    enviar_email_confirmacion_piloto(lead.email, lead.nombre)

    return {"status": "success", "mensaje": "Solicitud procesada correctamente."}

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

    # Comparación exacta insensible a mayúsculas, NO un patrón LIKE: con .ilike()
    # un nombre que contuviera "%" o "_" se interpretaba como comodín SQL y
    # daba falsos positivos de "producto duplicado" contra cualquier producto.
    producto_existente = db.query(Producto).filter(
        Producto.usuario_id == current_user.id,
        func.lower(Producto.nombre) == producto.nombre.lower()
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
        # Bloqueamos la fila (SELECT ... FOR UPDATE) justo antes de leer/modificar
        # el stock: sin esto, dos comandos de voz concurrentes sobre el mismo
        # producto pueden leer el mismo valor antes de que el otro confirme su
        # cambio, y uno de los dos incrementos/decrementos se pierde ("lost update").
        # populate_existing() es imprescindible: producto_objetivo ya estaba en el
        # identity map de la sesión (viene del .all() de más arriba), así que sin
        # esto SQLAlchemy devolvía el objeto Python cacheado con el stock viejo en
        # vez de refrescar sus atributos con la fila recién bloqueada — el lock se
        # adquiría bien a nivel de base de datos, pero se seguía leyendo un valor
        # obsoleto en Python.
        producto_objetivo = (
            db.query(Producto)
            .filter(Producto.id == producto_objetivo.id)
            .populate_existing()
            .with_for_update()
            .one()
        )

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