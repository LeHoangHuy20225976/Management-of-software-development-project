#!/bin/sh
set -e

echo "[entrypoint] Running migrations..."
npx sequelize-cli db:migrate

if [ "${SEED_HOTEL_FACILITIES:-true}" = "true" ]; then
  echo "[entrypoint] Seeding HotelFacilities if empty..."
  node scripts/seed-hotel-facilities.js
else
  echo "[entrypoint] Skipping HotelFacilities seed (SEED_HOTEL_FACILITIES=${SEED_HOTEL_FACILITIES})"
fi

echo "[entrypoint] Starting app: $*"
exec "$@"