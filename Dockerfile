# Stage 1: Build frontend
FROM node:22-slim AS frontend
WORKDIR /app/frontend
RUN npm install -g pnpm@latest --quiet
COPY frontend/package.json frontend/pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY frontend/ ./
RUN pnpm build
# Output at /app/frontend/dist (vite default outDir)

# Stage 2: Python runtime
FROM python:3.11-slim
WORKDIR /app

RUN apt-get update && apt-get install -y gcc && rm -rf /var/lib/apt/lists/*

COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/app/ ./app/
COPY core/ ./core/

COPY --from=frontend /app/frontend/dist /app/static/

RUN useradd -m -u 1000 ledger && chown -R ledger:ledger /app
USER ledger

EXPOSE 9400

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:9400/api/health || exit 1

CMD ["python", "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "9400"]
