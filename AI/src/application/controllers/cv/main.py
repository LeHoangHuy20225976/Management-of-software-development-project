"""
CV Service - Face Recognition & Image Search
Entry point for Computer Vision service
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
from .face_controller import router as face_router, initialize_face_service, shutdown_face_service
from .image_search_controller import (
    router as image_search_router,
    initialize_image_search_service,
    shutdown_image_search_service,
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
        "Starting CV Service - Face Recognition & Image Search",
        extra={
            "environment": settings.environment,
            "debug": settings.debug,
        },
    )

    # Configure third-party loggers
    configure_third_party_loggers()

    # Initialize Face Recognition Service
    try:
        await initialize_face_service()
        app_logger.info("Face Recognition service initialized successfully")
    except Exception as e:
        app_logger.error(f"Failed to initialize face service: {e}", exc_info=True)

    # Initialize Image Search Service
    try:
        await initialize_image_search_service()
        app_logger.info("Image Search service initialized successfully")
    except Exception as e:
        app_logger.error(f"Failed to initialize image search service: {e}", exc_info=True)

    app_logger.info("CV Service started successfully")

    yield  # Application is running

    # Shutdown
    app_logger.info("Shutting down CV Service")

    # Shutdown Face Recognition Service
    try:
        await shutdown_face_service()
    except Exception as e:
        app_logger.error(f"Failed to shutdown face service: {e}", exc_info=True)

    # Shutdown Image Search Service
    try:
        await shutdown_image_search_service()
    except Exception as e:
        app_logger.error(f"Failed to shutdown image search service: {e}", exc_info=True)

    app_logger.info("CV Service shut down successfully")


# ========== Create FastAPI App ==========

app = FastAPI(
    title="Hotel AI - CV Service",
    description="Computer Vision Service for Face Recognition, Attendance Tracking & Image Search/Retrieval",
    version="0.1.0",
    debug=settings.debug,
    lifespan=lifespan,
    docs_url="/docs" if settings.debug else None,
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
    return {
        "service": "CV Service - Face Recognition & Image Search",
        "version": "0.1.0",
        "status": "running",
    }


@app.get("/health", tags=["Health"])
async def health_check() -> dict[str, Any]:
    """
    Health check endpoint for monitoring
    """
    return {
        "status": "healthy",
        "service": "cv-service",
        "version": "0.1.0",
    }


# ========== Include Routers ==========

app.include_router(face_router, prefix="/api/cv", tags=["Face Recognition"])
app.include_router(image_search_router, prefix="/api", tags=["Image Search"])


# ========== Run Application ==========

if __name__ == "__main__":
    import uvicorn

    app_logger.info(
        "Starting CV Service",
        extra={
            "host": settings.api_host,
            "port": 8001,
        },
    )

    uvicorn.run(
        "src.application.controllers.cv.main:app",
        host=settings.api_host,
        port=8001,
        reload=settings.api_reload,
        log_level=settings.log_level.lower(),
    )
