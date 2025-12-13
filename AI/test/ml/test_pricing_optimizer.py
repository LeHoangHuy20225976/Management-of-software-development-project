import pytest
from datetime import date, timedelta
from src.application.services.ml.pricing_optimizer import get_pricing_optimizer
from src.application.dtos.ml.pricing_dto import (
    PricingOptimizationRequest,
    CurrentPriceRequest,
    DateRange,
    PricingConstraints,
    OptimizationGoal, 
)


@pytest.mark.asyncio
async def test_optimize_pricing():
    """Test pricing optimization"""
    optimizer = get_pricing_optimizer()
    
    request = PricingOptimizationRequest(
        date_range=DateRange(
            start=date.today() + timedelta(days=7),
            end=date.today() + timedelta(days=14)
        ),
        room_types=["deluxe", "suite"],
        constraints=PricingConstraints(
            min_price_multiplier=0.9,
            max_price_multiplier=1.3
        ),
        optimization_goal=OptimizationGoal.REVENUE
    )
    
    response = await optimizer.optimize_pricing(request)
    
    assert len(response.pricing_schedule) == 16  # 8 days * 2 room types
    assert response.summary.total_expected_revenue > 0
    assert 0 <= response.summary.avg_occupancy <= 1.0
    
    # Check constraints are respected
    for item in response.pricing_schedule:
        assert 0.9 <= item.price_multiplier <= 1.3


@pytest.mark.asyncio
async def test_current_price():
    """Test getting current price"""
    optimizer = get_pricing_optimizer()
    
    request = CurrentPriceRequest(
        room_type="deluxe",
        date=date.today() + timedelta(days=3)
    )
    
    response = await optimizer.get_current_price(request)
    
    assert response.room_type == "deluxe"
    assert response.current_price > 0
    assert response.price_multiplier >= 0.8
    assert response.demand_level in ["low", "medium", "high", "very_high"]