#!/bin/sh

# backend/start.sh

# Migrations decoupled from application startup to avoid blocking port binding on Railway.
# Database schema updates should be executed independently during deployment tasks.
# echo "🏗️ Running database migrations..."
# if uv run alembic upgrade head; then
#     echo "✅ Database migrations successfully applied."
# else
#     echo "⚠️ Database migrations failed to apply, but proceeding to start ASGI server..."
# fi

WORKERS=${WEB_CONCURRENCY:-2}
echo "🚀 Starting ASGI server with ${WORKERS} workers..."
exec uv run uvicorn app.main:app \
    --host 0.0.0.0 \
    --port "${PORT:-8000}" \
    --workers "${WORKERS}" \
    --proxy-headers \
    --forwarded-allow-ips "*"
