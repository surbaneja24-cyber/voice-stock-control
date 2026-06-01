<div align="center">

  <h1>🎙️ VoxStock WMS</h1>
  <p><strong>Sistema SaaS de Gestión de Inventario dirigido por Inteligencia Artificial de Voz</strong></p>

  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" />
  <img src="https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white" />
  <img src="https://img.shields.io/badge/SQLite-07405E?style=for-the-badge&logo=sqlite&logoColor=white" />
  <img src="https://img.shields.io/badge/AI-faster--whisper-FF6F00?style=for-the-badge" />

  <br />
</div>

---

## 📦 Sobre el Proyecto

**VoxStock** es una solución de software diseñada para modernizar el control de almacenes y sectores industriales (química, curtidos, logística). Elimina la fricción de los sistemas tradicionales al permitir a los operarios actualizar el stock, registrar entradas y salidas, y consultar ubicaciones **100% manos libres** mediante comandos de voz naturales.

A diferencia de los costosos sistemas corporativos, este proyecto es ligero, funciona en redes locales (Offline-First) y utiliza procesamiento de lenguaje natural para entender el contexto, tolerando ruido de fondo y variaciones en la dicción.

## ✨ Características Principales

- **🗣️ Picking por Voz Natural:** Transcripción de audio a texto en tiempo real usando el modelo de IA `faster-whisper` ejecutado en local.
- **🧠 Filtro de Similitud (Fuzzy Matching):** Uso de la librería `thefuzz` para asociar comandos de voz imperfectos con el catálogo real de productos, reduciendo los errores de lectura a cero.
- **⚡ Interfaz Reactiva:** Panel de control moderno y rápido construido con React y Vite.
- **🔒 Operativa Offline:** Base de datos SQLite integrada, garantizando que el almacén siga funcionando incluso sin conexión a internet externa.
- **📱 Multi-dispositivo:** Accesible desde cualquier ordenador, tablet o terminal móvil con navegador y micrófono.

---

## 🏗️ Arquitectura y Tecnologías

El proyecto sigue una arquitectura Full-Stack desacoplada:

* **Frontend:** React.js, Vite, HTML/CSS (Gestión de UI y captura nativa de audio mediante `MediaRecorder`).
* **Backend:** Python (FastAPI/Flask) para orquestar la lógica del servidor y procesar los binarios de audio.
* **Motor de IA:** `faster-whisper` (Speech-to-Text).
* **Base de Datos:** SQLite / SQL Estándar (Almacenamiento persistente local).

---

## 🚀 Instalación y Despliegue Local

Sigue estos pasos para levantar el entorno de desarrollo en tu máquina.

### Requisitos Previos
- Node.js y npm instalados.
- Python 3.10+ instalado.
- Git.

### 1. Clonar el repositorio
```bash
git clone [https://github.com/tu-usuario/voxstock.git](https://github.com/tu-usuario/voxstock.git)
cd voxstock
```
2. Levantar el Backend (Python)

```bash
cd backend
# Crear entorno virtual (Recomendado)
python -m venv venv
source venv/Scripts/activate  # En Windows
# Instalar dependencias
pip install -r requirements.txt
# Iniciar servidor
python app.py
```

### 3. Levantar el Frontend (React)
Abre otra terminal en la raíz del proyecto:

```bash
cd frontend
npm install
npm run dev
```

El panel de control estará disponible en http://localhost:5173.

👥 Equipo de Desarrollo
Este sistema ha sido diseñado y construido por:
