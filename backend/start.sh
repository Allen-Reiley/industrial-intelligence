#!/bin/sh

# backend/start.sh
echo "🏗️ Running database migrations..."
# Run alembic upgrade head. If it fails, log the error but do not crash the container.
if uv run alembic upgrade head; then
    echo "✅ Database migrations successfully applied."
else
    echo "⚠️ Database migrations failed to apply, but proceeding to start ASGI server..."
fi

echo "🚀 Starting ASGI server..."
exec uv run uvicorn app.main:app --host 0.0.0.0 --port 8080
