from typing import Dict, Any, List
import numpy as np
from datetime import datetime

CHURN_FEATURES = [
    # Booking characteristics
    'booking_lead_time_days',
    'total_amount', 
    'length_of_stay', 
    'room_type_encoded', 
    'payment_method_encoded',
    'booking_source_encoded', 

    # Guest history
    'is_first_booking', 
    'previous_bookings_count',
    'previous_cancellations_count',
    'cancellation_rate',
    'avg_previous_booking_value',
    'days_since_last_booking'

    # Engagement
    'special_requests_count',
    'booking_modifications_count',
    'loyalty_tier_encoded', 
    'loyalty_points_balance', 

    # Behavioral
    'time_spent_on_website_minutes', 
    'pages_viewed', 
    'price_comparison_searches', 

    # Temporal
    'days_until_checkin',
    'booking_dow',
    'booking_hour',
    'season_encoded', 

    # Price sensitivity
    'price_vs_avg_ratio',
    'discount_applied',
]


class ChurnFeatureEncoder:
    """ Encode categorical features for churn prediction """

    # Encoding mappings 
    ROOM_TYPE_ENCODING = {
        'standard': 0, 
        'deluxe': 1, 
        'suite': 2, 
        'presidential': 3,
    }

    PAYMENT_METHOD_ENCODING = {
        'cash': 0, 
        'debit_card': 1, 
        'bank_transfer': 2, 
        'credit_card': 3,
    }

    BOOKING_SOURCE_ENCODING = {
        'direct': 0, 
        'website': 1,
        'mobile_app': 2,
        'ota': 3, # Online Travel Agency
        'agency': 4, 
    }

    LOYALTY_TIER_ENCODING = {
        'none': 0, 
        'silver': 1, 
        'gold': 2, 
        'platinum': 3, 
    }

    SEASON_ENCODING = {
        'low': 0,   
        'normal': 1, 
        'peak': 2, 
    }

    @classmethod
    def encode_features(cls, features: Dict[str, Any]) -> np.ndarray:
        """
        Convert raw features to model-ready numpy array
        
        Args:
            features: Dictionary of raw feature values
            
        Returns:
            numpy array of encoded features
        """

        encoded = []

        # Booking characteristics
        encoded.append(features.get('booking_lead_time_days', 0))
        encoded.append(features.get('total_amount', 0) / 1_000_000)  # Normalize to millions VND
        encoded.append(features.get('length_of_stay', 1))
        encoded.append(cls.ROOM_TYPE_ENCODING.get(features.get('room_type', 'standard').lower(), 0))
        encoded.append(cls.PAYMENT_METHOD_ENCODING.get(features.get('payment_method', 'cash').lower(), 0))
        encoded.append(cls.BOOKING_SOURCE_ENCODING.get(features.get('booking_source', 'direct').lower(), 0))
        
        # Guest history
        encoded.append(1 if features.get('is_first_booking', True) else 0)
        encoded.append(features.get('previous_bookings_count', 0))
        encoded.append(features.get('previous_cancellations_count', 0))
        encoded.append(features.get('cancellation_rate', 0.0))
        encoded.append(features.get('avg_previous_booking_value', 0) / 1_000_000)
        encoded.append(features.get('days_since_last_booking', 365) or 365)  # Default to 1 year
        
        # Engagement
        encoded.append(features.get('special_requests', features.get('special_requests_count', 0)))
        encoded.append(features.get('booking_modifications', features.get('booking_modifications_count', 0)))
        encoded.append(cls.LOYALTY_TIER_ENCODING.get(features.get('loyalty_tier', 'none').lower(), 0))
        encoded.append(features.get('loyalty_points_balance', 0) / 1000)  # Normalize
        
        # Behavioral
        encoded.append(features.get('time_spent_on_website_minutes', 0))
        encoded.append(features.get('pages_viewed', 0))
        encoded.append(features.get('price_comparison_searches', 0))
        
        # Temporal
        encoded.append(features.get('days_until_checkin', 0))
        encoded.append(features.get('booking_dow', 0))
        encoded.append(features.get('booking_hour', 12))
        encoded.append(cls.SEASON_ENCODING.get(features.get('season', 'normal').lower(), 1))
        
        # Price sensitivity
        encoded.append(features.get('price_vs_avg_ratio', 1.0))
        encoded.append(1 if features.get('discount_applied', False) else 0)
        
        return np.array(encoded, dtype=np.float32)
    
    @classmethod
    def get_feature_names(cls) -> List[str]:
        """ Get ordered list of feature names """
        return CHURN_FEATURES
