#!/bin/bash

# Función para crear túnel
create_tunnel() {
    echo "🚀 Creando túnel SSH..."
    ssh vps-postgres -N &
    TUNNEL_PID=$!
    echo "✅ Túnel SSH creado (PID: $TUNNEL_PID)"
    echo $TUNNEL_PID > ~/.ssh/postgres_tunnel_pid
    echo ""
    echo "🐘 Configuración para DBeaver:"
    echo "   Host: localhost"
    echo "   Port: 5433"
    echo "   Database: animal_register"
    echo "   Username: hormiguitas_rabiosas"
    echo ""
    echo "🛑 Para cerrar: $0 stop"
}

# Función para cerrar túnel
stop_tunnel() {
    if [ -f ~/.ssh/postgres_tunnel_pid ]; then
        PID=$(cat ~/.ssh/postgres_tunnel_pid)
        echo "🛑 Cerrando túnel SSH (PID: $PID)..."
        kill $PID 2>/dev/null && echo "✅ Túnel cerrado" || echo "⚠️  Túnel ya estaba cerrado"
        rm ~/.ssh/postgres_tunnel_pid
    else
        echo "⚠️  No hay túnel activo guardado"
        echo "🔧 Intentando cerrar cualquier túnel vps-postgres..."
        pkill -f "ssh vps-postgres" && echo "✅ Túnel cerrado" || echo "❌ No se encontró túnel"
    fi
}

# Verificar parámetros
case "${1:-start}" in
    "start")
        echo "🔗 Iniciando túnel SSH a PostgreSQL VPS..."
        # Verificar si ya existe el túnel
        if netstat -tlnp 2>/dev/null | grep -q ":5433.*LISTEN"; then
            echo "✅ Túnel SSH ya está activo en puerto 5433"
        else
            create_tunnel
        fi
        ;;
    "stop")
        stop_tunnel
        ;;
    "restart")
        stop_tunnel
        sleep 1
        create_tunnel
        ;;
    *)
        echo "Uso: $0 [start|stop|restart]"
        echo "  start   - Crear túnel SSH (por defecto)"
        echo "  stop    - Cerrar túnel SSH"
        echo "  restart - Reiniciar túnel SSH"
        ;;
esac
