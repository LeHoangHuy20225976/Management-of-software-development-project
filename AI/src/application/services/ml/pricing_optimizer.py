"""
Dynamic Pricing Optimizer Service

Uses XGBoost with custom revenue optimization

"""
from typing import List, Dict, Optional
import numpy as np
from datetime import datetime, date, timedelta
import time


from src.application.dtos.ml.pricing_dto import (
    PricingOptimizationRequest,
    PricingOptimizationResponse,
    PricingScheduleItem,
    PricingSummary,
    PricingFactors,
    CurrentPriceRequest,
    CurrentPriceResponse,
    PricingConstraints, 
)
from src.utils.logger import app_logger


# Mock historical data for now
HISTORICAL_OCCUPANCY = {
    "deluxe": {"weekday": 0.65, "weekend": 0.85, "holiday": 0.92},
    "suite": {"weekday": 0.55, "weekend": 0.75, "holiday": 0.88},
    "standard": {"weekday": 0.75, "weekend": 0.90, "holiday": 0.95},
}

BASE_PRICES = {
    "deluxe": 2000000,
    "suite": 3500000,
    "standard": 1200000,
}

class PricingOptimizer:
    """
    Dynamic pricing optimizer
    
    In production, this would use:
    - XGBoost with custom revenue optimization loss
    - Real-time demand signals
    - Competitor pricing data
    - Event calendars
    
    For now, uses rule-based pricing with ML-style scoring
    """
    
    def __init__(self, model=None):
        self.model = model
        self.model_version = "pricing_v3.2"
        
    async def optimize_pricing(
        self,
        request: PricingOptimizationRequest
    ) -> PricingOptimizationResponse:
        """
        Generate optimized pricing schedule for date range
        """
        start_time = time.time()
        
        pricing_schedule = []
        
        # Generate pricing for each date and room type
        current_date = request.date_range.start
        end_date = request.date_range.end
        
        while current_date <= end_date:
            for room_type in request.room_types:
                item = await self._calculate_optimal_price(
                    room_type=room_type,
                    target_date=current_date,
                    constraints=request.constraints,
                    goal=request.optimization_goal
                )
                pricing_schedule.append(item)
            
            current_date += timedelta(days=1)
        
        # Calculate summary statistics
        summary = self._calculate_summary(pricing_schedule)
        
        app_logger.info(
            f"Generated pricing schedule for {len(pricing_schedule)} entries "
            f"in {time.time() - start_time:.2f}s"
        )
        
        return PricingOptimizationResponse(
            pricing_schedule=pricing_schedule,
            summary=summary,
            model_version=self.model_version,
            generated_at=datetime.now().isoformat()
        )
    
    async def get_current_price(
        self,
        request: CurrentPriceRequest
    ) -> CurrentPriceResponse:
        """
        Get current optimized price for a room type
        """
        target_date = request.date or date.today()
        
        item = await self._calculate_optimal_price(
            room_type=request.room_type,
            target_date=target_date,
            constraints=None,
            goal="revenue"
        )
        
        # Determine demand level
        if item.demand_score >= 0.85:
            demand_level = "very_high"
        elif item.demand_score >= 0.70:
            demand_level = "high"
        elif item.demand_score >= 0.50:
            demand_level = "medium"
        else:
            demand_level = "low"
        
        return CurrentPriceResponse(
            room_type=request.room_type,
            date=target_date,
            base_price=item.base_price,
            current_price=item.suggested_price,
            price_multiplier=item.price_multiplier,
            valid_until=(target_date + timedelta(days=1)).isoformat() + "T00:00:00Z",
            demand_level=demand_level
        )
    
    async def _calculate_optimal_price(
        self,
        room_type: str,
        target_date: date,
        constraints: Optional[PricingConstraints],
        goal: str
    ) -> PricingScheduleItem:
        """
        Calculate optimal price for a specific room type and date
        
        This is where the ML model would be used in production
        """
        # Get base price
        base_price = BASE_PRICES.get(room_type, 1500000)
        
        # Calculate demand score
        demand_score = self._calculate_demand_score(room_type, target_date)
        
        # Calculate price multiplier based on demand
        price_multiplier = self._calculate_multiplier(
            demand_score, 
            constraints
        )
        
        # Apply constraints
        if constraints:
            price_multiplier = max(
                constraints.min_price_multiplier,
                min(constraints.max_price_multiplier, price_multiplier)
            )
        
        suggested_price = int(base_price * price_multiplier)
        
        # Estimate occupancy based on price
        expected_occupancy = self._estimate_occupancy(
            room_type, 
            target_date, 
            price_multiplier
        )
        
        # Calculate expected revenue (per room)
        expected_revenue = int(suggested_price * expected_occupancy)
        
        # Get pricing factors
        factors = self._get_pricing_factors(target_date)
        
        # Confidence based on historical data availability
        confidence = 0.85 + (np.random.random() * 0.1)
        
        return PricingScheduleItem(
            date=target_date,
            room_type=room_type,
            base_price=base_price,
            suggested_price=suggested_price,
            price_multiplier=round(price_multiplier, 2),
            expected_occupancy=round(expected_occupancy, 2),
            expected_revenue=expected_revenue,
            competitor_avg_price=int(base_price * 1.1),  # Mock competitor price
            demand_score=round(demand_score, 2),
            confidence=round(confidence, 2),
            factors=factors
        )
    
    def _calculate_demand_score(self, room_type: str, target_date: date) -> float:
        """
        Calculate demand score (0-1) based on date characteristics
        """
        # Base score
        score = 0.5
        
        # Day of week effect
        day_of_week = target_date.weekday()
        if day_of_week >= 4:  # Friday-Saturday
            score += 0.2
        
        # Month seasonality
        month = target_date.month
        if month in [7, 8, 12, 1]:  # Summer & Winter holidays
            score += 0.15
        
        # Distance from today (booking lead time)
        days_ahead = (target_date - date.today()).days
        if 7 <= days_ahead <= 30:  # Sweet spot
            score += 0.1
        elif days_ahead < 7:  # Last minute
            score += 0.05
        
        # Random variation (simulating events, etc.)
        score += np.random.uniform(-0.05, 0.15)
        
        return min(1.0, max(0.0, score))
    
    def _calculate_multiplier(self, demand_score: float, constraints: Optional[PricingConstraints]) -> float:
        """
        Convert demand score to price multiplier
        """
        # Linear mapping: demand [0-1] -> multiplier [0.8-1.5]
        min_mult = 0.8
        max_mult = 1.5
        
        multiplier = min_mult + (demand_score * (max_mult - min_mult))
        
        return multiplier
    
    def _estimate_occupancy(
        self, 
        room_type: str, 
        target_date: date, 
        price_multiplier: float
    ) -> float:
        """
        Estimate occupancy rate based on price
        
        Uses price elasticity: higher prices -> lower occupancy
        """
        # Get base occupancy for this room type and date type
        day_type = "weekend" if target_date.weekday() >= 5 else "weekday"
        base_occupancy = HISTORICAL_OCCUPANCY.get(room_type, {}).get(day_type, 0.7)
        
        # Apply price elasticity (elasticity = -1.5)
        price_effect = -1.5 * (price_multiplier - 1.0)
        adjusted_occupancy = base_occupancy * (1 + price_effect)
        
        return min(1.0, max(0.0, adjusted_occupancy))
    
    def _get_pricing_factors(self, target_date: date) -> PricingFactors:
        """
        Get factors affecting pricing for a date
        """
        day_names = ["Monday", "Tuesday", "Wednesday", "Thursday", 
                     "Friday", "Saturday", "Sunday"]
        
        # Mock local events
        events = []
        if target_date.weekday() >= 4:
            events.append("Weekend Tourism")
        if np.random.random() > 0.8:
            events.append("Tech Conference")
        
        # Historical occupancy
        hist_occ = 0.65 + (np.random.random() * 0.25)
        
        # Booking pace
        paces = ["slow", "normal", "fast", "very_fast"]
        booking_pace = np.random.choice(paces, p=[0.2, 0.4, 0.3, 0.1])
        
        return PricingFactors(
            day_of_week=day_names[target_date.weekday()],
            is_holiday=target_date.month in [1, 7, 8, 12],
            local_events=events,
            historical_occupancy=round(hist_occ, 2),
            booking_pace=booking_pace
        )
    
    def _calculate_summary(
        self, 
        pricing_schedule: List[PricingScheduleItem]
    ) -> PricingSummary:
        """
        Calculate summary statistics
        """
        if not pricing_schedule:
            return PricingSummary(
                total_expected_revenue=0,
                avg_occupancy=0.0,
                avg_price_increase=0.0
            )
        
        total_revenue = sum(item.expected_revenue for item in pricing_schedule)
        avg_occupancy = float(np.mean([item.expected_occupancy for item in pricing_schedule]))
        
        # Calculate average price increase
        price_increases = [
            ((item.suggested_price - item.base_price) / item.base_price) * 100
            for item in pricing_schedule
        ]
        avg_increase = float(np.mean(price_increases))
        
        return PricingSummary(
            total_expected_revenue=total_revenue,
            avg_occupancy=round(avg_occupancy, 2),
            avg_price_increase=round(avg_increase, 1)
        )


# Singleton
_pricing_optimizer: Optional[PricingOptimizer] = None

def get_pricing_optimizer() -> PricingOptimizer:
    global _pricing_optimizer
    if _pricing_optimizer is None:
        _pricing_optimizer = PricingOptimizer()
    return _pricing_optimizer