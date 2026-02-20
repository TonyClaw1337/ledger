FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY app/ ./app/
COPY ../core/ ./core/

# Create static directory for frontend
RUN mkdir -p /app/static

# Copy frontend dist files (will be built separately)
COPY ../frontend/dist/ /app/static/

# Create non-root user
RUN useradd -m -u 1000 ledger && chown -R ledger:ledger /app
USER ledger

# Expose port
EXPOSE 9400

# Start the application
CMD ["python", "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "9400"]