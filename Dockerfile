# ---------- STAGE 1: Build ----------
    FROM node:20-alpine AS builder

    # Create app directory
    WORKDIR /app
    
    # Install dependencies first (better caching)
    COPY package*.json ./
    RUN npm ci --legacy-peer-deps   
    
    # Copy source
    COPY . .
    
    # Build NestJS
    RUN npm run build
    
    # ---------- STAGE 2: Production ----------
    FROM node:20-alpine AS production
    
    WORKDIR /app
    
    # Install only production dependencies
    COPY package*.json ./
    RUN npm ci --omit=dev --legacy-peer-deps
    
    # Copy built files from builder
    COPY --from=builder /app/dist ./dist
    COPY --from=builder /app/node_modules ./node_modules
    
    # Security: run as non-root
    USER node
    
    # Expose Nest port
    EXPOSE 3000
    
    # Start app
    CMD ["node", "--enable-source-maps", "--max-old-space-size=512", "dist/main.js"]
    