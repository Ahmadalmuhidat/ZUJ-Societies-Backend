# Stage 1: Build
FROM node:18-alpine AS build

WORKDIR /app

COPY package*.json ./

# Optional: safer caching step
RUN npm install --omit=dev

COPY . .

# Optional: if you use TypeScript or build tools
# RUN npm run build

# Stage 2: Runtime
FROM node:18-alpine

WORKDIR /app

COPY --from=build /app /app

# Create non-root user and use it
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

# Expose application port
EXPOSE 3000

# Optional: Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

CMD ["node", "src/server.js"]

