#!/bin/bash
# deploy_front.sh - Despliegue del FRONTEND (Next.js) de GEMA

# Configuración
FRONTEND_PATH="$HOME/Documents/Proyecto_Final/proyecto"
FRONTEND_REMOTE_PATH="/opt/proyecto-frontend"
FRONTEND_SERVICE="proyecto_final"        # Nombre en PM2
FRONTEND_PORT="${FRONTEND_PORT:-3000}"   # Puerto del Next.js en el VPS
VPS_SSH="vps"                             # Alias SSH

# Timestamp para backups
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

set -e  # Fallar en el primer error

# 1) Verificar conexión SSH
if ! ssh "$VPS_SSH" "echo ok" >/dev/null 2>&1; then
  echo "❌ Error: No se pudo conectar por SSH al servidor ($VPS_SSH)"
  exit 1
fi

# 2) Confirmación
if [[ -n "$AUTO_CONFIRM" ]]; then
  CONFIRM="s"
else
  read -p "⚠️  ¿Seguro que quieres desplegar el FRONTEND de GEMA en producción? (s/N): " CONFIRM
fi
if [[ "$CONFIRM" != "s" && "$CONFIRM" != "S" ]]; then
  echo "Cancelado."
  exit 1
fi

echo "🚀 Iniciando despliegue del FRONTEND de GEMA..."

# 3) Verificar proyecto y .env.production
if [ ! -d "$FRONTEND_PATH" ]; then
  echo "❌ Error: No existe el directorio del frontend: $FRONTEND_PATH"
  exit 1
fi
if [ ! -f "$FRONTEND_PATH/.env.production" ]; then
  echo "❌ Error: No existe $FRONTEND_PATH/.env.production"
  echo "💡 Debe contener: AUTH_SECRET, NEXT_PUBLIC_API_BASE_URL=/api, API_BASE_URL_SERVER, AUTH_TRUST_HOST, NEXTAUTH_URL/AUTH_URL"
  exit 1
fi

# 4) Subir código fuente (excluyendo caches y dependencias)
echo "📤 Subiendo código del frontend..."
rsync -avz --delete \
  --exclude node_modules \
  --exclude .next \
  --exclude .git \
  --exclude '.env.local' \
  "$FRONTEND_PATH/" "$VPS_SSH:~/proyecto-frontend-new"

# Subir .env.production
scp "$FRONTEND_PATH/.env.production" "$VPS_SSH:~/proyecto-frontend-new/.env.production"

# 5) Actualizar en el servidor
ssh "$VPS_SSH" << 'EOF'
set -e
FRONTEND_REMOTE_PATH="/opt/proyecto-frontend"
FRONTEND_SERVICE="proyecto_final"
FRONTEND_PORT="${FRONTEND_PORT:-3000}"

# Detener servicio existente si corre
pm2 delete "$FRONTEND_SERVICE" 2>/dev/null || true

# Preparar destino (backup deshabilitado para ahorrar espacio)
sudo mkdir -p "$FRONTEND_REMOTE_PATH"
# if [ -d "$FRONTEND_REMOTE_PATH" ]; then
#   sudo cp -r "$FRONTEND_REMOTE_PATH" "${FRONTEND_REMOTE_PATH}-bak-$(date +%Y%m%d_%H%M%S)" || true
# fi

# Publicar nueva versión
sudo rm -rf "${FRONTEND_REMOTE_PATH}-old" 2>/dev/null || true
sudo mv "$FRONTEND_REMOTE_PATH" "${FRONTEND_REMOTE_PATH}-old" 2>/dev/null || true
sudo mv ~/proyecto-frontend-new "$FRONTEND_REMOTE_PATH"

# Permisos
VPS_USER=${VPS_USER:-$(whoami)}
sudo chown -R "$VPS_USER":"$VPS_USER" "$FRONTEND_REMOTE_PATH"

# Instalar dependencias y compilar
cd "$FRONTEND_REMOTE_PATH"
if [ -f package-lock.json ]; then
  npm ci || npm install
else
  npm install
fi

# Build (package.json ya fija NEXT_PUBLIC_API_BASE_URL=/api)
npm run build -- --no-lint || npm run build

# PM2
if ! command -v pm2 >/dev/null 2>&1; then
  sudo npm install -g pm2
fi
# Exportar variables de entorno de .env.production para runtime (NextAuth, API, etc.)
set -a
[ -f .env.production ] && . ./.env.production
set +a
pm2 start npm --name "$FRONTEND_SERVICE" -- start -- -p "$FRONTEND_PORT"
pm2 save
sudo pm2 startup systemd -u "$VPS_USER" --hp "/home/$VPS_USER" || true
pm2 restart "$FRONTEND_SERVICE" --update-env || true

# Smoke test: preferir dominio si NEXTAUTH_URL está definido para evitar UntrustedHost
SMOKE_URL="${NEXTAUTH_URL:-http://127.0.0.1:$FRONTEND_PORT}"
if curl -fsSk "$SMOKE_URL" >/dev/null; then
  echo "✅ Frontend responde en $SMOKE_URL"
else
  echo "⚠️  Frontend no respondió en $SMOKE_URL (revisa pm2 logs)"
fi
EOF

# 6) Estado PM2
ssh "$VPS_SSH" "pm2 status --no-color" || true

echo
echo "🎉 Despliegue del FRONTEND de GEMA finalizado"
echo "🌐 URL: https://192-99-145-175.sslip.io/"
echo "📋 Comandos útiles:"
echo "  - Ver logs: ssh $VPS_SSH 'pm2 logs $FRONTEND_SERVICE'"
echo "  - Reiniciar: ssh $VPS_SSH 'pm2 restart $FRONTEND_SERVICE'"
echo "  - Estado: ssh $VPS_SSH 'pm2 status'"
