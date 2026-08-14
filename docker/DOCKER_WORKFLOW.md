# Flujo Docker para desarrollo y releases

## 1. Levantar stack local (build desde código)

1. Posicionarse en la carpeta `docker`:
   ```bash
   cd docker
   ```
2. Construir las imágenes locales:
   ```bash
   docker compose build backend frontend nginx
   ```
3. Levantar el stack:
   ```bash
   docker compose up -d
   ```
4. Ver estado:
   ```bash
   docker compose ps
   ```
5. Apagar todo:
   ```bash
   docker compose down
   ```

## 2. Publicar nueva versión en Docker Hub

Después de hacer cambios en el código y probar que el stack local funciona:

1. Construir imágenes (si no lo hiciste aún):
   ```bash
   cd docker
   docker compose build backend frontend nginx
   ```
2. Etiquetar imágenes locales con el repo de Docker Hub:
   ```bash
   docker tag docker-backend:latest  protos50/animal-register:backend
   docker tag docker-frontend:latest protos50/animal-register:frontend
   docker tag docker-nginx:latest    protos50/animal-register:nginx
   ```
3. Hacer push de cada imagen:
   ```bash
   docker push protos50/animal-register:backend
   docker push protos50/animal-register:frontend
   docker push protos50/animal-register:nginx
   ```

## 3. Actualizar un entorno que use third_party

En una máquina que ya está usando `docker/third_party` (cliente, servidor, etc.):

1. Bajar cambios de imágenes:
   ```bash
   cd docker/third_party
   docker compose pull
   ```
2. Levantar con la nueva versión:
   ```bash
   docker compose up -d
   ```
