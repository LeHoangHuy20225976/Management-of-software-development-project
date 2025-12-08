"""
Test Churn Predictor Service
Unit tests for churn prediction logic
"""
import pytest
from src.application.services.ml.churn_predictor import (
    ChurnPredictor,
    get_churn_predictor,
    RISK_THRESHOLDS
)
from src.application.dtos.ml.churn_dto import ChurnFeatures


class TestChurnPredictor:
    """Test ChurnPredictor class"""

    def test_churn_predictor_initialization(self):
        """Test ChurnPredictor can be initialized"""
        predictor = ChurnPredictor()
        assert predictor is not None
        assert predictor.model_version == "churn_v1.8"

    def test_churn_predictor_singleton(self):
        """Test get_churn_predictor returns singleton"""
        predictor1 = get_churn_predictor()
        predictor2 = get_churn_predictor()
        assert predictor1 is predictor2

    def test_predict_returns_valid_probability(self):
        """Test predict returns probability in valid range"""
        predictor = ChurnPredictor()
        
        features = ChurnFeatures(
            booking_lead_time_days=30,
            room_type="deluxe",
            total_amount=5000000,
            payment_method="credit_card",
            booking_source="website",
            is_first_booking=False,
            special_requests=2,
            loyalty_tier="gold",
            booking_modifications=0,
            days_until_checkin=15
        )
        
        probability, confidence = predictor.predict(features)
        
        assert 0.0 <= probability <= 1.0
        assert 0.0 <= confidence <= 1.0

    def test_risk_level_classification(self):
        """Test risk level is correctly classified"""
        predictor = ChurnPredictor()
        
        # Test low risk
        assert predictor._classify_risk(0.2) == "low"
        
        # Test medium risk
        assert predictor._classify_risk(0.4) == "medium"
        
        # Test high risk
        assert predictor._classify_risk(0.7) == "high"

    def test_risk_thresholds_coverage(self):
        """Test risk thresholds cover full range"""
        assert RISK_THRESHOLDS["low"] < RISK_THRESHOLDS["medium"]
        assert RISK_THRESHOLDS["medium"] < RISK_THRESHOLDS["high"]
        assert RISK_THRESHOLDS["high"] == 1.0


class TestChurnFeatureEngineering:
    """Test feature engineering for churn prediction"""

    def test_churn_features_validation(self):
        """Test ChurnFeatures validates correctly"""
        features = ChurnFeatures(
            booking_lead_time_days=30,
            room_type="deluxe",
            total_amount=5000000,
            payment_method="credit_card",
            booking_source="website",
            is_first_booking=False,
            special_requests=2,
            loyalty_tier="gold",
            booking_modifications=0,
            days_until_checkin=15
        )
        
        assert features.booking_lead_time_days == 30
        assert features.room_type == "deluxe"
        assert features.loyalty_tier == "gold"

    def test_churn_features_optional_fields(self):
        """Test ChurnFeatures with optional fields"""
        # Minimal required fields
        features = ChurnFeatures(
            booking_lead_time_days=10,
            room_type="standard",
            total_amount=2000000,
            payment_method="cash",
            booking_source="phone",
            is_first_booking=True,
            days_until_checkin=5
        )
        
        assert features is not None