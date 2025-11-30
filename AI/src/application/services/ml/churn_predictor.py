"""
Uses LightGBM for prediction with AUC > 0.75 target
"""

from typing import Dict, Any, List, Optional, Tuple, cast, Literal
import numpy as np 
from datetime import datetime 
import logging

from src.application.dtos.ml.churn_dto import (
    ChurnFeatures, 
    ChurnPredictResponse, 
    RiskFactor, 
    RecommendedAction, 
    BatchPrediction, 
)
from src.application.services.ml.feature_engineering import ChurnFeatureEncoder

logger = logging.getLogger(__name__)

# Risk thresholds 
RISK_THRESHOLDS = {
    'low': 0.3,  # probability < 0.3
    'medium': 0.6, 
    'high': 1.0, 
}

# Feature importance for explanation (from trained model)
FEATURE_IMPORTANCE = { 
    'booking_lead_time_days': 0.15,
    'days_until_checkin': 0.12,
    'is_first_booking': 0.10,
    'cancellation_rate': 0.10,
    'price_vs_avg_ratio': 0.08,
    'loyalty_tier_encoded': 0.08,
    'payment_method_encoded': 0.07,
    'booking_source_encoded': 0.06,
    'booking_modifications_count': 0.05,
    'special_requests_count': 0.05,
    'previous_bookings_count': 0.05,
    'total_amount': 0.04,
    'discount_applied': 0.03,
    'length_of_stay': 0.02,
}

class ChurnPredictor:
    """
    Churn prediction service using LightGBM
    
    Model Configuration (from docs):
    - objective: binary
    - metric: auc
    - boosting_type: gbdt
    - num_leaves: 31
    - learning_rate: 0.05
    - n_estimators: 500
    """

    def __init__(self, model=None):
        """ 
        Initialize churn predictor

        Args:
            model: Pre-trained LightGBM model (optional)
        """

        self.model = model
        self.model_version = "churn_v1.8"
        self.feature_encoder = ChurnFeatureEncoder()
    
    def predict(self, features: ChurnFeatures) -> Tuple[float, float]:
        """ 
        Predict churn probability for a single booking

        Args: 
            features: ChurnFeatures object containing booking features
        
        Returns: 
            Tuple of (churn_probability, confidence)
        """

        # Encode features
        feature_dict = features.model_dump()
        encoded_features = self.feature_encoder.encode_features(feature_dict) 

        if self.model is not None: 
            proba = self.model.predict_proba(encoded_features.reshape(1, -1))[0, 1]
            confidence = self._calculate_confidence(encoded_features)
        else: 
            proba, confidence = self._mock_predict(feature_dict, encoded_features)
        
        return float(proba), float(confidence) 

    def _mock_predict(self, features: Dict, encoded: np.ndarray) -> Tuple[float, float]:
        """
        Mock prediction when no model is loaded
        Uses heuristic rules based on domain knowledge
        """
        base_prob = 0.2 

        # Lead time impact (longer lead time = higher churn)
        lead_time = features.get('booking_lead_time_days', 0)
        if lead_time > 60:
            base_prob += 0.15
        elif lead_time > 30:
            base_prob += 0.08
        elif lead_time > 14:
            base_prob += 0.03
            
        # First booking impact
        if features.get('is_first_booking', True):
            base_prob += 0.10
            
        # Historical cancellation rate
        cancel_rate = features.get('cancellation_rate', 0)
        base_prob += cancel_rate * 0.3

        # Loyalty tier (reduces churn)
        loyalty = features.get('loyalty_tier', 'none').lower()
        loyalty_discount = {'none': 0, 'silver': 0.05, 'gold': 0.10, 'platinum': 0.15}
        base_prob -= loyalty_discount.get(loyalty, 0)
        
        # Payment method (credit card = more committed)
        if features.get('payment_method', '').lower() == 'credit_card':
            base_prob -= 0.05
            
        # Price sensitivity
        price_ratio = features.get('price_vs_avg_ratio', 1.0)
        if price_ratio > 1.3:
            base_prob += 0.10
        elif price_ratio > 1.1:
            base_prob += 0.05
            
        # Modifications increase churn
        mods = features.get('booking_modifications', 0)
        base_prob += min(mods * 0.05, 0.15)
    
        # Clamp probability
        churn_prob = max(0.0, min(1.0, base_prob))
        
        # Confidence based on data completeness
        confidence = self._calculate_mock_confidence(features)
        
        return churn_prob, confidence

    def _calculate_confidence(self, features: np.ndarray) -> float:
        """Calculate prediction confidence"""
        # In production, this would use model uncertainty estimation
        # For now, use a simple heuristic
        non_zero_features = np.count_nonzero(features)
        total_features = len(features)
        return min(0.95, 0.70 + (non_zero_features / total_features) * 0.25)
    
    def _calculate_mock_confidence(self, features: Dict) -> float:
        """Calculate confidence for mock predictions"""
        # Check how many features are provided
        important_features = [
            'booking_lead_time_days', 'days_until_checkin', 'previous_bookings_count',
            'loyalty_tier', 'payment_method', 'total_amount'
        ]
        provided = sum(1 for f in important_features if features.get(f) is not None)
        return 0.70 + (provided / len(important_features)) * 0.25
    
    def get_risk_level(self, probability: float) -> str:
        """Convert probability to risk level"""
        if probability < RISK_THRESHOLDS['low']:
            return 'low'
        elif probability < RISK_THRESHOLDS['medium']:
            return 'medium'
        else:
            return 'high'
    
    def analyze_risk_factors(
        self, 
        features: ChurnFeatures
    ) -> Tuple[List[RiskFactor], List[RiskFactor]]:
        """
        Analyze risk and protective factors
        
        Returns:
            Tuple of (risk_factors, protective_factors)
        """
        feature_dict = features.model_dump()
        risk_factors = []
        protective_factors = []
        
        # Lead time analysis
        lead_time = feature_dict.get('booking_lead_time_days', 0)
        if lead_time > 30:
            risk_factors.append(RiskFactor(
                factor='long_lead_time',
                impact_score=0.15 if lead_time > 60 else 0.08,
                description=f"Bookings made {lead_time}+ days in advance have higher cancellation rates"
            ))
        elif lead_time < 7:
            protective_factors.append(RiskFactor(
                factor='short_lead_time',
                impact_score=-0.10,
                description="Short booking window indicates urgency and commitment"
            ))
            
        # First booking analysis
        if feature_dict.get('is_first_booking', True):
            risk_factors.append(RiskFactor(
                factor='first_time_guest',
                impact_score=0.10,
                description="First-time guests have higher cancellation rates"
            ))
        else:
            prev_bookings = feature_dict.get('previous_bookings_count', 0)
            if prev_bookings > 3:
                protective_factors.append(RiskFactor(
                    factor='repeat_guest',
                    impact_score=-0.10,
                    description=f"Guest has completed {prev_bookings} previous stays"
                ))
        
        # Historical cancellation rate
        cancel_rate = feature_dict.get('cancellation_rate', 0)
        if cancel_rate > 0.3:
            risk_factors.append(RiskFactor(
                factor='high_historical_cancellation',
                impact_score=cancel_rate * 0.3,
                description=f"Guest has {cancel_rate*100:.0f}% historical cancellation rate"
            ))
            
        # Loyalty tier analysis
        loyalty = feature_dict.get('loyalty_tier', 'none').lower()
        if loyalty in ['gold', 'platinum']:
            protective_factors.append(RiskFactor(
                factor='loyalty_member',
                impact_score=-0.08 if loyalty == 'gold' else -0.12,
                description=f"{loyalty.capitalize()} member status indicates commitment"
            ))
        elif loyalty == 'none':
            risk_factors.append(RiskFactor(
                factor='no_loyalty_membership',
                impact_score=0.05,
                description="Non-loyalty member has less commitment"
            ))
        
        # Payment method
        payment = feature_dict.get('payment_method', '').lower()
        if payment == 'credit_card':
            protective_factors.append(RiskFactor(
                factor='credit_card_payment',
                impact_score=-0.05,
                description="Credit card payment indicates commitment"
            ))
        elif payment == 'cash':
            risk_factors.append(RiskFactor(
                factor='cash_payment',
                impact_score=0.05,
                description="Cash payment has no financial commitment"
            ))
            
        # Price sensitivity
        price_ratio = feature_dict.get('price_vs_avg_ratio', 1.0)
        if price_ratio > 1.2:
            risk_factors.append(RiskFactor(
                factor='price_sensitivity',
                impact_score=0.12,
                description="Price point above guest's typical spending"
            ))
        elif price_ratio < 0.9:
            protective_factors.append(RiskFactor(
                factor='good_value',
                impact_score=-0.05,
                description="Booking price is below typical spending"
            ))
            
        # Modifications
        mods = feature_dict.get('booking_modifications', 0)
        if mods > 2:
            risk_factors.append(RiskFactor(
                factor='multiple_modifications',
                impact_score=min(mods * 0.05, 0.15),
                description=f"Booking has been modified {mods} times"
            ))
            
        return risk_factors, protective_factors
    
    def generate_recommendations(
        self,
        probability: float,
        risk_level: str,
        features: ChurnFeatures,
        risk_factors: List[RiskFactor]
    ) -> List[RecommendedAction]:
        """Generate actionable recommendations to reduce churn"""
        recommendations = []
        feature_dict = features.model_dump()
        
        # Always recommend confirmation for medium+ risk
        if risk_level in ['medium', 'high']:
            recommendations.append(RecommendedAction(
                action='send_confirmation_email',
                priority='high',
                timing='immediate',
                expected_impact=0.05
            ))
        
        # Lead time specific recommendations
        lead_time = feature_dict.get('booking_lead_time_days', 0)
        days_until = feature_dict.get('days_until_checkin', 0)
        
        if lead_time > 30 and days_until > 7:
            recommendations.append(RecommendedAction(
                action='send_reminder_communications',
                priority='medium',
                timing='weekly_until_checkin',
                expected_impact=0.03
            ))
        
        # Loyalty member recommendations
        loyalty = feature_dict.get('loyalty_tier', 'none').lower()
        if loyalty in ['gold', 'platinum']:
            # Check if benefits applied
            if not feature_dict.get('discount_applied', False):
                recommendations.append(RecommendedAction(
                    action='apply_loyalty_discount',
                    priority='high',
                    timing='immediate',
                    expected_impact=0.12,
                    details={
                        'discount_percentage': 10 if loyalty == 'gold' else 15,
                        'estimated_cost': int(feature_dict.get('total_amount', 0) * 0.10)
                    }
                ))
        
        # High risk specific recommendations
        if risk_level == 'high':
            recommendations.append(RecommendedAction(
                action='personal_outreach',
                priority='high',
                timing='within_24_hours',
                expected_impact=0.10
            ))
            
            recommendations.append(RecommendedAction(
                action='offer_flexible_cancellation',
                priority='medium',
                timing='7_days_before',
                expected_impact=0.08
            ))
        
        # First-time guest recommendations
        if feature_dict.get('is_first_booking', True):
            recommendations.append(RecommendedAction(
                action='send_welcome_package',
                priority='medium',
                timing='after_booking',
                expected_impact=0.05
            ))
            
        # Sort by priority and expected impact
        priority_order = {'high': 0, 'medium': 1, 'low': 2}
        recommendations.sort(key=lambda x: (priority_order[x.priority], -x.expected_impact))
        
        return recommendations[:5]  # Return top 5 recommendations
    
    async def predict_single(
        self,
        booking_id: str,
        guest_id: str,
        features: ChurnFeatures
    ) -> ChurnPredictResponse:
        """
        Complete prediction pipeline for single booking
        """
        # Get prediction
        probability, confidence = self.predict(features)
        risk_level = cast(Literal['low', 'medium', 'high'], self.get_risk_level(probability))
        
        # Analyze factors
        risk_factors, protective_factors = self.analyze_risk_factors(features)
        
        # Generate recommendations
        recommendations = self.generate_recommendations(
            probability, risk_level, features, risk_factors
        )
        return ChurnPredictResponse(
            booking_id=booking_id,
            guest_id=guest_id,
            churn_probability=round(probability, 4),
            risk_level=risk_level,
            confidence=round(confidence, 4),
            risk_factors=risk_factors,
            protective_factors=protective_factors,
            recommended_actions=recommendations,
            model_version=self.model_version,
            predicted_at=datetime.utcnow()
        )

    async def predict_batch(
        self,
        bookings: List[Dict[str, Any]]
    ) -> List[BatchPrediction]:
        """
        Batch prediction for multiple bookings
        
        Args:
            bookings: List of booking dictionaries with features
        """
        predictions = []
        
        for booking in bookings:
            features = ChurnFeatures(**booking.get('features', {}))
            probability, _ = self.predict(features)
            risk_level = cast(Literal['low', 'medium', 'high'], self.get_risk_level(probability))
            
            predictions.append(BatchPrediction(
                booking_id=booking['booking_id'],
                churn_probability=round(probability, 4),
                risk_level=risk_level
            ))
            
        return predictions

# Singleton instance
_predictor: Optional[ChurnPredictor] = None


def get_churn_predictor() -> ChurnPredictor:
    """Get or create churn predictor instance"""
    global _predictor
    if _predictor is None:
        _predictor = ChurnPredictor()
    return _predictor