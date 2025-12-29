# VietStay Hotel Management System - Task Analysis Summary

**Analysis Date:** December 29, 2025
**Total Tasks Identified:** 38
**High Priority:** 10 | Medium Priority: 13 | Low Priority: 0

---

## Executive Summary

This comprehensive analysis of the VietStay codebase identified 38 actionable development tasks across three teams. The project has a solid architectural foundation with clear modular separation. Key gaps include:

- **8 missing API endpoints** (reviews, admin management, user statistics)
- **5 incomplete feature implementations** (promo codes, liveness detection, PDF export)
- **Database query implementations** needed for analytics and CLV prediction
- **Security configurations** required before production deployment

---

## Frontend Team (5 Developers) - 8 Tasks

### High Priority (3 tasks)

#### 1. FE-001: Remove Hardcoded Hotel IDs
- **Files:** `/frontend/app/hotel/dashboard/profile/page.tsx:31`
- **Issue:** Hardcoded `hotelId = 'h1'` prevents multi-hotel support
- **Effort:** 4 hours
- **Impact:** HIGH - Blocks production deployment for multiple hotels
- **Action:** Extract hotel ID from auth context or URL parameters

#### 2. FE-002: Complete Room Edit API Integration
- **Files:** `/frontend/app/hotel/rooms/[id]/edit/page.tsx:83`
- **Issue:** API call not implemented (TODO comment present)
- **Effort:** 4 hours
- **Action:** Implement PUT request to update room details, add error handling

#### 3. FE-006: Implement PDF Download Feature
- **Files:** `/frontend/app/booking/confirmation/page.tsx:59`
- **Issue:** PDF export stub implementation only
- **Effort:** 8 hours
- **Dependencies:** PDF library (jsPDF/html2pdf)
- **Action:** Generate PDF from booking confirmation data with proper formatting

### Medium Priority (5 tasks)

#### 4. FE-003: Implement Destination Reviews Display
- **Files:** `/frontend/app/tourism/[destination_id]/page.tsx:47`
- **Issue:** Backend reviews endpoint not implemented
- **Effort:** 6 hours
- **Backend Dependency:** GET `/destinations/:id/reviews`

#### 5. FE-004: Add User Reviews Stats
- **Files:** `/frontend/app/user/dashboard/profile/page.tsx:69`
- **Issue:** Reviews count always shows 0
- **Effort:** 5 hours
- **Backend Dependency:** GET `/users/:id/reviews`

#### 6. FE-005: Configure Google Maps API
- **Files:** `/frontend/components/search/ResultsMap.tsx:12`
- **Issue:** Missing API key documentation and validation
- **Effort:** 3 hours
- **Action:** Create `.env.local` guide, improve error messaging

#### 7. FE-007: Add Promo Code UI
- **Files:** `/frontend/app/booking/page.tsx`
- **Issue:** No frontend for promo code validation
- **Effort:** 5 hours
- **Backend Dependency:** BE-001

#### 8. FE-008: Complete Admin Dashboard
- **Files:** `/frontend/app/admin/*`
- **Issue:** Admin pages exist but are not fully implemented
- **Effort:** 12 hours
- **Features Needed:**
  - System statistics dashboard
  - User management table
  - Hotel approval workflow
  - Destination management
  - Revenue analytics

---

## Backend Team (4 Developers) - 7 Tasks

### High Priority (3 tasks)

#### 1. BE-001: Implement Promo Code System
- **Files:** `/backend/modules/pricing-engine/services/pricingEngineService.js:187`
- **Issue:** Method placeholder with `TODO` comment
- **Effort:** 8 hours
- **Database Requirements:**
  - Create `promo_codes` table
  - Fields: code, discount_type, discount_value, start_date, end_date, max_uses, usage_count, active
- **Endpoints Needed:**
  - `POST /promo-codes` (admin create)
  - `GET /promo-codes/:code` (validate and apply)
  - `POST /promo-codes/:code/apply`
- **Acceptance Criteria:**
  - Validate code format and expiration
  - Track usage and prevent over-usage
  - Support percentage and fixed amount discounts
  - Test with edge cases (expired codes, max uses reached)

#### 2. BE-005: Implement Admin Management APIs
- **Files:** `/backend/modules/admin/routes/adminRoutes.js`
- **Issue:** Admin module exists but endpoints not fully implemented
- **Effort:** 12 hours
- **Endpoints Needed:**
  - `GET /admin/statistics` - System-wide metrics
  - `GET /admin/users` - User management list
  - `GET /admin/hotels` - Hotel management list
  - `GET /admin/destinations` - Destination management
  - `PUT /admin/users/:id` - Modify user status
  - `PUT /admin/hotels/:id` - Approve/reject hotels
  - `DELETE` endpoints with soft deletes
- **Features:**
  - Pagination and filtering
  - Admin role verification
  - Audit logging for all actions

#### 3. BE-006: Implement Database Queries for CLV Analytics
- **Files:** `/backend/modules/analytics/services/customerService.js`
- **Issue:** Mock data used instead of real database queries
- **Effort:** 6 hours
- **Queries Needed:**
  - Guest booking history with dates and amounts
  - Cancellation patterns and rates
  - Service usage tracking
  - Revenue metrics over time
- **Performance:** Add caching and create stored procedures

### Medium Priority (4 tasks)

#### 4. BE-002: Email Rate Limiting & Unsubscribe
- **Files:** `/backend/modules/notification/EMAIL_NOTIFICATION_GUIDE.md:444`
- **Issue:** TODO comments for missing features
- **Effort:** 10 hours
- **Implementation:**
  - Rate limiting: max 5 emails per user per hour
  - Create `email_preferences` table
  - Add unsubscribe endpoint: `POST /notifications/unsubscribe/:token`
  - Generate unsubscribe tokens in email templates
  - Implement async email queue (Bull/RabbitMQ)

#### 5. BE-003: Destination Reviews API
- **Files:** `/backend/modules/tourism/routes/tourismRoutes.js`
- **Issue:** Reviews endpoint doesn't exist
- **Effort:** 8 hours
- **Endpoints:**
  - `GET /destinations/:id/reviews` (with pagination)
  - `POST /destinations/:id/reviews` (create)
  - `PUT /destinations/:id/reviews/:review_id` (user's own reviews)
  - `DELETE /destinations/:id/reviews/:review_id`
- **Features:** Rating statistics, authentication checks

#### 6. BE-004: User Reviews API
- **Files:** `/backend/modules/user/routes/userRoutes.js`
- **Issue:** User review history not available
- **Effort:** 6 hours
- **Endpoints:**
  - `GET /users/:id/reviews` (with pagination)
  - Return review count, average rating
  - Support filtering by destination, rating, date

---

## AI/ML Team (4 Developers) - 8 Tasks

### High Priority (4 tasks)

#### 1. AI-001: Implement Liveness Detection
- **Files:** `/AI/src/application/services/cv/face_recognition.py:59`
- **Issue:** Only placeholder implementation (always returns True)
- **Effort:** 8 hours
- **Implementation:**
  - Integrate Silent-Face-Anti-Spoofing or similar model
  - Replace `TODO` in `__init__` and `detect()` methods
  - Return confidence score 0-1
- **Testing:** Live face, printed photos, video attacks
- **Note:** Requires GPU resources for inference

#### 2. AI-006: Configure CORS for Production
- **Files:** `/AI/src/application/controllers/storage/main.py:71`
- **Issue:** Wildcard CORS (`allow_origins=["*"]`)
- **Effort:** 3 hours
- **Action:** Move to environment variables, create dev/prod configs

#### 3. AI-008: Add JWT Authentication to CV API
- **Files:** `/AI/docs/CV_API_ENDPOINTS.md:31`
- **Issue:** `TODO` note about missing JWT before production
- **Effort:** 10 hours
- **Scope:** Add JWT validation to all CV endpoints (face enrollment, recognition, image upload)

#### 4. AI-003: Real Database Queries for CLV
- **Files:** `/AI/src/application/services/ml/clv_calculator.py:267`
- **Issue:** Mock booking data hardcoded
- **Effort:** 8 hours
- **Changes:**
  - Replace mock bookings with database queries
  - Fetch real guest booking history
  - Calculate actual metrics: recency, frequency, monetary

### Medium Priority (4 tasks)

#### 5. AI-002: Implement Hybrid Image Search
- **Files:** `/AI/src/application/services/cv/image_search.py:664`
- **Issue:** Hybrid search method returns empty results
- **Effort:** 10 hours
- **Features:**
  - Text-to-image search with CLIP embeddings
  - Image-to-image similarity search
  - Weighted combination of both
  - pgvector index optimization

#### 6. AI-004: Calculate Revenue Growth Time Series
- **Files:** `/AI/src/application/services/ml/clv_feature_engineering.py:379`
- **Issue:** Revenue growth rate hardcoded as 0.0
- **Effort:** 6 hours
- **Implementation:**
  - Fetch booking time series data
  - Calculate month-over-month growth
  - Implement trend analysis with regression
  - Handle seasonality

#### 7. AI-005: Add CLV Configuration Management
- **Files:** `/AI/src/application/services/ml/clv_calculator.py:730`
- **Issue:** `config=None` instead of proper config
- **Effort:** 4 hours
- **Features:**
  - Create CLVConfig class
  - Support configurable prediction horizons (30/60/90 days)
  - Load from environment/config file
  - Validate on initialization

#### 8. AI-007: Implement Background RAG Indexing
- **Files:** `/AI/src/application/controllers/hotel/upload_controller.py:354`
- **Issue:** TODO comment about background RAG indexing
- **Effort:** 8 hours
- **Implementation:**
  - Trigger async indexing after image upload
  - Use Celery/RabbitMQ for task queue
  - Track indexing status
  - Handle failures gracefully

---

## Critical Issues Summary

### Security Concerns
1. **Hardcoded hotel IDs** in frontend (blocks multi-hotel support)
2. **Wildcard CORS** in AI service (security risk)
3. **No JWT authentication** on CV API (production blocker)
4. **Missing rate limiting** on email endpoints

### Missing API Endpoints (8 total)
| Endpoint | Status | Priority |
|----------|--------|----------|
| GET /destinations/:id/reviews | Not implemented | MEDIUM |
| GET /users/:id/reviews | Not implemented | MEDIUM |
| POST /promo-codes/* | Not implemented | HIGH |
| GET /admin/* | Partial | HIGH |
| PUT /admin/* | Not implemented | HIGH |

### Database Gaps
- Promo codes table needed (BE-001)
- Email preferences table needed (BE-002)
- Destination reviews table needed (BE-003)
- CLV queries using mock data (AI-003)
- Revenue time series analysis needed (AI-004)

### Feature Completions Needed
| Feature | Current State | Effort | Priority |
|---------|--------------|--------|----------|
| PDF Export | Stub | 8h | HIGH |
| Room Edit API | Comment only | 4h | HIGH |
| Liveness Detection | Always True | 8h | HIGH |
| Hybrid Image Search | Empty results | 10h | MEDIUM |
| Admin Dashboard | UI only | 12h | MEDIUM |

---

## Implementation Timeline

### Week 1-2: Foundation Phase (Critical Path)
- Remove hardcoded IDs (FE-006)
- Implement promo codes (BE-001)
- Implement liveness detection (AI-001)
- Complete room edit API (FE-002)

### Week 3-4: Enhanced Features
- Review systems (BE-003, FE-003, FE-004)
- Image search implementation (AI-002)
- CLV real data (AI-003)
- Email improvements (BE-002)

### Week 5-6: Security & Optimization
- JWT authentication (AI-008)
- CORS configuration (AI-006)
- PDF export (FE-001)
- Admin dashboard (FE-008)
- Background tasks (AI-007)

### Week 7-8: Polish & Testing
- Time series analytics (AI-004)
- Configuration management (AI-005)
- User reviews API (BE-004)
- Comprehensive testing and bug fixes

---

## Team Allocation Recommendation

### Frontend (5 developers)
- **Person 1:** FE-006, FE-002 (Hardcoding & Room API)
- **Person 2:** FE-001, FE-008 (PDF & Admin)
- **Person 3:** FE-003, FE-004 (Reviews)
- **Person 4:** FE-005, FE-007 (Maps & Promo)
- **Person 5:** Code review, QA, Integration testing

### Backend (4 developers)
- **Person 1:** BE-001, BE-004 (Promo codes & User Reviews)
- **Person 2:** BE-005, BE-006 (Admin APIs & CLV Queries)
- **Person 3:** BE-002, BE-003 (Email & Destination Reviews)
- **Person 4:** Architecture review, Integration, DevOps

### AI/ML (4 developers)
- **Person 1:** AI-001, AI-006 (Liveness & CORS)
- **Person 2:** AI-002, AI-007 (Image Search & Background Tasks)
- **Person 3:** AI-003, AI-004 (CLV & Time Series)
- **Person 4:** AI-005, AI-008 (Config & JWT), Model optimization

---

## Dependencies & Blockers

### External Dependencies
- Silent-Face-Anti-Spoofing model (GPU required)
- jsPDF or html2pdf library for PDF export
- Email service provider (SendGrid/AWS SES)
- Redis for rate limiting and caching
- Message queue (RabbitMQ or Celery)

### Internal Dependencies
| Task | Blocked By | Impact |
|------|-----------|--------|
| FE-003, FE-004 | BE-003, BE-004 | Reviews display features |
| FE-007 | BE-001 | Promo code checkout |
| AI-007 | Message queue setup | Background processing |
| AI-003 | BE-006 database design | Real CLV prediction |
| All Auth | AI-008 | Secure API access |

---

## Metrics & Success Criteria

### Code Quality
- All tasks include unit and integration tests
- Coverage target: >80% for new code
- Code review before merge to main

### Performance
- Image search: <500ms response time
- Face recognition: <2 second processing
- Admin APIs: <1 second response time
- Email queue: Process within 5 minutes

### Security
- All APIs protected by JWT
- Rate limiting: 5 emails/hour, 100 requests/minute
- No hardcoded credentials
- CORS properly configured

### User Experience
- PDF download works in all browsers
- Promo codes apply immediately
- Reviews display with sorting/filtering
- Admin dashboard intuitive and responsive

---

## Notes & Recommendations

1. **Priority Matrix:** High-priority tasks should start immediately; medium tasks can be parallelized
2. **Code Review:** Establish review process for AI/ML changes due to complexity
3. **Database:** Create migration files for all schema changes
4. **Testing:** Consider test-driven development for new APIs
5. **Documentation:** Update API docs as endpoints are implemented
6. **Monitoring:** Add logging and monitoring for all production features

---

## JSON Output

A detailed JSON file (`TASK_ANALYSIS.json`) has been generated with:
- All 38 tasks with detailed specifications
- Dependencies and effort estimates
- Acceptance criteria for each task
- Phased implementation roadmap
- Deployment prerequisites

This JSON can be imported directly into Trello, Jira, or other project management tools.

---

**Analysis completed:** December 29, 2025
**Total estimated effort:** ~220 hours across all teams
