from faster_whisper import WhisperModel
import time
import os
import datetime

# --- 1. SIMULACIÓN DE BASE DE DATOS (El puente temporal) ---
# Esta lista guardará el historial de todas las órdenes que reciba el sistema.
# Cuando tu compañero de BD termine, reemplazará esta lista por comandos SQL.
historial_pedidos = []

def guardar_en_historial(texto_orden):
    """Toma el texto de la IA, le añade la hora actual y lo guarda."""
    hora_actual = datetime.datetime.now().strftime("%H:%M:%S")
    
    # Creamos un "diccionario" (equivalente a una fila en SQL o un JSON)
    nuevo_registro = {
        "id_operario": 1, 
        "hora": hora_actual,
        "comando_voz": texto_orden,
        "estado": "PENDIENTE_DE_PROCESAR"
    }
    
    historial_pedidos.append(nuevo_registro)
    return nuevo_registro

# --- 2. CONFIGURACIÓN DEL MOTOR DE IA ---
print("Cargando el motor de IA...")
modelo = WhisperModel("base", device="cpu", compute_type="int8")

carpeta_audios = "audios_prueba"
nombre_archivo = "marcat2.ogg" # Recuerda poner el nombre de tu archivo
ruta_completa = os.path.join(carpeta_audios, nombre_archivo)

if not os.path.exists(ruta_completa):
    print(f"\n❌ Error: No se encontró el archivo '{nombre_archivo}'.")
    exit()

print(f"\nEscuchando el audio: {ruta_completa}...")

# --- 3. TRANSCRIPCIÓN ---
segmentos, _ = modelo.transcribe(ruta_completa, beam_size=5, language="ca")

# --- 4. INTEGRACIÓN Y GUARDADO ---
# En lugar de solo imprimirlo, ahora unimos todas las frases en un solo String de texto
texto_completo = ""
for segmento in segmentos:
    texto_completo += segmento.text + " "

texto_completo = texto_completo.strip() # Limpiamos espacios extra al final

# Mandamos el String a nuestra "base de datos"
registro_guardado = guardar_en_historial(texto_completo)

# --- 5. MOSTRAR RESULTADOS FINALES ---
print("\n=== HISTORIAL DEL SISTEMA ACTUALIZADO ===")
print(f"Registro nº {len(historial_pedidos)}")
print(f"Hora: {registro_guardado['hora']}")
print(f"Orden: {registro_guardado['comando_voz']}")
print(f"Estado: {registro_guardado['estado']}")
print("=========================================\n")