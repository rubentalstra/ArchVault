#!/bin/sh
set -e

if [ "${AUTO_MIGRATE:-true}" = "true" ]; then
  echo "Running database migrations..."
  node migrate.mjs
fi

exec node .output/server/index.mjs
