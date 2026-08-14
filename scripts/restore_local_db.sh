#!/bin/bash

# Script para restaurar un backup en la base de datos LOCAL
# Lee la configuración del .env del backend

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
BACKEND_DIR="$PROJECT_DIR/BackendAPI"
BACKUP_DIR="$PROJECT_DIR/backups"

# Verificar si se pasó un archivo de backup
if [ -z "$1" ]; then
  echo "📂 Buscando backups disponibles..."
  echo ""
  
  BACKUPS=$(ls -t "$BACKUP_DIR"/*.sql 2>/dev/null)
  
  if [ -z "$BACKUPS" ]; then
    echo "❌ No se encontraron backups en $BACKUP_DIR/"
    echo ""
    echo "Uso: bash scripts/restore_local_db.sh <archivo_backup.sql>"
    exit 1
  fi
  
  echo "Backups disponibles:"
  select BACKUP_FILE in $BACKUPS "Cancelar"; do
    if [ "$BACKUP_FILE" = "Cancelar" ]; then
      echo "Operación cancelada."
      exit 0
    elif [ -n "$BACKUP_FILE" ]; then
      break
    fi
  done
else
  BACKUP_FILE="$1"
  
  if [ ! -f "$BACKUP_FILE" ]; then
    echo "❌ Archivo no encontrado: $BACKUP_FILE"
    exit 1
  fi
fi

echo ""
echo "🔄 Restaurando base de datos LOCAL"
echo "=============================================="
echo "📂 Backup: $(basename "$BACKUP_FILE")"
echo ""

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

# Extraer componentes
DB_USER=$(echo "$DATABASE_URL" | sed -n 's/.*:\/\/\([^:]*\):.*/\1/p')
DB_PASSWORD=$(echo "$DATABASE_URL" | sed -n 's/.*:\/\/[^:]*:\([^@]*\)@.*/\1/p')
DB_HOST=$(echo "$DATABASE_URL" | sed -n 's/.*@\([^:]*\):.*/\1/p')
DB_PORT=$(echo "$DATABASE_URL" | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')
DB_NAME=$(echo "$DATABASE_URL" | sed -n 's/.*\/\([^?]*\).*/\1/p')

echo "⚠️  ADVERTENCIA: Esto sobrescribirá la base de datos actual!"
echo "📊 Base de datos: $DB_NAME"
echo "🖥️  Host: $DB_HOST:$DB_PORT"
echo ""

read -p "¿Estás seguro de continuar? (escribe 'SI' para confirmar): " CONFIRM

if [ "$CONFIRM" != "SI" ]; then
  echo "Operación cancelada."
  exit 0
fi

echo ""
echo "📥 Restaurando datos..."

# Restaurar con psql
PGPASSWORD="$DB_PASSWORD" psql \
  -h "$DB_HOST" \
  -p "$DB_PORT" \
  -U "$DB_USER" \
  -d postgres \
  -f "$BACKUP_FILE"

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ Base de datos restaurada exitosamente!"
  echo ""
  echo "💡 Ahora deberías:"
  echo "  1. cd BackendAPI"
  echo "  2. npx prisma generate  (regenerar Prisma Client)"
  echo "  3. npm run start:dev    (reiniciar el backend)"
else
  echo ""
  echo "❌ Error al restaurar la base de datos"
  exit 1
fi
