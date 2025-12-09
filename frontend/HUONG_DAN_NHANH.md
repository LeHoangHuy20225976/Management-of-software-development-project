# 🚀 Hướng Dẫn Chuyển Đổi API - Siêu Nhanh

## ⚡ TL;DR - Chỉ Cần Làm Thế Này:

### Đang dùng Mock Data (localStorage):
```env
# File: .env.local
NEXT_PUBLIC_USE_MOCK_DATA=true
```

### Chuyển sang API Thật:
```env
# File: .env.local
NEXT_PUBLIC_USE_MOCK_DATA=false
NEXT_PUBLIC_API_URL=http://localhost:8000
```

**→ Restart dev server → Xong!**

---

## 📋 Chi Tiết 3 Bước:

### 1️⃣ Chuẩn bị Backend

Backend cần có các endpoints này (xem file `CHUYEN_DOI_API.md` để biết chi tiết):

```
POST /api/v1/auth/login
POST /api/v1/auth/register
GET  /api/v1/hotels
GET  /api/v1/hotels/:id
POST /api/v1/bookings/create
GET  /api/v1/user/profile
PUT  /api/v1/user/profile
... (và nhiều endpoints khác)
```

### 2️⃣ Cấu hình URL Backend

Mở file `.env.local`:

```env
# URL của backend (thay đổi theo môi trường)
NEXT_PUBLIC_API_URL=http://localhost:8000

# Production:
# NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

### 3️⃣ Tắt Mock Mode

Trong file `.env.local`:

```env
NEXT_PUBLIC_USE_MOCK_DATA=false
```

### 4️⃣ Restart Server

```bash
npm run dev
```

---

## 🔄 Chuyển Đổi Linh Hoạt

### Mode Development (Mock):
```bash
# .env.local
NEXT_PUBLIC_USE_MOCK_DATA=true
```
✅ Không cần backend
✅ Data lưu localStorage
✅ Phát triển nhanh

### Mode Testing (Real API):
```bash
# .env.local
NEXT_PUBLIC_USE_MOCK_DATA=false
NEXT_PUBLIC_API_URL=http://localhost:8000
```
✅ Test với backend local
✅ Kiểm tra integration

### Mode Production:
```bash
# .env.local hoặc .env.production
NEXT_PUBLIC_USE_MOCK_DATA=false
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```
✅ Backend thật
✅ Sẵn sàng deploy

---

## 💡 Lưu Ý Quan Trọng

### ⚠️ Không Cần Sửa Code!
- ❌ Không cần sửa components
- ❌ Không cần sửa services
- ✅ Chỉ cần đổi file `.env.local`

### ✅ Response Format Backend

Backend cần trả về đúng format như mock data. Ví dụ:

**GET /api/v1/hotels**
```json
[
  {
    "id": "hotel1",
    "name": "Grand Hotel",
    "slug": "grand-hotel",
    "stars": 5,
    "rating": 4.8,
    "basePrice": 2500000,
    "city": "Hà Nội",
    ...
  }
]
```

**POST /api/v1/bookings/create**
```json
{
  "id": "BK123456789",
  "hotelId": "hotel1",
  "hotelName": "Grand Hotel",
  "status": "confirmed",
  "paymentStatus": "paid",
  ...
}
```

### 🔐 Authentication

Backend cần accept header:
```
Authorization: Bearer {token}
```

Frontend tự động gửi token nếu user đã login.

---

## 🐛 Fix Lỗi Thường Gặp

### Lỗi: CORS Policy
**Backend cần:**
```javascript
// Express.js example
app.use(cors({
  origin: 'http://localhost:3002',
  credentials: true
}));
```

### Lỗi: 401 Unauthorized
**Check:**
- Token có tồn tại? → `localStorage.getItem('auth_token')`
- User đã login? → Test login flow trước
- Backend verify token đúng?

### Lỗi: Network Error
**Check:**
- Backend có chạy không?
- URL trong `.env.local` đúng không?
- Port đúng không?

---

## 📂 Files Cần Biết

```
frontend/
├── .env.local              ← Đổi cấu hình ở đây
├── lib/
│   └── api/
│       ├── config.ts       ← Định nghĩa endpoints
│       ├── client.ts       ← HTTP client
│       └── services.ts     ← Logic chuyển đổi mock/real
└── CHUYEN_DOI_API.md      ← Docs chi tiết
```

---

## ✅ Test Nhanh

### 1. Test Mock Mode
```bash
# .env.local
NEXT_PUBLIC_USE_MOCK_DATA=true

# Run
npm run dev

# Thử tạo booking → Check localStorage
```

### 2. Test Real API Mode
```bash
# .env.local
NEXT_PUBLIC_USE_MOCK_DATA=false
NEXT_PUBLIC_API_URL=http://localhost:8000

# Run backend trước
# Run frontend
npm run dev

# Thử tạo booking → Check backend database
```

---

## 🎯 Tóm Tắt

| Bước | Hành động | File |
|------|-----------|------|
| 1 | Đổi `NEXT_PUBLIC_USE_MOCK_DATA=false` | `.env.local` |
| 2 | Set `NEXT_PUBLIC_API_URL=URL_backend` | `.env.local` |
| 3 | Restart dev server | Terminal |
| 4 | ✅ Xong! | - |

---

**Đọc thêm:** `CHUYEN_DOI_API.md` để biết chi tiết về từng endpoint và request/response format.
