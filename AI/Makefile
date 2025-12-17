# Makefile for Hotel AI System
# Commands for testing, linting, formatting, and running services

.PHONY: help test test-unit test-integration test-cv test-cv-unit test-cv-integration \
        test-watch test-cov lint format clean install dev

# Default target
.DEFAULT_GOAL := help

# ============================================================================
# HELP
# ============================================================================

help: ## Show this help message
	@echo "Hotel AI System - Makefile Commands"
	@echo ""
	@echo "Usage: make [target]"
	@echo ""
	@echo "Available targets:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "  %-25s %s\n", $$1, $$2}'

# ============================================================================
# INSTALLATION & SETUP
# ============================================================================

install: ## Install dependencies with uv
	uv pip install -e ".[dev]"

dev: ## Install development dependencies
	uv pip install -e ".[dev,test]"

# ============================================================================
# TESTING
# ============================================================================

test: ## Run all tests
	pytest test/ -v

test-unit: ## Run all unit tests
	pytest test/ -v -m "not integration" --ignore=test/cv/integration --ignore=test/llm/integration

test-integration: ## Run all integration tests
	pytest test/ -v -m "integration" -k "integration"

test-cv: ## Run all CV (Face Recognition) tests
	pytest test/cv/ -v

test-cv-unit: ## Run CV unit tests only
	pytest test/cv/unit/ -v

test-cv-integration: ## Run CV integration tests only
	pytest test/cv/integration/ -v

test-cv-manual: ## Run CV manual tests (interactive testing)
	.venv/bin/python test/cv/manual/test_image_search_manual.py

test-cv-benchmark: ## Run CV performance benchmarks
	.venv/bin/python test/cv/performance/benchmark_image_search.py

test-cv-all: test-cv-unit test-cv-integration test-cv-manual ## Run all CV tests (unit + integration + manual)

test-watch: ## Run tests in watch mode (re-run on file changes)
	pytest-watch test/ -v

test-cov: ## Run tests with coverage report
	pytest test/ -v --cov=src --cov-report=html --cov-report=term

test-cov-cv: ## Run CV tests with coverage
	pytest test/cv/ -v --cov=src/application/services/cv --cov=src/application/controllers/cv \
		--cov-report=html --cov-report=term

# ============================================================================
# CODE QUALITY
# ============================================================================

lint: ## Run linters (ruff)
	ruff check src/ test/

lint-fix: ## Fix linting issues automatically
	ruff check --fix src/ test/

format: ## Format code with ruff
	ruff format src/ test/

format-check: ## Check code formatting without making changes
	ruff format --check src/ test/

type-check: ## Run type checking with mypy
	mypy src/

# ============================================================================
# DOCKER & SERVICES
# ============================================================================

docker-up: ## Start all Docker services
	docker compose up -d

docker-down: ## Stop all Docker services
	docker compose down

docker-logs: ## Show Docker logs
	docker compose logs -f

docker-ps: ## Show running Docker containers
	docker compose ps

docker-rebuild: ## Rebuild Docker images
	docker compose build --no-cache

docker-clean: ## Remove all Docker containers, volumes, and images
	docker compose down -v
	docker system prune -af

# ============================================================================
# DATABASE
# ============================================================================

db-init: ## Initialize database (recreate from scratch)
	docker compose stop postgres
	docker compose rm -f postgres
	docker volume rm ai_postgres_data || true
	docker compose up -d postgres
	@echo "Waiting for PostgreSQL to initialize..."
	@sleep 10
	@echo "Database initialized successfully!"

db-shell: ## Open PostgreSQL shell
	docker exec -it hotel-postgres psql -U hotel_user -d hotel_db

db-logs: ## Show PostgreSQL logs
	docker logs hotel-postgres -f

# ============================================================================
# CLEANING
# ============================================================================

clean: ## Clean temporary files and caches
	find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name ".pytest_cache" -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name ".ruff_cache" -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name "*.egg-info" -exec rm -rf {} + 2>/dev/null || true
	find . -type f -name "*.pyc" -delete
	find . -type f -name "*.pyo" -delete
	find . -type f -name ".coverage" -delete
	rm -rf htmlcov/
	rm -rf .mypy_cache/
	@echo "Cleaned temporary files and caches"

clean-all: clean docker-clean ## Deep clean (including Docker)

# ============================================================================
# DEVELOPMENT
# ============================================================================

run-api: ## Run FastAPI development server
	uvicorn src.application.main:app --reload --host 0.0.0.0 --port 8000

run-prefect: ## Run Prefect worker
	cd src && prefect worker start --pool local-pool

# ============================================================================
# CI/CD
# ============================================================================

ci-test: ## Run tests for CI/CD pipeline
	pytest test/ -v --cov=src --cov-report=xml --cov-report=term

ci-lint: ## Run linting for CI/CD
	ruff check src/ test/
	ruff format --check src/ test/

ci: ci-lint ci-test ## Run all CI checks (lint + test)

# ============================================================================
# QUICK COMMANDS
# ============================================================================

qa: lint format test ## Run quality assurance (lint, format, test)

check: lint-fix format test-cv-unit ## Quick check before commit (fix, format, unit tests)
