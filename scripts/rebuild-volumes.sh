#!/usr/bin/env bash
# Phase 6 task 6.7 — repo-wide Docker rebuild.
#
# Use this when a dependency change (native binding, new worker, or a
# package added on the host) drifts out of sync with what the running
# containers have in their bind-mounted node_modules. Phase 5 hit this
# hard when BullMQ + ioredis arrived; a plain `docker compose build`
# didn't pick the new modules up.
#
# Safe to run repeatedly — tears down volumes + cache, then rebuilds
# the API + client images from scratch and brings the stack back up.
#
# Does NOT touch the Postgres volume when invoked without --with-db,
# so local DB state survives. Pass --with-db to also reset Postgres.

set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &>/dev/null && pwd)"
REPO_ROOT="$(cd -- "$SCRIPT_DIR/.." &>/dev/null && pwd)"
cd "$REPO_ROOT"

WITH_DB=0
if [[ "${1:-}" == "--with-db" ]]; then
  WITH_DB=1
fi

echo ">> stopping containers"
docker compose down

if [[ "$WITH_DB" -eq 1 ]]; then
  echo ">> removing all volumes (including Postgres) — fresh DB on next boot"
  docker compose down -v
else
  echo ">> removing server + client named volumes only (DB preserved)"
  # Named volumes follow <project>_<volume>. Compose v2 auto-prefixes
  # with the project name (directory basename). We scope the wipe so a
  # forgotten "--with-db" doesn't nuke local Postgres data.
  PROJECT="$(basename "$REPO_ROOT" | tr '[:upper:]' '[:lower:]')"
  docker volume rm "${PROJECT}_server_node_modules" 2>/dev/null || true
  docker volume rm "${PROJECT}_client_node_modules" 2>/dev/null || true
fi

echo ">> rebuilding images with --no-cache"
docker compose build --no-cache server client

echo ">> starting stack"
docker compose up -d

echo ">> waiting for containers to report healthy"
sleep 3
docker compose ps
echo ">> done. tail logs with: docker compose logs -f server client"
