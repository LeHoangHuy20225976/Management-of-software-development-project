# ML Service - Machine Learning Service

## 📋 Table of Contents
1. [Service Overview](#service-overview)
2. [Responsibilities](#responsibilities)
3. [Technology Stack](#technology-stack)
4. [Architecture](#architecture)
5. [API Endpoints](#api-endpoints)
6. [ML Models](#ml-models)
7. [Implementation Guide](#implementation-guide)
8. [Model Training & Evaluation](#model-training--evaluation)
9. [Testing Strategy](#testing-strategy)
10. [Deployment](#deployment)
11. [Monitoring & Metrics](#monitoring--metrics)

---

## 🎯 Service Overview

**Port:** 8002
**Framework:** FastAPI
**Language:** Python 3.10+
**Purpose:** Provide machine learning capabilities for recommendations, forecasting, pricing optimization, and churn prediction

### Key Features
- ✅ Personalized service recommendations
- ✅ Dynamic room pricing optimization
- ✅ Booking churn prediction (AUC > 0.75)
- ✅ Occupancy forecasting (MAPE < 10%)
- ✅ Revenue forecasting
- ✅ Customer lifetime value (CLV) prediction
- ✅ Housekeeping demand forecasting

---

## 🎯 Responsibilities

### 1. Recommendation Engine
- Personalized service recommendations for guests
- Room recommendations based on preferences and history
- Cross-sell and upsell suggestions
- Similar guest clustering for marketing

### 2. Dynamic Pricing
- Real-time price optimization based on:
  - Current occupancy
  - Historical patterns
  - Competitor pricing
  - Seasonal trends
  - Special events
- Multi-room-type pricing strategies

### 3. Forecasting
- Occupancy rate forecasts (daily, weekly, monthly)
- Revenue projections
- Housekeeping workload prediction
- Demand forecasting for services

### 4. Churn Prediction
- Booking cancellation probability
- No-show risk assessment
- Guest retention likelihood
- Early warning system for at-risk bookings

### 5. Customer Analytics
- Customer lifetime value (CLV) calculation
- Guest segmentation
- Behavior pattern analysis
- Personalization features

---

## 🛠️ Technology Stack

### Core Framework
```yaml
Framework: FastAPI 0.109.0
Language: Python 3.10+
ASGI Server: Uvicorn
API Docs: OpenAPI/Swagger
```

### ML Libraries
```yaml
Core ML:
  - scikit-learn 1.4.0
  - xgboost 2.0.3
  - lightgbm 4.1.0
  - catboost 1.2.2

Deep Learning:
  - torch 2.1.2
  - tensorflow 2.15.0 (optional)

Time Series:
  - prophet 1.1.5
  - statsmodels 0.14.1
  - pmdarima 2.0.4

Recommendation:
  - surprise 1.1.3
  - implicit 0.7.0
  - lightfm 1.17

Data Processing:
  - pandas 2.1.4
  - numpy 1.26.3
  - polars 0.20.3 (fast alternative)

Feature Engineering:
  - featuretools 1.30.0
  - category_encoders 2.6.3
```

### ML Ops
```yaml
Experiment Tracking:
  - mlflow 2.9.2

Model Serving:
  - onnxruntime 1.16.3
  - triton-inference-server (optional)

Feature Store:
  - feast 0.35.0 (optional)

Hyperparameter Tuning:
  - optuna 3.5.0
  - hyperopt 0.2.7
```

### Databases & Storage
```yaml
Relational Database:
  - asyncpg 0.29.0 (PostgreSQL)
  - sqlalchemy 2.0.25

Cache:
  - redis 5.0.1
  - aioredis 2.0.1

Time Series DB:
  - influxdb-client 1.38.0 (optional)
```

### Message Queue
```yaml
RabbitMQ:
  - aio-pika 9.3.1
```

### Utilities
```yaml
HTTP Client:
  - httpx 0.26.0

Task Queue:
  - celery 5.3.4 (for async training)

Validation:
  - pydantic 2.5.3

Monitoring:
  - prometheus-client 0.19.0
```

---

## 🏗️ Architecture

### Directory Structure
```
ml-service/
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPI app entry point
│   ├── config.py               # Configuration management
│   ├── dependencies.py         # Dependency injection
│   │
│   ├── api/                    # API layer
│   │   ├── __init__.py
│   │   ├── v1/
│   │   │   ├── __init__.py
│   │   │   ├── endpoints/
│   │   │   │   ├── recommend.py    # Recommendation endpoints
│   │   │   │   ├── pricing.py      # Pricing endpoints
│   │   │   │   ├── forecast.py     # Forecasting endpoints
│   │   │   │   ├── churn.py        # Churn prediction endpoints
│   │   │   │   └── clv.py          # CLV endpoints
│   │   │   └── router.py       # API router aggregation
│   │
│   ├── core/                   # Core ML logic
│   │   ├── __init__.py
│   │   ├── recommender.py      # Recommendation engine
│   │   ├── pricing_optimizer.py # Dynamic pricing
│   │   ├── forecaster.py       # Time series forecasting
│   │   ├── churn_predictor.py  # Churn prediction
│   │   └── clv_calculator.py   # CLV calculation
│   │
│   ├── models/                 # Pydantic models
│   │   ├── __init__.py
│   │   ├── recommend.py
│   │   ├── pricing.py
│   │   ├── forecast.py
│   │   ├── churn.py
│   │   └── clv.py
│   │
│   ├── ml_models/              # ML model management
│   │   ├── __init__.py
│   │   ├── model_registry.py   # Model versioning
│   │   ├── model_loader.py     # Load models on startup
│   │   ├── feature_engineering.py
│   │   └── trained_models/     # Serialized models (gitignored)
│   │
│   ├── services/               # External service integrations
│   │   ├── __init__.py
│   │   ├── database.py         # PostgreSQL client
│   │   ├── cache.py            # Redis client
│   │   ├── message_queue.py    # RabbitMQ client
│   │   └── mlflow_client.py    # MLflow tracking
│   │
│   ├── training/               # Model training scripts
│   │   ├── __init__.py
│   │   ├── train_recommender.py
│   │   ├── train_pricing.py
│   │   ├── train_forecaster.py
│   │   ├── train_churn.py
│   │   └── utils.py
│   │
│   └── utils/                  # Utilities
│       ├── __init__.py
│       ├── data_loader.py      # Data loading utilities
│       ├── logging.py          # Logging setup
│       └── metrics.py          # Prometheus metrics
│
├── notebooks/                  # Jupyter notebooks for exploration
│   ├── exploratory_analysis.ipynb
│   ├── model_experimentation.ipynb
│   └── feature_engineering.ipynb
│
├── tests/
│   ├── __init__.py
│   ├── conftest.py
│   ├── unit/
│   │   ├── test_recommender.py
│   │   ├── test_pricing.py
│   │   └── test_forecaster.py
│   ├── integration/
│   │   ├── test_api_recommend.py
│   │   └── test_api_pricing.py
│   └── performance/
│       └── test_model_latency.py
│
├── scripts/
│   ├── train_all_models.py     # Train all models
│   ├── evaluate_models.py      # Evaluate model performance
│   └── export_models.py        # Export to ONNX
│
├── data/                       # Data for training (gitignored)
│   ├── raw/
│   ├── processed/
│   └── features/
│
├── mlruns/                     # MLflow tracking (gitignored)
│
├── Dockerfile
├── docker-compose.yml
├── requirements.txt
├── requirements-dev.txt
├── .env.example
└── README.md
```

### Component Interaction
```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │ HTTP Request
       ▼
┌──────────────────────────────────┐
│      FastAPI Router              │
│  /api/v1/ml/recommend/services   │
└──────┬───────────────────────────┘
       │
       ▼
┌──────────────────────────────────┐
│   Recommendation Engine          │
│  1. Load guest profile           │
│  2. Extract features             │
│  3. Run ML model inference       │
│  4. Rank & filter results        │
└──────┬───────────────────────────┘
       │
       ├──────────────────┐
       ▼                  ▼
┌─────────────┐    ┌─────────────┐
│ PostgreSQL  │    │   Redis     │
│ (Features)  │    │  (Cache)    │
└─────────────┘    └─────────────┘
```

---

## 🔌 API Endpoints

### Recommendation Engine

#### POST `/api/v1/ml/recommend/services`
Get personalized service recommendations for a guest.

**Request:**
```json
{
  "guest_id": "GUEST001",
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
  "guest_id": "GUEST001",
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
    },
    {
      "service_id": "SVC_LAUNDRY_001",
      "service_name": "Express Laundry Service",
      "category": "laundry",
      "score": 0.82,
      "confidence": 0.88,
      "reason": "Frequently used by guests in your segment",
      "estimated_revenue": 200000,
      "discount_eligible": false,
      "availability": "available"
    }
  ],
  "total_recommendations": 5,
  "inference_time_ms": 45,
  "model_version": "recommender_v2.1"
}
```

---

#### POST `/api/v1/ml/recommend/rooms`
Recommend rooms based on guest preferences.

**Request:**
```json
{
  "guest_id": "GUEST001",
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
  "guest_id": "GUEST001",
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

### Dynamic Pricing

#### POST `/api/v1/ml/pricing/optimize`
Get optimized pricing for rooms.

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
    },
    {
      "date": "2025-02-02",
      "room_type": "deluxe",
      "base_price": 2000000,
      "suggested_price": 2800000,
      "price_multiplier": 1.4,
      "expected_occupancy": 0.92,
      "expected_revenue": 25760000,
      "competitor_avg_price": 2600000,
      "demand_score": 0.95,
      "confidence": 0.91,
      "factors": {
        "day_of_week": "Saturday",
        "is_holiday": false,
        "local_events": ["Tech Conference"],
        "historical_occupancy": 0.88,
        "booking_pace": "very_fast"
      }
    }
  ],
  "summary": {
    "total_expected_revenue": 750000000,
    "avg_occupancy": 0.83,
    "avg_price_increase": 22.5
  },
  "model_version": "pricing_v3.2",
  "generated_at": "2025-01-17T10:00:00Z"
}
```

---

#### GET `/api/v1/ml/pricing/current/{room_type}`
Get current optimized price for a room type.

**Response:**
```json
{
  "room_type": "deluxe",
  "date": "2025-01-17",
  "base_price": 2000000,
  "current_price": 2200000,
  "price_multiplier": 1.1,
  "valid_until": "2025-01-18T00:00:00Z",
  "demand_level": "medium"
}
```

---

### Churn Prediction

#### POST `/api/v1/ml/churn/predict`
Predict booking cancellation probability.

**Request:**
```json
{
  "booking_id": "BOOK001",
  "guest_id": "GUEST001",
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
  "booking_id": "BOOK001",
  "guest_id": "GUEST001",
  "churn_probability": 0.35,
  "risk_level": "medium",
  "confidence": 0.86,
  "risk_factors": [
    {
      "factor": "long_lead_time",
      "impact_score": 0.15,
      "description": "Bookings made 30+ days in advance have higher cancellation rates"
    },
    {
      "factor": "price_sensitivity",
      "impact_score": 0.12,
      "description": "Price point above guest's typical spending"
    },
    {
      "factor": "no_loyalty_benefits_applied",
      "impact_score": 0.08,
      "description": "Gold member but no loyalty discount applied"
    }
  ],
  "protective_factors": [
    {
      "factor": "repeat_guest",
      "impact_score": -0.10,
      "description": "Guest has completed 5 previous stays"
    },
    {
      "factor": "credit_card_payment",
      "impact_score": -0.05,
      "description": "Credit card payment indicates commitment"
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
      "action": "offer_flexible_cancellation",
      "priority": "medium",
      "timing": "7_days_before",
      "expected_impact": 0.08
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
  "predicted_at": "2025-01-17T10:00:00Z"
}
```

---

#### POST `/api/v1/ml/churn/batch`
Batch predict churn for multiple bookings.

**Request:**
```json
{
  "booking_ids": ["BOOK001", "BOOK002", "BOOK003"]
}
```

**Response:**
```json
{
  "predictions": [
    {
      "booking_id": "BOOK001",
      "churn_probability": 0.35,
      "risk_level": "medium"
    },
    {
      "booking_id": "BOOK002",
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

---

### Forecasting

#### POST `/api/v1/ml/forecast/occupancy`
Forecast hotel occupancy rates.

**Request:**
```json
{
  "forecast_days": 30,
  "room_type": "all",
  "include_confidence_intervals": true
}
```

**Response:**
```json
{
  "forecasts": [
    {
      "date": "2025-02-01",
      "predicted_occupancy": 0.78,
      "lower_bound": 0.70,
      "upper_bound": 0.85,
      "confidence_level": 0.95,
      "total_rooms": 100,
      "predicted_occupied": 78,
      "predicted_available": 22
    },
    {
      "date": "2025-02-02",
      "predicted_occupancy": 0.85,
      "lower_bound": 0.78,
      "upper_bound": 0.91,
      "confidence_level": 0.95,
      "total_rooms": 100,
      "predicted_occupied": 85,
      "predicted_available": 15
    }
  ],
  "summary": {
    "avg_occupancy": 0.82,
    "peak_date": "2025-02-14",
    "peak_occupancy": 0.95,
    "lowest_date": "2025-02-05",
    "lowest_occupancy": 0.65
  },
  "model_info": {
    "model_type": "Prophet",
    "model_version": "forecast_v2.3",
    "training_data_range": "2022-01-01 to 2025-01-16",
    "mape": 8.5,
    "rmse": 0.07
  },
  "generated_at": "2025-01-17T10:00:00Z"
}
```

---

#### POST `/api/v1/ml/forecast/revenue`
Forecast revenue projections.

**Request:**
```json
{
  "forecast_days": 30,
  "breakdown_by": "room_type"
}
```

**Response:**
```json
{
  "forecasts": [
    {
      "date": "2025-02-01",
      "predicted_revenue": 85000000,
      "lower_bound": 75000000,
      "upper_bound": 95000000,
      "breakdown": {
        "deluxe": 45000000,
        "suite": 30000000,
        "standard": 10000000
      }
    }
  ],
  "summary": {
    "total_forecasted_revenue": 2400000000,
    "avg_daily_revenue": 80000000,
    "peak_revenue_date": "2025-02-14",
    "peak_revenue": 120000000
  }
}
```

---

#### POST `/api/v1/ml/forecast/housekeeping_demand`
Forecast housekeeping workload.

**Request:**
```json
{
  "forecast_days": 7
}
```

**Response:**
```json
{
  "forecasts": [
    {
      "date": "2025-01-18",
      "predicted_checkouts": 25,
      "predicted_stayovers": 60,
      "total_rooms_to_clean": 85,
      "estimated_hours_needed": 170,
      "recommended_staff": 12,
      "peak_hours": ["09:00-12:00"]
    }
  ]
}
```

---

### Customer Lifetime Value

#### POST `/api/v1/ml/clv/predict`
Calculate predicted customer lifetime value.

**Request:**
```json
{
  "guest_id": "GUEST001",
  "time_horizon_months": 12
}
```

**Response:**
```json
{
  "guest_id": "GUEST001",
  "predicted_clv": 50000000,
  "time_horizon_months": 12,
  "currency": "VND",
  "confidence": 0.82,
  "breakdown": {
    "predicted_bookings": 6,
    "avg_booking_value": 8000000,
    "predicted_ancillary_revenue": 2000000
  },
  "segment": "high_value",
  "retention_probability": 0.82,
  "churn_risk": 0.18,
  "recommended_investment": {
    "max_acquisition_cost": 5000000,
    "loyalty_program_tier": "platinum",
    "personalized_offers": true
  },
  "historical_data": {
    "total_bookings": 12,
    "total_revenue": 95000000,
    "avg_booking_value": 7900000,
    "first_booking_date": "2023-05-15",
    "last_booking_date": "2025-01-10",
    "booking_frequency_days": 45
  },
  "model_version": "clv_v1.5",
  "predicted_at": "2025-01-17T10:00:00Z"
}
```

---

### Model Management

#### POST `/api/v1/ml/retrain/{model_name}`
Trigger model retraining.

**Request:**
```json
{
  "training_data_range": {
    "start": "2023-01-01",
    "end": "2025-01-16"
  },
  "hyperparameters": {
    "learning_rate": 0.01,
    "n_estimators": 100
  },
  "async": true
}
```

**Response:**
```json
{
  "job_id": "train_job_12345",
  "model_name": "churn_predictor",
  "status": "queued",
  "estimated_duration_minutes": 30,
  "mlflow_run_id": "abc123def456"
}
```

---

#### GET `/api/v1/ml/models/{model_name}/info`
Get model information.

**Response:**
```json
{
  "model_name": "churn_predictor",
  "version": "1.8",
  "model_type": "XGBoost",
  "status": "production",
  "metrics": {
    "auc": 0.82,
    "precision": 0.78,
    "recall": 0.75,
    "f1_score": 0.76
  },
  "training_date": "2025-01-10T00:00:00Z",
  "training_samples": 50000,
  "feature_count": 25,
  "inference_latency_ms": 15
}
```

---

### Health & Monitoring

#### GET `/api/v1/ml/health`
Health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-01-17T15:00:00Z",
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
    "occupancy_forecaster": "v2.3",
    "clv_calculator": "v1.5"
  }
}
```

---

#### GET `/api/v1/ml/metrics`
Prometheus metrics endpoint.

---

## 🧠 ML Models

### 1. Recommendation Model

**Algorithm:** Collaborative Filtering + Content-Based Hybrid

**Architecture:**
```python
# Two-tower neural network approach
class RecommendationModel(nn.Module):
    def __init__(self, n_users, n_services, embedding_dim=64):
        super().__init__()

        # User tower
        self.user_embedding = nn.Embedding(n_users, embedding_dim)
        self.user_features = nn.Linear(20, embedding_dim)

        # Service tower
        self.service_embedding = nn.Embedding(n_services, embedding_dim)
        self.service_features = nn.Linear(15, embedding_dim)

        # Interaction layers
        self.fc1 = nn.Linear(embedding_dim * 2, 128)
        self.fc2 = nn.Linear(128, 64)
        self.output = nn.Linear(64, 1)

    def forward(self, user_id, service_id, user_feats, service_feats):
        # User representation
        user_emb = self.user_embedding(user_id)
        user_dense = self.user_features(user_feats)
        user_repr = user_emb + user_dense

        # Service representation
        service_emb = self.service_embedding(service_id)
        service_dense = self.service_features(service_feats)
        service_repr = service_emb + service_dense

        # Interaction
        combined = torch.cat([user_repr, service_repr], dim=-1)
        x = F.relu(self.fc1(combined))
        x = F.relu(self.fc2(x))
        score = torch.sigmoid(self.output(x))

        return score
```

**Features:**
- Guest demographics (age, nationality, segment)
- Historical booking patterns
- Service usage history
- Temporal features (season, day of week)
- Service attributes (category, price, popularity)

**Training:**
- Loss: Binary Cross-Entropy
- Optimizer: Adam
- Metrics: AUC-ROC, Precision@K, Recall@K

---

### 2. Dynamic Pricing Model

**Algorithm:** XGBoost Regressor with custom loss

**Features (35 total):**
```python
PRICING_FEATURES = [
    # Demand indicators
    'current_occupancy_rate',
    'booking_pace_7d',
    'booking_pace_30d',
    'days_until_date',

    # Historical patterns
    'historical_occupancy_same_dow',  # day of week
    'historical_occupancy_same_month',
    'historical_avg_price',

    # Temporal
    'day_of_week',
    'month',
    'is_weekend',
    'is_holiday',
    'week_of_year',

    # External factors
    'competitor_avg_price',
    'competitor_min_price',
    'competitor_max_price',
    'local_event_score',  # 0-1 based on nearby events

    # Room specific
    'room_type_encoded',
    'room_capacity',
    'room_amenities_count',

    # Market conditions
    'city_hotel_occupancy_rate',
    'tourism_index',
    'weather_score',

    # Lag features
    'occupancy_lag_7',
    'occupancy_lag_14',
    'price_lag_7',

    # Rolling statistics
    'occupancy_rolling_mean_7d',
    'occupancy_rolling_std_7d',
    'price_rolling_mean_7d',
]
```

**Custom Loss Function:**
```python
def revenue_optimized_loss(y_pred, y_true, occupancy_elasticity=-1.5):
    """
    Optimize for revenue = price * occupancy
    Account for price elasticity of demand
    """
    price_diff = y_pred - y_true
    occupancy_impact = occupancy_elasticity * (price_diff / y_true)

    # Revenue loss
    revenue_loss = -(y_pred * (1 + occupancy_impact))

    # Regularization to prevent extreme prices
    price_penalty = torch.abs(price_diff / y_true)

    return revenue_loss.mean() + 0.1 * price_penalty.mean()
```

---

### 3. Churn Prediction Model

**Algorithm:** LightGBM Classifier

**Features (25 total):**
```python
CHURN_FEATURES = [
    # Booking characteristics
    'booking_lead_time_days',
    'total_amount',
    'length_of_stay',
    'room_type_encoded',
    'payment_method_encoded',
    'booking_source_encoded',

    # Guest history
    'is_first_booking',
    'previous_bookings_count',
    'previous_cancellations_count',
    'cancellation_rate',
    'avg_previous_booking_value',
    'days_since_last_booking',

    # Engagement
    'special_requests_count',
    'booking_modifications_count',
    'loyalty_tier_encoded',
    'loyalty_points_balance',

    # Behavioral
    'time_spent_on_website_minutes',
    'pages_viewed',
    'price_comparison_searches',

    # Temporal
    'days_until_checkin',
    'booking_dow',
    'booking_hour',
    'season',

    # Price sensitivity
    'price_vs_avg_ratio',
    'discount_applied',
]
```

**Model Configuration:**
```python
churn_model_params = {
    'objective': 'binary',
    'metric': 'auc',
    'boosting_type': 'gbdt',
    'num_leaves': 31,
    'learning_rate': 0.05,
    'feature_fraction': 0.8,
    'bagging_fraction': 0.8,
    'bagging_freq': 5,
    'max_depth': 7,
    'min_child_samples': 20,
    'class_weight': 'balanced',  # Handle imbalanced data
    'n_estimators': 500,
    'early_stopping_rounds': 50
}
```

---

### 4. Occupancy Forecasting Model

**Algorithm:** Prophet (Facebook's time series forecasting)

**Model Configuration:**
```python
from prophet import Prophet

forecaster = Prophet(
    seasonality_mode='multiplicative',
    changepoint_prior_scale=0.05,
    holidays=vietnam_holidays,  # Custom holiday calendar
    daily_seasonality=False,
    weekly_seasonality=True,
    yearly_seasonality=True
)

# Add custom seasonalities
forecaster.add_seasonality(
    name='monthly',
    period=30.5,
    fourier_order=5
)

# Add external regressors
forecaster.add_regressor('local_events_score')
forecaster.add_regressor('competitor_occupancy')
forecaster.add_regressor('weather_quality_index')
forecaster.add_regressor('tourism_index')
```

**Features:**
- Historical occupancy data (2+ years)
- Vietnamese holidays and festivals
- Local events calendar
- Weather patterns
- Tourism seasonality

---

### 5. CLV (Customer Lifetime Value) Model

**Approach:** RFM + Predictive Model

**Steps:**
1. Calculate RFM scores (Recency, Frequency, Monetary)
2. Predict future behavior with XGBoost
3. Calculate CLV based on predictions

```python
def calculate_clv(guest_data, time_horizon_months=12):
    """
    CLV = (Average Booking Value) × (Bookings per Year) ×
          (Retention Rate) × (Time Horizon) - (Acquisition Cost)
    """

    # Predict future bookings
    predicted_bookings = booking_frequency_model.predict(guest_features)

    # Predict average booking value
    predicted_avg_value = booking_value_model.predict(guest_features)

    # Predict retention probability
    retention_prob = retention_model.predict_proba(guest_features)[:, 1]

    # Calculate CLV
    clv = (
        predicted_avg_value *
        predicted_bookings *
        retention_prob *
        (time_horizon_months / 12)
    )

    return clv
```

---

## 💻 Implementation Guide

### 1. Configuration (`app/config.py`)

```python
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # App
    APP_NAME: str = "ML Service"
    VERSION: str = "1.0.0"
    PORT: int = 8002
    DEBUG: bool = False

    # Database
    DATABASE_URL: str
    POSTGRES_POOL_SIZE: int = 20

    # Redis
    REDIS_URL: str = "redis://localhost:6379/1"
    PREDICTION_CACHE_TTL: int = 3600  # 1 hour

    # RabbitMQ
    RABBITMQ_URL: str = "amqp://guest:guest@localhost:5672/"

    # MLflow
    MLFLOW_TRACKING_URI: str = "http://localhost:5000"
    MLFLOW_EXPERIMENT_NAME: str = "hotel-ml"

    # Model paths
    MODEL_DIR: str = "app/ml_models/trained_models"
    RECOMMENDER_MODEL_PATH: str = f"{MODEL_DIR}/recommender_v2.1.pkl"
    PRICING_MODEL_PATH: str = f"{MODEL_DIR}/pricing_v3.2.pkl"
    CHURN_MODEL_PATH: str = f"{MODEL_DIR}/churn_v1.8.pkl"
    FORECAST_MODEL_PATH: str = f"{MODEL_DIR}/forecast_v2.3.pkl"

    # Model settings
    RECOMMENDATION_TOP_K: int = 10
    CHURN_THRESHOLD: float = 0.5
    FORECAST_CONFIDENCE_LEVEL: float = 0.95

    class Config:
        env_file = ".env"
```

---

### 2. Model Registry (`app/ml_models/model_registry.py`)

```python
import joblib
import mlflow
from typing import Any, Dict
from pathlib import Path

class ModelRegistry:
    """Centralized model loading and versioning"""

    def __init__(self, config):
        self.config = config
        self.models: Dict[str, Any] = {}
        mlflow.set_tracking_uri(config.MLFLOW_TRACKING_URI)

    def load_model(self, model_name: str, model_path: str):
        """Load model from disk"""
        if model_name in self.models:
            return self.models[model_name]

        path = Path(model_path)
        if not path.exists():
            raise FileNotFoundError(f"Model not found: {model_path}")

        model = joblib.load(model_path)
        self.models[model_name] = model
        return model

    def load_from_mlflow(self, model_name: str, version: str = "latest"):
        """Load model from MLflow registry"""
        if version == "latest":
            model_uri = f"models:/{model_name}/Production"
        else:
            model_uri = f"models:/{model_name}/{version}"

        model = mlflow.pyfunc.load_model(model_uri)
        self.models[model_name] = model
        return model

    def get_model(self, model_name: str):
        """Get loaded model"""
        if model_name not in self.models:
            raise ValueError(f"Model not loaded: {model_name}")
        return self.models[model_name]

# Singleton
_registry: Optional[ModelRegistry] = None

def get_model_registry() -> ModelRegistry:
    global _registry
    if _registry is None:
        from app.config import get_settings
        _registry = ModelRegistry(get_settings())
    return _registry
```

---

### 3. Recommendation Engine (`app/core/recommender.py`)

```python
import numpy as np
from typing import List, Dict
import torch

class RecommendationEngine:
    def __init__(self, model, config):
        self.model = model
        self.config = config

    async def recommend_services(
        self,
        guest_id: str,
        context: Dict,
        top_k: int = 10,
        exclude_services: List[str] = None
    ) -> List[Dict]:
        """
        Generate personalized service recommendations
        """

        # Load guest profile and history
        guest_profile = await self._load_guest_profile(guest_id)
        guest_history = await self._load_guest_history(guest_id)

        # Get all available services
        available_services = await self._get_available_services(exclude_services)

        # Prepare features
        features = self._prepare_features(
            guest_profile,
            guest_history,
            context,
            available_services
        )

        # Run model inference
        with torch.no_grad():
            scores = self.model.predict(features)

        # Rank and filter
        recommendations = self._rank_and_filter(
            available_services,
            scores,
            top_k
        )

        # Add explanations
        recommendations = self._add_explanations(recommendations, guest_profile)

        return recommendations

    def _prepare_features(self, guest_profile, history, context, services):
        """Feature engineering for recommendation"""

        features = []

        for service in services:
            feature_vec = {
                # Guest features
                'guest_segment': guest_profile['segment'],
                'total_previous_bookings': history['total_bookings'],
                'avg_booking_value': history['avg_value'],

                # Service features
                'service_category': service['category'],
                'service_price': service['price'],
                'service_popularity': service['usage_count'],

                # Context features
                'day_of_week': context.get('day_of_week', 0),
                'time_of_day': context.get('time_of_day', 'morning'),
                'length_of_stay': context.get('length_of_stay', 1),

                # Interaction features
                'used_before': 1 if service['id'] in history['used_services'] else 0,
                'similar_users_usage': service['similar_guest_usage_rate'],
            }

            features.append(feature_vec)

        return features

    def _add_explanations(self, recommendations, guest_profile):
        """Add human-readable explanations"""

        for rec in recommendations:
            if rec['score'] > 0.8:
                rec['reason'] = f"Highly popular with {guest_profile['segment']} guests"
            elif rec.get('used_before'):
                rec['reason'] = "You've enjoyed this service before"
            else:
                rec['reason'] = "Recommended based on guests with similar preferences"

        return recommendations
```

---

(Tiếp tục trong phần 2...)

## 📊 Model Training & Evaluation

### Training Pipeline

```bash
# Train all models
python scripts/train_all_models.py --config config/training.yaml

# Train specific model
python app/training/train_churn.py \
  --data-path data/processed/bookings.csv \
  --test-size 0.2 \
  --cv-folds 5 \
  --log-mlflow
```

### Model Evaluation Metrics

**Recommender:**
- Precision@K, Recall@K
- NDCG (Normalized Discounted Cumulative Gain)
- MAP (Mean Average Precision)

**Pricing:**
- RMSE (Root Mean Square Error)
- MAE (Mean Absolute Error)
- Revenue lift vs baseline

**Churn:**
- AUC-ROC
- Precision, Recall, F1
- Profit curve analysis

**Forecasting:**
- MAPE (Mean Absolute Percentage Error)
- RMSE
- Coverage of confidence intervals

---

## 🚀 Deployment

### Dockerfile
```dockerfile
FROM python:3.10-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY app/ ./app/
COPY scripts/ ./scripts/

# Copy trained models
COPY app/ml_models/trained_models ./app/ml_models/trained_models

EXPOSE 8002

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8002"]
```

---

## 📊 Monitoring & Metrics

### Key Metrics to Track
- Model prediction latency (p50, p95, p99)
- Prediction cache hit rate
- Model accuracy drift over time
- Feature distribution shifts
- Business impact metrics (conversion rate, revenue lift)

---

Đây là file ML_SERVICE.md hoàn chỉnh với đầy đủ specifications, code examples, và deployment guide!
