from typing import Optional, Literal
from pydantic import BaseModel, Field
from datetime import datetime


# ========== Request Models ==========

class CLVPredictRequest(BaseModel):
    """Request for customer lifetime value prediction"""
    guest_id: str = Field(..., description="Unique identifier for the guest")
    time_horizon_months: int = Field(
        default=12,
        ge=1,
        le=60,
        description="Time horizon for CLV prediction in months (1-60)"
    )


class CLVBatchPredictRequest(BaseModel):
    """Request for batch CLV prediction"""
    guest_ids: list[str] = Field(..., min_length=1, max_length=100, description="List of guest IDs")
    time_horizon_months: int = Field(default=12, ge=1, le=60)


# ========== Response Sub-Models ==========

class CLVBreakdown(BaseModel):
    """Breakdown of CLV components"""
    predicted_bookings: float = Field(..., description="Expected number of bookings in time horizon")
    avg_booking_value: float = Field(..., description="Predicted average booking value in VND")
    predicted_ancillary_revenue: float = Field(..., description="Expected revenue from services/upgrades in VND")
    base_revenue: float = Field(..., description="Base revenue from room bookings in VND")
    total_revenue: float = Field(..., description="Total predicted revenue (CLV) in VND")


class RFMScores(BaseModel):
    """RFM (Recency, Frequency, Monetary) analysis scores"""
    recency_score: int = Field(..., ge=1, le=5, description="Recency score (1-5, 5 is best)")
    frequency_score: int = Field(..., ge=1, le=5, description="Frequency score (1-5, 5 is best)")
    monetary_score: int = Field(..., ge=1, le=5, description="Monetary score (1-5, 5 is best)")
    overall_score: float = Field(..., ge=1, le=5, description="Weighted overall RFM score")
    recency_days: int = Field(..., description="Days since last booking")
    frequency_count: int = Field(..., description="Total number of bookings")
    monetary_value: float = Field(..., description="Total revenue generated in VND")


class RecommendedInvestment(BaseModel):
    """Recommended marketing investment and engagement strategy"""
    max_acquisition_cost: float = Field(..., description="Maximum cost to acquire this customer in VND")
    loyalty_program_tier: Literal["bronze", "silver", "gold", "platinum"] = Field(
        ...,
        description="Recommended loyalty program tier"
    )
    personalized_offers: bool = Field(..., description="Whether to provide personalized offers")
    priority_level: Literal["low", "medium", "high", "critical"] = Field(
        ...,
        description="Priority level for marketing efforts"
    )


class HistoricalData(BaseModel):
    """Historical booking data for the guest"""
    total_bookings: int = Field(..., description="Total number of bookings")
    total_revenue: float = Field(..., description="Total revenue generated in VND")
    avg_booking_value: float = Field(..., description="Average booking value in VND")
    first_booking_date: str = Field(..., description="Date of first booking (ISO format)")
    last_booking_date: str = Field(..., description="Date of last booking (ISO format)")
    booking_frequency_days: Optional[float] = Field(
        None,
        description="Average days between bookings"
    )
    cancellation_rate: float = Field(..., ge=0, le=1, description="Historical cancellation rate")
    avg_length_of_stay: float = Field(..., description="Average length of stay in nights")


# ========== Main Response Models ==========

class CLVPredictResponse(BaseModel):
    """Response for customer lifetime value prediction"""
    guest_id: str
    predicted_clv: float = Field(..., description="Predicted customer lifetime value in VND")
    time_horizon_months: int
    currency: str = Field(default="VND", description="Currency code")
    confidence: float = Field(..., ge=0, le=1, description="Prediction confidence score")
    
    breakdown: CLVBreakdown
    segment: Literal["vip", "high_value", "medium_value", "low_value"] = Field(
        ...,
        description="Customer segment based on CLV"
    )
    
    retention_probability: float = Field(
        ...,
        ge=0,
        le=1,
        description="Probability of customer retention"
    )
    churn_risk: float = Field(..., ge=0, le=1, description="Risk of customer churn")
    
    rfm_scores: Optional[RFMScores] = Field(None, description="RFM analysis (null for new guests)")
    recommended_investment: RecommendedInvestment
    historical_data: Optional[HistoricalData] = Field(
        None,
        description="Historical data (null for new guests)"
    )
    
    model_version: str = Field(default="clv_v1.5", description="Model version used")
    predicted_at: datetime = Field(default_factory=datetime.utcnow, description="Prediction timestamp")


class CLVBatchPrediction(BaseModel):
    """Single prediction in batch response"""
    guest_id: str
    predicted_clv: float
    segment: Literal["vip", "high_value", "medium_value", "low_value"]
    retention_probability: float
    confidence: float


class CLVBatchPredictResponse(BaseModel):
    """Response for batch CLV prediction"""
    predictions: list[CLVBatchPrediction]
    total_processed: int
    summary: dict = Field(
        default_factory=dict,
        description="Summary statistics (avg_clv, segment_counts, etc.)"
    )
    model_version: str = Field(default="clv_v1.5")
    predicted_at: datetime = Field(default_factory=datetime.utcnow)