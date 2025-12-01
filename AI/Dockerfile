# ==============================================================================
# Hotel AI System - LLM Service with uv package manager
# ==============================================================================

FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    gcc \
    g++ \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Install uv package manager
RUN pip install --no-cache-dir uv

# Copy dependency files
COPY pyproject.toml .
COPY README.md .

# Copy .python-version if exists (optional)
COPY .python-version* ./

# Sync dependencies with uv
RUN uv sync --no-dev

# Copy application source code
COPY src/ /app/src/

# Set Python path
ENV PYTHONPATH=/app:${PYTHONPATH}

# Expose port for FastAPI
EXPOSE 8000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
  CMD curl -f http://localhost:8000/health || exit 1

# Start FastAPI application with uvicorn
CMD ["uv", "run", "uvicorn", "src.application.main:app", "--host", "0.0.0.0", "--port", "8000"]
