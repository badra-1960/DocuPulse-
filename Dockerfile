# =============================================================================
# DOCUPULSE SAAS - MULTI-STAGE PRODUCTION DOCKERFILE
# Optimized for Google Cloud Run, AWS ECS, Scaleway, or any Docker VPS
# =============================================================================

# -----------------------------------------------------------------------------
# 1. BUILD STAGE
# -----------------------------------------------------------------------------
FROM node:22-alpine AS builder

WORKDIR /app

# Install build essentials for alpine
RUN apk add --no-cache python3 make g++

# Install dependencies with cached package manifests
COPY package*.json ./
RUN npm ci --no-audit --prefer-offline

# Copy source code and build production assets
COPY . .
RUN npm run build

# -----------------------------------------------------------------------------
# 2. RUNTIME STAGE
# -----------------------------------------------------------------------------
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Install curl for container health check probe
RUN apk add --no-cache curl

# Security: run as non-root user
USER node

# Copy package manifests and production dependencies
COPY --chown=node:node package*.json ./
RUN npm ci --omit=dev --no-audit --ignore-scripts && npm cache clean --force

# Copy pre-built client assets and bundled server from builder
COPY --chown=node:node --from=builder /app/dist ./dist

# Document exposed container port (Cloud Run overrides PORT dynamically)
EXPOSE 3000

# Container liveness health check probe
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:${PORT}/health || exit 1

# Start bundled Node.js server
CMD ["node", "dist/server.cjs"]
