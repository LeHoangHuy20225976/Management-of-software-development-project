"""CV Service Controllers"""

from .face_controller import router as face_router, initialize_face_service, shutdown_face_service

__all__ = ["face_router", "initialize_face_service", "shutdown_face_service"]
