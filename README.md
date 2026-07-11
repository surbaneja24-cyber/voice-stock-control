<div align="center">

  <h1>VoxStock WMS</h1>
  <p><strong>Sistema SaaS de Gestión de Inventario dirigido por IA y Procesamiento de Lenguaje Natural</strong></p>

  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" />
  <img src="https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white" />
  <img src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white" />
  <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" />

  <br />
</div>

---

## Sobre el Proyecto

**VoxStock** es una solución de software B2B diseñada para modernizar el control de almacenes. Elimina la fricción de los sistemas tradicionales permitiendo a los operarios gestionar stock, registrar entradas/salidas y consultar el inventario mediante comandos de voz naturales o entradas de texto ágiles, adaptándose a las realidades de la planta logística.

Diseñado bajo una arquitectura **SaaS Multi-Tenant**, permite que múltiples operarios interactúen con el sistema simultáneamente manteniendo sus catálogos e historiales de forma completamente aislada en la nube.

## Arquitectura del Sistema

El flujo de datos está diseñado para garantizar persistencia y baja latencia en entornos industriales:

```text
[ Cliente: React SPA ]        <- Interfaz visual del operario
           │
           │ (1. Solicitud HTTP / Auth)
           ▼
[ API: FastAPI REST ]         <- Motor que procesa la lógica
           │
           │ (2. Inferencia NLP)
           ▼
[ ORM: SQLAlchemy 2.0 ]       <- Traductor de código a tablas
           │
           │ (3. Transacción ACID)
           ▼
[ BD: PostgreSQL (Neon) ]     <- Almacén definitivo en la nube
```

## Características Principales
 - **Cloud-Native Persistence**: Base de datos relacional PostgreSQL alojada en un clúster serverless (Neon), garantizando integridad ACID y persistencia frente a caídas de instancias.

 - **Seguridad Multi-Usuario**: Autenticación JWT encriptada (Bcrypt) y aislamiento de base de datos a nivel de fila (Row-level Multi-tenancy).

 - **Motor de Inferencia NLP**: Análisis de lenguaje natural para categorizar acciones y extraer cantidades automáticamente, independientemente de la sintaxis del operario.

 - **Fuzzy Matching Logístico**: Tolerancia a fallos de pronunciación o tipográficos al asociar dictados imperfectos con el catálogo real del almacén.

 - **Fallback de Interfaz**: Sistema de control híbrido que permite transicionar de reconocimiento de voz a comandos manuales para entornos con alto ruido industrial o restricciones de hardware.

## Configuración del Entorno
El sistema opera bajo estrictas políticas de seguridad mediante inyección de variables de entorno.

Crea un archivo .env en el directorio /backend:

````
DATABASE_URL="postgresql://usuario:password@host/database"
SECRET_KEY="tu_clave_secreta"
````
Crea un archivo .env en el directorio /frontend:
````
VITE_BACKEND_URL="http://localhost:5001"
````
##  Despliegue Local

### Terminal A (Backend):

```Bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --port 5001 --reload
```
### Terminal B (Frontend):

```Bash
cd frontend
npm install
npm run dev
```
## Entornos Virtualizados (GitHub Codespaces)
Para la ejecución dentro de contenedores de Codespaces, es crítico ajustar las reglas de red tras levantar los servidores:

Abrir el panel Ports en VS Code.

Modificar la visibilidad de los puertos 5173 y 5001 de Private a Public.

Aviso: Omitir este paso provocará que el proxy inverso de GitHub bloquee los protocolos WebRTC necesarios para la captura de audio y rechace las peticiones CORS.