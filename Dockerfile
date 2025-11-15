# ---- Base image ----
FROM node:22-alpine AS base

# Install pnpm globally
RUN npm install -g pnpm@10.21.0

WORKDIR /usr/src/app

# ---- Dependencies stage ----
FROM base AS dependencies

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Install all dependencies (including dev dependencies for building)
RUN pnpm install --frozen-lockfile

# ---- Production dependencies stage ----
FROM base AS prod-dependencies

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Install only production dependencies
RUN pnpm install --prod --frozen-lockfile

# ---- Build stage ----
FROM base AS build

# Copy dependencies from dependencies stage
COPY --from=dependencies /usr/src/app/node_modules ./node_modules

# Copy application source
COPY . .

# Generate Drizzle migrations if needed
# RUN pnpm run db:generate

# ---- Runtime stage ----
FROM base AS runner

# Set production environment
ENV NODE_ENV=production

# Copy production dependencies
COPY --from=prod-dependencies /usr/src/app/node_modules ./node_modules

# Copy application source
COPY --from=build /usr/src/app/src ./src
COPY --from=build /usr/src/app/drizzle ./drizzle
COPY --from=build /usr/src/app/package.json ./
COPY --from=build /usr/src/app/drizzle.config.js ./

# Expose the application port
ENV PORT=8000
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=30s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the application
CMD ["node", "src/index.js"]
