# Backend multi-stage build for NestJS + Prisma

# Stage 1: Dependencies & build
FROM node:22-alpine AS builder

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache openssl

# Copy package files first to leverage cache layers
COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci --omit=optional && npm cache clean --force

# Copy the rest of the source
COPY . .

# Generate Prisma Client and build NestJS project
RUN npx prisma generate && npm run build

# Stage 2: Production runtime
FROM node:22-alpine

WORKDIR /app

# Install runtime dependencies
RUN apk add --no-cache openssl && \
    addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001 && \
    mkdir -p /var/log/backend && \
    chown -R nestjs:nodejs /var/log/backend

# Copy compiled output and node_modules from builder stage
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY package*.json ./

USER nestjs

EXPOSE 4000

CMD ["sh", "-c", "node dist/main.js 2>&1 | tee -a /var/log/backend/app.log"]
