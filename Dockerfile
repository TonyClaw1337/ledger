# LEDGER app build

# Python backend
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY backend/app/ ./app/
COPY core/ ./core/

# Create static directory and copy frontend build
COPY frontend/dist/ /app/static/

# Create non-root user
RUN useradd -m -u 1000 ledger && chown -R ledger:ledger /app
USER ledger

# Expose port
EXPOSE 9400

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:9400/api/health || exit 1

# Start the application
CMD ["python", "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "9400"]