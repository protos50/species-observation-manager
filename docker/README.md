# Dockerization Blueprint

This directory stores the future containerization setup for the project. Nothing is wired into the main app yet; when you are ready to dockerize, use the files here as the base.

## Contents

- `docker-compose.yml` – full stack topology (PostgreSQL, Backend, Frontend, NGINX) with three isolated networks and named volumes.
- `.env.docker` – placeholder environment variables; **replace every secret** before running.
- `backend/Dockerfile` – multi-stage NestJS build (Node 18 alpine).
- `frontend/Dockerfile` – multi-stage Next.js build targeting the standalone server output.
- `nginx/` – Dockerfile + reverse proxy config (HTTP 80/443, rate limiting, security headers).
- `postgres/init-scripts/` – place SQL files here to seed the database on first run.

## Next Steps When You Decide to Dockerize

1. **Copy / adjust secrets**
   - Duplicate `.env.docker` to `.env` (or keep the name and reference it via compose).
   - Generate strong values for `POSTGRES_PASSWORD`, JWT secrets, and `NEXTAUTH_SECRET`.

2. **Review Dockerfiles**
   - Confirm the backend/frontend build steps match the current package scripts.
   - If you add native dependencies (Sharp, bcrypt prebuilds, etc.) update the base image packages accordingly.

3. **Optional production overrides**
   - Create `docker-compose.prod.yml` if you need HTTPS certificates, scaling, or different port mappings.
   - Configure real TLS certificates under `nginx/ssl/` and update `nginx.conf` accordingly.

4. **Run the stack**

   ```bash
   cd docker
   cp .env.docker .env   # or export variables manually
   docker compose up -d --build
   ```

5. **Persistence**
   - PostgreSQL data lives in the named volume `animal_register_postgres_data`.
   - NGINX logs persist in `animal_register_nginx_logs`.

Keep this blueprint synced with any future changes to the application (ports, env vars, extra services) so onboarding to Docker later is straightforward.
