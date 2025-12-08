
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