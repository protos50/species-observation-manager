#!/bin/bash

# Script para hacer backup de la base de datos LOCAL
# Lee la configuración del .env del backend

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
BACKEND_DIR="$PROJECT_DIR/BackendAPI"
BACKUP_DIR="$PROJECT_DIR/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Extraer datos del .env
if [ ! -f "$BACKEND_DIR/.env" ]; then
  echo "❌ No se encontró el archivo .env en BackendAPI/"
  exit 1
fi

# Parsear DATABASE_URL
DATABASE_URL=$(grep "^DATABASE_URL=" "$BACKEND_DIR/.env" | cut -d'"' -f2)

if [ -z "$DATABASE_URL" ]; then
  echo "❌ No se pudo leer DATABASE_URL del .env"
  exit 1
fi

# Extraer componentes de la URL: postgresql://user:password@host:port/database
DB_USER=$(echo "$DATABASE_URL" | sed -n 's/.*:\/\/\([^:]*\):.*/\1/p')
DB_PASSWORD=$(echo "$DATABASE_URL" | sed -n 's/.*:\/\/[^:]*:\([^@]*\)@.*/\1/p')
DB_HOST=$(echo "$DATABASE_URL" | sed -n 's/.*@\([^:]*\):.*/\1/p')
DB_PORT=$(echo "$DATABASE_URL" | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')
DB_NAME=$(echo "$DATABASE_URL" | sed -n 's/.*\/\([^?]*\).*/\1/p')

echo "🗄️  Haciendo backup de la base de datos LOCAL"
echo "=============================================="
echo "📊 Base de datos: $DB_NAME"
echo "🖥️  Host: $DB_HOST:$DB_PORT"
echo "👤 Usuario: $DB_USER"
echo ""

# Crear directorio de backups si no existe
mkdir -p "$BACKUP_DIR"

BACKUP_FILE="$BACKUP_DIR/local_db_${DB_NAME}_$TIMESTAMP.sql"

echo "📥 Extrayendo datos..."

# Hacer backup con pg_dump
PGPASSWORD="$DB_PASSWORD" pg_dump \
  -h "$DB_HOST" \
  -p "$DB_PORT" \
  -U "$DB_USER" \
  -d "$DB_NAME" \
  --clean \
  --if-exists \
  --create \
  --inserts \
  --column-inserts \
  --no-owner \
  --no-acl \
  > "$BACKUP_FILE"

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ Backup completado exitosamente!"
  echo "📂 Archivo: $BACKUP_FILE"
  echo "📊 Tamaño: $(du -h "$BACKUP_FILE" | cut -f1)"
  echo ""
  echo "Para restaurar este backup:"
  echo "  PGPASSWORD='$DB_PASSWORD' psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d postgres -f $BACKUP_FILE"
  echo ""
  echo "O usa el script de restauración:"
  echo "  bash scripts/restore_local_db.sh $BACKUP_FILE"
else
  echo "❌ Error al hacer el backup"
  rm -f "$BACKUP_FILE"
  exit 1
fi
