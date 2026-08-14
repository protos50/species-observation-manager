#!/bin/bash
# deploy_gema.sh - Script para automatizar el despliegue del BACKEND de GEMA

# Configuración de rutas para GEMA Backend
GEMA_BACKEND_PATH="$HOME/Documents/Proyecto_Final/BackendAPI"
GEMA_BACKEND_REMOTE_PATH="/opt/gema-backend"
GEMA_BACKEND_SERVICE="gema-backend"
VPS_SSH="vps"  # Usa el alias configurado en ~/.ssh/config

# Crear timestamp para backups
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

set -e  # Parar en caso de error

# 1. Verificar conexión SSH
if ! ssh $VPS_SSH "echo ok" >/dev/null 2>&1; then
    echo "❌ Error: No se pudo conectar por SSH al servidor ($VPS_SSH)"
    exit 1
fi

# 2. Confirmación (automática o interactiva)
if [[ -n "$AUTO_CONFIRM" ]]; then
    CONFIRM="s"
else
    read -p "⚠️  ¿Seguro que quieres desplegar el BACKEND de GEMA en producción? (s/N): " CONFIRM
fi
if [[ "$CONFIRM" != "s" && "$CONFIRM" != "S" ]]; then
    echo "Cancelado."
    exit 1
fi

echo "🚀 Iniciando despliegue del BACKEND de GEMA..."

# 3. Verificar directorio del backend
if [ ! -d "$GEMA_BACKEND_PATH" ]; then
    echo "❌ Error: No existe el directorio del backend: $GEMA_BACKEND_PATH"
    exit 1
fi

# 4. BACKUPS DESHABILITADOS (ocupan mucho espacio)
# Si necesitas backup, hazlo manualmente antes de desplegar
echo "⚠️  Backups automáticos deshabilitados para ahorrar espacio"
# ssh $VPS_SSH "
#     # Backup de PostgreSQL
#     if [ -f '/opt/backups/scripts/backup-db.sh' ]; then
#         /opt/backups/scripts/backup-db.sh || echo '⚠️  Backup con script falló; continuando sin detener el deploy'
#     else
#         echo '⚠️  Script de backup no encontrado, intentando backup manual...'
#         docker exec gema-postgres pg_dump -U hormiguitas_rabiosas -d animal_register > ~/backup_gema_$TIMESTAMP.sql || echo '⚠️  Backup manual falló; continuando sin detener el deploy'
#     fi
#     
#     # Backup del backend existente
#     if [ -d '$GEMA_BACKEND_REMOTE_PATH' ]; then 
#         sudo cp -r $GEMA_BACKEND_REMOTE_PATH $GEMA_BACKEND_REMOTE_PATH-bak-$TIMESTAMP || echo '⚠️  No se pudo crear backup del backend existente'
#         echo '✅ Backup del backend creado: $GEMA_BACKEND_REMOTE_PATH-bak-$TIMESTAMP'
#     fi
# "

# 5. Preparar y subir backend de GEMA
echo "📦 Preparando backend de GEMA..."
cd $GEMA_BACKEND_PATH

# Verificar que existe .env.production
if [ ! -f .env.production ]; then
    echo "❌ Error: No existe .env.production en el backend"
    echo "💡 Crea el archivo .env.production con las credenciales de producción"
    exit 1
fi

echo "📤 Subiendo backend de GEMA..."
rsync -avz --delete --exclude node_modules --exclude .git --exclude dist --exclude .env --exclude '*.md' \
    ./ $VPS_SSH:~/gema-backend-new

# Subir .env.production del backend
scp .env.production $VPS_SSH:~/gema-backend-new/.env.production

# No subir .env local (solo producción)
echo "ℹ️  No se sube .env local; se usará .env.production en el servidor"

# 6. Actualizar backend en el servidor
echo "🔄 Actualizando backend en el servidor..."
ssh $VPS_SSH << EOF
# Detener servicio backend existente
echo "🛑 Deteniendo servicio backend existente..."
pm2 delete $GEMA_BACKEND_SERVICE 2>/dev/null || true

# Preparar directorio
sudo mkdir -p $GEMA_BACKEND_REMOTE_PATH

# Mover backend
echo "📂 Configurando backend..."
sudo rm -rf $GEMA_BACKEND_REMOTE_PATH-old 2>/dev/null || true
sudo mv $GEMA_BACKEND_REMOTE_PATH $GEMA_BACKEND_REMOTE_PATH-old 2>/dev/null || true
sudo mv ~/gema-backend-new $GEMA_BACKEND_REMOTE_PATH
VPS_USER=${VPS_USER:-\$(whoami)}
sudo chown -R $VPS_USER:$VPS_USER $GEMA_BACKEND_REMOTE_PATH

# Configurar backend
cd $GEMA_BACKEND_REMOTE_PATH
# Backup .env deshabilitado
# if [ -f .env ]; then
#   echo "🗂️  Backup .env existente -> .env.bak-$TIMESTAMP"
#   cp .env ".env.bak-$TIMESTAMP"
# fi
echo "📝 Sobrescribiendo .env desde .env.production"
cp .env.production .env

echo "📦 Instalando dependencias del backend..."
npm install --production=false

echo "🔧 Generando cliente Prisma..."
npx prisma generate

echo "🗃️ Ejecutando migrations..."
npx prisma migrate deploy

echo "🏗️ Compilando backend..."
npm run build

# Instalar PM2 si no existe
if ! command -v pm2 &> /dev/null; then
    echo "📥 Instalando PM2..."
    sudo npm install -g pm2
fi

# Iniciar backend con PM2
echo "🚀 Iniciando backend con PM2..."
cd $GEMA_BACKEND_REMOTE_PATH
# Forzar entorno de producción para que Nest cargue .env.production
NODE_ENV=production pm2 start dist/main.js --name "$GEMA_BACKEND_SERVICE" --cwd $GEMA_BACKEND_REMOTE_PATH

# Guardar configuración PM2
pm2 save
sudo pm2 startup systemd -u "$VPS_USER" --hp "/home/$VPS_USER" || true
# Asegurar actualización de variables de entorno en caso de cambios
pm2 restart "$GEMA_BACKEND_SERVICE" --update-env || true

EOF

# 7. Verificar estado del servicio backend
echo "📊 Verificando estado del servicio backend:"
ssh $VPS_SSH "pm2 status"

# 8. Test básico de conectividad
echo "🔍 Probando conectividad del backend..."
ssh $VPS_SSH "
    echo '📡 Backend (puerto 4000):'
    if curl -s http://localhost:4000 &>/dev/null; then
        echo '✅ Backend responde correctamente'
    else
        echo '❌ Backend no responde'
    fi
    
    echo '🐘 PostgreSQL:'
    if docker exec gema-postgres pg_isready -U hormiguitas_rabiosas &>/dev/null; then
        echo '✅ PostgreSQL disponible'
    else
        echo '❌ PostgreSQL no disponible'
    fi
"

echo ""
echo "🎉 Despliegue del BACKEND de GEMA completado!"
echo "⚠️  Backups automáticos deshabilitados (haz backups manuales si es necesario)"
echo ""
echo "🌐 URLs de acceso:"
echo "   - Backend API: https://192-99-145-175.sslip.io/api"
echo "   - Swagger Docs: https://192-99-145-175.sslip.io/api/docs"
echo ""
echo "📋 Comandos útiles:"
echo "   - Ver logs backend: ssh $VPS_SSH 'pm2 logs $GEMA_BACKEND_SERVICE'"
echo "   - Estado servicios: ssh $VPS_SSH 'pm2 status'"
echo "   - Reiniciar backend: ssh $VPS_SSH 'pm2 restart $GEMA_BACKEND_SERVICE'"
echo ""
echo "✅ ¡Backend deployment exitoso!"
