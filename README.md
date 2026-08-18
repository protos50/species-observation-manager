# Species Observation Manager

Sistema de gestión de colecciones biológicas para el Laboratorio de Zoología
Agrícola (FaCENA – UNNE). Centraliza observaciones de campo, jerarquía
taxonómica, geolocalización y datos climáticos, con una API REST documentada y
un panel de administración web.

En producción gestiona más de 1.000 observaciones reales con su cadena
taxonómica completa.

## Arquitectura

```
Cliente (navegador)
        │  HTTPS
        ▼
     Nginx  ── reverse proxy · rate limiting · security headers
        │
        ├──────────────► Frontend Next.js 15  (React 19, App Router)
        │
        └──── /api/* ──► Backend NestJS 11
                              │  JwtAuthGuard → RolesGuard → Controllers
                              │  Services → PrismaService
                              ▼
                         PostgreSQL 18
```

| Capa | Tecnología |
|---|---|
| Backend | NestJS 11, TypeScript 5.7, Prisma 6.5 |
| Base de datos | PostgreSQL 18 |
| Frontend | Next.js 15, React 19, NextAuth v5, Tailwind, shadcn/ui |
| Infraestructura | Docker Compose, Nginx, PM2 |
| Autenticación | JWT (access + refresh), bcrypt (10 salt rounds) |

## Estructura

```
├── BackendAPI/   API NestJS: 22 controllers, 15 módulos de dominio,
│                 esquema y migraciones de Prisma
├── proyecto/     Dashboard Next.js
├── docker/       Dockerfiles, docker-compose y configuración de Nginx
├── scripts/      Utilidades de importación, respaldo y despliegue
└── docs/         Documentación técnica
```

## Roles y permisos

El sistema define tres perfiles. La autorización se aplica en el backend
mediante `RolesGuard` + el decorador `@Roles(...)`; el frontend solo oculta la
interfaz que no corresponde.

| Perfil | `role_id` | Permisos |
|---|---|---|
| **Administrador** | 1 | Acceso total: usuarios, roles, servicios, bandeja de contacto, restauración y borrado físico |
| **Colaborador** (`RESEARCHER`) | 3 | Crea y edita observaciones, colecciones, taxones, ubicaciones y datos maestros. Búsqueda avanzada y exportación |
| **Consulta** (`USER`) | 2 | Solo lectura de los datos científicos |

Endpoints públicos, sin autenticación:

- `POST /api/auth/login` y `POST /api/auth/register`
- `POST /api/contact` — formulario público de contacto
- `GET /api/service` — listado público de servicios

## Puesta en marcha

### Con Docker (recomendado)

```bash
cd docker
cp .env.example .env      # completar con valores reales
docker compose up -d --build
```

La aplicación queda en `http://localhost`. El backend no expone su puerto al
host: todo el tráfico entra por Nginx.

### Desarrollo local

**Backend**

```bash
cd BackendAPI
cp .env.example .env      # configurar DATABASE_URL y los secretos JWT
npm install
npx prisma migrate deploy
npm run start:dev         # http://localhost:4000
```

Documentación OpenAPI en `http://localhost:4000/docs`.

**Frontend**

```bash
cd proyecto
cp .env.example .env      # generar AUTH_SECRET con: npx auth secret
npm install
npm run dev               # http://localhost:3000
```

## Variables de entorno

Ningún archivo `.env` se versiona. Cada carpeta trae su plantilla:

| Plantilla | Para qué |
|---|---|
| `BackendAPI/.env.example` | Desarrollo local del backend |
| `proyecto/.env.example` | Desarrollo local del frontend |
| `docker/.env.example` | Stack completo con build local |
| `docker/third_party/.env.example` | Stack usando imágenes publicadas |

Generar secretos robustos:

```bash
openssl rand -base64 48   # JWT_SECRET_KEY, JWT_REFRESH_TOKEN
npx auth secret           # AUTH_SECRET / NEXTAUTH_SECRET
```

## Pruebas

```bash
cd BackendAPI
npm test          # unitarias
npm run test:e2e  # end to end
```

## Licencia

Proyecto académico desarrollado como Práctica Profesional Supervisada,
Licenciatura en Sistemas de Información — FaCENA, UNNE.
