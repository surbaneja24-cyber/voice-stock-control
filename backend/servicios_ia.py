import io
import re
from faster_whisper import WhisperModel
from thefuzz import process, fuzz

print("[INFO] Cargando el motor de IA en RAM...")
modelo = WhisperModel("tiny", device="cpu", compute_type="int8")
print("[INFO] Motor de IA listo")

def extraer_texto_de_audio(contenido_audio_bytes: bytes) -> str:
    flujo_ram = io.BytesIO(contenido_audio_bytes)
    segmentos, _ = modelo.transcribe(flujo_ram, beam_size=5, language="es")
    texto = " ".join([segmento.text for segmento in segmentos]).strip()
    return texto

def evaluar_coincidencia(texto_operario: str, nombres_catalogo: list, umbral: int = 65):
    if not nombres_catalogo:
        return None, 0
        
    texto_limpio = texto_operario.lower()
    
    basura_regex = [
        r"\b(un|uno|una|par|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez|once|doce|docena|trece|catorce|quince|veinte|treinta|cuarenta|cincuenta|cien)\b", 
        r"\b(añad|agreg|entr|sum|met|lleg|dev|recib|pon|guard|ingres|compr|tra)\w*", 
        r"\b(sac|quit|rest|sal|usa|usó|llev|men|gast|vend|retir|despach|mand|envi|rot|tir|perd)\w*", 
        r"\b(el|la|los|las|unos|unas|de|con|para|por|favor|oye|necesito|quiero|porque|acaban|sistema|mercancia|generar|movimiento)\b",
        r"\b(pallet|pallets|palet|palets|palé|palés|pales|caja|cajas|unidad|unidades|bulto|bultos|suelto|sueltas|botella|botellas)\b"
    ]
    
    for patron in basura_regex:
        texto_limpio = re.sub(patron, " ", texto_limpio)
        
    texto_limpio = re.sub(r'\s+', ' ', texto_limpio).strip()
    
    if not texto_limpio:
        return None, 0
        
    mejor_coincidencia, porcentaje = process.extractOne(
        texto_limpio, 
        nombres_catalogo, 
        scorer=fuzz.token_set_ratio
    )
    
    print(f"[IA NLP] Audio: '{texto_operario}' -> Filtro: '{texto_limpio}' -> Match: '{mejor_coincidencia}' ({porcentaje}%)")
    
    if porcentaje >= umbral:
        return mejor_coincidencia, porcentaje
    return None, porcentaje

def interpretar_orden(texto: str):
    texto_lower = texto.lower()
    accion = "leer"
    cantidad = 0
    unidad = "unidad"
    
    raices_suma = [
        r"\bañad", r"\bagreg", r"\bentr", r"\bsum", r"\bmet", 
        r"\blleg", r"\bdev", r"\brecib", r"\bpon", r"\bguard", 
        r"\bingres", r"\bcompr", r"\btra"
    ]
    
    raices_resta = [
        r"\bsac", r"\bquit", r"\brest", r"\bsal", r"\busa", r"\busó",
        r"\bllev", r"\bmen", r"\bgast", r"\bvend", r"\bretir", 
        r"\bdespach", r"\bmand", r"\benvi", r"\brot", r"\btir", r"\bperd"
    ]

    # --- INICIO DE LÓGICA DE UNIDAD CORREGIDA ---
    palabras_pallet = ["pallet", "pallets", "palet", "palets", "palé", "palés", "pales"]
    palabras_caja = ["caja", "cajas"]
    palabras_unidad = ["unidad", "unidades", "suelto", "sueltas", "bulto", "bultos", "botella", "botellas"]

    if any(p in texto_lower for p in palabras_pallet):
        unidad = "pallet"
    elif any(p in texto_lower for p in palabras_caja):
        unidad = "caja"
    elif any(p in texto_lower for p in palabras_unidad):
        unidad = "unidad"
    # --- FIN DE LÓGICA DE UNIDAD CORREGIDA ---

    pos_suma = -1
    pos_resta = -1

    for patron in raices_suma:
        match = re.search(patron, texto_lower)
        if match:
            pos = match.start()
            if pos_suma == -1 or pos < pos_suma:
                pos_suma = pos

    for patron in raices_resta:
        match = re.search(patron, texto_lower)
        if match:
            pos = match.start()
            if pos_resta == -1 or pos < pos_resta:
                pos_resta = pos

    if pos_suma != -1 and pos_resta != -1:
        accion = "suma" if pos_suma < pos_resta else "resta"
    elif pos_suma != -1:
        accion = "suma"
    elif pos_resta != -1:
        accion = "resta"

    numeros_texto = {
        "un": 1, "uno": 1, "una": 1, "par": 2, "dos": 2, "tres": 3, 
        "cuatro": 4, "cinco": 5, "seis": 6, "siete": 7, "ocho": 8, 
        "nueve": 9, "diez": 10, "once": 11, "doce": 12, "docena": 12,
        "trece": 13, "catorce": 14, "quince": 15, "veinte": 20, 
        "treinta": 30, "cuarenta": 40, "cincuenta": 50, "cien": 100
    }
    
    match_num = re.search(r'\d+', texto_lower)
    if match_num:
        cantidad = int(match_num.group())
    else:
        palabras_limpias = re.sub(r'[^\w\s]', '', texto_lower).split()
        for palabra in palabras_limpias:
            if palabra in numeros_texto:
                cantidad = numeros_texto[palabra]
                break
                
    if accion != "leer" and cantidad == 0:
        cantidad = 1
        
    return accion, cantidad, unidad