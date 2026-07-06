#!/bin/sh
set -e

# Wait for MySQL if DATABASE_URL contains mysql
if echo "${DATABASE_URL:-sqlite}" | grep -q "mysql"; then
  echo "Waiting for MySQL at db:3306..."
  while ! python -c "import socket; s=socket.socket(); s.settimeout(2); s.connect(('db', 3306)); s.close()" 2>/dev/null; do
    sleep 2
  done
  echo "MySQL is ready."
fi

# Run database migrations
echo "Running Alembic migrations..."
alembic upgrade head

# Start the application
echo "Starting DeutschCoach API on port 8001..."
exec uvicorn main:app --host 0.0.0.0 --port 8001
