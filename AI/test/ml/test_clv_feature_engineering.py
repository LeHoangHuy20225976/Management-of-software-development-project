"""
Test CLV Feature Engineering
Unit tests for CLV feature engineering logic
"""
import pytest
import numpy as np
import pandas as pd
from datetime import datetime, timedelta

from src.application.services.ml.clv_feature_engineering import (
    CLVFeatureEngineer,
    get_feature_engineer,
    RFM_BINS
)


class TestCLVFeatureEngineer:
    """Test CLVFeatureEngineer class"""

    def test_feature_engineer_initialization(self):
        """Test feature engineer can be initialized"""
        engineer = CLVFeatureEngineer()
        assert engineer is not None
        assert len(engineer.feature_names) == 19

    def test_feature_engineer_singleton(self):
        """Test get_feature_engineer returns singleton"""
        engineer1 = get_feature_engineer()
        engineer2 = get_feature_engineer()
        assert engineer1 is engineer2

    def test_feature_names_order(self):
        """Test feature names are in correct order"""
        engineer = CLVFeatureEngineer()
        expected_features = [
            'rfm_recency_score',
            'rfm_frequency_score',
            'rfm_monetary_score',
            'rfm_overall_score',
            'total_bookings',
            'completed_bookings',
            'cancellation_rate',
            'avg_booking_value',
            'total_revenue',
            'days_since_last_booking',
            'avg_days_between_bookings',
            'booking_frequency_per_year',
            'avg_length_of_stay',
            'service_usage_rate',
            'unique_services_used',
            'customer_age_days',
            'revenue_per_booking',
            'revenue_growth_rate',
            'booking_regularity',
        ]
        assert engineer.feature_names == expected_features

    def test_engineer_features_from_history(self):
        """Test feature engineering from booking history"""
        engineer = CLVFeatureEngineer()
        
        # Create mock booking history
        base_date = datetime(2024, 1, 1)
        bookings = [
            {
                'booking_date': base_date,
                'checkin_date': base_date + timedelta(days=30),
                'checkout_date': base_date + timedelta(days=33),
                'total_amount': 7_000_000,
                'cancelled': False,
                'services_used': ['spa', 'restaurant']
            },
            {
                'booking_date': base_date + timedelta(days=90),
                'checkin_date': base_date + timedelta(days=120),
                'checkout_date': base_date + timedelta(days=124),
                'total_amount': 8_500_000,
                'cancelled': False,
                'services_used': ['restaurant', 'laundry']
            },
            {
                'booking_date': base_date + timedelta(days=180),
                'checkin_date': base_date + timedelta(days=210),
                'checkout_date': base_date + timedelta(days=214),
                'total_amount': 9_200_000,
                'cancelled': False,
                'services_used': ['spa', 'restaurant', 'gym']
            }
        ]
        
        features = engineer.engineer_features_from_history(bookings)
        
        # Check shape
        assert features.shape == (1, 19)
        
        # Check no NaN values
        assert not np.isnan(features).any()
        
        # Check values are reasonable
        assert features[0, 4] == 3  # total_bookings
        assert features[0, 5] == 3  # completed_bookings
        assert features[0, 6] == 0.0  # cancellation_rate

    def test_engineer_features_with_cancellations(self):
        """Test feature engineering with cancelled bookings"""
        engineer = CLVFeatureEngineer()
        
        bookings = [
            {
                'booking_date': datetime(2024, 1, 1),
                'checkin_date': datetime(2024, 2, 1),
                'checkout_date': datetime(2024, 2, 4),
                'total_amount': 7_000_000,
                'cancelled': False,
                'services_used': ['spa']
            },
            {
                'booking_date': datetime(2024, 3, 1),
                'checkin_date': datetime(2024, 4, 1),
                'checkout_date': datetime(2024, 4, 4),
                'total_amount': 8_000_000,
                'cancelled': True,  # Cancelled
                'services_used': []
            }
        ]
        
        features = engineer.engineer_features_from_history(bookings)
        
        # Check cancellation rate
        assert features[0, 6] == 0.5  # 1 out of 2 cancelled

    def test_calculate_booking_metrics(self):
        """Test booking metrics calculation"""
        engineer = CLVFeatureEngineer()
        
        bookings = [
            {
                'booking_date': datetime(2024, 1, 1),
                'checkin_date': datetime(2024, 2, 1),
                'checkout_date': datetime(2024, 2, 5),
                'total_amount': 10_000_000,
                'cancelled': False,
                'services_used': ['spa', 'restaurant']
            },
            {
                'booking_date': datetime(2024, 3, 1),
                'checkin_date': datetime(2024, 4, 1),
                'checkout_date': datetime(2024, 4, 3),
                'total_amount': 6_000_000,
                'cancelled': False,
                'services_used': ['restaurant']
            }
        ]
        
        metrics = engineer._calculate_booking_metrics(bookings)
        
        assert metrics['total_bookings'] == 2
        assert metrics['completed_bookings'] == 2
        assert metrics['total_revenue'] == 16_000_000
        assert metrics['avg_booking_value'] == 8_000_000
        assert metrics['cancellation_rate'] == 0.0
        assert metrics['avg_length_of_stay'] == 3.0  # (4 + 2) / 2

    def test_calculate_temporal_features(self):
        """Test temporal pattern features"""
        engineer = CLVFeatureEngineer()
        
        bookings = [
            {'booking_date': datetime(2024, 1, 1)},
            {'booking_date': datetime(2024, 4, 1)},  # 90 days later
            {'booking_date': datetime(2024, 7, 1)},  # 90 days later
        ]
        
        temporal = engineer._calculate_temporal_features(bookings)
        
        assert temporal['avg_days_between'] == 90.0
        assert abs(temporal['bookings_per_year'] - 4.055) < 0.1  # 365/90

    def test_calculate_engagement_features(self):
        """Test engagement metrics calculation"""
        engineer = CLVFeatureEngineer()
        
        bookings = [
            {
                'cancelled': False,
                'services_used': ['spa', 'restaurant']
            },
            {
                'cancelled': False,
                'services_used': ['restaurant', 'laundry', 'gym']
            },
            {
                'cancelled': False,
                'services_used': ['spa', 'restaurant']
            }
        ]
        
        engagement = engineer._calculate_engagement_features(bookings)
        
        # Total services: 2 + 3 + 2 = 7, across 3 bookings
        assert engagement['service_usage_rate'] == 7 / 3
        
        # Unique services: spa, restaurant, laundry, gym = 4
        assert engagement['unique_services_count'] == 4

    def test_engineer_features_for_training(self):
        """Test batch feature engineering for training"""
        engineer = CLVFeatureEngineer()
        
        # Create mock training data
        data = []
        for i in range(3):
            for j in range(3):  # 3 bookings per guest
                data.append({
                    'guest_id': f'GUEST_{i:03d}',
                    'booking_date': datetime(2024, 1 + j*3, 1),
                    'checkin_date': datetime(2024, 2 + j*3, 1),
                    'checkout_date': datetime(2024, 2 + j*3, 4),
                    'total_amount': 7_000_000 + (i * 1_000_000),
                    'cancelled': False,
                    'services_used': ['spa', 'restaurant']
                })
        
        df = pd.DataFrame(data)
        features_df = engineer.engineer_features_for_training(df)
        
        # Should have 3 guests
        assert len(features_df) == 3
        
        # Should have all feature columns plus guest_id
        assert len(features_df.columns) == 20  # 19 features + guest_id
        
        # Check guest_ids are present
        assert 'guest_id' in features_df.columns
        assert set(features_df['guest_id']) == {'GUEST_000', 'GUEST_001', 'GUEST_002'}

    def test_bin_score_functionality(self):
        """Test bin scoring mechanism"""
        engineer = CLVFeatureEngineer()
        
        # Test normal scoring (higher = better)
        frequency_bins = [0, 2, 5, 10, 20, float('inf')]
        assert engineer._bin_score(1, frequency_bins) == 1
        assert engineer._bin_score(3, frequency_bins) == 2
        assert engineer._bin_score(7, frequency_bins) == 3
        assert engineer._bin_score(15, frequency_bins) == 4
        assert engineer._bin_score(25, frequency_bins) == 5
        
        # Test reverse scoring (lower = better)
        recency_bins = [0, 30, 90, 180, 365, float('inf')]
        assert engineer._bin_score(15, recency_bins, reverse=True) == 5
        assert engineer._bin_score(60, recency_bins, reverse=True) == 4
        assert engineer._bin_score(150, recency_bins, reverse=True) == 3

    def test_empty_bookings_raises_error(self):
        """Test that empty booking list raises error"""
        engineer = CLVFeatureEngineer()
        
        with pytest.raises(ValueError, match="No booking history"):
            engineer.engineer_features_from_history([])

    def test_single_booking_handling(self):
        """Test feature engineering with single booking"""
        engineer = CLVFeatureEngineer()
        
        bookings = [
            {
                'booking_date': datetime(2024, 1, 1),
                'checkin_date': datetime(2024, 2, 1),
                'checkout_date': datetime(2024, 2, 4),
                'total_amount': 7_000_000,
                'cancelled': False,
                'services_used': ['spa']
            }
        ]
        
        features = engineer.engineer_features_from_history(bookings)
        
        # Should still produce valid features
        assert features.shape == (1, 19)
        assert not np.isnan(features).any()
        
        # Customer age should be 0 for single booking
        assert features[0, 15] == 0  # customer_age_days


class TestRFMBinsValidation:
    """Test RFM bin definitions"""

    def test_rfm_bins_are_sorted(self):
        """Test that RFM bins are in ascending order"""
        for bin_type, bins in RFM_BINS.items():
            for i in range(len(bins) - 1):
                assert bins[i] < bins[i+1], f"{bin_type} bins not sorted"

    def test_rfm_bins_start_at_zero(self):
        """Test that RFM bins start at zero"""
        for bin_type, bins in RFM_BINS.items():
            assert bins[0] == 0, f"{bin_type} bins don't start at 0"


if __name__ == '__main__':
    pytest.main([__file__, '-v'])
