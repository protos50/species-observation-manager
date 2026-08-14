# GEMA / AntLog - Bundle Docker (terceros)

Bundle listo para levantar el sistema usando las imágenes de Docker Hub.

## Requisitos

1. Docker instalado
2. Docker Compose v2

## Pasos rápidos

1. **Ir al folder**
   ```bash
   cd docker/third_party
   ```

2. **Levantar contenedores**
   ```bash
   docker compose up -d
   ```

3. **Restaurar la base de datos** (solo la primera vez)
   ```bash
   docker compose exec -T postgres \
     psql -U DD_LARREA -d animal_register \
     < restore.sql
   ```

4. **Abrir la app**
   - En el host: `http://localhost`
   - Desde otro dispositivo de la red: `http://IP_DEL_HOST`

## Comandos útiles

1. Ver estado de contenedores
   ```bash
   docker compose ps
   ```

2. Ver logs de backend
   ```bash
   docker compose logs backend -n 50
   ```

3. Detener todo
   ```bash
   docker compose down
   ```

