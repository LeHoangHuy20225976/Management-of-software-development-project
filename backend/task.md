# Module Roles Overview

This document summarizes the role and responsibilities of each backend module in the modular monolith. Each module contains two main layers: `controller` (HTTP request/response handling) and `services` (business logic). Cross-module interactions should go through service contracts where possible.

## Modules

- Auth **(Owner: Minh)**
  - Handles user authentication (register, login, logout) and session/JWT management.  
  - Provides role-based access control (RBAC) for User, Hotel Manager, and Admin. 
  - Password lifecycle features (reset/forget), token issuing/refresh, and auth guards.

- User Profile **(Owner: Khanh)**
  - Manages end-user profile CRUD (name, contacts, preferences).
  - Exposes endpoints for viewing and updating personal details and basic account settings.
  - May expose read-only booking history aggregation via Booking Engine for user dashboards.

- Notification **(Owner: Khanh)**
  - Sends transactional communications (email, possibly push) such as booking confirmations and password reset messages.
  - Abstracts provider integrations (e.g., SMTP, third-party email APIs) behind a unified service.
  - Manages templates, dispatch policy, and retry/backoff for delivery.

- Tourism CMS **(Owner: Khanh)**
  - Content management for tourism data: places/attractions, categories, posts/articles, and media (images/videos).
  - Admin editorial workflows (create/read/update/delete), listing and search.
  - Media metadata and asset linking to content records.

- Super Admin **(Owner: Duc)**
  - System-level administration: approve/lock Hotel Manager accounts, manage users, and oversee configurations.
  - Provides dashboards/metrics endpoints (e.g., revenue, bookings KPIs) via aggregated queries.
  - Enforces high-privilege operations with strict authorization checks.

- Hotel Profile **(Owner: Minh)**
  - Hotel Manager domain for managing hotel details: description, amenities, policies, address, photos.
  - CRUD for hotel entities owned by the manager; validation of ownership/tenancy.
  - Provides reference data consumed by Room & Inventory and Pricing Engine.

- Room & Inventory **(Owner: Huy)**
  - Manages room types and per-day inventory (availability calendar).
  - Provides safe reservation holds/locks and transaction-aware updates to prevent overbooking.
  - Exposes availability queries used by the Booking Engine.

- Pricing Engine **(Owner: Huy)**
  - Calculates room prices using base rates and dynamic rules (date/season/occupancy/demand).
  - Returns quoted totals for given stay parameters; supports discounts/promo codes.
  - Works closely with Inventory to ensure price reflects availability constraints.

- Booking Engine **(Owner: Duc)**
  - Core reservation logic: create, modify, cancel bookings; generate itinerary and confirmation.
  - Performs availability checks (Inventory), price quotes (Pricing), and orchestrates holds/commits.
  - Emits events to Notification for confirmations and to Payment Gateway for payment flows.

- Payment Gateway **(Owner: Duc)**
  - Integrates with third-party payment providers (e.g., VNPay, MoMo) for payment initiation and capture.
  - Verifies webhook callbacks and reconciles payment status with bookings.
  - Provides a consistent interface for multiple providers and handles error/edge cases.

- Synchronization **(Owner: Huy)**
  - Synchronizes hotel data (availability, pricing) with external systems or partners.
  - May run scheduled jobs or message-driven workflows to publish/consume updates.
  - Ensures eventual consistency and conflict resolution across systems.

## Interaction Guidelines

- Controllers should validate input, call services, and shape HTTP responses; avoid embedding business logic.
- Services encapsulate domain logic and should be unit-testable; prefer depending on interfaces to reduce coupling.
- For cross-module operations, prefer service-to-service calls rather than direct data access across module boundaries.
- Emit domain events (in-process or queued) for side effects like notifications and synchronization.
