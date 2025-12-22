FROM node:20-alpine AS builder

WORKDIR /usr/src/app

RUN npm i -g pnpm

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./

COPY apps/backend ./apps/backend

COPY packages ./packages

# Install dependencies
RUN pnpm install --filter=backend --frozen-lockfile

# Generate Prisma client
WORKDIR /usr/src/app/apps/backend
RUN npx prisma generate

# Build application
RUN pnpm run build

# Production stage
FROM node:20-alpine

WORKDIR /usr/src/app

RUN npm i -g pnpm

# Copy workspace files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./

# Copy backend files (package.json, prisma schema, built dist)
COPY apps/backend/package.json ./apps/backend/
COPY apps/backend/prisma ./apps/backend/prisma
COPY --from=builder /usr/src/app/apps/backend/dist ./apps/backend/dist

# Copy shared packages (needed for @shared/* imports)
COPY packages ./packages

# Copy entrypoint script
COPY apps/backend/docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Install only production dependencies
RUN pnpm install --filter=backend --prod --frozen-lockfile

# Generate Prisma client in production (needed at runtime)
WORKDIR /usr/src/app/apps/backend
RUN npx prisma generate

ENV NODE_PATH=/usr/src/app/apps/backend/node_modules
ENV NODE_ENV=production

WORKDIR /usr/src/app/apps/backend

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["pnpm", "run", "prod"]