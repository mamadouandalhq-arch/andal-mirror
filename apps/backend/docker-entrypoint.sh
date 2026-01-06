#!/bin/sh
set -e

# Change to backend directory
cd /usr/src/app/apps/backend

# Run migrations (always run on startup to ensure DB is up to date)
echo "Running database migrations..."
prisma migrate deploy

# Seed database (only if RUN_SEED environment variable is set to 'true')
if [ "$RUN_SEED" = "true" ]; then
  echo "Seeding database (RUN_SEED=true)..."
  prisma db seed || echo "Seed completed or skipped"
else
  echo "Skipping seed (set RUN_SEED=true to enable seeding)"
fi

echo "Starting application..."
exec "$@"
