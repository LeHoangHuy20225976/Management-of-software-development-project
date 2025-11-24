"""
Test main application endpoints
Test root, health check, and info endpoints
"""
import pytest
from fastapi import status


class TestMainEndpoints:
    """Test main application endpoints"""

    def test_root_endpoint(self, client):
        """Test root endpoint returns basic info"""
        response = client.get("/")
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        
        assert "app" in data
        assert "version" in data
        assert "environment" in data
        assert "status" in data
        assert data["status"] == "running"

    def test_health_check_endpoint(self, client):
        """Test health check endpoint"""
        response = client.get("/health")
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        
        assert "status" in data
        assert data["status"] == "healthy"
        assert "checks" in data
        assert "database" in data["checks"]
        assert "redis" in data["checks"]
        assert "rabbitmq" in data["checks"]

    def test_app_info_endpoint(self, client):
        """Test application info endpoint"""
        response = client.get("/info")
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        
        assert "app_name" in data
        assert "version" in data
        assert "environment" in data
        assert "services" in data
        
        # Check services are configured
        services = data["services"]
        assert "database" in services
        assert "redis" in services
        assert "rabbitmq" in services
        assert "minio" in services

    def test_invalid_endpoint_returns_404(self, client):
        """Test that invalid endpoint returns 404"""
        response = client.get("/invalid-endpoint-xyz")
        assert response.status_code == status.HTTP_404_NOT_FOUND
