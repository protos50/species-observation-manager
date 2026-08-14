#!/bin/bash

# Script para configurar el entorno de desarrollo local completo
# - Backend (NestJS)
# - Frontend (Next.js)
# - Base de datos PostgreSQL local

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
BACKUP_DIR="$PROJECT_DIR/backups"

echo "🚀 Configurando entorno de desarrollo local para GEMA"
echo "=================================================="
echo ""

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Función para verificar si un comando existe
command_exists() {
  command -v "$1" >/dev/null 2>&1
}

# 1. Verificar dependencias
echo "1️⃣  Verificando dependencias..."
echo ""

MISSING_DEPS=()

if ! command_exists node; then
  MISSING_DEPS+=("Node.js (v18+)")
fi

if ! command_exists npm; then
  MISSING_DEPS+=("npm")
fi

if ! command_exists psql; then
  MISSING_DEPS+=("PostgreSQL client (psql)")
fi

if ! command_exists docker; then
  echo -e "${YELLOW}⚠️  Docker no encontrado. Puedes usar PostgreSQL nativo o Docker.${NC}"
fi

if [ ${#MISSING_DEPS[@]} -gt 0 ]; then
  echo -e "${RED}❌ Faltan las siguientes dependencias:${NC}"
  for dep in "${MISSING_DEPS[@]}"; do
    echo "   - $dep"
  done
  echo ""
  echo "Instala las dependencias y vuelve a ejecutar este script."
  exit 1
fi

echo -e "${GREEN}✅ Todas las dependencias están instaladas${NC}"
echo ""

# 2. Configurar Base de Datos
echo "2️⃣  Configurando Base de Datos PostgreSQL..."
echo ""

# Preguntar si quiere usar Docker o PostgreSQL nativo
read -p "¿Quieres usar Docker para PostgreSQL? (s/n, default: n): " USE_DOCKER
USE_DOCKER=${USE_DOCKER:-n}

if [[ "$USE_DOCKER" =~ ^[Ss]$ ]]; then
  echo "🐳 Configurando PostgreSQL con Docker..."
  
  # Verificar si ya existe el contenedor
  if docker ps -a | grep -q gema_postgres_local; then
    echo "Contenedor 'gema_postgres_local' ya existe."
    read -p "¿Quieres recrearlo? (s/n): " RECREATE
    if [[ "$RECREATE" =~ ^[Ss]$ ]]; then
      docker stop gema_postgres_local 2>/dev/null || true
      docker rm gema_postgres_local 2>/dev/null || true
    fi
  fi
  
  if ! docker ps | grep -q gema_postgres_local; then
    echo "Iniciando contenedor PostgreSQL..."
    docker run -d \
      --name gema_postgres_local \
      -e POSTGRES_USER=admin \
      -e POSTGRES_PASSWORD=admin123 \
      -e POSTGRES_DB=ant_observations \
      -p 5433:5432 \
      postgres:15
    
    echo "Esperando a que PostgreSQL inicie..."
    sleep 5
  fi
  
  DB_HOST="localhost"
  DB_PORT="5433"
  DB_USER="admin"
  DB_PASSWORD="admin123"
  DB_NAME="ant_observations"
  
else
  echo "📦 Usando PostgreSQL nativo..."
  
  # Pedir credenciales
  read -p "Host de PostgreSQL (default: localhost): " DB_HOST
  DB_HOST=${DB_HOST:-localhost}
  
  read -p "Puerto (default: 5432): " DB_PORT
  DB_PORT=${DB_PORT:-5432}
  
  read -p "Usuario (default: postgres): " DB_USER
  DB_USER=${DB_USER:-postgres}
  
  read -sp "Contraseña: " DB_PASSWORD
  echo ""
  
  read -p "Nombre de la base de datos (default: ant_observations): " DB_NAME
  DB_NAME=${DB_NAME:-ant_observations}
fi

# 3. Buscar el backup más reciente o generarlo
echo ""
echo "3️⃣  Buscando backup de la base de datos..."
echo ""

LATEST_BACKUP=$(ls -t "$BACKUP_DIR"/gema_db_backup_*.sql 2>/dev/null | head -1)

if [ -z "$LATEST_BACKUP" ]; then
  echo "No se encontró backup local. Generando uno desde el VPS..."
  read -p "¿Tienes acceso SSH al VPS? (s/n): " HAS_VPS_ACCESS
  
  if [[ "$HAS_VPS_ACCESS" =~ ^[Ss]$ ]]; then
    bash "$SCRIPT_DIR/backup_db_from_vps.sh"
    LATEST_BACKUP=$(ls -t "$BACKUP_DIR"/gema_db_backup_*.sql 2>/dev/null | head -1)
  else
    echo -e "${RED}❌ No se puede continuar sin un backup de la base de datos.${NC}"
    echo "Opciones:"
    echo "  1. Obtén acceso SSH al VPS"
    echo "  2. Pide a alguien que ejecute: bash scripts/backup_db_from_vps.sh"
    echo "  3. Descarga el backup manualmente"
    exit 1
  fi
fi

echo -e "${GREEN}✅ Usando backup: $(basename "$LATEST_BACKUP")${NC}"
echo ""

# 4. Restaurar base de datos
echo "4️⃣  Restaurando base de datos..."
echo ""

if [[ "$USE_DOCKER" =~ ^[Ss]$ ]]; then
  # Restaurar en Docker
  docker exec -i gema_postgres_local psql -U "$DB_USER" -d postgres < "$LATEST_BACKUP"
else
  # Restaurar en PostgreSQL nativo
  PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -f "$LATEST_BACKUP"
fi

if [ $? -eq 0 ]; then
  echo -e "${GREEN}✅ Base de datos restaurada exitosamente${NC}"
else
  echo -e "${RED}❌ Error al restaurar la base de datos${NC}"
  exit 1
fi

echo ""

# 5. Configurar Backend
echo "5️⃣  Configurando Backend (NestJS)..."
echo ""

cd "$PROJECT_DIR/BackendAPI"

# Instalar dependencias si no existen
if [ ! -d "node_modules" ]; then
  echo "Instalando dependencias del backend..."
  npm install
fi

# Crear .env local si no existe
if [ ! -f ".env" ]; then
  echo "Creando archivo .env para desarrollo local..."
  cat > .env << EOF
# Database
DATABASE_URL="postgresql://$DB_USER:$DB_PASSWORD@$DB_HOST:$DB_PORT/$DB_NAME?schema=public"

# Server
PORT=4000
NODE_ENV=development

# JWT
JWT_SECRET=dev-secret-key-change-in-production
JWT_EXPIRATION=7d

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
EOF
  echo -e "${GREEN}✅ Archivo .env creado${NC}"
else
  echo -e "${YELLOW}⚠️  .env ya existe, no se sobrescribió${NC}"
fi

# Generar Prisma Client
echo "Generando Prisma Client..."
npx prisma generate

echo -e "${GREEN}✅ Backend configurado${NC}"
echo ""

# 6. Configurar Frontend
echo "6️⃣  Configurando Frontend (Next.js)..."
echo ""

cd "$PROJECT_DIR/proyecto"

# Instalar dependencias si no existen
if [ ! -d "node_modules" ]; then
  echo "Instalando dependencias del frontend..."
  npm install
fi

# Crear .env.local si no existe
if [ ! -f ".env.local" ]; then
  echo "Creando archivo .env.local para desarrollo..."
  cat > .env.local << EOF
# API Backend
NEXT_PUBLIC_API_URL=http://localhost:4000/api

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=dev-nextauth-secret-change-in-production

# Environment
NODE_ENV=development
EOF
  echo -e "${GREEN}✅ Archivo .env.local creado${NC}"
else
  echo -e "${YELLOW}⚠️  .env.local ya existe, no se sobrescribió${NC}"
fi

echo -e "${GREEN}✅ Frontend configurado${NC}"
echo ""

# 7. Resumen final
echo "=================================================="
echo -e "${GREEN}✅ ¡Entorno de desarrollo configurado exitosamente!${NC}"
echo "=================================================="
echo ""
echo "📝 Credenciales de Base de Datos:"
echo "   Host: $DB_HOST"
echo "   Port: $DB_PORT"
echo "   Database: $DB_NAME"
echo "   User: $DB_USER"
echo ""
echo "🚀 Para iniciar el entorno de desarrollo:"
echo ""
echo "   Terminal 1 - Backend:"
echo "   cd BackendAPI"
echo "   npm run start:dev"
echo ""
echo "   Terminal 2 - Frontend:"
echo "   cd proyecto"
echo "   npm run dev"
echo ""
echo "🌐 URLs:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:4000/api"
echo "   Swagger Docs: http://localhost:4000/api/docs"
echo ""
echo "💡 Comandos útiles:"
echo "   - Ver logs de Prisma: cd BackendAPI && npx prisma studio"
echo "   - Resetear DB: cd BackendAPI && npx prisma migrate reset"
echo "   - Ver estructura: psql -U $DB_USER -h $DB_HOST -p $DB_PORT -d $DB_NAME"
echo ""
