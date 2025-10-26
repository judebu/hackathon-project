# ---------- Stage 1: build frontend ----------
FROM node:22-alpine AS frontend-build
WORKDIR /app

# Install dependencies for the whole repo (monorepo root)
COPY package.json package-lock.json* ./
RUN npm ci --ignore-scripts

# Copy source files
COPY . .

# Build frontend (Vite) artifacts into /app/dist
RUN npm run build

# ---------- Stage 2: production server ----------
FROM node:22-alpine AS runtime
WORKDIR /app

# Create a non-root user for safety (optional)
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy only what we need from the previous stage and package files
COPY package.json package-lock.json* ./

# Install only production dependencies
RUN npm ci --omit=dev

# Copy built frontend assets from build stage
COPY --from=frontend-build /app/dist ./dist

# Copy server source (assumes server/ directory contains index.js)
COPY server ./server

# Copy other runtime files (e.g. migrations, data folder if any)
COPY data ./data

# Expose port (match what server listens on via .env PORT)
EXPOSE 5000

# Use non-root user
USER appuser

# Default command: run server
CMD ["node", "--env-file", ".env", "server/index.js"]
