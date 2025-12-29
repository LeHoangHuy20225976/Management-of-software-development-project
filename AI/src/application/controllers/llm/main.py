"""
LLM Service - Chat, RAG, Email Generation
Entry point for LLM service
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
from .router import router as llm_router
from .email_router import router as email_router
from .rag_router_v2 import router as rag_router
from .tools_router import router as tools_router
from src.application.controllers.hotel.upload_controller import router as hotel_upload_router

settings = get_settings()


# ========== Lifespan Events ==========

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan events - runs on startup and shutdown
    """
    # Startup
    app_logger.info(
        "Starting LLM Service",
        extra={
            "environment": settings.environment,
            "debug": settings.debug,
        },
    )

    # Configure third-party loggers
    configure_third_party_loggers()

    # Initialize LLM components
    try:
        from src.application.services.llm.graph import chat_graph
        from src.application.services.llm.checkpointer import get_checkpointer

        # Initialize checkpointer (creates tables if needed)
        get_checkpointer()

        app_logger.info("LLM service initialized successfully")
    except Exception as e:
        app_logger.error(f"Failed to initialize LLM service: {e}", exc_info=True)

    app_logger.info("LLM Service started successfully")

    yield  # Application is running

    # Shutdown
    app_logger.info("Shutting down LLM Service")
    app_logger.info("LLM Service shut down successfully")


# ========== Create FastAPI App ==========

app = FastAPI(
    title="Hotel AI - LLM Service",
    description="LLM Service for Chat, RAG, and Email Generation",
    version="0.1.0",
    debug=settings.debug,
    lifespan=lifespan,
    #docs_url="/docs" if settings.debug else None,     # turn on this later
    docs_url="/docs",           # for testing
    redoc_url="/redoc",
    #redoc_url="/redoc" if settings.debug else None,
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
        "service": "LLM Service",
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
        "service": "llm-service",
        "version": "0.1.0",
    }


# ========== Include Routers ==========

app.include_router(llm_router, prefix="/api/llm", tags=["LLM Chat"])
app.include_router(rag_router, prefix="/api/llm", tags=["RAG (PDF Q&A)"])
app.include_router(email_router, prefix="/api/email", tags=["Email Service"])
app.include_router(tools_router, prefix="/api/llm", tags=["LLM with Tools (DB Query)"])
app.include_router(hotel_upload_router, prefix="/api", tags=["Hotel Upload Management"])


# ========== Run Application ==========

if __name__ == "__main__":
    import uvicorn

    app_logger.info(
        "Starting LLM Service",
        extra={
            "host": settings.api_host,
            "port": 8003,
        },
    )

    uvicorn.run(
        "src.application.controllers.llm.main:app",
        host=settings.api_host,
        port=8003,
        reload=settings.api_reload,
        log_level=settings.log_level.lower(),
    )
