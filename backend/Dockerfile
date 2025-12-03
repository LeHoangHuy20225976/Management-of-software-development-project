# Stage 1: Build
FROM node:22.16.0-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (skip husky postinstall)
RUN npm ci --omit=dev --ignore-scripts && \
    npm install -g nodemon

# Stage 2: Production
FROM node:22.16.0-alpine

WORKDIR /app

# Install nodemon globally for development
RUN npm install -g nodemon

# Copy dependencies from builder
COPY --from=builder /app/node_modules ./node_modules

# Copy application code
COPY . .

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start application
CMD ["npm", "start"]
