from typing import Optional, List, Literal
from pydantic import BaseModel, Field
from datetime import datetime


""" 
 "features": {
    "booking_lead_time_days": 30,
    "room_type": "deluxe",
    "total_amount": 5000000,
    "payment_method": "credit_card",
    "booking_source": "website",
    "is_first_booking": false,
    "special_requests": 2,
    "loyalty_tier": "gold",
    "booking_modifications": 0,
    "days_until_checkin": 15
} in User request.
"""

""" Data transfer object """
class ChurnFeatures(BaseModel): 
    # Booking characteristics
    booking_lead_time_days: int = Field(..., description="Days between booking and check-in")
    room_type: str = Field(..., description="Room type: standard, deluxe, suite")
    total_amount: float = Field(..., description="Total booking amount in VND")
    payment_method: str = Field(..., description="credit_card, debit_card, cash, bank_transfer")
    booking_source: str = Field(..., description="website, mobile_app, ota, direct, agency")
    length_of_stay: int = Field(default=1, description="Number of nights")
    
    # Guest history
    is_first_booking: bool = Field(..., description="Is this the guest's first booking")
    previous_bookings_count: int = Field(default=0, description="Number of previous bookings")
    previous_cancellations_count: int = Field(default=0, description="Number of previous cancellations")
    cancellation_rate: float = Field(default=0.0, ge=0, le=1, description="Historical cancellation rate")
    avg_previous_booking_value: float = Field(default=0, description="Average value of previous bookings")
    days_since_last_booking: Optional[int] = Field(default=None, description="Days since last booking")
    
    # Engagement
    special_requests: int = Field(default=0, alias="special_requests_count", description="Number of special requests")
    booking_modifications: int = Field(default=0, alias="booking_modifications_count", description="Number of modifications")
    loyalty_tier: str = Field(default="none", description="none, silver, gold, platinum")
    loyalty_points_balance: int = Field(default=0, description="Current loyalty points")
    # Behavioral
    time_spent_on_website_minutes: float = Field(default=0, description="Time spent browsing")
    pages_viewed: int = Field(default=0, description="Number of pages viewed")
    price_comparison_searches: int = Field(default=0, description="Number of price comparisons")
    
    # Temporal
    days_until_checkin: int = Field(..., description="Days remaining until check-in")
    booking_dow: int = Field(default=0, ge=0, le=6, description="Day of week booking was made (0=Monday)")
    booking_hour: int = Field(default=12, ge=0, le=23, description="Hour of day booking was made")
    season: str = Field(default="normal", description="peak, normal, low")
    
    # Price sensitivity
    price_vs_avg_ratio: float = Field(default=1.0, description="Price compared to average")
    discount_applied: bool = Field(default=False, description="Whether discount was applied")
    
    class Config:
        populate_by_name = True

class ChurnPredictRequest(BaseModel):
    """ Request for single churn prediction """
    booking_id: str = Field(..., description="Unique identifier for the booking")
    guest_id: str = Field(..., description="Unique identifier for the guest")
    features: ChurnFeatures

class ChurnBatchPredictRequest(BaseModel):
    """" Request for batch churn prediction """
    booking_ids: List[str] = Field(..., min_length=1, max_length=100)

class RiskFactor(BaseModel):
    """ Risk factor contributing to churn """
    factor: str = Field(..., description="Factor name")
    impact_score: float = Field(..., description="Impact on churn probability (-1 to 1)")
    description: str = Field(..., description="Human-readable explanation of the risk factor")

class RecommendedAction(BaseModel):
    """ Recommended action to reduce churn risk """
    action: str = Field(..., description="Action to take")
    priority: Literal["high", "medium", "low"] 
    timing: str = Field(..., description="When to take action")
    expected_impact: float = Field(..., description="Expected impact on reducing churn probability")
    details: Optional[dict] = Field(default=None, description="Additional details about the action")

class ChurnPredictResponse(BaseModel):
    """ Response for single churn prediction """
    booking_id: str
    guest_id: str
    churn_probability: float = Field(..., ge=0, le=1)
    risk_level: Literal["low", "medium", "high"]
    confidence: float = Field(..., ge=0, le=1)
    risk_factors: List[RiskFactor] = []
    protective_factors: List[RiskFactor] = []
    recommended_actions: List[RecommendedAction] = []
    model_version: str = Field(default="churn_v1.8")
    predicted_at: datetime = Field(default_factory=datetime.utcnow)

class BatchPrediction(BaseModel):
    """ Single prediction in batch response """
    booking_id: str
    churn_probability: float = Field(..., ge=0, le=1)
    risk_level: Literal["low", "medium", "high"]

class ChurnBatchPredictResponse(BaseModel):
    """ Response for batch churn prediction """
    predictions: List[BatchPrediction]
    total_processed: int
    high_risk_count: int
    medium_risk_count: int
    low_risk_count: int
