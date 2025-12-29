#!/bin/sh
set -e

echo "[entrypoint] Running migrations..."
npx sequelize-cli db:migrate

SEED_ADDITIONAL_DATA_FLAG="${SEED_ADDITIONAL_DATA:-${SEED_HOTEL_FACILITIES:-true}}"
if [ "${SEED_ADDITIONAL_DATA_FLAG}" = "true" ]; then
  echo "[entrypoint] Seeding additional data if empty..."
  node scripts/seed-additional-data.js
else
  echo "[entrypoint] Skipping additional seed (SEED_ADDITIONAL_DATA=${SEED_ADDITIONAL_DATA_FLAG})"
fi

echo "[entrypoint] Starting app: $*"
exec "$@"
