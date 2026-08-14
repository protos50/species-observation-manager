#!/bin/bash

# Script para actualizar todos los archivos de API con soporte JWT
# Agrega createHeaders() y handleResponse desde config.ts

API_DIR="/home/francojzini/Documents/Proyecto_Final/proyecto/src/lib/api"

echo "🔧 Actualizando archivos de API para incluir JWT..."

# Array de archivos a actualizar (excluimos config.ts y auth.ts)
files=(
  "collection.ts"
  "contact.ts"
  "dashboard.api.ts"
  "geolocation.ts"
  "location.ts"
  "preservation.ts"
  "roles.ts"
  "service.ts"
  "taxonomy.ts"
  "traps.ts"
  "users.ts"
)

for file in "${files[@]}"; do
  filepath="$API_DIR/$file"
  
  if [ -f "$filepath" ]; then
    echo "  📝 Procesando $file..."
    
    # Verificar si ya tiene el import
    if ! grep -q "handleResponse, createHeaders" "$filepath"; then
      # Agregar import en la primera línea que tenga import { API_BASE_URL }
      sed -i 's/import { API_BASE_URL }/import { API_BASE_URL, handleResponse, createHeaders }/g' "$filepath"
      echo "     ✅ Import agregado"
    else
      echo "     ⏭️  Ya tiene el import"
    fi
    
  else
    echo "  ❌ Archivo no encontrado: $file"
  fi
done

echo ""
echo "✅ Actualización completada!"
echo ""
echo "⚠️  NOTA: Debes agregar manualmente 'headers: await createHeaders()'"
echo "   en cada llamada fetch() de estos archivos."
