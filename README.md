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

## 🚀 Instalación y despliegue en Local (Desde cero)

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
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
pip install "bcrypt==4.0.1"
uvicorn main:app --port 5001 --reload
```
Terminal B (Frontend):

```Fragmento de código
cd frontend
npm install
npm run dev
```

El panel de control estará disponible en http://localhost:5173.

👥 Equipo de Desarrollo
Proyecto de arquitectura Full-Stack.