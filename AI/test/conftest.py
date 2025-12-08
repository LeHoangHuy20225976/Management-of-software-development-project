"""
Pytest configuration and fixtures
Shared fixtures for all tests
"""
import pytest
from fastapi.testclient import TestClient


# Service-specific app imports (imported on-demand)
def get_cv_app():
    """Get CV service app"""
    from src.application.controllers.cv.main import app
    return app


def get_llm_app():
    """Get LLM service app (if exists)"""
    try:
        from src.application.controllers.llm.main import app
        return app
    except ImportError:
        return None


@pytest.fixture
def cv_client():
    """
    CV service test client fixture
    Usage: def test_example(cv_client): response = cv_client.get("/")
    """
    app = get_cv_app()
    with TestClient(app) as test_client:
        yield test_client


@pytest.fixture
def llm_client():
    """
    LLM service test client fixture
    """
    app = get_llm_app()
    if app:
        with TestClient(app) as test_client:
            yield test_client
    else:
        yield None


@pytest.fixture
def base_url():
    """Base URL for API endpoints"""
    return "http://testserver"


@pytest.fixture
def llm_base_path():
    """Base path for LLM endpoints"""
    return "/api/llm"
