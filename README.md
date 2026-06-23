<div align="center">

  <h1>VoxStock WMS</h1>
  <p><strong>Sistema SaaS de Gestión de Inventario Multi-Usuario dirigido por IA de Voz</strong></p>

  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" />
  <img src="https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white" />
  <img src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white" />
  <img src="https://img.shields.io/badge/SQLite-07405E?style=for-the-badge&logo=sqlite&logoColor=white" />
  <img src="https://img.shields.io/badge/AI-faster--whisper-FF6F00?style=for-the-badge" />

  <br />
</div>

---

##  Sobre el Proyecto

**VoxStock** es una solución de software B2B diseñada para modernizar el control de almacenes. Elimina la fricción de los sistemas tradicionales permitiendo a los operarios gestionar stock, registrar entradas/salidas y consultar el inventario **100% manos libres** mediante comandos de voz naturales. 

Diseñado bajo una arquitectura **SaaS Multi-Tenant**, permite que múltiples operarios interactúen con el sistema simultáneamente manteniendo sus catálogos e historiales de forma completamente aislada y segura.

##  Características Principales

- **Picking por Voz Natural:** Procesamiento de audio en tiempo real mediante `faster-whisper` ejecutado en local.
- **Seguridad Multi-Usuario:** Sistema de autenticación encriptada y aislamiento de base de datos a nivel de fila (Row-level Multi-tenancy). Cada operario tiene su propio entorno.
- **Motor de Inferencia:** Análisis de lenguaje natural para categorizar acciones (suma/resta) y extraer cantidades y unidades automáticamente.
- **Precisión Logística:** Uso de algoritmos de *Fuzzy Matching* para asociar dictados imperfectos con el catálogo real del almacén.
- **Catálogos Dinámicos:** CRUD completo que permite a los usuarios sembrar y personalizar sus propios inventarios según su sector industrial.
- **Arquitectura Offline-First:** Base de datos SQLite integrada, garantizando operatividad sin dependencias de APIs de IA de pago (OpenAI/Google).
- **Interfaz Adaptativa:** UI moderna con React, Dashboards analíticos y Onboarding persistente.

---

##  Guía de Instalación

### 1. Preparación del Entorno
Asegúrate de tener instalados:
- **Node.js** (v18+)
- **Python** (v3.10+)
- **Git**

## Despliegue en Local (PC)
Terminal A (Backend):

```Fragmento de código
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --port 5001 --reload
```
Terminal B (Frontend):

```Fragmento de código
cd frontend
npm install
npm run dev
```
## Despliegue en GitHub Codespaces
Si estás evaluando este proyecto en Codespaces, sigue estrictamente estos pasos:

Abre dos terminales y ejecuta los comandos de la sección anterior (Backend y Frontend).

### Configuración Crítica de Puertos: - Ve a la pestaña "Ports" (Puertos) en VS Code.

Verás los puertos 5173 y 5001.

Haz clic derecho sobre la columna "Visibility" de cada uno y cámbialos de Private a Public.

Nota: Esto es vital para que el túnel de red de GitHub habilite las APIs de micrófono (WebRTC) y permita el Login.

Haz clic en el enlace que genera el puerto 5173 para abrir la aplicación. (Acepta los permisos de micrófono).

### Tecnologías Utilizadas
Frontend: React.js, Vite, TailwindCSS, Recharts, Zustand.

Backend: Python, FastAPI, SQLAlchemy (ORM), Faster-Whisper, Passlib (Bcrypt).

Base de Datos: SQLite.

👥 Equipo de Desarrollo
Proyecto de arquitectura Full-Stack.