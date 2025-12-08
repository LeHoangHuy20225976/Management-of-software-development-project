"""
Recommendation Service DTOs
"""

from typing import List, Optional, Dict, Literal
from pydantic import BaseModel, Field
from datetime import datetime

class RecommendationContext(BaseModel):
    """ Context for recommendation request """
    current_room: Optional[str] = None
    check_in_date: Optional[str] = None
    check_out_date: Optional[str] = None
    guest_segment: Optional[Literal["business", "leisure", "family"]] = "leisure"
    time_of_day: Optional[Literal["morning", "afternoon", "evening"]] = "morning"
    length_of_stay: Optional[int] = 1

class ServiceRecommendationRequest(BaseModel):
    """ Request for service recommendation """
    guest_id: str = Field(..., description="Unique identifier for the guest") 
    top_k: int = Field(default=5, ge=1, le=20, description="Number of recommendations")
    context: Optional[RecommendationContext] = None
    exclude_services: Optional[List[str]] = Field(default=None, description="Service IDs to exclude") 



class ServiceRecommendation(BaseModel):
    """ Single service recommendation """
    service_id: str
    service_name: str
    category: str
    score: float = Field(..., ge=0.0, le=1.0, description="Recommendation score") 
    confidence: float = Field(..., ge=0.0, le=1.0, description="Confidence level of the recommendation")
    reason: str = Field(..., description="Explanation for the recommendation")
    estimated_revenue: Optional[float] = None
    discount_eligible: bool = False
    availability: Literal["available", "limited", "unavailable"] = "available"


class ServiceRecommendationResponse(BaseModel):
    """Response with service recommendations"""
    guest_id: str
    recommendations: List[ServiceRecommendation]
    total_recommendations: int
    inference_time_ms: float
    model_version: str
    generated_at: datetime = Field(default_factory=datetime.utcnow)

class RoomPreferences(BaseModel):
    """ Guest room preferences """
    budget: Optional[Literal["low", "medium", "high"]] = "medium"
    view: Optional[Literal["ocean", "city", "garden", "none"]] = None
    floor: Optional[Literal["low", "medium", "high"]] = None
    smoking: bool = False


class RoomRecommendationRequest(BaseModel):
    """ Request for room recommendations """

    guest_id: str
    check_in: str

    check_out: str
    preferences: Optional[RoomPreferences] = None
    party_size: int = Field(default=2, ge=1)


class RoomMatchScore(BaseModel):
    """  How well room matches preferences"""
    budget: float = Field(..., ge=0.0, le=1.0)
    view: float = Field(..., ge=0.0, le=1.0)
    floor: float = Field(..., ge=0.0, le=1.0)
    overall: float = Field(..., ge=0.0, le=1.0) 



class RoomRecommendation(BaseModel):
    """ Single room recommendation """
    room_number: str
    room_type: str

    floor: int
    score: float = Field(..., ge=0.0, le=1.0)
    price: float
    features: List[str] 
    availability: Literal["available", "occupied"] = "available"
    match_score: RoomMatchScore

class RoomRecommendationResponse(BaseModel):
    """ Response with room recommendations """
    guest_id: str
    recommendations: List[RoomRecommendation] 
    total_recommendations: int
    model_version: str = "recommender_v2.1"
