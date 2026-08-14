#!/bin/bash

# Script para hacer backup completo de la base de datos desde el VPS
# Incluye: estructura, funciones, datos, y constraints

set -e

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/home/francojzini/Documents/Proyecto_Final/backups"
BACKUP_FILE="$BACKUP_DIR/gema_db_backup_$TIMESTAMP.sql"

echo "🗄️  Haciendo backup completo de la base de datos..."
echo "📂 Destino: $BACKUP_FILE"

# Crear directorio de backups si no existe
mkdir -p "$BACKUP_DIR"

# Hacer backup completo desde el contenedor Docker en el VPS
echo "📥 Conectando al VPS y extrayendo datos..."

ssh vps "docker exec ant_observations_postgres pg_dump -U admin -d ant_observations \
  --clean \
  --if-exists \
  --create \
  --inserts \
  --column-inserts \
  --no-owner \
  --no-acl" > "$BACKUP_FILE"

if [ $? -eq 0 ]; then
  echo "✅ Backup completado exitosamente!"
  echo "📊 Tamaño del archivo: $(du -h "$BACKUP_FILE" | cut -f1)"
  echo ""
  echo "Para restaurar en tu notebook local:"
  echo "  1. Asegúrate de tener PostgreSQL corriendo localmente"
  echo "  2. Ejecuta: psql -U tu_usuario -d postgres -f $BACKUP_FILE"
  echo ""
  echo "O usa el script de setup: bash scripts/setup_local_dev.sh"
else
  echo "❌ Error al hacer el backup"
  exit 1
fi
