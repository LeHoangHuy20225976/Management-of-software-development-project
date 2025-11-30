"""
Main FastAPI application
Entry point for all API services (CV, ML, LLM)
"""
from contextlib import asynccontextmanager
from typing import Any

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import time

from src.infrastructure.config import get_settings
from src.utils.logger import (
    app_logger,
    access_logger,
    error_logger,
    configure_third_party_loggers,
)

settings = get_settings()


# ========== Lifespan Events ==========

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan events - runs on startup and shutdown
    """
    # Startup
    app_logger.info(
        "Starting Hotel AI System",
        extra={
            "environment": settings.environment,
            "debug": settings.debug,
            "app_name": settings.app_name,
        },
    )

    # Configure third-party loggers
    configure_third_party_loggers()

    # Initialize connections (database, redis, rabbitmq, etc.)
    app_logger.info("Initializing connections...")
    # TODO: Add connection initialization here
    # await init_database()
    # await init_redis()
    # await init_rabbitmq()

    app_logger.info("Application started successfully")

    yield  # Application is running

    # Shutdown
    app_logger.info("Shutting down Hotel AI System")
    # TODO: Close connections here
    # await close_database()
    # await close_redis()
    # await close_rabbitmq()

    app_logger.info("Application shut down successfully")


# ========== Create FastAPI App ==========

app = FastAPI(
    title=settings.app_name,
    description="Hotel AI Management System with CV, ML, LLM services",
    version="0.1.0",
    debug=settings.debug,
    lifespan=lifespan,
    docs_url="/docs" if settings.debug else None,  # Disable in production
    redoc_url="/redoc" if settings.debug else None,
)


# ========== Middleware ==========

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Request logging middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    """
    Log all incoming requests and responses
    """
    start_time = time.time()

    # Log request
    access_logger.info(
        "Incoming request",
        extra={
            "method": request.method,
            "path": request.url.path,
            "query_params": str(request.query_params),
            "client_host": request.client.host if request.client else None,
        },
    )

    # Process request
    try:
        response = await call_next(request)
        duration = time.time() - start_time

        # Log response
        access_logger.info(
            "Request completed",
            extra={
                "method": request.method,
                "path": request.url.path,
                "status_code": response.status_code,
                "duration_ms": round(duration * 1000, 2),
            },
        )

        return response

    except Exception as e:
        duration = time.time() - start_time

        # Log error
        error_logger.error(
            "Request failed",
            extra={
                "method": request.method,
                "path": request.url.path,
                "error": str(e),
                "error_type": type(e).__name__,
                "duration_ms": round(duration * 1000, 2),
            },
            exc_info=True,
        )

        # Return error response
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "error": "Internal server error",
                "message": str(e) if settings.debug else "An error occurred",
                "path": request.url.path,
            },
        )


# ========== Exception Handlers ==========

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """
    Global exception handler for unhandled errors
    """
    error_logger.error(
        "Unhandled exception",
        extra={
            "method": request.method,
            "path": request.url.path,
            "error": str(exc),
            "error_type": type(exc).__name__,
        },
        exc_info=True,
    )

    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": "Internal server error",
            "message": str(exc) if settings.debug else "An unexpected error occurred",
            "path": request.url.path,
        },
    )


# ========== Routes ==========

@app.get("/", tags=["Health"])
async def root() -> dict[str, Any]:
    """
    Root endpoint - basic info
    """
    app_logger.debug("Root endpoint accessed")
    return {
        "app": settings.app_name,
        "version": "0.1.0",
        "environment": settings.environment,
        "status": "running",
    }


@app.get("/health", tags=["Health"])
async def health_check() -> dict[str, Any]:
    """
    Health check endpoint for monitoring
    """
    # TODO: Add actual health checks here
    # - Database connection
    # - Redis connection
    # - RabbitMQ connection
    # - Disk space
    # - Memory usage

    return {
        "status": "healthy",
        "app": settings.app_name,
        "environment": settings.environment,
        "checks": {
            "database": "ok",  # TODO: Add real check
            "redis": "ok",  # TODO: Add real check
            "rabbitmq": "ok",  # TODO: Add real check
        },
    }


@app.get("/info", tags=["Health"])
async def app_info() -> dict[str, Any]:
    """
    Application information
    """
    return {
        "app_name": settings.app_name,
        "version": "0.1.0",
        "environment": settings.environment,
        "debug": settings.debug,
        "log_level": settings.log_level,
        "services": {
            "database": settings.database_url.split("@")[1] if "@" in settings.database_url else "configured",
            "redis": f"{settings.redis_host}:{settings.redis_port}",
            "rabbitmq": f"{settings.rabbitmq_host}:{settings.rabbitmq_port}",
            "minio": settings.minio_endpoint,
            "mlflow": settings.mlflow_tracking_uri,
            "prefect": settings.prefect_api_url,
        },
    }


# ========== Include Routers ==========

# TODO: Uncomment when implementing services
# from src.application.controllers.cv.router import router as cv_router
# from src.application.controllers.ml.router import router as ml_router
from src.application.controllers.llm.router import router as llm_router
from src.application.controllers.llm.email_router import router as email_router

# app.include_router(cv_router, prefix="/api/cv", tags=["Computer Vision"])
# app.include_router(ml_router, prefix="/api/ml", tags=["Machine Learning"])
app.include_router(llm_router, prefix="/api/llm", tags=["LLM & RAG"])
app.include_router(email_router, prefix="/api/email", tags=["Email Service"])


# ========== Run Application ==========

if __name__ == "__main__":
    import uvicorn

    app_logger.info(
        "Starting server",
        extra={
            "host": settings.api_host,
            "port": settings.api_port,
            "reload": settings.api_reload,
        },
    )

    uvicorn.run(
        "src.application.main:app",
        host=settings.api_host,
        port=settings.api_port,
        reload=settings.api_reload,
        workers=settings.api_workers if not settings.api_reload else 1,
        log_level=settings.log_level.lower(),
    )
