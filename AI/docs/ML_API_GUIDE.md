# Machine Learning Service API Guide

Complete guide for all ML service endpoints in the Hotel Management System.

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Base URL & Authentication](#base-url--authentication)
3. [Recommendation Endpoints](#recommendation-endpoints)
4. [Churn Prediction Endpoints](#churn-prediction-endpoints)
5. [Dynamic Pricing Endpoints](#dynamic-pricing-endpoints)
6. [Customer Lifetime Value (CLV) Endpoints](#customer-lifetime-value-clv-endpoints)
7. [Health & Monitoring](#health--monitoring)
8. [Error Handling](#error-handling)
9. [Rate Limits & Best Practices](#rate-limits--best-practices)

---

## 🎯 Overview

The ML Service provides machine learning capabilities for:
- **Personalized Recommendations** - Service and room suggestions
- **Churn Prediction** - Booking cancellation probability
- **Dynamic Pricing** - Real-time price optimization
- **Customer Lifetime Value (CLV)** - Guest value prediction
- **Forecasting** - Occupancy, revenue, and demand

**Service Port:** `8002`  
**Framework:** FastAPI  
**Documentation:** `http://localhost:8002/docs` (Swagger UI)

---

## 🔗 Base URL & Authentication

### Local Development
```
http://localhost:8002/api/v1/ml
```

### Production
```
https://api.yourhotel.com/api/v1/ml
```

### Authentication
Currently using API key authentication (to be implemented):

```http
Authorization: Bearer <your-api-key>
Content-Type: application/json
```

---

## 🎯 Recommendation Endpoints

### 1. Service Recommendations

**Endpoint:** `POST /recommend/services`

Get personalized service recommendations for a guest.

**Request:**
```json
{
  "guest_id": "GUEST_001",
  "top_k": 5,
  "context": {
    "current_room": "201",
    "check_in_date": "2025-01-15",
    "check_out_date": "2025-01-18",
    "guest_segment": "business",
    "time_of_day": "evening"
  },
  "exclude_services": ["SVC_SPA_001"]
}
```

**Response:**
```json
{
  "guest_id": "GUEST_001",
  "recommendations": [
    {
      "service_id": "SVC_RESTAURANT_001",
      "service_name": "Fine Dining Restaurant",
      "category": "dining",
      "score": 0.87,
      "confidence": 0.92,
      "reason": "Popular with business travelers staying 3+ nights",
      "estimated_revenue": 800000,
      "discount_eligible": true,
      "availability": "available"
    }
  ],
  "total_recommendations": 5,
  "inference_time_ms": 45,
  "model_version": "recommender_v2.1"
}
```

**cURL Example:**
```bash
curl -X POST "http://localhost:8002/api/v1/ml/recommend/services" \
  -H "Content-Type: application/json" \
  -d '{
    "guest_id": "GUEST_001",
    "top_k": 5,
    "context": {
      "guest_segment": "business"
    }
  }'
```

**Python Example:**
```python
import requests

response = requests.post(
    "http://localhost:8002/api/v1/ml/recommend/services",
    json={
        "guest_id": "GUEST_001",
        "top_k": 5,
        "context": {"guest_segment": "business"}
    }
)

recommendations = response.json()
print(f"Top service: {recommendations['recommendations'][0]['service_name']}")
```

---

### 2. Room Recommendations

**Endpoint:** `POST /recommend/rooms`

Recommend rooms based on guest preferences.

**Request:**
```json
{
  "guest_id": "GUEST_001",
  "check_in": "2025-02-01",
  "check_out": "2025-02-03",
  "preferences": {
    "budget": "high",
    "view": "ocean",
    "floor": "high",
    "smoking": false
  },
  "party_size": 2
}
```

**Response:**
```json
{
  "guest_id": "GUEST_001",
  "recommendations": [
    {
      "room_number": "801",
      "room_type": "deluxe_ocean_view",
      "floor": 8,
      "score": 0.95,
      "price": 3500000,
      "features": ["ocean_view", "balcony", "king_bed"],
      "availability": "available",
      "match_score": {
        "budget": 1.0,
        "view": 1.0,
        "floor": 0.9,
        "overall": 0.95
      }
    }
  ],
  "total_recommendations": 3
}
```

---

## 🔮 Churn Prediction Endpoints

### 1. Single Booking Churn Prediction

**Endpoint:** `POST /churn/predict`

Predict cancellation probability for a booking.

**Request:**
```json
{
  "booking_id": "BOOK_001",
  "guest_id": "GUEST_001",
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
  }
}
```

**Response:**
```json
{
  "booking_id": "BOOK_001",
  "guest_id": "GUEST_001",
  "churn_probability": 0.35,
  "risk_level": "medium",
  "confidence": 0.86,
  "risk_factors": [
    {
      "factor": "long_lead_time",
      "impact_score": 0.15,
      "description": "Bookings made 30+ days in advance have higher cancellation rates"
    }
  ],
  "protective_factors": [
    {
      "factor": "repeat_guest",
      "impact_score": -0.10,
      "description": "Guest has completed 5 previous stays"
    }
  ],
  "recommended_actions": [
    {
      "action": "send_confirmation_email",
      "priority": "high",
      "timing": "immediate",
      "expected_impact": 0.05
    },
    {
      "action": "apply_loyalty_discount",
      "priority": "high",
      "timing": "immediate",
      "expected_impact": 0.12,
      "details": {
        "discount_percentage": 10,
        "estimated_cost": 500000
      }
    }
  ],
  "model_version": "churn_v1.8",
  "predicted_at": "2025-12-15T10:00:00Z"
}
```

**Use Cases:**
- ✅ Proactive retention campaigns
- ✅ Dynamic pricing adjustments
- ✅ Staff alert for high-risk bookings
- ✅ Automated loyalty incentives

**cURL Example:**
```bash
curl -X POST "http://localhost:8002/api/v1/ml/churn/predict" \
  -H "Content-Type: application/json" \
  -d '{
    "booking_id": "BOOK_001",
    "guest_id": "GUEST_001",
    "features": {
      "booking_lead_time_days": 30,
      "total_amount": 5000000,
      "days_until_checkin": 15
    }
  }'
```

---

### 2. Batch Churn Prediction

**Endpoint:** `POST /churn/batch`

Predict churn for multiple bookings at once.

**Request:**
```json
{
  "booking_ids": ["BOOK_001", "BOOK_002", "BOOK_003"]
}
```

**Response:**
```json
{
  "predictions": [
    {
      "booking_id": "BOOK_001",
      "churn_probability": 0.35,
      "risk_level": "medium"
    },
    {
      "booking_id": "BOOK_002",
      "churn_probability": 0.15,
      "risk_level": "low"
    }
  ],
  "total_processed": 3,
  "high_risk_count": 0,
  "medium_risk_count": 1,
  "low_risk_count": 2
}
```

**Python Example:**
```python
import requests

# Batch predict for all bookings
booking_ids = ["BOOK_001", "BOOK_002", "BOOK_003"]

response = requests.post(
    "http://localhost:8002/api/v1/ml/churn/batch",
    json={"booking_ids": booking_ids}
)

results = response.json()
high_risk = [p for p in results["predictions"] if p["risk_level"] == "high"]
print(f"High risk bookings: {len(high_risk)}")
```

---

## 💰 Dynamic Pricing Endpoints

### 1. Pricing Optimization

**Endpoint:** `POST /pricing/optimize`

Get optimized pricing schedule for rooms.

**Request:**
```json
{
  "date_range": {
    "start": "2025-02-01",
    "end": "2025-02-28"
  },
  "room_types": ["deluxe", "suite", "standard"],
  "constraints": {
    "min_price_multiplier": 0.8,
    "max_price_multiplier": 1.5
  },
  "optimization_goal": "revenue"
}
```

**Response:**
```json
{
  "pricing_schedule": [
    {
      "date": "2025-02-01",
      "room_type": "deluxe",
      "base_price": 2000000,
      "suggested_price": 2500000,
      "price_multiplier": 1.25,
      "expected_occupancy": 0.85,
      "expected_revenue": 21250000,
      "competitor_avg_price": 2300000,
      "demand_score": 0.82,
      "confidence": 0.88,
      "factors": {
        "day_of_week": "Friday",
        "is_holiday": false,
        "local_events": ["Tech Conference"],
        "historical_occupancy": 0.78,
        "booking_pace": "fast"
      }
    }
  ],
  "summary": {
    "total_expected_revenue": 750000000,
    "avg_occupancy": 0.83,
    "avg_price_increase": 22.5
  },
  "model_version": "pricing_v3.2",
  "generated_at": "2025-12-15T10:00:00Z"
}
```

**Optimization Goals:**
- `revenue` - Maximize total revenue
- `occupancy` - Maximize occupancy rate
- `balanced` - Balance revenue and occupancy

---

### 2. Current Price

**Endpoint:** `POST /pricing/current`

Get current optimized price for a room type.

**Request:**
```json
{
  "room_type": "deluxe",
  "date": "2025-01-20"
}
```

**Response:**
```json
{
  "room_type": "deluxe",
  "date": "2025-01-20",
  "base_price": 2000000,
  "current_price": 2200000,
  "price_multiplier": 1.1,
  "valid_until": "2025-01-21T00:00:00Z",
  "demand_level": "medium"
}
```

---

## 💎 Customer Lifetime Value (CLV) Endpoints

### 1. CLV Prediction

**Endpoint:** `POST /clv/predict`

Calculate predicted customer lifetime value for a guest.

**Request:**
```json
{
  "guest_id": "GUEST_001",
  "time_horizon_months": 12
}
```

**Response:**
```json
{
  "guest_id": "GUEST_001",
  "predicted_clv": 50000000,
  "time_horizon_months": 12,
  "currency": "VND",
  "confidence": 0.82,
  "breakdown": {
    "predicted_bookings": 6,
    "avg_booking_value": 8000000,
    "predicted_ancillary_revenue": 2000000,
    "base_revenue": 48000000,
    "total_revenue": 50000000
  },
  "segment": "high_value",
  "retention_probability": 0.82,
  "churn_risk": 0.18,
  "rfm_scores": {
    "recency_score": 5,
    "frequency_score": 4,
    "monetary_score": 4,
    "overall_score": 4.3,
    "recency_days": 25,
    "frequency_count": 8,
    "monetary_value": 45000000
  },
  "recommended_investment": {
    "max_acquisition_cost": 12500000,
    "loyalty_program_tier": "gold",
    "personalized_offers": true,
    "priority_level": "high"
  },
  "historical_data": {
    "total_bookings": 8,
    "total_revenue": 45000000,
    "avg_booking_value": 5625000,
    "first_booking_date": "2024-01-15",
    "last_booking_date": "2025-11-20",
    "booking_frequency_days": 45,
    "cancellation_rate": 0.1,
    "avg_length_of_stay": 3.2
  },
  "model_version": "clv_v1.5",
  "predicted_at": "2025-12-15T10:00:00Z"
}
```

**Customer Segments:**
- `vip` - CLV ≥ 100M VND (Platinum tier)
- `high_value` - CLV 50M-100M VND (Gold tier)
- `medium_value` - CLV 20M-50M VND (Silver tier)
- `low_value` - CLV < 20M VND (Bronze tier)

**Use Cases:**
- ✅ Customer segmentation for marketing
- ✅ Personalized loyalty program assignment
- ✅ Budget allocation for customer acquisition
- ✅ VIP customer identification
- ✅ Churn prevention prioritization

**cURL Example:**
```bash
curl -X POST "http://localhost:8002/api/v1/ml/clv/predict" \
  -H "Content-Type: application/json" \
  -d '{
    "guest_id": "GUEST_001",
    "time_horizon_months": 12
  }'
```

**Python Example:**
```python
import requests

# Predict CLV for a guest
response = requests.post(
    "http://localhost:8002/api/v1/ml/clv/predict",
    json={
        "guest_id": "GUEST_001",
        "time_horizon_months": 12
    }
)

clv_data = response.json()

# Use CLV for decision making
if clv_data["segment"] == "vip":
    print(f"VIP Guest! CLV: {clv_data['predicted_clv']:,.0f} VND")
    print(f"Recommend loyalty tier: {clv_data['recommended_investment']['loyalty_program_tier']}")
    print(f"Max acquisition cost: {clv_data['recommended_investment']['max_acquisition_cost']:,.0f} VND")
```

---

### 2. Batch CLV Prediction

**Endpoint:** `POST /clv/batch`

Calculate CLV for multiple guests at once.

**Request:**
```json
{
  "guest_ids": ["GUEST_001", "GUEST_002", "GUEST_003"],
  "time_horizon_months": 12
}
```

**Response:**
```json
{
  "predictions": [
    {
      "guest_id": "GUEST_001",
      "predicted_clv": 50000000,
      "segment": "high_value",
      "retention_probability": 0.82,
      "confidence": 0.85
    },
    {
      "guest_id": "GUEST_002",
      "predicted_clv": 120000000,
      "segment": "vip",
      "retention_probability": 0.90,
      "confidence": 0.88
    }
  ],
  "total_processed": 3,
  "summary": {
    "avg_clv": 75000000,
    "total_clv": 225000000,
    "avg_retention": 0.85,
    "segment_counts": {
      "vip": 1,
      "high_value": 1,
      "medium_value": 1,
      "low_value": 0
    }
  },
  "model_version": "clv_v1.5",
  "predicted_at": "2025-12-15T10:00:00Z"
}
```

**Use Cases:**
- ✅ Bulk customer segmentation
- ✅ Marketing campaign targeting
- ✅ Portfolio analysis
- ✅ Customer base valuation

---

### 3. CLV Segment Definitions

**Endpoint:** `GET /clv/segments`

Get CLV segment thresholds and definitions.

**Response:**
```json
{
  "segments": {
    "vip": {
      "threshold_min": 100000000,
      "threshold_max": null,
      "description": "VIP guests with CLV >= 100M VND",
      "loyalty_tier": "platinum",
      "priority": "critical"
    },
    "high_value": {
      "threshold_min": 50000000,
      "threshold_max": 100000000,
      "description": "High-value guests with CLV 50M-100M VND",
      "loyalty_tier": "gold",
      "priority": "high"
    },
    "medium_value": {
      "threshold_min": 20000000,
      "threshold_max": 50000000,
      "description": "Medium-value guests with CLV 20M-50M VND",
      "loyalty_tier": "silver",
      "priority": "medium"
    },
    "low_value": {
      "threshold_min": 0,
      "threshold_max": 20000000,
      "description": "Low-value guests with CLV < 20M VND",
      "loyalty_tier": "bronze",
      "priority": "low"
    }
  },
  "currency": "VND",
  "default_time_horizon_months": 12
}
```

---

### 4. CLV Model Information

**Endpoint:** `GET /clv/model/info`

Get information about CLV prediction models.

**Response:**
```json
{
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
    "enabled": true,
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
```

---

## 🏥 Health & Monitoring

### 1. Health Check

**Endpoint:** `GET /health`

Check service health status.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-12-15T15:00:00Z",
  "version": "1.0.0",
  "checks": {
    "database": {
      "status": "ok",
      "latency_ms": 5
    },
    "redis": {
      "status": "ok",
      "latency_ms": 2
    },
    "mlflow": {
      "status": "ok",
      "latency_ms": 50
    }
  },
  "models_loaded": {
    "recommender": "v2.1",
    "pricing_optimizer": "v3.2",
    "churn_predictor": "v1.8",
    "clv_calculator": "v1.5"
  }
}
```

---

### 2. Metrics

**Endpoint:** `GET /metrics`

Prometheus metrics endpoint for monitoring.

---

## ⚠️ Error Handling

### Error Response Format

```json
{
  "detail": "Error message description",
  "status_code": 400
}
```

### Common HTTP Status Codes

| Code | Status                  | Description                    |
| ---- | ----------------------- | ------------------------------ |
| 200  | OK                      | Success                        |
| 400  | Bad Request             | Invalid request parameters     |
| 404  | Not Found               | Resource not found             |
| 422  | Unprocessable Entity    | Validation error               |
| 500  | Internal Server Error   | Server error                   |
| 503  | Service Unavailable     | Service temporarily unavailable|

### Error Examples

**Validation Error (422):**
```json
{
  "detail": [
    {
      "loc": ["body", "time_horizon_months"],
      "msg": "ensure this value is less than or equal to 60",
      "type": "value_error.number.not_le"
    }
  ]
}
```

**Not Found (404):**
```json
{
  "detail": "Guest with ID 'GUEST_999' not found"
}
```

**Server Error (500):**
```json
{
  "detail": "Model inference failed: Model not loaded"
}
```

---

## 📊 Rate Limits & Best Practices

### Rate Limits

| Endpoint Type    | Limit              | Window  |
| ---------------- | ------------------ | ------- |
| Single Prediction| 100 requests/min   | 1 min   |
| Batch Prediction | 10 requests/min    | 1 min   |
| GET endpoints    | 300 requests/min   | 1 min   |

### Best Practices

#### 1. Use Batch Endpoints for Multiple Predictions
**❌ Bad:**
```python
# Multiple single requests
for guest_id in guest_ids:
    response = requests.post("/clv/predict", json={"guest_id": guest_id})
```

**✅ Good:**
```python
# Single batch request
response = requests.post("/clv/batch", json={"guest_ids": guest_ids})
```

#### 2. Cache Frequently Accessed Data
```python
import requests
from functools import lru_cache

@lru_cache(maxsize=1000)
def get_clv_segments():
    """Cache segment definitions"""
    response = requests.get("http://localhost:8002/api/v1/ml/clv/segments")
    return response.json()
```

#### 3. Handle Errors Gracefully
```python
import requests
from requests.exceptions import RequestException

def predict_clv_safe(guest_id: str):
    """Predict CLV with error handling"""
    try:
        response = requests.post(
            "http://localhost:8002/api/v1/ml/clv/predict",
            json={"guest_id": guest_id},
            timeout=10
        )
        response.raise_for_status()
        return response.json()
    except RequestException as e:
        print(f"Error predicting CLV: {e}")
        return None
```

#### 4. Use Async Requests for Better Performance
```python
import asyncio
import aiohttp

async def predict_clv_async(guest_id: str):
    """Async CLV prediction"""
    async with aiohttp.ClientSession() as session:
        async with session.post(
            "http://localhost:8002/api/v1/ml/clv/predict",
            json={"guest_id": guest_id}
        ) as response:
            return await response.json()

# Run multiple predictions concurrently
async def predict_multiple():
    tasks = [predict_clv_async(f"GUEST_{i:03d}") for i in range(10)]
    results = await asyncio.gather(*tasks)
    return results
```

#### 5. Monitor Response Times
```python
import time
import requests

def predict_with_timing(guest_id: str):
    """Predict CLV and measure latency"""
    start = time.time()
    
    response = requests.post(
        "http://localhost:8002/api/v1/ml/clv/predict",
        json={"guest_id": guest_id}
    )
    
    elapsed = time.time() - start
    print(f"Prediction took {elapsed:.2f}s")
    
    return response.json()
```

---

## 🔗 Integration Examples

### 1. Complete Customer Analysis Workflow

```python
import requests

class MLServiceClient:
    def __init__(self, base_url="http://localhost:8002/api/v1/ml"):
        self.base_url = base_url
    
    def analyze_guest(self, guest_id: str):
        """Complete guest analysis using multiple ML endpoints"""
        
        # 1. Predict CLV
        clv_response = requests.post(
            f"{self.base_url}/clv/predict",
            json={"guest_id": guest_id, "time_horizon_months": 12}
        ).json()
        
        # 2. Get personalized recommendations
        rec_response = requests.post(
            f"{self.base_url}/recommend/services",
            json={
                "guest_id": guest_id,
                "top_k": 5,
                "context": {"guest_segment": clv_response["segment"]}
            }
        ).json()
        
        # 3. Check if they have active bookings with churn risk
        # (Assuming you have booking IDs)
        
        return {
            "clv_analysis": clv_response,
            "recommendations": rec_response,
            "segment": clv_response["segment"],
            "loyalty_tier": clv_response["recommended_investment"]["loyalty_program_tier"]
        }

# Usage
client = MLServiceClient()
analysis = client.analyze_guest("GUEST_001")

print(f"Guest Segment: {analysis['segment']}")
print(f"Predicted CLV: {analysis['clv_analysis']['predicted_clv']:,.0f} VND")
print(f"Top Recommendation: {analysis['recommendations']['recommendations'][0]['service_name']}")
```

---

### 2. Dynamic Pricing Dashboard Integration

```python
import requests
from datetime import datetime, timedelta

def get_pricing_dashboard_data(days=30):
    """Get pricing data for dashboard"""
    
    base_url = "http://localhost:8002/api/v1/ml"
    
    # Get optimized pricing for next 30 days
    response = requests.post(
        f"{base_url}/pricing/optimize",
        json={
            "date_range": {
                "start": datetime.now().isoformat(),
                "end": (datetime.now() + timedelta(days=days)).isoformat()
            },
            "room_types": ["deluxe", "suite", "standard"],
            "optimization_goal": "revenue"
        }
    )
    
    pricing_data = response.json()
    
    # Calculate metrics for dashboard
    dashboard_data = {
        "avg_price_increase": pricing_data["summary"]["avg_price_increase"],
        "total_expected_revenue": pricing_data["summary"]["total_expected_revenue"],
        "avg_occupancy": pricing_data["summary"]["avg_occupancy"],
        "pricing_by_date": [
            {
                "date": p["date"],
                "price": p["suggested_price"],
                "occupancy": p["expected_occupancy"]
            }
            for p in pricing_data["pricing_schedule"]
        ]
    }
    
    return dashboard_data
```

---

### 3. Automated Retention Campaign

```python
import requests

def identify_at_risk_bookings(booking_ids: list[str]):
    """Identify at-risk bookings and trigger retention actions"""
    
    base_url = "http://localhost:8002/api/v1/ml"
    
    # Batch predict churn
    response = requests.post(
        f"{base_url}/churn/batch",
        json={"booking_ids": booking_ids}
    )
    
    predictions = response.json()
    
    # Filter high-risk bookings
    high_risk = [
        p for p in predictions["predictions"]
        if p["risk_level"] in ["high", "medium"]
    ]
    
    # For each high-risk booking, get detailed analysis
    for booking in high_risk:
        detail = requests.post(
            f"{base_url}/churn/predict",
            json={
                "booking_id": booking["booking_id"],
                "guest_id": booking.get("guest_id"),
                "features": {}  # Load from database
            }
        ).json()
        
        # Execute recommended actions
        for action in detail["recommended_actions"]:
            if action["priority"] == "high":
                execute_retention_action(
                    booking_id=booking["booking_id"],
                    action=action["action"],
                    details=action.get("details")
                )
    
    return high_risk

def execute_retention_action(booking_id, action, details):
    """Execute retention action (send email, apply discount, etc.)"""
    print(f"Executing {action} for booking {booking_id}")
    # Implement actual action execution
```

---

## 📚 Additional Resources

- **API Documentation:** `http://localhost:8002/docs` (Swagger UI)
- **ReDoc:** `http://localhost:8002/redoc`
- **Architecture Guide:** `docs/ML_SERVICE.md`
- **Model Training:** `docs/CLV_IMPLEMENTATION_SUMMARY.md`
- **Testing Guide:** `test/ml/README.md`

---

## 🆘 Support & Troubleshooting

### Common Issues

**1. Model not loaded error:**
```
Error: Model inference failed: Model not loaded
```
**Solution:** Ensure trained models are placed in `src/application/ml_models/trained_models/`

**2. Connection timeout:**
```
Error: Connection timeout
```
**Solution:** Check if ML service is running on port 8002

**3. Invalid guest_id:**
```
Error: Guest with ID 'GUEST_XYZ' not found
```
**Solution:** Verify guest exists in database

### Contact & Support

- **Documentation:** `docs/`
- **GitHub Issues:** [Create issue](https://github.com/your-repo/issues)
- **Email:** support@yourhotel.com

---

## 📝 Changelog

### Version 1.5.0 (2025-12-15)
- ✅ Added Customer Lifetime Value (CLV) endpoints
- ✅ Implemented RFM analysis
- ✅ Added batch prediction support for CLV
- ✅ Customer segmentation (VIP, High, Medium, Low)

### Version 1.4.0
- ✅ Added dynamic pricing optimization
- ✅ Improved churn prediction accuracy (AUC > 0.75)

### Version 1.3.0
- ✅ Initial release with recommendations and churn prediction

---

**Last Updated:** December 15, 2025  
**API Version:** 1.5.0  
**Service Status:** Production Ready ✅
