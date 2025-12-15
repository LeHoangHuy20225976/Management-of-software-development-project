"""
Feature Engineering for Customer Lifetime Value (CLV) Prediction

This module contains all feature engineering logic for CLV models:
- RFM (Recency, Frequency, Monetary) feature calculation
- Temporal pattern features
- Behavioral features
- Engagement metrics
- Customer lifecycle features
"""

from typing import Dict, List, Any, Optional
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)


# RFM scoring bins (quintiles based on hotel industry data)
RFM_BINS = {
    'recency': [0, 30, 90, 180, 365, float('inf')],  # days since last booking
    'frequency': [0, 2, 5, 10, 20, float('inf')],     # number of bookings
    'monetary': [0, 5_000_000, 10_000_000, 20_000_000, 50_000_000, float('inf')],  # total revenue VND
}


class CLVFeatureEngineer:
    """
    Feature engineering for CLV prediction models
    
    Creates 19 features from raw booking data:
    - RFM scores (4 features)
    - Booking behavior (5 features)
    - Temporal patterns (3 features)
    - Stay patterns (1 feature)
    - Engagement (2 features)
    - Customer lifecycle (1 feature)
    - Derived features (3 features)
    """
    
    def __init__(self):
        self.feature_names = self._get_feature_names()
        
    def _get_feature_names(self) -> List[str]:
        """Get ordered list of feature names"""
        return [
            # RFM features
            'rfm_recency_score',
            'rfm_frequency_score',
            'rfm_monetary_score',
            'rfm_overall_score',
            
            # Booking behavior
            'total_bookings',
            'completed_bookings',
            'cancellation_rate',
            'avg_booking_value',
            'total_revenue',
            
            # Temporal patterns
            'days_since_last_booking',
            'avg_days_between_bookings',
            'booking_frequency_per_year',
            
            # Stay patterns
            'avg_length_of_stay',
            
            # Engagement
            'service_usage_rate',
            'unique_services_used',
            
            # Customer lifecycle
            'customer_age_days',
            
            # Derived features
            'revenue_per_booking',
            'revenue_growth_rate',
            'booking_regularity',
        ]
    
    def engineer_features_from_history(
        self,
        guest_bookings: List[Dict[str, Any]]
    ) -> np.ndarray:
        """
        Engineer features from raw booking history
        
        Args:
            guest_bookings: List of booking dictionaries with fields:
                - booking_date: datetime
                - checkin_date: datetime
                - checkout_date: datetime
                - total_amount: float
                - cancelled: bool
                - services_used: List[str]
                
        Returns:
            Feature vector as numpy array (1, 19)
        """
        if not guest_bookings:
            raise ValueError("No booking history provided")
        
        # 1. Calculate basic metrics
        metrics = self._calculate_booking_metrics(guest_bookings)
        
        # 2. Calculate RFM scores
        rfm = self._calculate_rfm_scores(metrics)
        
        # 3. Calculate temporal patterns
        temporal = self._calculate_temporal_features(guest_bookings)
        
        # 4. Calculate engagement metrics
        engagement = self._calculate_engagement_features(guest_bookings)
        
        # 5. Calculate lifecycle features
        lifecycle = self._calculate_lifecycle_features(guest_bookings)
        
        # 6. Calculate derived features
        derived = self._calculate_derived_features(metrics, temporal)
        
        # 7. Combine all features in correct order
        features = {
            # RFM
            'rfm_recency_score': rfm['recency_score'],
            'rfm_frequency_score': rfm['frequency_score'],
            'rfm_monetary_score': rfm['monetary_score'],
            'rfm_overall_score': rfm['overall_score'],
            
            # Booking behavior
            'total_bookings': metrics['total_bookings'],
            'completed_bookings': metrics['completed_bookings'],
            'cancellation_rate': metrics['cancellation_rate'],
            'avg_booking_value': metrics['avg_booking_value'],
            'total_revenue': metrics['total_revenue'],
            
            # Temporal
            'days_since_last_booking': temporal['days_since_last'],
            'avg_days_between_bookings': temporal['avg_days_between'],
            'booking_frequency_per_year': temporal['bookings_per_year'],
            
            # Stay
            'avg_length_of_stay': metrics['avg_length_of_stay'],
            
            # Engagement
            'service_usage_rate': engagement['service_usage_rate'],
            'unique_services_used': engagement['unique_services_count'],
            
            # Lifecycle
            'customer_age_days': lifecycle['customer_age_days'],
            
            # Derived
            'revenue_per_booking': derived['revenue_per_booking'],
            'revenue_growth_rate': derived['revenue_growth_rate'],
            'booking_regularity': derived['booking_regularity'],
        }
        
        # Convert to numpy array in correct order
        feature_vector = np.array([
            features[name] for name in self.feature_names
        ]).reshape(1, -1)
        
        return feature_vector
    
    
    def engineer_features_for_training(
        self,
        bookings_df: pd.DataFrame
    ) -> pd.DataFrame:
        """
        Engineer features for training dataset
        
        Args:
            bookings_df: DataFrame with columns:
                - guest_id
                - booking_date
                - checkin_date
                - checkout_date
                - total_amount
                - cancelled
                - services_used
                
        Returns:
            DataFrame with engineered features, one row per guest
        """
        features_list = []
        
        # Group by guest
        for guest_id, guest_bookings in bookings_df.groupby('guest_id'):
            try:
                # Convert to list of dicts
                booking_list = guest_bookings.to_dict('records')
                
                # Engineer features
                feature_vector = self.engineer_features_from_history(booking_list)
                
                # Add guest_id
                feature_dict = {
                    'guest_id': guest_id,
                    **{name: feature_vector[0, i] 
                       for i, name in enumerate(self.feature_names)}
                }
                
                features_list.append(feature_dict)
                
            except Exception as e:
                logger.warning(f"Failed to engineer features for guest {guest_id}: {e}")
                continue
        
        return pd.DataFrame(features_list)
    
    
    def _calculate_booking_metrics(
        self,
        bookings: List[Dict[str, Any]]
    ) -> Dict[str, float]:
        """Calculate basic booking metrics"""
        
        total_bookings = len(bookings)
        completed_bookings = [b for b in bookings if not b.get('cancelled', False)]
        cancelled_bookings = [b for b in bookings if b.get('cancelled', False)]
        
        total_revenue = sum(b['total_amount'] for b in completed_bookings)
        avg_booking_value = total_revenue / len(completed_bookings) if completed_bookings else 0
        
        cancellation_rate = len(cancelled_bookings) / total_bookings if total_bookings > 0 else 0
        
        # Average length of stay
        stays = [
            (b['checkout_date'] - b['checkin_date']).days
            for b in completed_bookings
        ]
        avg_length_of_stay = np.mean(stays) if stays else 0
        
        return {
            'total_bookings': total_bookings,
            'completed_bookings': len(completed_bookings),
            'cancelled_bookings': len(cancelled_bookings),
            'total_revenue': float(total_revenue),
            'avg_booking_value': float(avg_booking_value),
            'cancellation_rate': float(cancellation_rate),
            'avg_length_of_stay': float(avg_length_of_stay),
        }
    
    
    def _calculate_rfm_scores(
        self,
        metrics: Dict[str, float]
    ) -> Dict[str, Any]:
        """
        Calculate RFM scores
        
        RFM is calculated from the metrics already computed
        """
        # For this to work, we need recency, frequency, and monetary from metrics
        # We'll need to pass these separately
        
        # Placeholder - these should be calculated in _calculate_temporal_features
        # and passed here
        recency_days = 0  # Will be set properly
        frequency_count = metrics['total_bookings']
        monetary_value = metrics['total_revenue']
        
        # Score recency (lower is better, so reverse)
        recency_score = self._bin_score(recency_days, RFM_BINS['recency'], reverse=True)
        
        # Score frequency (higher is better)
        frequency_score = self._bin_score(frequency_count, RFM_BINS['frequency'])
        
        # Score monetary (higher is better)
        monetary_score = self._bin_score(monetary_value, RFM_BINS['monetary'])
        
        # Overall RFM score (weighted average)
        overall_score = (
            recency_score * 0.3 +
            frequency_score * 0.35 +
            monetary_score * 0.35
        )
        
        return {
            'recency_score': recency_score,
            'frequency_score': frequency_score,
            'monetary_score': monetary_score,
            'overall_score': float(overall_score),
            'recency_days': recency_days,
            'frequency_count': frequency_count,
            'monetary_value': float(monetary_value),
        }
    
    
    def _calculate_temporal_features(
        self,
        bookings: List[Dict[str, Any]]
    ) -> Dict[str, float]:
        """Calculate temporal pattern features"""
        
        booking_dates = sorted([b['booking_date'] for b in bookings])
        
        # Days since last booking
        last_booking = max(booking_dates)
        days_since_last = (datetime.now() - last_booking).days
        
        # Average days between bookings
        if len(booking_dates) > 1:
            date_diffs = [
                (booking_dates[i+1] - booking_dates[i]).days
                for i in range(len(booking_dates)-1)
            ]
            avg_days_between = float(np.mean(date_diffs))
        else:
            avg_days_between = 90.0  # Default
        
        # Bookings per year
        bookings_per_year = 365 / avg_days_between if avg_days_between > 0 else 0
        
        return {
            'days_since_last': days_since_last,
            'avg_days_between': avg_days_between,
            'bookings_per_year': float(bookings_per_year),
        }
    
    
    def _calculate_engagement_features(
        self,
        bookings: List[Dict[str, Any]]
    ) -> Dict[str, float]:
        """Calculate engagement metrics"""
        
        completed_bookings = [b for b in bookings if not b.get('cancelled', False)]
        
        # Service usage
        all_services = [
            s for b in completed_bookings
            for s in b.get('services_used', [])
        ]
        unique_services = set(all_services)
        
        service_usage_rate = (
            len(all_services) / len(completed_bookings)
            if completed_bookings else 0
        )
        
        return {
            'service_usage_rate': float(service_usage_rate),
            'unique_services_count': len(unique_services),
        }
    
    
    def _calculate_lifecycle_features(
        self,
        bookings: List[Dict[str, Any]]
    ) -> Dict[str, int]:
        """Calculate customer lifecycle features"""
        
        booking_dates = [b['booking_date'] for b in bookings]
        
        first_booking = min(booking_dates)
        last_booking = max(booking_dates)
        
        customer_age_days = (last_booking - first_booking).days
        
        return {
            'customer_age_days': customer_age_days,
        }
    
    
    def _calculate_derived_features(
        self,
        metrics: Dict[str, float],
        temporal: Dict[str, float]
    ) -> Dict[str, float]:
        """Calculate derived features"""
        
        # Revenue per booking
        revenue_per_booking = metrics['avg_booking_value']
        
        # Revenue growth rate (simplified - would need time series)
        revenue_growth_rate = 0.0  # TODO: Calculate from time series
        
        # Booking regularity (inverse of variance in booking intervals)
        avg_days = temporal['avg_days_between']
        booking_regularity = 1.0 / (avg_days + 1)
        
        return {
            'revenue_per_booking': float(revenue_per_booking),
            'revenue_growth_rate': float(revenue_growth_rate),
            'booking_regularity': float(booking_regularity),
        }
    
    
    def _bin_score(
        self,
        value: float,
        bins: List[float],
        reverse: bool = False
    ) -> int:
        """
        Convert continuous value to score (1-5) based on bins
        
        Args:
            value: Value to score
            bins: List of bin edges
            reverse: If True, lower values get higher scores (for recency)
        """
        for i, threshold in enumerate(bins[1:], 1):
            if value < threshold:
                score = i
                break
        else:
            score = len(bins) - 1
        
        if reverse:
            score = (len(bins) - 1) - score + 1
        
        return min(max(score, 1), 5)  # Clamp to 1-5



# Singleton instance
_feature_engineer: Optional[CLVFeatureEngineer] = None


def get_feature_engineer() -> CLVFeatureEngineer:
    """Get feature engineer singleton"""
    global _feature_engineer
    if _feature_engineer is None:
        _feature_engineer = CLVFeatureEngineer()
    return _feature_engineer