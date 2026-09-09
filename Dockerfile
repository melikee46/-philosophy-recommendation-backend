# ----------------------------------------------------
# Stage 1: Build stage
# ----------------------------------------------------
FROM node:22-alpine AS builder

WORKDIR /app

# Install dependencies needed for native modules / Prisma
RUN apk add --no-cache openssl

# Copy package files and Prisma schema first for efficient caching
COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci

# Copy full application source
COPY tsconfig.json ./
COPY src ./src

# Generate Prisma Client and build TypeScript to dist
RUN npx prisma generate
RUN npm run build

# ----------------------------------------------------
# Stage 2: Production stage
# ----------------------------------------------------
FROM node:22-alpine AS runner

WORKDIR /app

RUN apk add --no-cache openssl

ENV NODE_ENV=production

# Copy package files and install only production dependencies
COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci --only=production && npx prisma generate

# Copy compiled JavaScript output from builder stage
COPY --from=builder /app/dist ./dist

EXPOSE 5000

CMD ["sh", "-c", "npx prisma db push && node dist/src/server.js"]
