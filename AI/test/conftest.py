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


"""
ML Service Test Fixtures
"""



@pytest.fixture
def ml_client():
    """
    FastAPI test client for ML service
    """
    with TestClient(app) as test_client:
        yield test_client


@pytest.fixture
def sample_churn_request():
    """Sample churn prediction request"""
    return {
        "booking_id": "BOOK_TEST_001",
        "guest_id": "GUEST_TEST_001",
        "features": {
            "booking_lead_time_days": 30,
            "room_type": "deluxe",
            "total_amount": 5000000,
            "payment_method": "credit_card",
            "booking_source": "website",
            "is_first_booking": False,
            "special_requests": 2,
            "loyalty_tier": "gold",
            "booking_modifications": 0,
            "days_until_checkin": 15
        }
    }


@pytest.fixture
def sample_service_recommendation_request():
    """Sample service recommendation request"""
    return {
        "guest_id": "GUEST_TEST_001",
        "top_k": 5,
        "context": {
            "guest_segment": "business",
            "time_of_day": "evening",
            "current_room": "801",
            "length_of_stay": 3
        }
    }


@pytest.fixture
def sample_room_recommendation_request():
    """Sample room recommendation request"""
    return {
        "guest_id": "GUEST_TEST_001",
        "check_in": "2025-02-01",
        "check_out": "2025-02-03",
        "preferences": {
            "budget": "high",
            "view": "ocean",
            "floor": "high",
            "smoking": False
        },
        "party_size": 2
    }


@pytest.fixture
def sample_batch_churn_request():
    """Sample batch churn prediction request"""
    return {
        "booking_ids": [
            "BOOK_TEST_001",
            "BOOK_TEST_002",
            "BOOK_TEST_003"
        ]
    }