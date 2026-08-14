# Frontend multi-stage build for Next.js 15

# Stage 1: Install dependencies
FROM node:22-alpine AS deps

WORKDIR /app

# Install dependencies based on lockfile
COPY package*.json ./
RUN npm ci && npm cache clean --force

# Stage 2: Build application
FROM node:22-alpine AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ARG NEXT_PUBLIC_API_BASE_URL
ENV NEXT_PUBLIC_API_BASE_URL=${NEXT_PUBLIC_API_BASE_URL}
ARG NEXT_PUBLIC_RECAPTCHA_SITE_KEY
ENV NEXT_PUBLIC_RECAPTCHA_SITE_KEY=${NEXT_PUBLIC_RECAPTCHA_SITE_KEY}

RUN npm run build

# Stage 3: Production runtime
FROM node:22-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001 && \
    mkdir -p /var/log/frontend && \
    chown -R nextjs:nodejs /var/log/frontend

# Copy build output and runtime dependencies
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/package*.json ./

USER nextjs

EXPOSE 3000
ENV PORT=3000

CMD ["sh", "-c", "node node_modules/next/dist/bin/next start 2>&1 | tee -a /var/log/frontend/app.log"]
