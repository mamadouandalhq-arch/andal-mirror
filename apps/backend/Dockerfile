FROM node:20-alpine AS builder

WORKDIR /usr/src/app

RUN npm i -g pnpm

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./

COPY apps/backend ./apps/backend

COPY packages ./packages

# Install dependencies
RUN pnpm install --filter=backend --frozen-lockfile

# Install TypeScript and tsc-alias globally for compiling shared packages
# These tools are needed to compile TypeScript shared packages to JavaScript
RUN npm install -g typescript@5.7.3 tsc-alias@1.8.10

# Generate Prisma client for database access
WORKDIR /usr/src/app/apps/backend
RUN pnpm exec prisma generate

# Build backend application
# Output directory is configured as "../../dist" in tsconfig.json, 
# so compiled files will be in /usr/src/app/dist
RUN pnpm run build

# Compile shared packages from TypeScript to JavaScript
# Shared packages are used via @shared/* imports and need to be compiled
# for runtime execution in the production environment
WORKDIR /usr/src/app/packages/shared
RUN mkdir -p dist && \
    tsc --project tsconfig.json && \
    tsc-alias -p tsconfig.json --outDir ./dist && \
    ls -la dist/ && \
    echo "Shared packages compilation finished"

# Production stage
FROM node:20-alpine

WORKDIR /usr/src/app

RUN npm i -g pnpm

# Copy workspace files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./

# Copy backend application files
COPY apps/backend/package.json ./apps/backend/
COPY apps/backend/prisma ./apps/backend/prisma
COPY apps/backend/tsconfig.json ./apps/backend/tsconfig.json

# Copy compiled backend application from builder stage
# The dist folder contains the compiled JavaScript files
COPY --from=builder /usr/src/app/dist ./dist-temp

# Copy shared packages source files and compiled output
# Source files are kept for reference, compiled dist is used at runtime
COPY packages ./packages
COPY --from=builder /usr/src/app/packages/shared/dist ./packages/shared/dist

# Verify that compiled shared packages structure exists
RUN echo "Checking shared dist structure:" && \
    ls -la ./packages/shared/dist/ 2>&1 && \
    ls -la ./packages/shared/dist/feedback/ 2>&1 || echo "Dist structure check completed"

# Copy entrypoint script
COPY apps/backend/docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Install production dependencies only
# tsconfig-paths is included as a production dependency for runtime path resolution
RUN pnpm install --filter=backend --prod --frozen-lockfile

# Install Prisma CLI globally with the version specified in package.json
# This ensures consistent Prisma version across environments
RUN npm install -g prisma@6.19.0

# Install development tools needed for runtime operations
# - ts-node: Required for running TypeScript seed files
# - tsconfig-paths: Required for resolving TypeScript path aliases in seed files
# - typescript: Required by ts-node for transpilation
# - tsc-alias: Required for fixing path aliases in compiled code
RUN npm install -g ts-node@10.9.2 tsconfig-paths@4.2.0 typescript@5.7.3 tsc-alias@1.8.10

# Generate Prisma client for production runtime
# Prisma client is required for database operations
WORKDIR /usr/src/app/apps/backend
RUN prisma generate

# Set environment variables for Node.js and TypeScript
ENV NODE_PATH=/usr/src/app/apps/backend/node_modules:/usr/src/app/node_modules
ENV NODE_ENV=production
ENV TS_NODE_PROJECT=/usr/src/app/apps/backend/tsconfig.json
ENV TS_NODE_TRANSPILE_ONLY=true
ENV TS_NODE_COMPILER_OPTIONS='{"module":"commonjs"}'
ENV TS_NODE_BASEURL=/usr/src/app/apps/backend

WORKDIR /usr/src/app/apps/backend

# Copy compiled application files to the final location
# The build output structure may vary, so we check multiple possible locations
RUN mkdir -p /usr/src/app/apps/backend/dist && \
    if [ -f "/usr/src/app/dist-temp/apps/backend/src/main.js" ]; then \
      cp -r /usr/src/app/dist-temp/apps/backend/src/* /usr/src/app/apps/backend/dist/; \
    elif [ -f "/usr/src/app/dist-temp/main.js" ]; then \
      cp -r /usr/src/app/dist-temp/* /usr/src/app/apps/backend/dist/; \
    elif [ -d "/usr/src/app/dist-temp/apps/backend" ]; then \
      cp -r /usr/src/app/dist-temp/apps/backend/* /usr/src/app/apps/backend/dist/; \
    fi && \
    rm -rf /usr/src/app/dist-temp

# Fix path aliases in compiled JavaScript files
# tsc-alias replaces @shared/* imports with relative paths
# Then we update paths to point to compiled dist folder instead of source files
WORKDIR /usr/src/app/apps/backend
RUN tsc-alias -p tsconfig.json --resolve-full-paths --outDir ./dist && \
    find ./dist -name "*.js" -type f -exec sed -i 's|../../packages/shared/|../../packages/shared/dist/|g' {} \; && \
    echo "Checking if shared dist exists:" && \
    ls -la /usr/src/app/packages/shared/dist/ 2>&1 || echo "Shared dist not found" && \
    echo "Path replacement completed"


ENTRYPOINT ["docker-entrypoint.sh"]
# Start the application
# Path aliases are already resolved during build, so we can use node directly
CMD ["node", "dist/main"]