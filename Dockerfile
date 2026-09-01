# ==========================================
# Stage 1: Build & Dependencies
# ==========================================
FROM node:22-alpine AS builder

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache libc6-compat

# Copy package manifests
COPY package.json package-lock.json* ./

# Install clean dependencies including devDependencies for build step
RUN npm ci || npm install

# Copy application source code and configurations
COPY tsconfig.json vite.config.ts index.html metadata.json ./
COPY src ./src
COPY server ./server
COPY server.ts ./

# Compile client SPA and bundle server into dist/server.cjs
ENV NODE_ENV=production
RUN npm run build

# Remove development dependencies to prepare minimal production node_modules
RUN npm prune --production

# ==========================================
# Stage 2: Hardened Production Runtime
# ==========================================
FROM node:22-alpine AS runner

# Install lightweight init system for proper signal handling (PID 1)
RUN apk add --no-cache dumb-init

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Create dedicated persistent data directory with proper non-root ownership
RUN mkdir -p /app/.data && chown -R node:node /app

# Copy production dependencies and built artifacts from builder stage
COPY --from=builder --chown=node:node /app/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/package.json ./package.json
COPY --from=builder --chown=node:node /app/dist ./dist

# Run as standard unprivileged node user
USER node

# Expose standard container port
EXPOSE 3000

# Use dumb-init to supervise node process and forward SIGTERM/SIGINT
ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["node", "dist/server.cjs"]
