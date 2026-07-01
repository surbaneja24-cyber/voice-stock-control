from flask import Flask, request, jsonify
from flask_cors import CORS
from faster_whisper import WhisperModel
import os
import requests # Para la futura conexión con el servidor de Marc

app_voz = Flask(__name__)
CORS(app_voz)

print("Cargando el motor de IA...")
modelo = WhisperModel("tiny", device="cpu", compute_type="int8")
print("¡Motor de voz listo y esperando órdenes!")

@app_voz.route('/api/transcribir', methods=['POST'])
def procesar_audio():
    if 'audio' not in request.files:
        return jsonify({"error": "No se recibió ningún archivo"}), 400
    
    archivo_recibido = request.files['audio']
    
    # Lo guardamos como .ogg que es mucho más estable para estos casos
    ruta_temporal = "temp_audio_operario.ogg"
    archivo_recibido.save(ruta_temporal)
    
    try:
        # BLINDAJE: Revisamos cuánto pesa el archivo
        tamaño = os.path.getsize(ruta_temporal)
        print(f"\n Tamaño del audio recibido: {tamaño} bytes")
        
        # Si el audio pesa menos de 5KB, significa que fue un clic demasiado rápido
        if tamaño < 5000:
            os.remove(ruta_temporal)
            return jsonify({"error": "Audio muy corto o vacío. Mantén presionado más tiempo."}), 400

        # Si todo está bien, transcribimos
        segmentos, _ = modelo.transcribe(ruta_temporal, beam_size=5, language="es")
        texto_extraido = " ".join([segmento.text for segmento in segmentos]).strip()
        
        os.remove(ruta_temporal)
        
        print(f" Orden detectada: {texto_extraido}")
        return jsonify({
            "texto": texto_extraido,
            "estado": "pendiente"
        }), 200
        
    except Exception as e:
        if os.path.exists(ruta_temporal):
            os.remove(ruta_temporal)
        return jsonify({"error": f"Error del motor: {str(e)}"}), 500

if __name__ == '__main__':
    app_voz.run(port=5001, debug=True)