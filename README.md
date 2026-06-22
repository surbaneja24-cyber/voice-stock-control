<div align="center">

  <h1>🎙️ VoxStock WMS</h1>
  <p><strong>Sistema SaaS de Gestión de Inventario dirigido por Inteligencia Artificial de Voz</strong></p>

  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" />
  <img src="https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white" />
  <img src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white" />
  <img src="https://img.shields.io/badge/SQLite-07405E?style=for-the-badge&logo=sqlite&logoColor=white" />
  <img src="https://img.shields.io/badge/AI-faster--whisper-FF6F00?style=for-the-badge" />

  <br />
</div>

---

## 📦 Sobre el Proyecto

**VoxStock** es una solución de software B2B diseñada para modernizar el control de almacenes. Elimina la fricción de los sistemas tradicionales permitiendo a los operarios gestionar stock, registrar entradas/salidas y consultar el inventario **100% manos libres** mediante comandos de voz naturales.



## ✨ Características Principales

- **🗣️ Picking por Voz Natural:** Procesamiento de audio en tiempo real mediante `faster-whisper` ejecutado en local.
- **🧠 Motor de Inferencia:** Análisis de lenguaje natural para categorizar acciones (suma/resta) y extraer cantidades y unidades automaticamente.
- **🎯 Precisión Logística:** Uso de algoritmos de *Fuzzy Matching* para asociar dictados imperfectos con el catálogo real del almacén.
- **⚡ Arquitectura Offline-First:** Base de datos SQLite integrada, garantizando operatividad total sin dependencias de APIs externas de pago (OpenAI/Google).
- **📱 Interfaz Adaptativa:** UI moderna con React, diseñada para terminales industriales o tablets.

---

## 🚀 Guía de Instalación

### 1. Preparación del Entorno
Asegúrate de tener instalados:
- **Node.js** (v18+)
- **Python** (v3.10+)
- **Git**

### 2. Configuración del Backend
Crea el archivo `backend/requirements.txt` con este contenido para simplificar la instalación:
```text
fastapi
uvicorn
sqlalchemy
faster-whisper
thefuzz
python-multipart
```

### 3. Ejecución en Local (PC)
Terminal A (Backend):

```Bash
cd backend
python -m venv venv
# Activar (Windows: venv\Scripts\activate | Mac/Linux: source venv/bin/activate)
pip install -r requirements.txt
uvicorn main:app --port 5001 --reload
```
Terminal B (Frontend):

```Bash
cd frontend
npm install
npm run dev
```
## ☁️ Despliegue en GitHub Codespaces
Si estás evaluando este proyecto en Codespaces, sigue estrictamente estos pasos:

Inicia los servicios:

Abre dos terminales. En la primera, ejecuta el Backend:
```Bash
cd backend
python -m venv venv
# Activar (Windows: venv\Scripts\activate | Mac/Linux/CODESPACE: source venv/bin/activate)
pip install -r requirements.txt
uvicorn main:app --port 5001 --reload
```
En la segunda, ejecuta el Frontend:
```Bash
cd frontend
npm install
npm run dev
```

### ⚠️ Configuración Crítica de Puertos:

Ve a la pestaña "Ports" (Puertos) en VS Code.

Verás los puertos 5173 y 5001.

Haz clic derecho sobre la columna "Visibility" de cada uno y cámbialos de Private a Public.

Esto permite que el túnel de red de GitHub habilite las APIs de micrófono (WebRTC) de forma segura.

### Acceso:

Haz clic en el enlace que genera el puerto 5173 para abrir la aplicación en tu navegador.

Importante: Debes aceptar el permiso de micrófono cuando el navegador lo solicite.

### 🛠️ Tecnologías Utilizadas

Frontend: React.js, Vite, TailwindCSS, Framer Motion, Zustand.

Backend: Python, FastAPI, SQLAlchemy (ORM), Faster-Whisper.

Base de Datos: SQLite.

### 👥 Equipo de Desarrollo
Proyecto final de arquitectura Full-Stack.