"""
Recommendation Engine Service

Uses collaborative filtering + content-based hybrid approach
"""
from typing import List, Dict, Optional
import numpy as np
from datetime import datetime
import time

from src.application.dtos.ml.recommendation_dto import (
    ServiceRecommendation,
    ServiceRecommendationResponse,
    RoomRecommendation,
    RoomRecommendationResponse,
    RoomMatchScore,
    RecommendationContext,
    RoomPreferences,
)
from src.utils.logger import app_logger


# Mock service catalog
MOCK_SERVICES = [
    {"id": "SVC_RESTAURANT_001", "name": "Fine Dining Restaurant", "category": "dining", "price": 800000, "popularity": 0.85},
    {"id": "SVC_SPA_001", "name": "Luxury Spa Treatment", "category": "spa", "price": 1500000, "popularity": 0.72},
    {"id": "SVC_LAUNDRY_001", "name": "Express Laundry Service", "category": "laundry", "price": 200000, "popularity": 0.65},
    {"id": "SVC_TRANSPORT_001", "name": "Airport Shuttle", "category": "transport", "price": 500000, "popularity": 0.78},
    {"id": "SVC_BREAKFAST_001", "name": "Buffet Breakfast", "category": "dining", "price": 300000, "popularity": 0.90},
]

MOCK_ROOMS = [
    {"number": "801", "type": "deluxe_ocean_view", "floor": 8, "price": 3500000, "features": ["ocean_view", "balcony", "king_bed"]},
    {"number": "702", "type": "suite_premium", "floor": 7, "price": 5000000, "features": ["city_view", "living_room", "jacuzzi"]},
    {"number": "503", "type": "standard_double", "floor": 5, "price": 2000000, "features": ["garden_view", "twin_beds"]},
]


class RecommendationEngine:
    """
    Recommendation engine for services and rooms
    
    In production, this would use:
    - Two-tower neural network (user + item embeddings)
    - Collaborative filtering on historical data
    - Content-based filtering on features
    
    For now, uses rule-based + scoring
    """
    
    def __init__(self, model=None):
        self.model = model
        self.model_version = "recommender_v2.1"
        
    async def recommend_services(
        self,
        guest_id: str,
        top_k: int,
        context: Optional[RecommendationContext],
        exclude_services: Optional[List[str]] = None
    ) -> ServiceRecommendationResponse:
        """
        Generate personalized service recommendations
        """
        start_time = time.time()
        
        # Filter available services
        available = [s for s in MOCK_SERVICES if s["id"] not in (exclude_services or [])]
        
        # Score each service
        scored_services = []
        for service in available:
            score = self._score_service(service, guest_id, context)
            confidence = self._calculate_confidence(score, service["popularity"])
            
            scored_services.append({
                "service": service,
                "score": score,
                "confidence": confidence
            })
        
        # Sort by score and take top K
        scored_services.sort(key=lambda x: x["score"], reverse=True)
        top_services = scored_services[:top_k]
        
        # Build recommendations
        recommendations = []
        for item in top_services:
            service = item["service"]
            recommendations.append(
                ServiceRecommendation(
                    service_id=service["id"],
                    service_name=service["name"],
                    category=service["category"],
                    score=round(item["score"], 2),
                    confidence=round(item["confidence"], 2),
                    reason=self._generate_reason(service, context),
                    estimated_revenue=service["price"],
                    discount_eligible=item["score"] > 0.8,
                    availability="available"
                )
            )
        
        inference_time = (time.time() - start_time) * 1000
        
        app_logger.info(
            "Generated service recommendations",
            extra={
                "guest_id": guest_id,
                "recommendations_count": len(recommendations),
                "inference_time_ms": inference_time
            }
        )
        
        return ServiceRecommendationResponse(
            guest_id=guest_id,
            recommendations=recommendations,
            total_recommendations=len(recommendations),
            inference_time_ms=round(inference_time, 2),
            model_version=self.model_version
        )
    
    def _score_service(
        self,
        service: Dict,
        guest_id: str,
        context: Optional[RecommendationContext]
    ) -> float:
        """
        Score a service for a guest
        
        In production: model.predict(features)
        For now: rule-based scoring
        """
        base_score = service["popularity"]
        
        # Context-based adjustments
        if context:
            # Business travelers prefer dining and laundry
            if context.guest_segment == "business":
                if service["category"] in ["dining", "laundry", "transport"]:
                    base_score += 0.1
            
            # Families prefer restaurants
            elif context.guest_segment == "family":
                if service["category"] == "dining":
                    base_score += 0.15
            
            # Evening time boosts spa and dining
            if context.time_of_day == "evening":
                if service["category"] in ["spa", "dining"]:
                    base_score += 0.05
        
        # Add some randomness for diversity
        base_score += np.random.uniform(-0.05, 0.05)
        
        return min(base_score, 1.0)
    
    def _calculate_confidence(self, score: float, popularity: float) -> float:
        """Calculate confidence in recommendation"""
        # Higher for popular items and high scores
        return (score * 0.7 + popularity * 0.3)
    
    def _generate_reason(
        self,
        service: Dict,
        context: Optional[RecommendationContext]
    ) -> str:
        """Generate human-readable explanation"""
        if service["popularity"] > 0.8:
            return f"Highly popular service, used by 80%+ of guests"
        
        if context and context.guest_segment == "business":
            if service["category"] in ["dining", "laundry"]:
                return f"Popular with {context.guest_segment} travelers"
        
        return "Recommended based on your profile and preferences"
    
    async def recommend_rooms(
        self,
        guest_id: str,
        check_in: str,
        check_out: str,
        preferences: Optional[RoomPreferences],
        party_size: int
    ) -> RoomRecommendationResponse:
        """
        Recommend rooms based on preferences
        """
        # Score each room
        scored_rooms = []
        for room in MOCK_ROOMS:
            match_score = self._calculate_room_match(room, preferences)
            scored_rooms.append({
                "room": room,
                "match_score": match_score
            })
        
        # Sort by overall match score
        scored_rooms.sort(key=lambda x: x["match_score"].overall, reverse=True)
        
        # Build recommendations
        recommendations = []
        for item in scored_rooms[:5]:
            room = item["room"]
            recommendations.append(
                RoomRecommendation(
                    room_number=room["number"],
                    room_type=room["type"],
                    floor=room["floor"],
                    score=round(item["match_score"].overall, 2),
                    price=room["price"],
                    features=room["features"],
                    availability="available",
                    match_score=item["match_score"]
                )
            )
        
        return RoomRecommendationResponse(
            guest_id=guest_id,
            recommendations=recommendations,
            total_recommendations=len(recommendations)
        )
    
    def _calculate_room_match(
        self,
        room: Dict,
        preferences: Optional[RoomPreferences]
    ) -> RoomMatchScore:
        """Calculate how well room matches preferences"""
        if not preferences:
            return RoomMatchScore(budget=0.8, view=0.8, floor=0.8, overall=0.8)
        
        # Budget matching
        budget_map = {"low": (0, 2500000), "medium": (2000000, 4000000), "high": (3500000, 10000000)}
        budget_range = budget_map.get(preferences.budget or "medium", (0, 10000000))
        budget_match = 1.0 if budget_range[0] <= room["price"] <= budget_range[1] else 0.5
        
        # View matching
        view_match = 1.0
        if preferences.view:
            view_match = 1.0 if f"{preferences.view}_view" in room["features"] else 0.7
        
        # Floor matching
        floor_map = {"low": (1, 3), "medium": (4, 6), "high": (7, 10)}
        if preferences.floor:
            floor_range = floor_map[preferences.floor]
            floor_match = 1.0 if floor_range[0] <= room["floor"] <= floor_range[1] else 0.6
        else:
            floor_match = 0.8
        
        overall = (budget_match * 0.4 + view_match * 0.4 + floor_match * 0.2)
        
        return RoomMatchScore(
            budget=round(budget_match, 2),
            view=round(view_match, 2),
            floor=round(floor_match, 2),
            overall=round(overall, 2)
        )


# Singleton
_recommender: Optional[RecommendationEngine] = None

def get_recommender() -> RecommendationEngine:
    global _recommender
    if _recommender is None:
        _recommender = RecommendationEngine()
    return _recommender