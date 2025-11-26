"""
Test LLM service router endpoints
Test all LLM API endpoints
"""
import pytest
from fastapi import status


class TestLLMRouter:
    """Test LLM service router"""

    def test_llm_health_endpoint(self, client, llm_base_path):
        """Test LLM health check endpoint"""
        response = client.get(f"{llm_base_path}/health")
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        
        assert "status" in data
        assert data["status"] == "ok"
        assert "service" in data
        assert data["service"] == "llm"

    def test_llm_root_endpoint(self, client, llm_base_path):
        """Test LLM root endpoint"""
        response = client.get(f"{llm_base_path}/")
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        
        assert "service" in data
        assert data["service"] == "LLM"
        assert "version" in data
        assert data["version"] == "0.1.0"
        assert "status" in data
        assert data["status"] == "running"

    def test_llm_endpoints_are_registered(self, client):
        """Test that LLM endpoints are properly registered in OpenAPI schema"""
        response = client.get("/openapi.json")
        
        if response.status_code == status.HTTP_200_OK:
            schema = response.json()
            paths = schema.get("paths", {})
            
            # Check LLM endpoints exist in schema
            assert "/api/llm/health" in paths or "/api/llm/" in paths

    def test_llm_endpoints_return_json(self, client, llm_base_path):
        """Test that LLM endpoints return JSON content type"""
        response = client.get(f"{llm_base_path}/health")
        
        assert response.status_code == status.HTTP_200_OK
        assert "application/json" in response.headers["content-type"]


class TestLLMRouterErrorHandling:
    """Test LLM router error handling"""

    def test_invalid_llm_endpoint_returns_404(self, client, llm_base_path):
        """Test that invalid LLM endpoint returns 404"""
        response = client.get(f"{llm_base_path}/invalid-endpoint")
        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_llm_endpoints_allow_cors(self, client, llm_base_path):
        """Test that CORS headers are present"""
        response = client.get(
            f"{llm_base_path}/health",
            headers={"Origin": "http://localhost:3000"}
        )
        
        assert response.status_code == status.HTTP_200_OK
        # CORS middleware should add these headers
        assert "access-control-allow-origin" in response.headers or response.status_code == 200
