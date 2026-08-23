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

if [ ! -d /migrations ]; then
  echo "Migration directory /migrations is missing" >&2
  exit 1
fi

# Keep connection failures bounded while still allowing migration statements to
# use their normal server-side timeout policy.
export PGCONNECT_TIMEOUT=${PGCONNECT_TIMEOUT:-15}

# Bootstrap the ledger under the same transaction-scoped lock used below. The
# lock prevents two manually started executions from racing during bootstrap.
psql --no-password --no-psqlrc --dbname="$database_url" --set=ON_ERROR_STOP=1 \
  --command "BEGIN; SELECT pg_advisory_xact_lock(hashtextextended('tax-invoice-issuer-migrations', 0)); CREATE SCHEMA IF NOT EXISTS sam; CREATE TABLE IF NOT EXISTS sam.schema_migrations (version text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now()); COMMIT;"

found_migration=false
for migration in /migrations/*.sql; do
  if [ ! -f "$migration" ]; then
    continue
  fi

  found_migration=true
  version=$(basename "$migration" .sql)
  case "$version" in
    ''|*[!A-Za-z0-9_.-]*)
      echo "Invalid migration filename: $migration" >&2
      exit 1
      ;;
  esac

  # Keep the check, migration, and bookkeeping in one transaction. The
  # transaction-scoped advisory lock makes concurrent job executions safe.
  psql --no-password --no-psqlrc --dbname="$database_url" --set=ON_ERROR_STOP=1 --set=migration_version="$version" <<SQL
BEGIN;
SELECT pg_advisory_xact_lock(hashtextextended('tax-invoice-issuer-migrations', 0));
SELECT EXISTS (
  SELECT 1 FROM sam.schema_migrations WHERE version = :'migration_version'
) AS migration_applied \gset
\if :migration_applied
\echo Migration already applied: :migration_version
\else
\echo Applying migration: :migration_version
\i /migrations/$version.sql
INSERT INTO sam.schema_migrations (version) VALUES (:'migration_version');
\endif
COMMIT;
SQL
done

if [ "$found_migration" = "false" ]; then
  echo "No versioned migrations found" >&2
  exit 1
fi
