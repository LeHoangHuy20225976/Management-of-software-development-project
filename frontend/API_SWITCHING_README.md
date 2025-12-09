# API Switching Guide

## Quick Switch

Edit `.env.local`:

```env
# Use Mock Data (localStorage)
NEXT_PUBLIC_USE_MOCK_DATA=true

# Use Real API
NEXT_PUBLIC_USE_MOCK_DATA=false
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Restart dev server. Done!

## Documentation

- **Quick Guide (Vietnamese):** `HUONG_DAN_NHANH.md`
- **Detailed Guide (Vietnamese):** `CHUYEN_DOI_API.md`

## How It Works

```
Component → API Service → Check USE_MOCK_DATA?
                              ↓           ↓
                         localStorage  Real API
```

All API calls in `lib/api/services.ts` automatically check `API_CONFIG.USE_MOCK_DATA` and route to either mock data (localStorage) or real backend API.

## No Code Changes Needed

✅ Components stay the same
✅ Types stay the same
✅ Only change `.env.local`

## Files Structure

```
lib/
├── api/
│   ├── config.ts      - API configuration & endpoints
│   ├── client.ts      - HTTP client (fetch wrapper)
│   └── services.ts    - API functions with mock/real logic
└── utils/
    └── mockData.ts    - Mock data for development
```

## Requirements for Backend

Backend must implement endpoints defined in `lib/api/config.ts`:

- Authentication: `/auth/login`, `/auth/register`, etc.
- Hotels: `/hotels`, `/hotels/:id`, `/hotels/:id/rooms`, etc.
- Bookings: `/bookings`, `/bookings/create`, etc.
- User: `/user/profile`, `/user/bookings`, etc.

Response format must match TypeScript types in `types/index.ts`.

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | `http://localhost:8000` |
| `NEXT_PUBLIC_API_VERSION` | API version | `v1` |
| `NEXT_PUBLIC_USE_MOCK_DATA` | Use mock or real API | `true` or `false` |

## Testing

**Mock Mode:**
```bash
NEXT_PUBLIC_USE_MOCK_DATA=true
npm run dev
```

**Real API Mode:**
```bash
NEXT_PUBLIC_USE_MOCK_DATA=false
NEXT_PUBLIC_API_URL=http://localhost:8000
npm run dev
```

---

**For detailed Vietnamese documentation, see `CHUYEN_DOI_API.md` and `HUONG_DAN_NHANH.md`**
