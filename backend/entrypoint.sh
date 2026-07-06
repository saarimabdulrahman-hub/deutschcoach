#!/bin/sh
set -e

# Wait for MySQL only in Docker Compose (db host exists on the compose network).
# In production (Render, etc.) the DATABASE_URL points to a remote DB — skip wait.
if echo "${DATABASE_URL:-sqlite}" | grep -q "mysql" && getent hosts db >/dev/null 2>&1; then
  echo "Waiting for MySQL at db:3306..."
  while ! python -c "import socket; s=socket.socket(); s.settimeout(2); s.connect(('db', 3306)); s.close()" 2>/dev/null; do
    sleep 2
  done
  echo "MySQL is ready."
fi

# Run database migrations
echo "Running Alembic migrations..."
alembic upgrade head

# Use PORT env var if set (Render provides it), otherwise default to 8001
PORT="${PORT:-8001}"
echo "Starting DeutschCoach API on port $PORT..."
exec uvicorn main:app --host 0.0.0.0 --port "$PORT"
