# Scripts de Desarrollo - GEMA

Scripts útiles para desarrollo local y deployment del proyecto GEMA.

## 📦 Scripts de Base de Datos Local

### Backup de Base de Datos Local

Crea un backup completo de tu base de datos PostgreSQL local (configurada en `BackendAPI/.env`):

```bash
bash scripts/backup_local_db.sh
```

**Incluye:**
- ✅ Estructura completa de tablas
- ✅ Funciones PostgreSQL
- ✅ Todos los datos
- ✅ Constraints y relaciones
- ✅ Formato SQL con INSERTs individuales

**Salida:** `backups/local_db_animal_register_YYYYMMDD_HHMMSS.sql`

### Restaurar Base de Datos Local

Restaura un backup en tu base de datos local:

```bash
# Modo interactivo (selecciona el backup)
bash scripts/restore_local_db.sh

# O especifica el archivo directamente
bash scripts/restore_local_db.sh backups/local_db_animal_register_20251001_140000.sql
```

**⚠️ Advertencia:** Esto sobrescribirá completamente tu base de datos actual.

---

## 🚀 Scripts de Deployment

### Deploy Frontend a Producción

Despliega el frontend Next.js al VPS:

```bash
# Modo normal (pide confirmación)
bash deploy_front.sh

# Modo automático
AUTO_CONFIRM=1 bash deploy_front.sh
```

**Acciones:**
1. Sincroniza código con rsync al VPS
2. Instala dependencias (si es necesario)
3. Ejecuta build de producción
4. Reinicia PM2

### Deploy Backend a Producción

Despliega el backend NestJS al VPS:

```bash
# Modo normal (pide confirmación)
bash deploy_gema.sh

# Modo automático
AUTO_CONFIRM=1 bash deploy_gema.sh
```

**Acciones:**
1. Pull del repositorio en el VPS
2. Instala dependencias
3. Regenera Prisma Client
4. Rebuild del proyecto
5. Reinicia PM2

---

## 🛠️ Setup Completo para Otra Notebook

Si quieres configurar todo el entorno desde cero en otra máquina:

```bash
bash scripts/setup_local_dev.sh
```

Este script:
1. ✅ Verifica dependencias (Node.js, PostgreSQL, etc.)
2. ✅ Configura PostgreSQL (Docker o nativo)
3. ✅ Descarga backup de producción
4. ✅ Restaura la base de datos
5. ✅ Configura backend (instala deps, crea .env, genera Prisma)
6. ✅ Configura frontend (instala deps, crea .env.local)

---

## 📋 Flujo de Trabajo Recomendado

### Desarrollo Local Diario

```bash
# Terminal 1: Backend
cd BackendAPI
npm run start:dev

# Terminal 2: Frontend  
cd proyecto
npm run dev

# URLs:
# Frontend: http://localhost:3000
# Backend: http://localhost:4000/api
# Swagger: http://localhost:4000/api/docs
```

### Antes de Trabajar con Datos Importantes

```bash
# Hacer backup de seguridad
bash scripts/backup_local_db.sh
```

### Después de Cambios en Prisma Schema

```bash
cd BackendAPI
npx prisma migrate dev --name descripcion_del_cambio
npx prisma generate
```

### Sincronizar con Producción

```bash
# Si hiciste cambios en producción y quieres traerlos local
bash scripts/backup_db_from_vps.sh
bash scripts/restore_local_db.sh

# Si probaste local y quieres subir a producción
bash deploy_gema.sh      # Para backend
bash deploy_front.sh     # Para frontend
```

---

## 🔍 Configuración

### Base de Datos Local

Configurada en `BackendAPI/.env`:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/animal_register?schema=public"
```

Para cambiarla, edita ese archivo y luego:

```bash
cd BackendAPI
npx prisma generate
```

### Variables de Entorno

**Backend** (`BackendAPI/.env`):
- `DATABASE_URL`: Conexión PostgreSQL
- `jwtSecretKey`: Secret para JWT
- `jwtRefreshToken`: Secret para refresh tokens

**Frontend** (`proyecto/.env.local`):
- `NEXT_PUBLIC_API_URL`: URL del backend API
- `NEXTAUTH_URL`: URL del frontend
- `NEXTAUTH_SECRET`: Secret para NextAuth

---

## 📊 Estructura de Backups

```
backups/
├── local_db_animal_register_20251001_140000.sql
├── local_db_animal_register_20251001_150000.sql
└── gema_db_backup_20251001_120000.sql
```

**Nombres:**
- `local_db_*`: Backups de tu base de datos local
- `gema_db_backup_*`: Backups del VPS de producción

---

## ⚙️ Troubleshooting

### Error: "psql: command not found"

Instala PostgreSQL client:

```bash
# Fedora/RHEL
sudo dnf install postgresql

# Ubuntu/Debian  
sudo apt install postgresql-client
```

### Error: "FATAL: database does not exist"

La base de datos no existe. Créala primero:

```bash
PGPASSWORD='postgres' psql -h localhost -p 5432 -U postgres -d postgres -c "CREATE DATABASE animal_register;"
```

### Error de permisos en backup/restore

Verifica las credenciales en `BackendAPI/.env` y que el usuario tenga permisos.

### Backend no conecta a la DB

1. Verifica que PostgreSQL esté corriendo: `sudo systemctl status postgresql`
2. Revisa el `DATABASE_URL` en `.env`
3. Prueba la conexión: `PGPASSWORD='postgres' psql -h localhost -p 5432 -U postgres -d animal_register`

---

## 📞 Ayuda

Si tienes problemas con algún script, revisa los logs o contacta al equipo.
