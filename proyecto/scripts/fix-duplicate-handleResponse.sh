#!/bin/bash

# Script para eliminar handleResponse duplicado de todos los archivos API

API_DIR="/home/francojzini/Documents/Proyecto_Final/proyecto/src/lib/api"

echo "🔧 Eliminando handleResponse duplicado de archivos API..."

files=(
  "collection.ts"
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
    
    # Eliminar las líneas que contienen la función handleResponse duplicada
    # Desde "// Función helper para manejar errores" hasta el final del bloque
    sed -i '/^\/\/ Función helper para manejar errores$/,/^};$/{ 
      /^\/\/ Función helper para manejar errores$/d
      /^const handleResponse = async/,/^};$/d
    }' "$filepath"
    
    echo "     ✅ Duplicado eliminado"
  else
    echo "  ❌ Archivo no encontrado: $file"
  fi
done

echo ""
echo "✅ Limpieza completada!"
