"""
Test Recommendation Engine
Unit tests for recommendation logic
"""
import pytest
from src.application.services.ml.recommender import (
    RecommendationEngine,
    get_recommender,
    MOCK_SERVICES,
    MOCK_ROOMS
)
from src.application.dtos.ml.recommendation_dto import (
    RecommendationContext,
    RoomPreferences
)


class TestRecommendationEngine:
    """Test RecommendationEngine class"""

    def test_recommender_initialization(self):
        """Test RecommendationEngine can be initialized"""
        recommender = RecommendationEngine()
        assert recommender is not None
        assert recommender.model_version == "recommender_v2.1"

    def test_recommender_singleton(self):
        """Test get_recommender returns singleton"""
        rec1 = get_recommender()
        rec2 = get_recommender()
        assert rec1 is rec2

    @pytest.mark.asyncio
    async def test_recommend_services_basic(self):
        """Test basic service recommendation"""
        recommender = RecommendationEngine()
        
        response = await recommender.recommend_services(
            guest_id="GUEST_001",
            top_k=3,
            context=None,
            exclude_services=None
        )
        
        assert response.guest_id == "GUEST_001"
        assert len(response.recommendations) <= 3
        assert response.total_recommendations <= 3
        assert response.inference_time_ms > 0

    @pytest.mark.asyncio
    async def test_recommend_services_with_context(self):
        """Test service recommendations with context"""
        recommender = RecommendationEngine()
        
        context = RecommendationContext(
            guest_segment="business",
            time_of_day="evening"
        )
        
        response = await recommender.recommend_services(
            guest_id="GUEST_001",
            top_k=5,
            context=context,
            exclude_services=None
        )
        
        assert len(response.recommendations) > 0
        
        # Business travelers should get dining/laundry recommendations
        categories = [r.category for r in response.recommendations]
        assert any(cat in ["dining", "laundry", "transport"] for cat in categories)

    @pytest.mark.asyncio
    async def test_recommend_services_with_exclusions(self):
        """Test service recommendations with exclusions"""
        recommender = RecommendationEngine()
        
        response = await recommender.recommend_services(
            guest_id="GUEST_001",
            top_k=5,
            context=None,
            exclude_services=["SVC_SPA_001"]
        )
        
        service_ids = [r.service_id for r in response.recommendations]
        assert "SVC_SPA_001" not in service_ids

    @pytest.mark.asyncio
    async def test_recommend_rooms_basic(self):
        """Test basic room recommendation"""
        recommender = RecommendationEngine()
        
        response = await recommender.recommend_rooms(
            guest_id="GUEST_001",
            check_in="2025-02-01",
            check_out="2025-02-03",
            preferences=None,
            party_size=2
        )
        
        assert response.guest_id == "GUEST_001"
        assert len(response.recommendations) > 0

    @pytest.mark.asyncio
    async def test_recommend_rooms_with_preferences(self):
        """Test room recommendations with preferences"""
        recommender = RecommendationEngine()
        
        preferences = RoomPreferences(
            budget="high",
            view="ocean",
            floor="high"
        )
        
        response = await recommender.recommend_rooms(
            guest_id="GUEST_001",
            check_in="2025-02-01",
            check_out="2025-02-03",
            preferences=preferences,
            party_size=2
        )
        
        assert len(response.recommendations) > 0
        
        # High budget should recommend expensive rooms
        for rec in response.recommendations:
            if rec.score > 0.8:  # High match
                assert rec.price >= 3000000  # High-end rooms

    def test_score_service_logic(self):
        """Test service scoring logic"""
        recommender = RecommendationEngine()
        
        service = MOCK_SERVICES[0]
        context = RecommendationContext(guest_segment="business")
        
        score = recommender._score_service(service, "GUEST_001", context)
        
        assert 0.0 <= score <= 1.0

    def test_calculate_room_match_logic(self):
        """Test room matching logic"""
        recommender = RecommendationEngine()
        
        room = MOCK_ROOMS[0]
        preferences = RoomPreferences(
            budget="high",
            view="ocean",
            floor="high"
        )
        
        match_score = recommender._calculate_room_match(room, preferences)
        
        assert 0.0 <= match_score.budget <= 1.0
        assert 0.0 <= match_score.view <= 1.0
        assert 0.0 <= match_score.floor <= 1.0
        assert 0.0 <= match_score.overall <= 1.0