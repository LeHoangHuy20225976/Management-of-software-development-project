"""
Customer Lifetime Value (CLV) Calculator Service

Uses three XGBoost models:
1. Booking Frequency Model - Predicts number of future bookings
2. Booking Value Model - Predicts average booking value
3. Retention Model - Predicts probability of customer retention

CLV Formula:
CLV = (Avg Booking Value) × (Bookings per Period) × (Retention Rate) × (Time Horizon)
"""

from typing import Dict, Any, Optional, Literal, Tuple
import numpy as np
from datetime import datetime, timedelta
import logging

from src.application.dtos.ml.clv_dto import (
    CLVPredictRequest,
    CLVPredictResponse,
    CLVBreakdown,
    HistoricalData,
    RecommendedInvestment,
    RFMScores,
    CLVBatchPredictRequest,
    CLVBatchPredictResponse,
    CLVBatchPrediction,
)

logger = logging.getLogger(__name__)

# Guest segmentation thresholds based on CLV
CLV_SEGMENTS = {
    'vip': 100_000_000,      # >= 100M VND
    'high_value': 50_000_000, # >= 50M VND
    'medium_value': 20_000_000, # >= 20M VND
    'low_value': 0,           # < 20M VND
}

# RFM scoring bins (quintiles)
RFM_BINS = {
    'recency': [0, 30, 90, 180, 365, float('inf')],  # days
    'frequency': [0, 2, 5, 10, 20, float('inf')],     # bookings
    'monetary': [0, 5_000_000, 10_000_000, 20_000_000, 50_000_000, float('inf')],  # VND
}


class CLVCalculator:
    """
    Customer Lifetime Value prediction service
    
    Uses ensemble of three XGBoost models for comprehensive prediction
    """
    
    def __init__(self, model_registry, config):
        """
        Initialize CLV calculator with trained models
        
        Args:
            model_registry: Model registry instance
            config: Service configuration
        """
        self.config = config
        self.model_registry = model_registry
        
        # Load three specialized models
        self.booking_frequency_model = None
        self.booking_value_model = None
        self.retention_model = None
        
        self._load_models()
        
    def _load_models(self):
        """Load all three CLV prediction models"""
        try:
            self.booking_frequency_model = self.model_registry.get_model(
                'clv_booking_frequency'
            )
            logger.info("Loaded booking frequency model")
        except Exception as e:
            logger.warning(f"Booking frequency model not loaded: {e}")
            
        try:
            self.booking_value_model = self.model_registry.get_model(
                'clv_booking_value'
            )
            logger.info("Loaded booking value model")
        except Exception as e:
            logger.warning(f"Booking value model not loaded: {e}")
            
        try:
            self.retention_model = self.model_registry.get_model(
                'clv_retention'
            )
            logger.info("Loaded retention model")
        except Exception as e:
            logger.warning(f"Retention model not loaded: {e}")


    async def predict_clv(
        self, 
        request: CLVPredictRequest
    ) -> CLVPredictResponse:
        """
        Predict customer lifetime value
        
        Args:
            request: CLV prediction request
            
        Returns:
            CLVPredictResponse with predictions and breakdown
        """
        guest_id = request.guest_id
        time_horizon_months = request.time_horizon_months
        
        # 1. Load guest historical data
        historical_data = await self._load_guest_history(guest_id)
        
        if not historical_data['has_history']:
            # New guest - return baseline prediction
            return self._predict_new_guest_clv(guest_id, time_horizon_months)
        
        # 2. Calculate RFM scores
        rfm_scores = self._calculate_rfm_scores(historical_data)
        
        # 3. Engineer features for prediction
        features = self._engineer_features(historical_data, rfm_scores)
        
        # 4. Run three predictive models
        predictions = await self._run_prediction_models(
            features, 
            time_horizon_months
        )
        
        # 5. Calculate final CLV
        clv_result = self._calculate_clv(
            predictions,
            time_horizon_months,
            historical_data
        )
        
        # 6. Determine customer segment
        segment = self._determine_segment(clv_result['clv'])
        
        # 7. Generate recommendations
        recommendations = self._generate_recommendations(
            clv_result,
            segment,
            predictions['retention_probability']
        )
        
        # 8. Build response
        response = CLVPredictResponse(
            guest_id=guest_id,
            predicted_clv=clv_result['clv'],
            time_horizon_months=time_horizon_months,
            currency="VND",
            confidence=clv_result['confidence'],
            breakdown=CLVBreakdown(
                predicted_bookings=predictions['booking_frequency'],
                avg_booking_value=predictions['avg_booking_value'],
                predicted_ancillary_revenue=predictions['ancillary_revenue'],
                base_revenue=clv_result['base_revenue'],
                total_revenue=clv_result['clv']
            ),
            segment=segment,
            retention_probability=predictions['retention_probability'],
            churn_risk=1 - predictions['retention_probability'],
            rfm_scores=RFMScores(
                recency_score=rfm_scores['recency_score'],
                frequency_score=rfm_scores['frequency_score'],
                monetary_score=rfm_scores['monetary_score'],
                overall_score=rfm_scores['overall_score'],
                recency_days=rfm_scores['recency_days'],
                frequency_count=rfm_scores['frequency_count'],
                monetary_value=rfm_scores['monetary_value']
            ),
            recommended_investment=RecommendedInvestment(
                max_acquisition_cost=recommendations['max_acquisition_cost'],
                loyalty_program_tier=recommendations['loyalty_tier'],
                personalized_offers=recommendations['personalized_offers'],
                priority_level=recommendations['priority_level']
            ),
            historical_data=HistoricalData(
                total_bookings=historical_data['total_bookings'],
                total_revenue=historical_data['total_revenue'],
                avg_booking_value=historical_data['avg_booking_value'],
                first_booking_date=historical_data['first_booking_date'],
                last_booking_date=historical_data['last_booking_date'],
                booking_frequency_days=historical_data['avg_days_between_bookings'],
                cancellation_rate=historical_data['cancellation_rate'],
                avg_length_of_stay=historical_data['avg_length_of_stay']
            ),
            model_version="clv_v1.5",
            predicted_at=datetime.utcnow()
        )
        
        return response


    async def predict_clv_batch(
        self,
        request: CLVBatchPredictRequest
    ) -> CLVBatchPredictResponse:
        """
        Predict CLV for multiple guests
        
        Args:
            request: Batch prediction request
            
        Returns:
            CLVBatchPredictResponse with all predictions
        """
        predictions = []
        
        for guest_id in request.guest_ids:
            try:
                single_request = CLVPredictRequest(
                    guest_id=guest_id,
                    time_horizon_months=request.time_horizon_months
                )
                result = await self.predict_clv(single_request)
                
                predictions.append(CLVBatchPrediction(
                    guest_id=result.guest_id,
                    predicted_clv=result.predicted_clv,
                    segment=result.segment,
                    retention_probability=result.retention_probability,
                    confidence=result.confidence
                ))
            except Exception as e:
                logger.error(f"Failed to predict CLV for guest {guest_id}: {e}")
                continue
        
        # Calculate summary statistics
        if predictions:
            summary = {
                'avg_clv': np.mean([p.predicted_clv for p in predictions]),
                'total_clv': np.sum([p.predicted_clv for p in predictions]),
                'avg_retention': np.mean([p.retention_probability for p in predictions]),
                'segment_counts': {
                    'vip': sum(1 for p in predictions if p.segment == 'vip'),
                    'high_value': sum(1 for p in predictions if p.segment == 'high_value'),
                    'medium_value': sum(1 for p in predictions if p.segment == 'medium_value'),
                    'low_value': sum(1 for p in predictions if p.segment == 'low_value'),
                }
            }
        else:
            summary = {}
        
        return CLVBatchPredictResponse(
            predictions=predictions,
            total_processed=len(predictions),
            summary=summary,
            model_version="clv_v1.5",
            predicted_at=datetime.utcnow()
        )


    async def _load_guest_history(self, guest_id: str) -> Dict[str, Any]:
        """
        Load complete guest booking history
        
        Returns:
            Dict with historical metrics and bookings
        """
        # TODO: Replace with actual database queries
        # This is a mock implementation
        
        # Mock data for demonstration
        mock_bookings = [
            {
                'booking_date': datetime(2024, 1, 15),
                'checkin_date': datetime(2024, 2, 1),
                'checkout_date': datetime(2024, 2, 4),
                'total_amount': 8_500_000,
                'room_type': 'deluxe',
                'cancelled': False,
                'services_used': ['spa', 'restaurant'],
            },
            {
                'booking_date': datetime(2024, 4, 10),
                'checkin_date': datetime(2024, 5, 15),
                'checkout_date': datetime(2024, 5, 18),
                'total_amount': 7_200_000,
                'room_type': 'standard',
                'cancelled': False,
                'services_used': ['restaurant'],
            },
            {
                'booking_date': datetime(2024, 7, 20),
                'checkin_date': datetime(2024, 8, 10),
                'checkout_date': datetime(2024, 8, 14),
                'total_amount': 9_800_000,
                'room_type': 'suite',
                'cancelled': False,
                'services_used': ['spa', 'restaurant', 'laundry'],
            },
        ]
        
        if not mock_bookings:
            return {'has_history': False}
        
        # Calculate metrics
        total_bookings = len(mock_bookings)
        completed_bookings = [b for b in mock_bookings if not b['cancelled']]
        cancelled_bookings = [b for b in mock_bookings if b['cancelled']]
        
        total_revenue = sum(b['total_amount'] for b in completed_bookings)
        avg_booking_value = total_revenue / len(completed_bookings) if completed_bookings else 0
        
        cancellation_rate = len(cancelled_bookings) / total_bookings if total_bookings > 0 else 0
        
        # Calculate booking frequency
        booking_dates = sorted([b['booking_date'] for b in mock_bookings])
        if len(booking_dates) > 1:
            date_diffs = [(booking_dates[i+1] - booking_dates[i]).days 
                         for i in range(len(booking_dates)-1)]
            avg_days_between = float(np.mean(date_diffs))
        else:
            avg_days_between = None
        
        # Days since last booking
        last_booking = max(booking_dates)
        days_since_last = (datetime.now() - last_booking).days
        
        # Average length of stay
        stays = [(b['checkout_date'] - b['checkin_date']).days 
                for b in completed_bookings]
        avg_length_of_stay = float(np.mean(stays)) if stays else 0
        
        # Service usage
        all_services = [s for b in completed_bookings for s in b['services_used']]
        unique_services = set(all_services)
        
        return {
            'has_history': True,
            'guest_id': guest_id,
            'bookings': mock_bookings,
            'total_bookings': total_bookings,
            'completed_bookings': len(completed_bookings),
            'cancelled_bookings': len(cancelled_bookings),
            'total_revenue': float(total_revenue),
            'avg_booking_value': float(avg_booking_value),
            'cancellation_rate': float(cancellation_rate),
            'first_booking_date': min(booking_dates).isoformat(),
            'last_booking_date': last_booking.isoformat(),
            'days_since_last_booking': days_since_last,
            'avg_days_between_bookings': avg_days_between,
            'avg_length_of_stay': avg_length_of_stay,
            'unique_services_used': len(unique_services),
            'total_service_usage': len(all_services),
            'service_usage_rate': len(all_services) / len(completed_bookings) if completed_bookings else 0,
        }


    def _calculate_rfm_scores(self, historical_data: Dict) -> Dict[str, Any]:
        """
        Calculate RFM (Recency, Frequency, Monetary) scores
        
        RFM is a classic customer segmentation technique:
        - Recency: How recently did the customer book?
        - Frequency: How often do they book?
        - Monetary: How much do they spend?
        
        Returns:
            Dict with RFM scores (1-5 scale)
        """
        # Recency (lower days = higher score)
        recency_days = historical_data['days_since_last_booking']
        recency_score = self._bin_score(recency_days, RFM_BINS['recency'], reverse=True)
        
        # Frequency (more bookings = higher score)
        frequency_count = historical_data['total_bookings']
        frequency_score = self._bin_score(frequency_count, RFM_BINS['frequency'])
        
        # Monetary (higher spend = higher score)
        monetary_value = historical_data['total_revenue']
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


    def _bin_score(self, value: float, bins: list, reverse: bool = False) -> int:
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


    def _engineer_features(
        self, 
        historical_data: Dict, 
        rfm_scores: Dict
    ) -> np.ndarray:
        """
        Engineer features for the three prediction models
        
        Returns:
            Feature vector as numpy array
        """
        features = {
            # RFM features
            'rfm_recency_score': rfm_scores['recency_score'],
            'rfm_frequency_score': rfm_scores['frequency_score'],
            'rfm_monetary_score': rfm_scores['monetary_score'],
            'rfm_overall_score': rfm_scores['overall_score'],
            
            # Booking behavior
            'total_bookings': historical_data['total_bookings'],
            'completed_bookings': historical_data['completed_bookings'],
            'cancellation_rate': historical_data['cancellation_rate'],
            'avg_booking_value': historical_data['avg_booking_value'],
            'total_revenue': historical_data['total_revenue'],
            
            # Temporal patterns
            'days_since_last_booking': historical_data['days_since_last_booking'],
            'avg_days_between_bookings': historical_data.get('avg_days_between_bookings', 90),
            'booking_frequency_per_year': 365 / historical_data.get('avg_days_between_bookings', 90) if historical_data.get('avg_days_between_bookings') else 0,
            
            # Stay patterns
            'avg_length_of_stay': historical_data['avg_length_of_stay'],
            
            # Engagement
            'service_usage_rate': historical_data['service_usage_rate'],
            'unique_services_used': historical_data['unique_services_used'],
            
            # Customer lifecycle
            'customer_age_days': (
                datetime.fromisoformat(historical_data['last_booking_date']) -
                datetime.fromisoformat(historical_data['first_booking_date'])
            ).days,
            
            # Derived features
            'revenue_per_booking': historical_data['avg_booking_value'],
            'revenue_growth_rate': 0.0,  # TODO: Calculate from time series
            'booking_regularity': 1.0 / (historical_data.get('avg_days_between_bookings', 90) + 1),
        }
        
        # Convert to array in consistent order
        feature_vector = np.array([
            features['rfm_recency_score'],
            features['rfm_frequency_score'],
            features['rfm_monetary_score'],
            features['rfm_overall_score'],
            features['total_bookings'],
            features['completed_bookings'],
            features['cancellation_rate'],
            features['avg_booking_value'],
            features['total_revenue'],
            features['days_since_last_booking'],
            features['avg_days_between_bookings'],
            features['booking_frequency_per_year'],
            features['avg_length_of_stay'],
            features['service_usage_rate'],
            features['unique_services_used'],
            features['customer_age_days'],
            features['revenue_per_booking'],
            features['revenue_growth_rate'],
            features['booking_regularity'],
        ]).reshape(1, -1)
        
        return feature_vector


    async def _run_prediction_models(
        self,
        features: np.ndarray,
        time_horizon_months: int
    ) -> Dict[str, float]:
        """
        Run all three prediction models
        
        Returns:
            Dict with predictions from all models
        """
        # Model 1: Booking Frequency
        if self.booking_frequency_model:
            # Predict bookings per year, then scale to time horizon
            bookings_per_year = self.booking_frequency_model.predict(features)[0]
            predicted_bookings = bookings_per_year * (time_horizon_months / 12)
        else:
            # Fallback: Use historical frequency
            predicted_bookings = features[0, 11] * (time_horizon_months / 12)  # booking_frequency_per_year
        
        # Model 2: Booking Value
        if self.booking_value_model:
            predicted_avg_value = self.booking_value_model.predict(features)[0]
        else:
            # Fallback: Use historical average
            predicted_avg_value = features[0, 7]  # avg_booking_value
        
        # Model 3: Retention Probability
        if self.retention_model:
            retention_prob = self.retention_model.predict_proba(features)[0, 1]
        else:
            # Fallback: Calculate from cancellation rate and recency
            cancellation_rate = features[0, 6]
            days_since_last = features[0, 9]
            retention_prob = (1 - cancellation_rate) * (1 - min(days_since_last / 365, 0.5))
        
        # Estimate ancillary revenue (services, upgrades, etc.)
        # Typically 10-20% of room revenue for hotel industry
        service_usage_rate = features[0, 13]
        ancillary_multiplier = 0.10 + (service_usage_rate * 0.10)  # 10-20%
        ancillary_revenue = predicted_avg_value * predicted_bookings * ancillary_multiplier
        
        return {
            'booking_frequency': float(predicted_bookings),
            'avg_booking_value': float(predicted_avg_value),
            'retention_probability': float(retention_prob),
            'ancillary_revenue': float(ancillary_revenue),
        }


    def _calculate_clv(
        self,
        predictions: Dict,
        time_horizon_months: int,
        historical_data: Dict
    ) -> Dict[str, Any]:
        """
        Calculate final CLV using the formula:
        CLV = (Avg Booking Value) × (Bookings per Period) × (Retention Rate) × (Time Horizon)
        
        Returns:
            Dict with CLV and confidence score
        """
        # Base revenue from bookings
        base_revenue = (
            predictions['avg_booking_value'] *
            predictions['booking_frequency'] *
            predictions['retention_probability']
        )
        
        # Add ancillary revenue
        total_clv = base_revenue + predictions['ancillary_revenue']
        
        # Calculate confidence score
        # Based on data quality and model confidence
        data_quality_score = self._calculate_data_quality_score(historical_data)
        model_confidence = predictions['retention_probability']  # Use retention as proxy
        
        confidence = (data_quality_score * 0.6) + (model_confidence * 0.4)
        
        return {
            'clv': float(total_clv),
            'base_revenue': float(base_revenue),
            'confidence': float(confidence),
        }


    def _calculate_data_quality_score(self, historical_data: Dict) -> float:
        """
        Calculate data quality score based on:
        - Number of bookings (more is better)
        - Recency (recent data is better)
        - Completeness
        """
        # Booking count score (0-1)
        booking_count = historical_data['total_bookings']
        count_score = min(booking_count / 10, 1.0)  # 10+ bookings = 1.0
        
        # Recency score (0-1)
        days_since_last = historical_data['days_since_last_booking']
        recency_score = max(0, 1 - (days_since_last / 365))  # 1 year old = 0
        
        # Data completeness score
        completeness_score = 0.9  # Assume 90% complete
        
        # Weighted average
        quality_score = (
            count_score * 0.4 +
            recency_score * 0.4 +
            completeness_score * 0.2
        )
        
        return quality_score


    def _determine_segment(self, clv: float) -> str:
        """
        Determine customer segment based on CLV
        """
        if clv >= CLV_SEGMENTS['vip']:
            return 'vip'
        elif clv >= CLV_SEGMENTS['high_value']:
            return 'high_value'
        elif clv >= CLV_SEGMENTS['medium_value']:
            return 'medium_value'
        else:
            return 'low_value'


    def _generate_recommendations(
        self,
        clv_result: Dict,
        segment: str,
        retention_prob: float
    ) -> Dict[str, Any]:
        """
        Generate investment and engagement recommendations
        """
        clv = clv_result['clv']
        
        # Maximum acquisition cost (typically 20-30% of CLV)
        max_acquisition_cost = clv * 0.25
        
        # Loyalty tier recommendations
        loyalty_tier_map = {
            'vip': 'platinum',
            'high_value': 'gold',
            'medium_value': 'silver',
            'low_value': 'bronze',
        }
        loyalty_tier = loyalty_tier_map.get(segment, 'bronze')
        
        # Personalized offers recommendation
        personalized_offers = segment in ['vip', 'high_value'] or clv > 30_000_000
        
        # Priority level for marketing
        if segment == 'vip':
            priority = 'critical'
        elif segment == 'high_value':
            priority = 'high'
        elif segment == 'medium_value':
            priority = 'medium'
        else:
            priority = 'low'
        
        return {
            'max_acquisition_cost': float(max_acquisition_cost),
            'loyalty_tier': loyalty_tier,
            'personalized_offers': personalized_offers,
            'priority_level': priority,
        }


    def _predict_new_guest_clv(
        self,
        guest_id: str,
        time_horizon_months: int
    ) -> CLVPredictResponse:
        """
        Predict CLV for new guest with no history
        Use industry averages and baseline model
        """
        # Industry baseline metrics for new hotel guests
        avg_booking_value = 5_000_000  # 5M VND
        bookings_per_year = 2.0  # Typical new guest books 2x/year
        retention_rate = 0.35  # 35% retention for new guests
        
        predicted_bookings = bookings_per_year * (time_horizon_months / 12)
        base_revenue = avg_booking_value * predicted_bookings * retention_rate
        ancillary_revenue = base_revenue * 0.10
        total_clv = base_revenue + ancillary_revenue
        
        return CLVPredictResponse(
            guest_id=guest_id,
            predicted_clv=total_clv,
            time_horizon_months=time_horizon_months,
            currency="VND",
            confidence=0.40,  # Low confidence for new guests
            breakdown=CLVBreakdown(
                predicted_bookings=predicted_bookings,
                avg_booking_value=avg_booking_value,
                predicted_ancillary_revenue=ancillary_revenue,
                base_revenue=base_revenue,
                total_revenue=total_clv
            ),
            segment='low_value',
            retention_probability=retention_rate,
            churn_risk=1 - retention_rate,
            rfm_scores=None,
            recommended_investment=RecommendedInvestment(
                max_acquisition_cost=total_clv * 0.20,
                loyalty_program_tier='bronze',
                personalized_offers=False,
                priority_level='low'
            ),
            historical_data=None,
            model_version="clv_v1.5_baseline",
            predicted_at=datetime.utcnow()
        )


# Singleton instance
_clv_calculator: Optional[CLVCalculator] = None

def get_clv_calculator() -> CLVCalculator:
    """Get CLV calculator singleton"""
    global _clv_calculator
    if _clv_calculator is None:
        from src.application.ml_models.model_registry import get_model_registry
        # TODO: Import proper config
        # from src.utils.config import get_config
        
        _clv_calculator = CLVCalculator(
            model_registry=get_model_registry(),
            config=None  # TODO: Add config
        )
    return _clv_calculator