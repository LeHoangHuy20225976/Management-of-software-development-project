from pydantic import BaseModel, Field
from typing import List, Optional, Dict
from datetime import date as Date # 
from enum import Enum

class OptimizationGoal(str, Enum):
    REVENUE = "revenue"
    OCCUPANCY = "occupancy"
    PROFIT = "profit"


class PricingConstraints(BaseModel):
    min_price_multiplier: float = Field(default=0.8, ge=0.5, le=1.0)
    max_price_multiplier: float = Field(default=1.5, ge=1.0, le=2.5)

class DateRange(BaseModel):
    start: Date
    end: Date

class PricingOptimizationRequest(BaseModel):
    date_range:  DateRange
    room_types: List[str]  # e.g., ["deluxe", "suite", "standard"]
    constraints: Optional[PricingConstraints] = PricingConstraints()
    optimization_goal: OptimizationGoal = OptimizationGoal.REVENUE

class PricingFactors(BaseModel):
    day_of_week: str
    is_holiday: bool
    local_events: List[str]
    historical_occupancy: float
    booking_pace: str  # "slow", "normal", "fast", "very_fast"

class PricingScheduleItem(BaseModel):
    date: Date
    room_type: str
    base_price: int
    suggested_price: int
    price_multiplier: float
    expected_occupancy: float
    expected_revenue: int
    competitor_avg_price: Optional[int] = None
    demand_score: float
    confidence: float
    factors: PricingFactors

class PricingSummary(BaseModel):
    total_expected_revenue: int
    avg_occupancy: float
    avg_price_increase: float

class PricingOptimizationResponse(BaseModel):
    pricing_schedule: List[PricingScheduleItem]
    summary: PricingSummary
    model_version: str
    generated_at: str


class CurrentPriceRequest(BaseModel):
    room_type: str
    date: Optional[Date] = None


class CurrentPriceResponse(BaseModel):
    room_type: str
    date: Date
    base_price: int
    current_price: int
    price_multiplier: float
    valid_until: str
    demand_level: str  # "low", "medium", "high", "very_high"