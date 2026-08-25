#!/bin/sh

set -eu
umask 077
export LC_ALL=C

database_url=${DATABASE_URL:-}
if [ -z "$database_url" ]; then
  echo "DATABASE_URL is required" >&2
  exit 1
fi

case "$database_url" in
  postgres://*|postgresql://*)
    ;;
  *)
    echo "DATABASE_URL must be a PostgreSQL connection URL" >&2
    exit 1
    ;;
esac

if ! command -v psql >/dev/null 2>&1; then
  echo "psql is required to run migrations" >&2
  exit 1
fi

if [ ! -f /migration/create.sql ]; then
  echo "Migration file /migration/create.sql is missing" >&2
  exit 1
fi

# Keep connection failures bounded while still allowing migration statements to
# use their normal server-side timeout policy.
export PGCONNECT_TIMEOUT=${PGCONNECT_TIMEOUT:-15}

exec psql --no-password --no-psqlrc --single-transaction \
  --dbname="$database_url" --set=ON_ERROR_STOP=1 \
  --file=/migration/create.sql
