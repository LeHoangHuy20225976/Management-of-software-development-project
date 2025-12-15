
"""
ML Service Router
"""
from typing import List
from datetime import datetime
from fastapi import APIRouter, HTTPException, status

from src.application.dtos.ml.churn_dto import (
    ChurnPredictRequest,
    ChurnPredictResponse,
    ChurnBatchPredictRequest,
    ChurnBatchPredictResponse,
    BatchPrediction,
)

from src.application.dtos.ml.recommendation_dto import (
    ServiceRecommendationRequest,
    ServiceRecommendationResponse,
    RoomRecommendationRequest,
    RoomRecommendationResponse,
)

# Add pricing_optimizer service code
from src.application.dtos.ml.pricing_dto import (
    PricingOptimizationRequest,
    PricingOptimizationResponse,
    CurrentPriceRequest,
    CurrentPriceResponse,
)
from src.application.services.ml.pricing_optimizer import get_pricing_optimizer

# Add CLV imports
from src.application.dtos.ml.clv_dto import (
    CLVPredictRequest,
    CLVPredictResponse,
    CLVBatchPredictRequest,
    CLVBatchPredictResponse,
)
from src.application.services.ml.clv_calculator import get_clv_calculator

from src.application.services.ml.recommender import get_recommender
from src.application.services.ml.churn_predictor import get_churn_predictor
from src.application.ml_models.model_registry import get_model_registry
from src.utils.logger import app_logger

router = APIRouter()



# ========== Recommendation Endpoints ==========

@router.post(
    "/recommend/services",
    response_model=ServiceRecommendationResponse,
    summary="Get personalized service recommendations",
    description="Recommend hotel services based on guest profile and context"
)
async def recommend_services(request: ServiceRecommendationRequest) -> ServiceRecommendationResponse:
    """
    Get personalized service recommendations for a guest
    
    Uses collaborative filtering + content-based hybrid approach
    """
    try:
        recommender = get_recommender()
        
        response = await recommender.recommend_services(
            guest_id=request.guest_id,
            top_k=request.top_k,
            context=request.context,
            exclude_services=request.exclude_services
        )
        
        return response
        
    except Exception as e:
        app_logger.error(f"Service recommendation failed: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Recommendation failed: {str(e)}"
        )


@router.post(
    "/recommend/rooms",
    response_model=RoomRecommendationResponse,
    summary="Get room recommendations",
    description="Recommend rooms based on guest preferences and requirements"
)
async def recommend_rooms(request: RoomRecommendationRequest) -> RoomRecommendationResponse:
    """
    Recommend rooms based on guest preferences
    """
    try:
        recommender = get_recommender()
        
        response = await recommender.recommend_rooms(
            guest_id=request.guest_id,
            check_in=request.check_in,
            check_out=request.check_out,
            preferences=request.preferences,
            party_size=request.party_size
        )
        
        return response
        
    except Exception as e:
        app_logger.error(f"Room recommendation failed: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Recommendation failed: {str(e)}"
        )


# ========== Churn Prediction Endpoints ==========

@router.post(
    "/churn/predict",
    response_model=ChurnPredictResponse,
    summary="Predict booking cancellation probability",
    description="Get churn prediction with risk factors and recommended actions"
)
async def predict_churn(request: ChurnPredictRequest) -> ChurnPredictResponse:
    """
    Predict booking cancellation probability
    
    Uses LightGBM model with 25 features as specified in ML_SERVICE.md
    Target: AUC > 0.75
    """
    try:
        predictor = get_churn_predictor()
        
        response = await predictor.predict_single(
            booking_id=request.booking_id,
            guest_id=request.guest_id,
            features=request.features
        )
        
        app_logger.info(
            "Churn prediction completed",
            extra={
                "booking_id": request.booking_id,
                "churn_probability": response.churn_probability,
                "risk_level": response.risk_level
            }
        )
        
        return response
        
    except Exception as e:
        app_logger.error(f"Churn prediction failed: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Prediction failed: {str(e)}"
        )


@router.post(
    "/churn/batch",
    response_model=ChurnBatchPredictResponse,
    summary="Batch predict churn for multiple bookings",
    description="Predict cancellation probability for multiple bookings at once"
)
async def predict_churn_batch(request: ChurnBatchPredictRequest) -> ChurnBatchPredictResponse:
    """
    Batch churn prediction for multiple bookings
    
    Note: This endpoint requires booking data to be fetched from database.
    Currently returns mock predictions for demonstration.
    """
    try:
        predictor = get_churn_predictor()
        
        # In production, fetch booking data from database
        # For now, generate mock predictions
        predictions = []
        high_risk = medium_risk = low_risk = 0
        
        for booking_id in request.booking_ids:
            # Mock feature generation - in production, fetch from DB
            mock_features = {
                'booking_id': booking_id,
                'features': {
                    'booking_lead_time_days': 14,
                    'room_type': 'deluxe',
                    'total_amount': 3000000,
                    'payment_method': 'credit_card',
                    'booking_source': 'website',
                    'is_first_booking': False,
                    'days_until_checkin': 7,
                    'loyalty_tier': 'gold'
                }
            }
            
            batch_predictions = await predictor.predict_batch([mock_features])
            
            for pred in batch_predictions:
                predictions.append(pred)
                if pred.risk_level == 'high':
                    high_risk += 1
                elif pred.risk_level == 'medium':
                    medium_risk += 1
                else:
                    low_risk += 1
        
        return ChurnBatchPredictResponse(
            predictions=predictions,
            total_processed=len(predictions),
            high_risk_count=high_risk,
            medium_risk_count=medium_risk,
            low_risk_count=low_risk
        )
        
    except Exception as e:
        app_logger.error(f"Batch churn prediction failed: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Batch prediction failed: {str(e)}"
        )


# ========== Model Management Endpoints ==========

@router.get(
    "/models/{model_name}/info",
    summary="Get model information",
    description="Get details about a specific ML model"
)
async def get_model_info(model_name: str):
    """Get model information and metrics"""
    registry = get_model_registry()
    info = registry.get_model_info(model_name)
    
    if info.get('status') == 'not_loaded':
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Model not found: {model_name}"
        )
    
    return info


@router.get(
    "/health",
    summary="ML Service health check",
    description="Check health of ML service and loaded models"
)
async def ml_health_check():
    """Health check for ML service"""
    registry = get_model_registry()
    
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "models_loaded": registry.list_models(),
        "checks": {
            "churn_predictor": "ok",
            "model_registry": "ok"
        }
    }




# ========== Dynamic Pricing Endpoints ==========

@router.post(
    "/pricing/optimize",
    response_model=PricingOptimizationResponse,
    summary="Optimize room pricing",
    description="Get optimized pricing schedule for rooms over a date range"
)
async def optimize_pricing(
    request: PricingOptimizationRequest
) -> PricingOptimizationResponse:
    """
    Generate optimized pricing for rooms
    
    Uses ML model to balance occupancy and revenue
    """
    try:
        optimizer = get_pricing_optimizer()
        
        response = await optimizer.optimize_pricing(request)
        
        return response
        
    except Exception as e:
        app_logger.error(f"Pricing optimization failed: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Pricing optimization failed: {str(e)}"
        )


@router.post(
    "/pricing/current",
    response_model=CurrentPriceResponse,
    summary="Get current optimal price",
    description="Get current optimized price for a room type"
)
async def get_current_pricing(
    request: CurrentPriceRequest
) -> CurrentPriceResponse:
    """
    Get current optimized price for a room type
    """
    try:
        optimizer = get_pricing_optimizer()
        
        response = await optimizer.get_current_price(request)
        
        return response
        
    except Exception as e:
        app_logger.error(f"Get current pricing failed: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Get current pricing failed: {str(e)}"
        )


# ========== Customer Lifetime Value (CLV) Endpoints ==========

@router.post(
    "/clv/predict",
    response_model=CLVPredictResponse,
    summary="Predict customer lifetime value",
    description="Calculate predicted CLV for a guest over a specified time horizon",
    tags=["CLV"]
)
async def predict_clv(request: CLVPredictRequest) -> CLVPredictResponse:
    """
    Predict customer lifetime value (CLV)
    
    Uses three XGBoost models:
    1. Booking Frequency Model - Predicts number of future bookings
    2. Booking Value Model - Predicts average booking value  
    3. Retention Model - Predicts probability of customer retention
    
    Formula: CLV = (Avg Booking Value) × (Bookings per Period) × (Retention Rate)
    
    Returns:
        - Predicted CLV in VND
        - RFM analysis scores
        - Customer segment (vip, high_value, medium_value, low_value)
        - Recommended marketing investment
        - Historical data and predictions breakdown
    """
    try:
        calculator = get_clv_calculator()
        
        response = await calculator.predict_clv(request)
        
        app_logger.info(
            f"CLV predicted for guest {request.guest_id}: "
            f"{response.predicted_clv:,.0f} VND (segment: {response.segment})"
        )
        
        return response
        
    except Exception as e:
        app_logger.error(f"CLV prediction failed for guest {request.guest_id}: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"CLV prediction failed: {str(e)}"
        )


@router.post(
    "/clv/batch",
    response_model=CLVBatchPredictResponse,
    summary="Batch predict customer lifetime value",
    description="Calculate CLV for multiple guests at once",
    tags=["CLV"]
)
async def predict_clv_batch(request: CLVBatchPredictRequest) -> CLVBatchPredictResponse:
    """
    Batch predict CLV for multiple guests
    
    Useful for:
    - Bulk customer segmentation
    - Marketing campaign targeting
    - Portfolio analysis
    - Customer base valuation
    
    Returns:
        - List of CLV predictions for all guests
        - Summary statistics (avg CLV, segment distribution)
        - Total portfolio value
    """
    try:
        calculator = get_clv_calculator()
        
        response = await calculator.predict_clv_batch(request)
        
        app_logger.info(
            f"Batch CLV prediction completed: {response.total_processed} guests processed, "
            f"Total CLV: {response.summary.get('total_clv', 0):,.0f} VND"
        )
        
        return response
        
    except Exception as e:
        app_logger.error(f"Batch CLV prediction failed: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Batch CLV prediction failed: {str(e)}"
        )


@router.get(
    "/clv/segments",
    summary="Get CLV segment definitions",
    description="Get the CLV thresholds for customer segmentation",
    tags=["CLV"]
)
async def get_clv_segments():
    """
    Get CLV segment thresholds
    
    Returns segment definitions used for customer classification
    """
    return {
        "segments": {
            "vip": {
                "threshold_min": 100_000_000,
                "threshold_max": None,
                "description": "VIP guests with CLV >= 100M VND",
                "loyalty_tier": "platinum",
                "priority": "critical"
            },
            "high_value": {
                "threshold_min": 50_000_000,
                "threshold_max": 100_000_000,
                "description": "High-value guests with CLV 50M-100M VND",
                "loyalty_tier": "gold",
                "priority": "high"
            },
            "medium_value": {
                "threshold_min": 20_000_000,
                "threshold_max": 50_000_000,
                "description": "Medium-value guests with CLV 20M-50M VND",
                "loyalty_tier": "silver",
                "priority": "medium"
            },
            "low_value": {
                "threshold_min": 0,
                "threshold_max": 20_000_000,
                "description": "Low-value guests with CLV < 20M VND",
                "loyalty_tier": "bronze",
                "priority": "low"
            }
        },
        "currency": "VND",
        "default_time_horizon_months": 12
    }


@router.get(
    "/clv/model/info",
    summary="Get CLV model information",
    description="Get information about the CLV prediction models",
    tags=["CLV"]
)
async def get_clv_model_info():
    """
    Get CLV model information
    
    Returns details about the three models used for CLV prediction
    """
    return {
        "model_version": "clv_v1.5",
        "models": {
            "booking_frequency": {
                "model_type": "XGBoost Regressor",
                "purpose": "Predicts number of future bookings",
                "features": 19,
                "status": "production"
            },
            "booking_value": {
                "model_type": "XGBoost Regressor", 
                "purpose": "Predicts average booking value",
                "features": 19,
                "status": "production"
            },
            "retention": {
                "model_type": "XGBoost Classifier",
                "purpose": "Predicts customer retention probability",
                "features": 19,
                "status": "production"
            }
        },
        "rfm_analysis": {
            "enabled": True,
            "components": ["Recency", "Frequency", "Monetary"],
            "scoring_scale": "1-5"
        },
        "formula": "CLV = (Avg Booking Value) × (Bookings per Period) × (Retention Rate) × (Time Horizon)",
        "features_used": [
            "RFM scores (4 features)",
            "Booking behavior (5 features)",
            "Temporal patterns (3 features)",
            "Stay patterns (1 feature)",
            "Engagement metrics (2 features)",
            "Customer lifecycle (1 feature)",
            "Derived features (3 features)"
        ],
        "total_features": 19
    }
    



# ========== Customer Lifetime Value (CLV) Endpoints ==========

@router.post(
    "/clv/predict",
    response_model=CLVPredictResponse,
    summary="Predict customer lifetime value",
    description="Calculate predicted CLV for a guest over a specified time horizon"
)
async def predict_clv(request: CLVPredictRequest) -> CLVPredictResponse:
    """
    Predict customer lifetime value (CLV)
    
    Uses three XGBoost models:
    1. Booking Frequency Model - Predicts number of future bookings
    2. Booking Value Model - Predicts average booking value  
    3. Retention Model - Predicts probability of customer retention
    
    Formula: CLV = (Avg Booking Value) × (Bookings per Period) × (Retention Rate)
    
    Returns:
        - Predicted CLV in VND
        - RFM analysis scores
        - Customer segment (vip, high_value, medium_value, low_value)
        - Recommended marketing investment
        - Historical data and predictions breakdown
    """
    try:
        calculator = get_clv_calculator()
        
        response = await calculator.predict_clv(request)
        
        app_logger.info(
            f"CLV predicted for guest {request.guest_id}: "
            f"{response.predicted_clv:,.0f} VND (segment: {response.segment})"
        )
        
        return response
        
    except Exception as e:
        app_logger.error(f"CLV prediction failed for guest {request.guest_id}: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"CLV prediction failed: {str(e)}"
        )


@router.post(
    "/clv/batch",
    response_model=CLVBatchPredictResponse,
    summary="Batch predict customer lifetime value",
    description="Calculate CLV for multiple guests at once"
)
async def predict_clv_batch(request: CLVBatchPredictRequest) -> CLVBatchPredictResponse:
    """
    Batch predict CLV for multiple guests
    
    Useful for:
    - Bulk customer segmentation
    - Marketing campaign targeting
    - Portfolio analysis
    - Customer base valuation
    
    Returns:
        - List of CLV predictions for all guests
        - Summary statistics (avg CLV, segment distribution)
        - Total portfolio value
    """
    try:
        calculator = get_clv_calculator()
        
        response = await calculator.predict_clv_batch(request)
        
        app_logger.info(
            f"Batch CLV prediction completed: {response.total_processed} guests processed, "
            f"Total CLV: {response.summary.get('total_clv', 0):,.0f} VND"
        )
        
        return response
        
    except Exception as e:
        app_logger.error(f"Batch CLV prediction failed: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Batch CLV prediction failed: {str(e)}"
        )


@router.get(
    "/clv/segments",
    summary="Get CLV segment definitions",
    description="Get the CLV thresholds for customer segmentation"
)
async def get_clv_segments():
    """
    Get CLV segment thresholds
    
    Returns segment definitions used for customer classification
    """
    return {
        "segments": {
            "vip": {
                "threshold_min": 100_000_000,
                "threshold_max": None,
                "description": "VIP guests with CLV >= 100M VND",
                "loyalty_tier": "platinum",
                "priority": "critical"
            },
            "high_value": {
                "threshold_min": 50_000_000,
                "threshold_max": 100_000_000,
                "description": "High-value guests with CLV 50M-100M VND",
                "loyalty_tier": "gold",
                "priority": "high"
            },
            "medium_value": {
                "threshold_min": 20_000_000,
                "threshold_max": 50_000_000,
                "description": "Medium-value guests with CLV 20M-50M VND",
                "loyalty_tier": "silver",
                "priority": "medium"
            },
            "low_value": {
                "threshold_min": 0,
                "threshold_max": 20_000_000,
                "description": "Low-value guests with CLV < 20M VND",
                "loyalty_tier": "bronze",
                "priority": "low"
            }
        },
        "currency": "VND",
        "default_time_horizon_months": 12
    }


@router.get(
    "/clv/model/info",
    summary="Get CLV model information",
    description="Get information about the CLV prediction models"
)
async def get_clv_model_info():
    """
    Get CLV model information
    
    Returns details about the three models used for CLV prediction
    """
    return {
        "model_version": "clv_v1.5",
        "models": {
            "booking_frequency": {
                "model_type": "XGBoost Regressor",
                "purpose": "Predicts number of future bookings",
                "features": 19,
                "status": "production"
            },
            "booking_value": {
                "model_type": "XGBoost Regressor", 
                "purpose": "Predicts average booking value",
                "features": 19,
                "status": "production"
            },
            "retention": {
                "model_type": "XGBoost Classifier",
                "purpose": "Predicts customer retention probability",
                "features": 19,
                "status": "production"
            }
        },
        "rfm_analysis": {
            "enabled": True,
            "components": ["Recency", "Frequency", "Monetary"],
            "scoring_scale": "1-5"
        },
        "formula": "CLV = (Avg Booking Value) × (Bookings per Period) × (Retention Rate) × (Time Horizon)",
        "features_used": [
            "RFM scores (4 features)",
            "Booking behavior (5 features)",
            "Temporal patterns (3 features)",
            "Stay patterns (1 feature)",
            "Engagement metrics (2 features)",
            "Customer lifecycle (1 feature)",
            "Derived features (3 features)"
        ],
        "total_features": 19
    }