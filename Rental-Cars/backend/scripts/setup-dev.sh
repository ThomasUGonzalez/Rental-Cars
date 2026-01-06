#!/usr/bin/env bash
set -euo pipefail

# setup-dev.sh
# Simple helper to boot the development environment.
# Usage: ./scripts/setup-dev.sh [--force-env] [--skip-docker]

FORCE_ENV=0
SKIP_DOCKER=0

while [[ $# -gt 0 ]]; do
  case "$1" in
    --force-env) FORCE_ENV=1; shift ;;
    --skip-docker) SKIP_DOCKER=1; shift ;;
    -h|--help) echo "Usage: $0 [--force-env] [--skip-docker]"; exit 0 ;;
    *) echo "Unknown arg: $1"; echo "Usage: $0 [--force-env] [--skip-docker]"; exit 2 ;;
  esac
done

REPO_ROOT="$(pwd)"
if [[ ! -f "$REPO_ROOT/package.json" ]]; then
  echo "[ERROR] package.json not found. Run this from the project root." >&2
  exit 1
fi

# 1) Start docker-compose (unless skipped)
if [[ "$SKIP_DOCKER" -eq 0 ]]; then
  echo "[INFO] Starting docker-compose services (if Docker is available)..."
  if command -v docker-compose >/dev/null 2>&1; then
    echo "[INFO] Using docker-compose"
    docker-compose up -d || echo "[WARN] docker-compose up failed"
  elif command -v docker >/dev/null 2>&1; then
    # prefer `docker compose` when available
    if docker compose version >/dev/null 2>&1; then
      echo "[INFO] Using 'docker compose'"
      docker compose up -d || echo "[WARN] docker compose up failed"
    else
      echo "[WARN] 'docker' found but 'docker compose' not available; skipping docker-compose startup"
    fi
  else
    echo "[WARN] Docker not found in PATH; skipping docker-compose startup"
  fi
else
  echo "[INFO] Skipping docker-compose as requested"
fi

# 2) npm install
if ! command -v npm >/dev/null 2>&1; then
  echo "[ERROR] npm not found in PATH. Install Node.js and npm and re-run." >&2
  exit 1
fi

echo "[INFO] Installing npm dependencies..."
npm install

# 3) Create .env from template if missing or if forced
ENV_FILE="$REPO_ROOT/.env"
if [[ -f "$ENV_FILE" && "$FORCE_ENV" -eq 0 ]]; then
  echo "[INFO] .env exists. Use --force-env to overwrite (a backup will be created)."
else
  if [[ -f "$ENV_FILE" && "$FORCE_ENV" -eq 1 ]]; then
    BACKUP="$ENV_FILE.bak.$(date -u +%Y%m%d%H%M%S)"
    echo "[INFO] Backing up existing .env to $BACKUP"
    cp "$ENV_FILE" "$BACKUP"
  fi

  echo "[INFO] Writing .env template"
  cat > "$ENV_FILE" <<'EOF'
SECRET=mySuperSecretKey
PORT=3000
MONGODB_URI=mongodb://root:example@localhost:27017/users?authSource=admin
PG_USER=postgres
PG_HOST=localhost
PG_DATABASE=repository
PG_PASSWORD=postgres
PG_PORT=5432
EOF
  echo "[INFO] .env written to $ENV_FILE"
fi

# 4) Start dev server
echo "[INFO] Starting dev server (npm run start:dev). This process will stay in foreground."
exec npm run start:dev
