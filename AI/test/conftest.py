"""
Pytest configuration and fixtures
Shared fixtures for all tests
"""
import pytest
from fastapi.testclient import TestClient

from src.application.main import app


@pytest.fixture
def client():
    """
    FastAPI test client fixture
    Usage: def test_example(client): response = client.get("/")
    """
    with TestClient(app) as test_client:
        yield test_client


@pytest.fixture
def base_url():
    """Base URL for API endpoints"""
    return "http://testserver"


@pytest.fixture
def llm_base_path():
    """Base path for LLM endpoints"""
    return "/api/llm"
