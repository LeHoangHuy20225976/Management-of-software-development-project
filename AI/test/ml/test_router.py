"""
Test ML Service Router Endpoints
Tests for churn prediction and recommendation endpoints
"""
import pytest
from fastapi import status


class TestMLHealthEndpoints:
    """Test ML service health and info endpoints"""

    def test_ml_health_endpoint(self, ml_client):
        """Test ML health check endpoint"""
        response = ml_client.get("/health")
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        
        assert data["status"] == "healthy"
        assert "timestamp" in data
        assert "models_loaded" in data
        assert "checks" in data
        assert data["checks"]["churn_predictor"] == "ok"

    def test_ml_root_endpoint(self, ml_client):
        """Test ML root endpoint"""
        response = ml_client.get("/")
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        
        assert "service" in data
        assert "version" in data
        assert "status" in data

    def test_model_info_endpoint(self, ml_client):
        """Test get model info endpoint"""
        response = ml_client.get("/models/churn_predictor/info")
        
        assert response.status_code in [status.HTTP_200_OK, status.HTTP_404_NOT_FOUND]
        
        if response.status_code == status.HTTP_200_OK:
            data = response.json()
            assert "model_name" in data or "status" in data


class TestChurnPredictionEndpoints:
    """Test churn prediction endpoints"""

    def test_predict_churn_single(self, ml_client, sample_churn_request):
        """Test single churn prediction"""
        response = ml_client.post("/churn/predict", json=sample_churn_request)
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        
        # Verify response structure
        assert "booking_id" in data
        assert "guest_id" in data
        assert "churn_probability" in data
        assert "risk_level" in data
        assert "confidence" in data
        assert "risk_factors" in data
        assert "recommended_actions" in data
        
        # Verify data types and ranges
        assert isinstance(data["churn_probability"], float)
        assert 0.0 <= data["churn_probability"] <= 1.0
        assert 0.0 <= data["confidence"] <= 1.0
        assert data["risk_level"] in ["low", "medium", "high"]
        
        # Verify booking and guest IDs match request
        assert data["booking_id"] == sample_churn_request["booking_id"]
        assert data["guest_id"] == sample_churn_request["guest_id"]

    def test_predict_churn_validation(self, ml_client):
        """Test churn prediction with invalid input"""
        invalid_request = {
            "booking_id": "BOOK_001",
            # Missing required fields
        }
        
        response = ml_client.post("/churn/predict", json=invalid_request)
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    def test_predict_churn_batch(self, ml_client, sample_batch_churn_request):
        """Test batch churn prediction"""
        response = ml_client.post("/churn/batch", json=sample_batch_churn_request)
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        
        # Verify response structure
        assert "predictions" in data
        assert "total_processed" in data
        assert "high_risk_count" in data
        assert "medium_risk_count" in data
        assert "low_risk_count" in data
        
        # Verify predictions
        assert len(data["predictions"]) == len(sample_batch_churn_request["booking_ids"])
        assert data["total_processed"] == len(sample_batch_churn_request["booking_ids"])
        
        # Verify each prediction
        for pred in data["predictions"]:
            assert "booking_id" in pred
            assert "churn_probability" in pred
            assert "risk_level" in pred
            assert 0.0 <= pred["churn_probability"] <= 1.0
            assert pred["risk_level"] in ["low", "medium", "high"]

    def test_churn_risk_factors_structure(self, ml_client, sample_churn_request):
        """Test that risk factors have proper structure"""
        response = ml_client.post("/churn/predict", json=sample_churn_request)
        data = response.json()
        
        # Check risk factors
        if data["risk_factors"]:
            for factor in data["risk_factors"]:
                assert "factor" in factor
                assert "impact_score" in factor
                assert "description" in factor
                assert isinstance(factor["impact_score"], float)

    def test_churn_recommended_actions_structure(self, ml_client, sample_churn_request):
        """Test that recommended actions have proper structure"""
        response = ml_client.post("/churn/predict", json=sample_churn_request)
        data = response.json()
        
        # Check recommended actions
        if data["recommended_actions"]:
            for action in data["recommended_actions"]:
                assert "action" in action
                assert "priority" in action
                assert "timing" in action
                assert "expected_impact" in action
                assert action["priority"] in ["low", "medium", "high"]


class TestRecommendationEndpoints:
    """Test recommendation endpoints"""

    def test_recommend_services(self, ml_client, sample_service_recommendation_request):
        """Test service recommendation endpoint"""
        response = ml_client.post(
            "/recommend/services",
            json=sample_service_recommendation_request
        )
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        
        # Verify response structure
        assert "guest_id" in data
        assert "recommendations" in data
        assert "total_recommendations" in data
        assert "inference_time_ms" in data
        assert "model_version" in data
        
        # Verify guest ID matches
        assert data["guest_id"] == sample_service_recommendation_request["guest_id"]
        
        # Verify recommendations
        assert len(data["recommendations"]) <= sample_service_recommendation_request["top_k"]
        
        for rec in data["recommendations"]:
            assert "service_id" in rec
            assert "service_name" in rec
            assert "category" in rec
            assert "score" in rec
            assert "confidence" in rec
            assert "reason" in rec
            assert 0.0 <= rec["score"] <= 1.0
            assert 0.0 <= rec["confidence"] <= 1.0

    def test_recommend_services_with_exclusions(self, ml_client):
        """Test service recommendations with exclusions"""
        request = {
            "guest_id": "GUEST_001",
            "top_k": 5,
            "exclude_services": ["SVC_SPA_001"]
        }
        
        response = ml_client.post("/recommend/services", json=request)
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        
        # Verify excluded service is not in recommendations
        service_ids = [rec["service_id"] for rec in data["recommendations"]]
        assert "SVC_SPA_001" not in service_ids

    def test_recommend_rooms(self, ml_client, sample_room_recommendation_request):
        """Test room recommendation endpoint"""
        response = ml_client.post(
            "/recommend/rooms",
            json=sample_room_recommendation_request
        )
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        
        # Verify response structure
        assert "guest_id" in data
        assert "recommendations" in data
        assert "total_recommendations" in data
        assert "model_version" in data
        
        # Verify recommendations
        for rec in data["recommendations"]:
            assert "room_number" in rec
            assert "room_type" in rec
            assert "floor" in rec
            assert "score" in rec
            assert "price" in rec
            assert "features" in rec
            assert "match_score" in rec
            
            # Verify match score structure
            match_score = rec["match_score"]
            assert "budget" in match_score
            assert "view" in match_score
            assert "floor" in match_score
            assert "overall" in match_score
            
            assert 0.0 <= rec["score"] <= 1.0
            assert isinstance(rec["price"], (int, float))
            assert isinstance(rec["features"], list)

    def test_recommend_rooms_without_preferences(self, ml_client):
        """Test room recommendations without preferences"""
        request = {
            "guest_id": "GUEST_001",
            "check_in": "2025-02-01",
            "check_out": "2025-02-03",
            "party_size": 2
        }
        
        response = ml_client.post("/recommend/rooms", json=request)
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "recommendations" in data
        assert len(data["recommendations"]) > 0


class TestMLServiceIntegration:
    """Integration tests for ML service"""

    def test_multiple_predictions_consistency(self, ml_client, sample_churn_request):
        """Test that multiple predictions for same input are consistent"""
        response1 = ml_client.post("/churn/predict", json=sample_churn_request)
        response2 = ml_client.post("/churn/predict", json=sample_churn_request)
        
        assert response1.status_code == status.HTTP_200_OK
        assert response2.status_code == status.HTTP_200_OK
        
        data1 = response1.json()
        data2 = response2.json()
        
        # Probabilities should be similar (allowing small variance for mock randomness)
        assert abs(data1["churn_probability"] - data2["churn_probability"]) < 0.3
        assert data1["risk_level"] == data2["risk_level"]

    def test_cors_headers_present(self, ml_client):
        """Test that CORS headers are configured"""
        response = ml_client.get(
            "/health",
            headers={"Origin": "http://localhost:3000"}
        )
        
        assert response.status_code == status.HTTP_200_OK

    def test_error_handling_invalid_json(self, ml_client):
        """Test error handling for invalid JSON"""
        response = ml_client.post(
            "/churn/predict",
            data="invalid json",
            headers={"Content-Type": "application/json"}
        )
        
        assert response.status_code in [
            status.HTTP_422_UNPROCESSABLE_ENTITY,
            status.HTTP_400_BAD_REQUEST
        ]


class TestMLServicePerformance:
    """Performance tests for ML service"""

    def test_prediction_latency(self, ml_client, sample_churn_request):
        """Test that predictions complete in reasonable time"""
        import time
        
        start = time.time()
        response = ml_client.post("/churn/predict", json=sample_churn_request)
        elapsed = time.time() - start
        
        assert response.status_code == status.HTTP_200_OK
        # Should complete within 2 seconds
        assert elapsed < 2.0

    def test_recommendation_latency(self, ml_client, sample_service_recommendation_request):
        """Test that recommendations complete in reasonable time"""
        response = ml_client.post(
            "/recommend/services",
            json=sample_service_recommendation_request
        )
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        
        # Check inference time is reasonable (< 500ms for mock)
        assert data["inference_time_ms"] < 500