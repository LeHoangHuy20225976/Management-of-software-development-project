Backend Structure Overview

This backend is a modular Node.js/Express service organized around domains (auth, booking, hotel, etc.). Below is a quick map of folders and their roles, plus how they align with the BE modules in AGENTS.md.

- src/: Application source code root.
  - src/server.js: Entry point. Loads env, sets module root to src, starts HTTP server.
  - src/app.js: Express app bootstrap. Registers JSON parsing and routes.

- src/routes/: HTTP route registration.
  - src/routes/index.js: Central router. Add route groups here (e.g., /auth, /booking). Includes a /health endpoint for quick checks.

- src/modules/: Feature modules (controllers/services) grouped by domain.
  - src/modules/auth/: Core & Auth (BE 1)
    - controller/, services/: Implement sign up/in, roles, RBAC.
  - src/modules/user-profile/: User Profile API (BE 1, Module 2)
    - controller/, services/: CRUD for user info and booking history.
  - src/modules/notification/: Notification Service (BE 1, Module 3)
    - controller/, services/: Email/push notifications (confirmations, forgot password, etc.).
  - src/modules/tourism-cms/: Tourism CMS (BE 2, Module 1)
    - controller/, services/: CRUD locations, categories, posts, media.
  - src/modules/super-admin/: Super Admin API (BE 2, Module 2)
    - controller/, services/: Approve/lock managers, manage users, dashboards.
  - src/modules/hotel-profile/: Hotel Management – Profile (BE 3, Module 1)
    - controller/, services/: CRUD hotel info, amenities, policies, images.
  - src/modules/room-inventory/: Room & Inventory (BE 3, Module 2)
    - controller/, services/: Room types and daily inventory with locking/transactions.
  - src/modules/pricing-engine/: Pricing Engine (BE 3, Module 3)
    - controller/, services/: Base price, overrides by day/season/guests.
  - src/modules/booking-engine/: Booking Engine (BE 4, Module 1)
    - controller/, services/: Create/cancel bookings; integrates with inventory.
  - src/modules/payment-gateway/: Payment Integration (BE 4, Module 2)
    - controller/, services/: VNPay/MoMo, webhooks for payment confirmation.
  - src/modules/synchronization/: Synchronization (BE 4, Module 3)
    - controller/, services/: Sync availability/prices via API/cron/queues.

- src/kernels/: Cross-cutting app kernel utilities.
  - src/kernels/middlewares/: Shared Express middlewares.
  - src/kernels/rules/: Reusable validation rules (body/param/query). 
  - src/kernels/validations/: Validation helpers (express-validator wrapper).
  - (Potential) kernels/api-docs: Swagger/OpenAPI wiring if enabled.

- src/utils/: Generic helpers not bound to a single domain.
  - jwtUtils.js: JWT sign/refresh helpers.
  - responseUtils.js: Standardized HTTP responses.
  - apiUtils.js, stringUtils.js: Misc utilities.

- src/config/ and src/configs/: Central configuration.
  - src/config/index.js: Loads env and exposes config (app, database, jwt, hashing) and top-level PORT/NODE_ENV.
  - src/configs/index.js: Re-exports config for legacy imports (require("configs")).

Environment
- .env.example: Template for environment variables. Copy to .env and fill secrets.

Development
- package.json scripts:
  - start: node src/server.js
  - dev: nodemon src/server.js

Where to add new code
- New endpoints: register in src/routes/index.js and implement controller/service in the matching src/modules/<domain>/ folder.
- Shared validation/middlewares: add under src/kernels/.
- Shared helpers: add under src/utils/.

Notes
- Module aliases are configured at runtime by setting the module root to src in server.js. This allows imports like require("utils/...") and require("modules/...").
