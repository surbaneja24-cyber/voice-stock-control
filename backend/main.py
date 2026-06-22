# ==============================================================================
# ARCHIVO: main.py
# PROPÓSITO: Controlador principal de FastAPI. 
# ==============================================================================

import asyncio
from fastapi import FastAPI, UploadFile, File, HTTPException, Depends, Form
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import datetime

from database import engine, Base, get_db, SessionLocal
from models import Producto, Movimiento 
import servicios_ia

Base.metadata.create_all(bind=engine)

app = FastAPI(title="VoxStock IA Motor")

# IMPORTANTE: En producción cambiar ["*"] por los dominios reales ["https://tudominio.com"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def inicializar_catalogo_seguro():
    """Inyecta el catálogo inicial SOLO si la tabla está completamente vacía."""
    db = SessionLocal()
    try:
        if db.query(Producto).count() == 0:
            productos_nuevos = [
                # --- ALIMENTACIÓN / SUPERMERCADO ---
                Producto(nombre="Leche entera", stock=250, sector="alimentacion"),
                Producto(nombre="Leche desnatada", stock=180, sector="alimentacion"),
                Producto(nombre="Huevos docena", stock=120, sector="alimentacion"),
                Producto(nombre="Pan de molde", stock=90, sector="alimentacion"),
                Producto(nombre="Arroz blanco 1kg", stock=200, sector="alimentacion"),
                Producto(nombre="Arroz integral 1kg", stock=80, sector="alimentacion"),
                Producto(nombre="Harina de trigo", stock=180, sector="alimentacion"),
                Producto(nombre="Azúcar blanco 1kg", stock=150, sector="alimentacion"),
                Producto(nombre="Aceite de oliva 1L", stock=90, sector="alimentacion"),
                Producto(nombre="Aceite de girasol 1L", stock=150, sector="alimentacion"),
                Producto(nombre="Pasta espaguetis", stock=140, sector="alimentacion"),
                Producto(nombre="Lentejas secas", stock=110, sector="alimentacion"),
                Producto(nombre="Garbanzos cocidos", stock=100, sector="alimentacion"),
                Producto(nombre="Atún en conserva", stock=200, sector="alimentacion"),

                # --- FERRETERÍA ---
                Producto(nombre="Tornillos galvanizados", stock=1000, sector="ferreteria"),
                Producto(nombre="Tornillos para madera", stock=700, sector="ferreteria"),
                Producto(nombre="Tuercas metálicas", stock=1200, sector="ferreteria"),
                Producto(nombre="Arandelas", stock=1500, sector="ferreteria"),
                Producto(nombre="Clavos de acero", stock=2000, sector="ferreteria"),
                Producto(nombre="Martillo de carpintero", stock=50, sector="ferreteria"),
                Producto(nombre="Destornillador plano", stock=80, sector="ferreteria"),
                Producto(nombre="Destornillador estrella", stock=90, sector="ferreteria"),
                Producto(nombre="Llave inglesa", stock=40, sector="ferreteria"),
                Producto(nombre="Alicates universales", stock=60, sector="ferreteria"),
                Producto(nombre="Taladro eléctrico", stock=20, sector="ferreteria"),
                Producto(nombre="Brocas para metal", stock=300, sector="ferreteria"),
                Producto(nombre="Pintura blanca 5L", stock=30, sector="ferreteria"),
                Producto(nombre="Pintura negra 5L", stock=25, sector="ferreteria"),

                # --- FARMACIA ---
                Producto(nombre="Paracetamol 500mg", stock=500, sector="farmacia"),
                Producto(nombre="Ibuprofeno 400mg", stock=450, sector="farmacia"),
                Producto(nombre="Alcohol antiséptico 1L", stock=120, sector="farmacia"),
                Producto(nombre="Agua oxigenada", stock=100, sector="farmacia"),
                Producto(nombre="Gasas estériles", stock=250, sector="farmacia"),
                Producto(nombre="Mascarillas quirúrgicas", stock=300, sector="farmacia"),
                Producto(nombre="Guantes de látex", stock=400, sector="farmacia"),
                Producto(nombre="Termómetro digital", stock=50, sector="farmacia"),

                # --- CONSTRUCCIÓN ---
                Producto(nombre="Sacos de cemento", stock=120, sector="construccion"),
                Producto(nombre="Sacos de yeso", stock=80, sector="construccion"),
                Producto(nombre="Ladrillos cerámicos", stock=5000, sector="construccion"),
                Producto(nombre="Bloques de hormigón", stock=700, sector="construccion"),
                Producto(nombre="Arena de construcción", stock=300, sector="construccion"),
                Producto(nombre="Grava", stock=250, sector="construccion"),
                Producto(nombre="Tubos de PVC", stock=180, sector="construccion"),
                Producto(nombre="Varillas de acero", stock=400, sector="construccion"),

                # --- TEXTIL ---
                Producto(nombre="Camisetas de algodón", stock=90, sector="textil"),
                Producto(nombre="Camisas de algodón", stock=60, sector="textil"),
                Producto(nombre="Pantalones vaqueros", stock=70, sector="textil"),
                Producto(nombre="Sudaderas", stock=50, sector="textil"),
                Producto(nombre="Chaquetas impermeables", stock=40, sector="textil"),
                Producto(nombre="Zapatos de cuero", stock=40, sector="textil"),
                Producto(nombre="Botas de seguridad", stock=35, sector="textil"),
                Producto(nombre="Tela de lona", stock=100, sector="textil"),

                # --- ELECTRÓNICA ---
                Producto(nombre="Cable HDMI", stock=100, sector="electronica"),
                Producto(nombre="Cable USB-C", stock=150, sector="electronica"),
                Producto(nombre="Cable Ethernet", stock=120, sector="electronica"),
                Producto(nombre="Ratón inalámbrico", stock=60, sector="electronica"),
                Producto(nombre="Teclado mecánico", stock=40, sector="electronica"),
                Producto(nombre="Monitor 24 pulgadas", stock=20, sector="electronica"),
                Producto(nombre="Disco SSD 1TB", stock=35, sector="electronica"),
                Producto(nombre="Memoria USB 64GB", stock=80, sector="electronica"),

                # --- OFICINA ---
                Producto(nombre="Paquetes de folios A4", stock=200, sector="oficina"),
                Producto(nombre="Bolígrafos azules", stock=500, sector="oficina"),
                Producto(nombre="Bolígrafos negros", stock=450, sector="oficina"),
                Producto(nombre="Lápices HB", stock=300, sector="oficina"),
                Producto(nombre="Carpetas archivadoras", stock=120, sector="oficina"),
                Producto(nombre="Grapadoras", stock=50, sector="oficina"),
                Producto(nombre="Grapas", stock=1000, sector="oficina"),
                Producto(nombre="Etiquetas adhesivas", stock=1000, sector="oficina"),

                # --- LOGÍSTICA ---
                Producto(nombre="Palets de madera", stock=80, sector="logistica"),
                Producto(nombre="Palet europeo", stock=60, sector="logistica"),
                Producto(nombre="Cajas de cartón pequeñas", stock=500, sector="logistica"),
                Producto(nombre="Cajas de cartón medianas", stock=350, sector="logistica"),
                Producto(nombre="Cajas de cartón grandes", stock=200, sector="logistica"),
                Producto(nombre="Film estirable", stock=90, sector="logistica"),
                Producto(nombre="Precinto de embalaje", stock=300, sector="logistica"),
                Producto(nombre="Contenedores apilables", stock=70, sector="logistica"),

                # --- AUTOMOCIÓN ---
                Producto(nombre="Aceite de motor 5W30", stock=120, sector="automocion"),
                Producto(nombre="Filtro de aceite", stock=90, sector="automocion"),
                Producto(nombre="Filtro de aire", stock=80, sector="automocion"),
                Producto(nombre="Líquido refrigerante", stock=100, sector="automocion"),
                Producto(nombre="Pastillas de freno", stock=60, sector="automocion"),
                Producto(nombre="Batería de coche", stock=25, sector="automocion"),
                Producto(nombre="Neumático 16 pulgadas", stock=40, sector="automocion"),

                # --- JARDINERÍA ---
                Producto(nombre="Semillas de césped", stock=150, sector="jardineria"),
                Producto(nombre="Abono universal", stock=100, sector="jardineria"),
                Producto(nombre="Macetas de plástico", stock=200, sector="jardineria"),
                Producto(nombre="Manguera de jardín", stock=50, sector="jardineria"),
                Producto(nombre="Regadera", stock=40, sector="jardineria"),
                Producto(nombre="Tijeras de poda", stock=35, sector="jardineria"),
                Producto(nombre="Pala de jardín", stock=45, sector="jardineria"),
                Producto(nombre="Rastrillo", stock=30, sector="jardineria"),
                
                # --- UNIVERSAL / COMODINES ---
                Producto(nombre="Materiales varios", stock=100, sector="universal"),
                Producto(nombre="Cosas generales", stock=100, sector="universal")
            ]
            db.add_all(productos_nuevos)
            db.commit()
            print("[INFO] Catalogo semilla inicializado correctamente.")
    except Exception as e:
        print(f"[ERROR] Error inicializando catalogo: {e}")
    finally:
        db.close()

inicializar_catalogo_seguro()

@app.get("/api/history")
def obtener_historial(db: Session = Depends(get_db)):
    return db.query(Movimiento).all()

@app.get("/api/catalogo")
def obtener_catalogo(sector: str = "universal", db: Session = Depends(get_db)):
    if sector != "universal":
        productos = db.query(Producto).filter(
            (Producto.sector == sector.lower()) | (Producto.sector == "universal")
        ).all()
    else:
        productos = db.query(Producto).all()
    return [{"nombre": p.nombre, "stock": p.stock, "sector": p.sector} for p in productos]

@app.post("/api/transcribir")
async def endpoint_transcribir(
    audio: UploadFile = File(...), 
    sector: str = Form("universal"), 
    db: Session = Depends(get_db)
):
    if not audio.filename:
        raise HTTPException(status_code=400, detail="Archivo invalido.")
    
    contenido_audio = await audio.read()
    if len(contenido_audio) < 5000:
        raise HTTPException(status_code=400, detail="Audio muy corto. Manten presionado.")
    
    try:
        # DELEGACIÓN A HILO SECUNDARIO: Evita congelar el servidor.
        texto_extraido = await asyncio.to_thread(servicios_ia.extraer_texto_de_audio, contenido_audio)
        
        productos_filtrados = db.query(Producto).filter(
            (Producto.sector == sector.lower()) | (Producto.sector == "universal")
        ).all()
        nombres_catalogo = [p.nombre for p in productos_filtrados]
        
        coincidencia, porcentaje = servicios_ia.evaluar_coincidencia(texto_extraido, nombres_catalogo)
        
        if coincidencia:
            producto_db = db.query(Producto).filter(Producto.nombre == coincidencia).first()
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
                        dateTime=datetime.now().strftime("%d/%m/%Y, %H:%M:%S"),
                        user="Operario 1", action=accion, product=producto_db.nombre,
                        quantity=cantidad, unit=unidad, method="Voz"
                    )
                    db.add(nuevo_movimiento)
                    db.commit() 
                    db.refresh(producto_db)
                except Exception as db_error:
                    db.rollback()
                    raise HTTPException(status_code=500, detail="Error de integridad al guardar la transaccion.")
            
            return {
                "transcripcion": texto_extraido,
                "mensaje": f"[EXITO] {producto_db.nombre}\n{accion_str}\nStock actual: {producto_db.stock} unidades\nPrecision: {porcentaje}%", 
                "estado": "completado", "accion": accion, "producto": producto_db.nombre, "cantidad": cantidad, "unidad": unidad
            }
        else:
            return {
                "transcripcion": texto_extraido, 
                "mensaje": f"[ERROR] Producto no identificado en el sector '{sector.upper()}'. Verifica el nombre del articulo.", 
                "estado": "error"
            }
            
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Fallo del motor: {str(e)}")