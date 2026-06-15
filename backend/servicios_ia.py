# ==============================================================================
# ARCHIVO: servicios_ia.py
# PROPÓSITO: Encapsular la IA (Whisper) y la lógica de búsqueda (thefuzz).
# ==============================================================================

import io
from faster_whisper import WhisperModel
from thefuzz import process, fuzz
import re

print("Cargando el motor de IA en RAM...")
modelo = WhisperModel("tiny", device="cpu", compute_type="int8")
print("¡Motor de IA asíncrono listo!")

def extraer_texto_de_audio(contenido_audio_bytes: bytes) -> str:
    """Procesa el audio en Memoria RAM y devuelve texto."""
    flujo_ram = io.BytesIO(contenido_audio_bytes)
    segmentos, _ = modelo.transcribe(flujo_ram, beam_size=5, language="es")
    texto = " ".join([segmento.text for segmento in segmentos]).strip()
    return texto

def evaluar_coincidencia(texto_operario: str, nombres_catalogo: list, umbral: int = 75):
    """
    Cruza lo que escuchó la IA con la Base de Datos real.
    Umbral ajustado al 75% para evitar falsos positivos con ruido o saludos.
    Utiliza token_set_ratio para ignorar palabras de relleno (ej: "sácame unas...").
    """
    if not nombres_catalogo:
        return None, 0
        
    # Usamos un comparador más inteligente que ignora el desorden de palabras
    mejor_coincidencia, porcentaje = process.extractOne(
        texto_operario, 
        nombres_catalogo, 
        scorer=fuzz.token_set_ratio
    )
    
    if porcentaje >= umbral:
        return mejor_coincidencia, porcentaje
    return None, porcentaje

def interpretar_orden(texto: str):
    """
    Analiza el texto para extraer si es una entrada o salida, y la cantidad.
    Devuelve una tupla: (accion, cantidad)
    """
    texto_lower = texto.lower()
    
    # 1. Por defecto, asumimos que solo quiere consultar el stock (leer) y la cantidad es 0
    accion = "leer"
    cantidad = 0
    
    # 2. Diccionario de palabras clave de movimiento
    palabras_suma = ["añade", "agrega", "entra", "suma", "mete", "llegaron", "devuelven"]
    palabras_resta = ["saca", "quita", "resta", "sale", "usa", "llevan", "menos"]
    
    # 3. Detectar la intención
    if any(p in texto_lower for p in palabras_suma):
        accion = "suma"
    elif any(p in texto_lower for p in palabras_resta):
        accion = "resta"
        
    # 4. Detectar la cantidad (Whisper suele devolver dígitos, pero a veces escribe números bajos en texto)
    numeros_texto = {
        "un": 1, "uno": 1, "una": 1, "par": 2, "dos": 2, "tres": 3, 
        "cuatro": 4, "cinco": 5, "seis": 6, "siete": 7, "ocho": 8, 
        "nueve": 9, "diez": 10, "docena": 12
    }
    
    # Buscar dígitos matemáticos (ej: "5", "120")
    match_num = re.search(r'\d+', texto_lower)
    if match_num:
        cantidad = int(match_num.group())
    else:
        # Si no hay dígitos, buscar si dijo "un", "dos", "cinco"...
        palabras_texto = texto_lower.split()
        for palabra in palabras_texto:
            if palabra in numeros_texto:
                cantidad = numeros_texto[palabra]
                break
                
    # Si detectó una acción pero no entendió la cantidad, por seguridad forzamos a 1
    if accion != "leer" and cantidad == 0:
        cantidad = 1
        
    return accion, cantidad