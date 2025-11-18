# Backend Monolith (Modular Architecture)

Sample Node.js Express monolith organized by modules/domains.

## Structure

```
backend/
├─ package.json
├─ .env.example
├─ src/
│  ├─ server.js           # Entry to start HTTP server
│  ├─ app.js              # Express app factory
│  ├─ config/             # Env/config
│  │  └─ index.js
│  ├─ routes/             # Route composition and wiring to controllers
│  │  └─ index.js
│  └─ module/             # Feature modules (plural contained within)
│     ├─ health/
│     │  ├─ controller/
│     │  │  └─ health.controller.js
│     │  └─ services/
│     │     └─ health.service.js
│     └─ users/
│        ├─ controller/
│        │  └─ users.controller.js
│        └─ services/
│           └─ users.service.js
```

## Getting Started

1. Copy env file:
   - `cp .env.example .env` (or create `.env` manually)
2. Install dependencies:
   - `npm install`
3. Run dev server:
   - `npm run dev`

Server listens on `http://localhost:3000` by default.

## Example Endpoints

- `GET /` → basic service info
- `GET /api/v1/health` → health check
- `GET /api/v1/users` → list users
- `POST /api/v1/users` → create user `{ name, email }`
- `GET /api/v1/users/:id` → get user by id
- `DELETE /api/v1/users/:id` → delete user

## Notes

- Users module uses an in-memory store for demo purposes.
- Add your own modules by following this pattern
  (controller + services). You can wire routes in `src/routes/index.js`.

