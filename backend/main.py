# ==============================================================================
# ARCHIVO: main.py
# PROPÓSITO: Controlador principal de FastAPI. Recibe peticiones y dirige el tráfico.
# ==============================================================================

from fastapi import FastAPI, UploadFile, File, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from database import engine, Base, get_db, SessionLocal
from models import Producto
import servicios_ia

# 1. Crear tablas si no existen
Base.metadata.create_all(bind=engine)

# 2. Inyectar datos de prueba si la tabla está vacía
def inicializar_catalogo_semilla():
    db = SessionLocal()
    if db.query(Producto).count() == 0:
        productos_iniciales = [
            Producto(nombre="Cajas de cartón", stock=500),
            Producto(nombre="Guantes de seguridad talla M", stock=120),
            Producto(nombre="Ácido sulfúrico 50L", stock=15),
            Producto(nombre="Botas de trabajo reforzadas", stock=40),
            Producto(nombre="Mascarillas con filtro", stock=200)
        ]
        db.add_all(productos_iniciales)
        db.commit()
    db.close()

inicializar_catalogo_semilla()

# 3. Configuración del Servidor
app = FastAPI(title="VoxStock IA Motor")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 4. Endpoints
@app.post("/api/transcribir")
async def endpoint_transcribir(audio: UploadFile = File(...), db: Session = Depends(get_db)):
    if not audio.filename:
        raise HTTPException(status_code=400, detail="Archivo inválido.")
    
    contenido_audio = await audio.read()
    
    if len(contenido_audio) < 5000:
        raise HTTPException(status_code=400, detail="Audio muy corto. Mantén presionado.")
    
    try:
        # Aislamiento: El main no sabe cómo funciona Whisper, solo le pasa los bytes
        texto_extraido = servicios_ia.extraer_texto_de_audio(contenido_audio)
        print(f"🎤 Operario dictó: '{texto_extraido}'")
        
        # Obtenemos los productos reales de SQLite
        productos_registrados = db.query(Producto).all()
        nombres_catalogo = [p.nombre for p in productos_registrados]
        
        # Cruzamos datos
        coincidencia, porcentaje = servicios_ia.evaluar_coincidencia(texto_extraido, nombres_catalogo)
        
        if coincidencia:
            # Encontramos el producto exacto
            producto_db = db.query(Producto).filter(Producto.nombre == coincidencia).first()
            
            # Extraemos la intención matemática (Suma, Resta o Leer) y la cantidad
            accion, cantidad = servicios_ia.interpretar_orden(texto_extraido)
            
            # Ejecutamos la transacción en la Base de Datos
            if accion == "suma":
                producto_db.stock += cantidad
                accion_str = f"📥 Entrada registrada: +{cantidad}"
            elif accion == "resta":
                if producto_db.stock >= cantidad:
                    producto_db.stock -= cantidad
                    accion_str = f"📤 Salida registrada: -{cantidad}"
                else:
                    # Si intenta sacar más de lo que hay, bloqueamos la operación
                    raise HTTPException(status_code=400, detail=f"Stock insuficiente. Hay {producto_db.stock} y quieres sacar {cantidad}.")
            else:
                accion_str = "👁️ Consulta de stock (Sin cambios)"
                
            # Guardamos los cambios físicos en SQLite solo si hubo movimiento
            if accion != "leer":
                db.commit()
                db.refresh(producto_db)
            
            # Formateamos la respuesta para el Frontend
            mensaje = (
                f"Entendido: '{texto_extraido}'\n\n"
                f"✅ {producto_db.nombre}\n"
                f"{accion_str}\n"
                f"📦 Stock actual: {producto_db.stock} unidades\n"
                f"🎯 Precisión: {porcentaje}%"
            )
        else:
            mensaje = f"Entendido: '{texto_extraido}'. \n\n❌ No se encontró coincidencia en stock."
            
        return {"texto": mensaje, "estado": "completado"}
        
    except HTTPException as e:
        # Capturamos el error de stock insuficiente y se lo mandamos al frontend
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Fallo del motor: {str(e)}")