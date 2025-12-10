"""
Storage Service - MinIO Object Storage
Entry point for Storage service
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
from .storage_controller import router as storage_router

settings = get_settings()


# ========== Lifespan Events ==========
@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan manager
    
    Startup:
    - Configure logging
    - Initialize MinIO connection
    
    Shutdown:
    - Cleanup resources
    """
    # Startup
    app_logger.info("=" * 80)
    app_logger.info("🚀 Storage Service Starting...")
    app_logger.info("=" * 80)
    
    # Configure third-party loggers
    configure_third_party_loggers()
    
    app_logger.info("✅ Storage service initialized successfully")
    app_logger.info(f"📦 MinIO endpoint: {settings.minio_endpoint}")
    
    yield
    
    # Shutdown
    app_logger.info("=" * 80)
    app_logger.info("🛑 Storage Service Shutting Down...")
    app_logger.info("=" * 80)
    app_logger.info("✅ Storage service shutdown complete")


# ========== Create FastAPI App ==========
app = FastAPI(
    title="Hotel AI - Storage Service",
    description="MinIO object storage service for bucket and file operations",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# ========== CORS Middleware ==========
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # TODO: Configure for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ========== Request Logging Middleware ==========
@app.middleware("http")
async def log_requests(request: Request, call_next):
    """Log all HTTP requests with timing"""
    start_time = time.time()
    
    # Log request
    access_logger.info(
        f"→ {request.method} {request.url.path}",
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
        process_time = time.time() - start_time
        
        # Log response
        access_logger.info(
            f"← {request.method} {request.url.path} | Status: {response.status_code} | Time: {process_time:.3f}s",
            extra={
                "method": request.method,
                "path": request.url.path,
                "status_code": response.status_code,
                "process_time": process_time,
            },
        )
        
        # Add timing header
        response.headers["X-Process-Time"] = str(process_time)
        
        return response
        
    except Exception as e:
        process_time = time.time() - start_time
        error_logger.error(
            f"❌ {request.method} {request.url.path} | Error: {str(e)} | Time: {process_time:.3f}s",
            extra={
                "method": request.method,
                "path": request.url.path,
                "error": str(e),
                "process_time": process_time,
            },
            exc_info=True,
        )
        raise


# ========== Exception Handlers ==========
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Global exception handler"""
    error_logger.error(
        f"Unhandled exception: {exc}",
        extra={
            "method": request.method,
            "path": request.url.path,
            "error_type": type(exc).__name__,
        },
        exc_info=True,
    )
    
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "detail": "Internal server error",
            "error_type": type(exc).__name__,
            "message": str(exc),
        },
    )


# ========== Include Routers ==========
app.include_router(
    storage_router,
    prefix="/storage",
    tags=["Storage"]
)


# ========== Root Endpoints ==========
@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "service": "Storage Service",
        "description": "MinIO object storage service",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs",
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "storage",
        "version": "1.0.0",
    }


# ========== Run with uvicorn (for local development) ==========
if __name__ == "__main__":
    import uvicorn
    
    app_logger.info("Starting Storage Service in development mode...")
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8004,
        reload=True,
        log_config=None,  # Use our custom logging
    )
