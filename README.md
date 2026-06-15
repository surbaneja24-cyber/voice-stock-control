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

**VoxStock** es una solución de software B2B diseñada para modernizar el control de almacenes en sectores industriales. Elimina la fricción de los sistemas tradicionales al permitir a los operarios actualizar el stock, registrar entradas/salidas y consultar ubicaciones **100% manos libres** mediante comandos de voz naturales.

A diferencia de los costosos sistemas corporativos, este proyecto es ligero, funciona en redes locales (Offline-First) y utiliza procesamiento de lenguaje natural (NLP) para entender el contexto logístico, tolerando ruido de fondo y variaciones en la dicción.

## ✨ Características Principales

- **🗣️ Picking por Voz Natural:** Transcripción asíncrona en tiempo real usando `faster-whisper` ejecutado enteramente en la memoria RAM local.
- **🧠 Extracción de Intenciones:** Motor lógico que procesa el lenguaje para detectar si la orden es de lectura, suma (entrada) o resta (salida) de material.
- **🎯 Filtro de Similitud (Fuzzy Matching):** Uso de la librería `thefuzz` para asociar comandos de voz imperfectos con el catálogo de base de datos, evitando falsos positivos por ruido ambiente.
- **⚡ Interfaz Reactiva y Modular:** Panel de control rápido construido con React (Vite) y enrutamiento seguro (React Router).
- **🔒 Operativa Aislada:** Base de datos SQLite integrada. Todo el ciclo de datos ocurre en la máquina, sin depender de APIs de terceros (OpenAI, Google).

---

## 🏗️ Arquitectura y Tecnologías

El proyecto sigue una arquitectura Full-Stack desacoplada y orientada a microservicios locales:

* **Frontend:** React.js, Vite, TailwindCSS y React Router (Gestión de UI y captura de audio nativa mediante `MediaRecorder`).
* **Backend:** Python con **FastAPI** para orquestar la concurrencia y procesar los binarios de audio en el puerto 5001.
* **Motor de IA:** `faster-whisper` (Speech-to-Text en CPU).
* **Base de Datos:** SQLite gestionado a través del ORM SQLAlchemy.

---

## 🚀 Instalación y despliegue en Local (PC)

Sigue estos pasos para levantar el entorno de desarrollo en tu máquina.

### Requisitos Previos
- Node.js (v18+) y npm instalados.
- Python 3.10+ instalado.

### 1. Levantar el Backend (FastAPI e IA)
Abre tu terminal en la raíz del proyecto y ejecuta:

```bash
cd backend
# Crear entorno virtual
python -m venv venv

# Activar el entorno (Windows)
venv\Scripts\activate
# Activar el entorno (Mac/Linux)
# source venv/bin/activate

# Instalar las dependencias exactas del motor
pip install fastapi uvicorn sqlalchemy faster-whisper thefuzz python-multipart

# Iniciar servidor asíncrono en el puerto 5001
uvicorn main:app --host 0.0.0.0 --port 5001 --reload
```

### 2. Levantar el Frontend (React)
Abre una segunda terminal en la raíz del proyecto:

```Bash
cd frontend
npm install
npm run dev
El sistema logístico estará disponible en http://localhost:5173.
```

## ☁️ Instalación y despliegue en GitHub Codespaces (Terminal Bash)
Debido a la arquitectura de contenedores de la nube, sigue estos pasos exactos para evitar bloqueos de red o de micrófono.

### 1. Levantar el Frontend
Abre la primera terminal de bash y ejecuta:

```Bash
cd frontend
npm install
npm run dev
```
### 2. Levantar el Backend
Abre una segunda terminal (+), entra al backend y lanza el servidor:

```Bash
cd backend
python -m venv venv
source venv/bin/activate
pip install fastapi uvicorn sqlalchemy faster-whisper thefuzz python-multipart
uvicorn main:app --host 0.0.0.0 --port 5001 --reload
```
### ⚠️ 3. CONFIGURACIÓN CRÍTICA DE PUERTOS
Para que el navegador permita enviar el audio de tu micrófono al backend dentro del contenedor de GitHub:

Ve a la pestaña "Ports" (Puertos) en el panel inferior de VS Code.

Verás dos puertos activos: 5173 (Frontend) y 5001 (Backend).

Haz clic derecho bajo la columna "Visibility" (Visibilidad) en AMBOS puertos.

Cámbialos de Private a Public.

Abre la URL del puerto 5173 en tu navegador y permite el uso del micrófono.

### 👥 Equipo de Desarrollo
Proyecto final de arquitectura Full-Stack construido por: