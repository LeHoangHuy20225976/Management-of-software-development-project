"""
Test CLV Calculator Service
Unit tests for Customer Lifetime Value prediction logic
"""
import pytest
import numpy as np
from datetime import datetime, timedelta
from unittest.mock import Mock, AsyncMock, patch

from src.application.services.ml.clv_calculator import (
    CLVCalculator,
    get_clv_calculator,
    CLV_SEGMENTS,
    RFM_BINS
)
from src.application.dtos.ml.clv_dto import (
    CLVPredictRequest,
    CLVPredictResponse,
    CLVBatchPredictRequest
)


class TestCLVCalculator:
    """Test CLVCalculator class"""

    def test_clv_calculator_initialization(self):
        """Test CLVCalculator can be initialized"""
        mock_registry = Mock()
        calculator = CLVCalculator(mock_registry, None)
        assert calculator is not None

    def test_clv_calculator_singleton(self):
        """Test get_clv_calculator returns singleton"""
        calculator1 = get_clv_calculator()
        calculator2 = get_clv_calculator()
        assert calculator1 is calculator2

    def test_determine_segment(self):
        """Test customer segmentation logic"""
        mock_registry = Mock()
        calculator = CLVCalculator(mock_registry, None)
        
        # Test VIP segment
        assert calculator._determine_segment(150_000_000) == 'vip'
        assert calculator._determine_segment(100_000_000) == 'vip'
        
        # Test high value
        assert calculator._determine_segment(75_000_000) == 'high_value'
        assert calculator._determine_segment(50_000_000) == 'high_value'
        
        # Test medium value
        assert calculator._determine_segment(35_000_000) == 'medium_value'
        assert calculator._determine_segment(20_000_000) == 'medium_value'
        
        # Test low value
        assert calculator._determine_segment(15_000_000) == 'low_value'
        assert calculator._determine_segment(5_000_000) == 'low_value'

    def test_bin_score(self):
        """Test RFM bin scoring"""
        mock_registry = Mock()
        calculator = CLVCalculator(mock_registry, None)
        
        # Test recency scoring (reverse)
        assert calculator._bin_score(20, RFM_BINS['recency'], reverse=True) == 5
        assert calculator._bin_score(200, RFM_BINS['recency'], reverse=True) == 3
        
        # Test frequency scoring
        assert calculator._bin_score(1, RFM_BINS['frequency']) == 1
        assert calculator._bin_score(15, RFM_BINS['frequency']) == 4
        
        # Test monetary scoring
        assert calculator._bin_score(3_000_000, RFM_BINS['monetary']) == 1
        assert calculator._bin_score(60_000_000, RFM_BINS['monetary']) == 5

    def test_calculate_rfm_scores(self):
        """Test RFM score calculation"""
        mock_registry = Mock()
        calculator = CLVCalculator(mock_registry, None)
        
        historical_data = {
            'days_since_last_booking': 45,
            'total_bookings': 8,
            'total_revenue': 40_000_000
        }
        
        rfm = calculator._calculate_rfm_scores(historical_data)
        
        assert 'recency_score' in rfm
        assert 'frequency_score' in rfm
        assert 'monetary_score' in rfm
        assert 'overall_score' in rfm
        
        assert 1 <= rfm['recency_score'] <= 5
        assert 1 <= rfm['frequency_score'] <= 5
        assert 1 <= rfm['monetary_score'] <= 5
        assert 1 <= rfm['overall_score'] <= 5

    def test_calculate_data_quality_score(self):
        """Test data quality scoring"""
        mock_registry = Mock()
        calculator = CLVCalculator(mock_registry, None)
        
        # High quality data
        high_quality = {
            'total_bookings': 15,
            'days_since_last_booking': 20
        }
        score_high = calculator._calculate_data_quality_score(high_quality)
        assert 0.8 <= score_high <= 1.0
        
        # Low quality data
        low_quality = {
            'total_bookings': 1,
            'days_since_last_booking': 400
        }
        score_low = calculator._calculate_data_quality_score(low_quality)
        assert 0.0 <= score_low <= 0.5

    def test_generate_recommendations(self):
        """Test marketing recommendations generation"""
        mock_registry = Mock()
        calculator = CLVCalculator(mock_registry, None)
        
        clv_result = {'clv': 80_000_000, 'confidence': 0.85}
        
        recommendations = calculator._generate_recommendations(
            clv_result,
            segment='high_value',
            retention_prob=0.75
        )
        
        assert 'max_acquisition_cost' in recommendations
        assert 'loyalty_tier' in recommendations
        assert 'personalized_offers' in recommendations
        assert 'priority_level' in recommendations
        
        # Test acquisition cost is reasonable (20-30% of CLV)
        assert 10_000_000 <= recommendations['max_acquisition_cost'] <= 30_000_000
        assert recommendations['loyalty_tier'] == 'gold'
        assert recommendations['priority_level'] == 'high'

    def test_engineer_features_shape(self):
        """Test feature engineering produces correct shape"""
        mock_registry = Mock()
        calculator = CLVCalculator(mock_registry, None)
        
        historical_data = {
            'total_bookings': 5,
            'completed_bookings': 4,
            'cancelled_bookings': 1,
            'cancellation_rate': 0.2,
            'avg_booking_value': 7_000_000,
            'total_revenue': 28_000_000,
            'days_since_last_booking': 60,
            'avg_days_between_bookings': 90.0,
            'avg_length_of_stay': 3.0,
            'service_usage_rate': 1.5,
            'unique_services_used': 3,
            'first_booking_date': '2024-01-01',
            'last_booking_date': '2024-11-01'
        }
        
        rfm_scores = {
            'recency_score': 4,
            'frequency_score': 3,
            'monetary_score': 3,
            'overall_score': 3.3
        }
        
        features = calculator._engineer_features(historical_data, rfm_scores)
        
        # Should produce (1, 19) shape
        assert features.shape == (1, 19)
        assert not np.isnan(features).any()

    @pytest.mark.asyncio
    async def test_predict_new_guest_clv(self):
        """Test CLV prediction for new guest with no history"""
        mock_registry = Mock()
        calculator = CLVCalculator(mock_registry, None)
        
        response = calculator._predict_new_guest_clv('NEW_GUEST_001', 12)
        
        assert isinstance(response, CLVPredictResponse)
        assert response.guest_id == 'NEW_GUEST_001'
        assert response.time_horizon_months == 12
        assert response.predicted_clv > 0
        assert response.segment == 'low_value'
        assert response.confidence < 0.5  # Low confidence for new guests
        assert response.rfm_scores is None
        assert response.historical_data is None

    @pytest.mark.asyncio
    async def test_predict_clv_with_history(self):
        """Test CLV prediction for guest with booking history"""
        mock_registry = Mock()
        mock_registry.get_model = Mock(return_value=None)  # Use fallback logic
        
        calculator = CLVCalculator(mock_registry, None)
        
        request = CLVPredictRequest(
            guest_id='GUEST_001',
            time_horizon_months=12
        )
        
        response = await calculator.predict_clv(request)
        
        assert isinstance(response, CLVPredictResponse)
        assert response.guest_id == 'GUEST_001'
        assert response.predicted_clv > 0
        assert response.segment in ['vip', 'high_value', 'medium_value', 'low_value']
        assert 0 <= response.confidence <= 1
        assert 0 <= response.retention_probability <= 1
        assert response.breakdown is not None
        assert response.recommended_investment is not None

    @pytest.mark.asyncio
    async def test_predict_clv_batch(self):
        """Test batch CLV prediction"""
        mock_registry = Mock()
        mock_registry.get_model = Mock(return_value=None)
        
        calculator = CLVCalculator(mock_registry, None)
        
        request = CLVBatchPredictRequest(
            guest_ids=['GUEST_001', 'GUEST_002', 'GUEST_003'],
            time_horizon_months=12
        )
        
        response = await calculator.predict_clv_batch(request)
        
        assert response.total_processed > 0
        assert len(response.predictions) <= 3
        assert 'avg_clv' in response.summary
        assert 'segment_counts' in response.summary

    def test_calculate_clv_formula(self):
        """Test CLV formula calculation"""
        mock_registry = Mock()
        calculator = CLVCalculator(mock_registry, None)
        
        predictions = {
            'booking_frequency': 4.0,
            'avg_booking_value': 8_000_000,
            'retention_probability': 0.8,
            'ancillary_revenue': 3_000_000
        }
        
        historical_data = {
            'total_bookings': 5,
            'days_since_last_booking': 30
        }
        
        result = calculator._calculate_clv(predictions, 12, historical_data)
        
        assert 'clv' in result
        assert 'base_revenue' in result
        assert 'confidence' in result
        
        # Verify formula: base_revenue = value * frequency * retention
        expected_base = 8_000_000 * 4.0 * 0.8
        assert abs(result['base_revenue'] - expected_base) < 1000
        
        # Total CLV should be base + ancillary
        expected_clv = expected_base + 3_000_000
        assert abs(result['clv'] - expected_clv) < 1000


class TestCLVSegmentation:
    """Test CLV segmentation thresholds"""

    def test_segment_thresholds(self):
        """Test segment thresholds are properly defined"""
        assert CLV_SEGMENTS['vip'] == 100_000_000
        assert CLV_SEGMENTS['high_value'] == 50_000_000
        assert CLV_SEGMENTS['medium_value'] == 20_000_000
        assert CLV_SEGMENTS['low_value'] == 0


class TestRFMBins:
    """Test RFM bin definitions"""

    def test_rfm_bins_structure(self):
        """Test RFM bins are properly structured"""
        assert 'recency' in RFM_BINS
        assert 'frequency' in RFM_BINS
        assert 'monetary' in RFM_BINS
        
        # Each should have 6 thresholds (5 bins + infinity)
        assert len(RFM_BINS['recency']) == 6
        assert len(RFM_BINS['frequency']) == 6
        assert len(RFM_BINS['monetary']) == 6
        
        # Last threshold should be infinity
        assert RFM_BINS['recency'][-1] == float('inf')
        assert RFM_BINS['frequency'][-1] == float('inf')
        assert RFM_BINS['monetary'][-1] == float('inf')


if __name__ == '__main__':
    pytest.main([__file__, '-v'])
