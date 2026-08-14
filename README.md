# Species Observation Manager

Sistema integral para gestionar observaciones biológicas, centralizar taxonomía y geolocalización, exponer una API estable y ofrecer un dashboard administrativo moderno. El backend corre sobre NestJS + Prisma + PostgreSQL y el frontend usa Next.js (App Router) con componentes reutilizables orientados a formularios científicos.@resumen_proyecto.md#5-54

## Arquitectura general

- **Backend**: NestJS 11, Prisma ORM y PostgreSQL. Usa JWT para autenticación y expone endpoints documentados; las operaciones críticas emplean funciones transaccionales y búsquedas avanzadas con múltiples filtros.@resumen_proyecto.md#11-73
- **Frontend**: Next.js 15 con React 19, dashboard modular con formularios, listados y autenticación de usuarios.@resumen_proyecto.md#47-75
- **Infraestructura**: Docker Compose orquesta PostgreSQL, API, frontend y Nginx como reverse proxy, cada uno con healthchecks y redes aisladas.@docker/docker-compose.yml#1-142

## Requisitos

| Herramienta | Versión recomendada |
|-------------|---------------------|
| Node.js     | ≥ 20.x |
| npm         | ≥ 10.x |
| PostgreSQL  | ≥ 15 (si no usas Docker) |
| Docker & Docker Compose | Última versión estable |

## Estructura de carpetas

```
proyecto_final/
├── BackendAPI/   # NestJS + Prisma API
├── proyecto/     # Next.js dashboard
├── docker/       # Dockerfiles, compose y configuración de infraestructura
└── scripts/      # Utilidades de datos y despliegue
```

## Configuración de variables de entorno

1. Copia `backup.env.production` a un nuevo archivo `.env` en la raíz del proyecto:
   ```bash
   cp backup.env.production .env
   ```
2. Ajusta valores críticos (tokens JWT, credenciales de BD, claves NextAuth/Recaptcha, dominios de CORS, etc.). El mismo `.env` se usará para desarrollo local y para Docker Compose (se pasa con `--env-file`).

> **Tip:** Prisma usa `DATABASE_URL` en `BackendAPI/.env`. Puedes reutilizar la misma cadena desde el archivo raíz o crear un archivo específico dentro de `BackendAPI`.

## Desarrollo local (sin Docker)

### 1. Backend API
```bash
cd BackendAPI
npm install
npx prisma migrate dev
npm run start:dev
```
El backend expone los endpoints en `http://localhost:4000` y requiere que la variable `DATABASE_URL` apunte a tu instancia local de PostgreSQL.@resumen_proyecto.md#43-75

### 2. Frontend (Next.js)
```bash
cd proyecto
npm install
npm run dev
```
La app correrá en `http://localhost:3000` y espera que el backend esté accesible para completar los flujos del dashboard.@resumen_proyecto.md#47-75

## Ejecución con Docker Compose

Todos los servicios productivos (PostgreSQL, API, frontend y Nginx) están definidos en `docker/docker-compose.yml`.@docker/docker-compose.yml#1-142

1. Asegúrate de tener el archivo `.env` en la raíz con todas las variables usadas por Compose (`POSTGRES_*`, `JWT_*`, `NEXTAUTH_*`, `AUTH_*`, `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`, etc.).
2. Desde la raíz del proyecto, levanta los servicios:
   ```bash
   docker compose -f docker/docker-compose.yml --env-file .env up -d --build
   ```
3. Servicios expuestos:
   - **Nginx (80/443)**: proxy que enruta `/api` hacia el backend y el resto hacia el frontend.
   - **Frontend (3000 interno)**: Next.js en modo producción, salud verificada mediante `wget` en `http://localhost:3000`.@docker/docker-compose.yml#57-93
   - **Backend (4000 interno)**: NestJS sirviendo la API; healthcheck en `/api/auth/status`.@docker/docker-compose.yml#23-56
   - **PostgreSQL (sin puerto público)**: acceso sólo desde la red interna `animal_register_database`; usa `docker exec -it animal_register_db psql ...` si necesitas conectarte.@docker/docker-compose.yml#1-22

4. Para revisar logs:
   ```bash
   docker compose -f docker/docker-compose.yml logs -f backend
   docker compose -f docker/docker-compose.yml logs -f frontend
   docker compose -f docker/docker-compose.yml logs -f nginx
   ```

5. Para detener y limpiar contenedores conservando volúmenes:
   ```bash
   docker compose -f docker/docker-compose.yml down
   ```
   Agrega `-v` si también deseas borrar los volúmenes (`postgres_data`, `backend_logs`, `frontend_logs`, `nginx_logs`).@docker/docker-compose.yml#129-140

## Scripts útiles

En `scripts/` hay utilidades para respaldar/restaurar la base de datos, crear usuarios administradores, ejecutar importaciones CSV/ODS y automatizar despliegues rápidos. Revisa el README individual dentro de esa carpeta para instrucciones detalladas.

## Próximos pasos

- Conectar completamente el frontend con todos los endpoints (listas, formularios, búsqueda avanzada con filtros).
- Ejecutar pruebas end-to-end y publicar la búsqueda avanzada en la UI.
- Mantener la documentación API actualizada y enlazada en este README.@resumen_proyecto.md#55-95
