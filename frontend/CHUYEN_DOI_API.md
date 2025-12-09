# Hướng Dẫn Chuyển Đổi Từ Mock Data Sang API Thật

## 📋 Tổng Quan

Hệ thống đã được thiết kế để dễ dàng chuyển đổi giữa Mock Data (localStorage) và API thật. Bạn chỉ cần thay đổi 1 biến cấu hình là có thể chuyển đổi toàn bộ ứng dụng.

---

## 🚀 Cách Chuyển Đổi (Chỉ 2 Bước)

### Bước 1: Cấu hình Backend URL

Mở file `.env.local` và cập nhật URL của backend:

```env
# Backend API URL
NEXT_PUBLIC_API_URL=https://api.yourdomain.com

# Hoặc nếu chạy local backend:
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Bước 2: Tắt Mock Data

Trong file `.env.local`, đổi giá trị:

```env
# Từ:
NEXT_PUBLIC_USE_MOCK_DATA=true

# Thành:
NEXT_PUBLIC_USE_MOCK_DATA=false
```

**Xong!** Restart development server và ứng dụng sẽ sử dụng API thật.

---

## 📁 Cấu Trúc API

### File Quan Trọng:

1. **`lib/api/config.ts`** - Cấu hình API và endpoints
2. **`lib/api/client.ts`** - API client xử lý requests
3. **`lib/api/services.ts`** - Các function gọi API
4. **`lib/utils/mockData.ts`** - Mock data cho development

### Luồng Hoạt Động:

```
Component
    ↓
API Service (services.ts)
    ↓
Kiểm tra USE_MOCK_DATA?
    ↓                   ↓
  TRUE              FALSE
    ↓                   ↓
localStorage      API Client
    ↓                   ↓
Mock Data        Real Backend
```

---

## 🔌 Danh Sách API Endpoints

Backend của bạn cần implement các endpoints sau:

### Authentication
- `POST /api/v1/auth/login` - Đăng nhập
- `POST /api/v1/auth/register` - Đăng ký
- `POST /api/v1/auth/logout` - Đăng xuất
- `POST /api/v1/auth/refresh` - Refresh token

### Hotels
- `GET /api/v1/hotels` - Lấy danh sách khách sạn (có filter)
- `GET /api/v1/hotels/:id` - Lấy chi tiết khách sạn
- `GET /api/v1/hotels/:id/rooms` - Lấy danh sách phòng
- `GET /api/v1/hotels/:id/reviews` - Lấy đánh giá khách sạn

### Search
- `POST /api/v1/search/hotels` - Tìm kiếm khách sạn
- `GET /api/v1/search/suggestions?q=query` - Gợi ý tìm kiếm

### Bookings
- `GET /api/v1/bookings` - Lấy tất cả bookings
- `GET /api/v1/bookings/:id` - Lấy chi tiết booking
- `POST /api/v1/bookings/create` - Tạo booking mới
- `DELETE /api/v1/bookings/:id/cancel` - Hủy booking

### User
- `GET /api/v1/user/profile` - Lấy thông tin user
- `PUT /api/v1/user/profile` - Cập nhật thông tin user
- `GET /api/v1/user/bookings` - Lấy bookings của user
- `GET /api/v1/user/reviews` - Lấy reviews của user
- `POST /api/v1/user/reviews` - Tạo review mới
- `PUT /api/v1/user/reviews/:id` - Cập nhật review
- `DELETE /api/v1/user/reviews/:id` - Xóa review

### Tourism
- `GET /api/v1/tourism` - Lấy danh sách điểm du lịch
- `GET /api/v1/tourism/:id` - Lấy chi tiết điểm du lịch

### Payment
- `POST /api/v1/payment/create` - Tạo payment
- `POST /api/v1/payment/callback` - Payment callback

### Hotel Manager
- `GET /api/v1/manager/hotels` - Quản lý khách sạn
- `GET /api/v1/manager/rooms` - Quản lý phòng
- `GET /api/v1/manager/bookings` - Quản lý đặt phòng

---

## 📝 Ví Dụ Request/Response

### 1. Get Hotels

**Request:**
```http
GET /api/v1/hotels
```

**Query Parameters:**
```typescript
{
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  stars?: number[];
  sortBy?: 'price' | 'rating';
}
```

**Response:**
```typescript
[
  {
    id: string;
    name: string;
    slug: string;
    description: string;
    stars: number;
    rating: number;
    reviewCount: number;
    basePrice: number;
    images: string[];
    amenities: string[];
    city: string;
    district: string;
    address: string;
    location: { lat: number; lng: number };
  }
]
```

### 2. Create Booking

**Request:**
```http
POST /api/v1/bookings/create
Content-Type: application/json
Authorization: Bearer {token}
```

**Body:**
```typescript
{
  hotelId: string;
  hotelName: string;
  roomType: string;
  checkIn: string; // ISO date
  checkOut: string; // ISO date
  nights: number;
  guests: number;
  totalPrice: number;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
}
```

**Response:**
```typescript
{
  id: string;
  ...bookingData,
  bookingDate: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'refunded';
}
```

### 3. Update User Profile

**Request:**
```http
PUT /api/v1/user/profile
Content-Type: application/json
Authorization: Bearer {token}
```

**Body:**
```typescript
{
  name?: string;
  email?: string;
  phone?: string;
  // other fields...
}
```

**Response:**
```typescript
{
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  totalBookings: number;
  points: number;
  memberSince: string;
}
```

---

## 🔐 Authentication

API Client tự động thêm token vào header:

```typescript
Authorization: Bearer {token}
```

Token được lưu trong localStorage với key `auth_token`.

### Quản lý Token:

```typescript
import { apiClient } from '@/lib/api/client';

// Set token sau khi login
apiClient.setAuthToken(token);

// Get token
const token = apiClient.getAuthToken();

// Clear token khi logout
apiClient.clearAuthToken();
```

---

## ⚙️ Cấu Hình Nâng Cao

### Thay Đổi Timeout

File `lib/api/config.ts`:

```typescript
export const API_CONFIG = {
  TIMEOUT: 30000, // 30 giây
};
```

### Thay Đổi Base URL

File `.env.local`:

```env
NEXT_PUBLIC_API_URL=https://api.production.com
```

### Thêm Endpoints Mới

File `lib/api/config.ts`:

```typescript
ENDPOINTS: {
  // ... existing endpoints
  MY_NEW_ENDPOINT: '/my/new/endpoint',
}
```

File `lib/api/services.ts`:

```typescript
export const myNewApi = {
  async getData(): Promise<MyType[]> {
    if (API_CONFIG.USE_MOCK_DATA) {
      // Mock logic
      return mockData;
    }
    return apiClient.get<MyType[]>(API_CONFIG.ENDPOINTS.MY_NEW_ENDPOINT);
  },
};
```

---

## 🧪 Testing

### Test Với Mock Data:
```env
NEXT_PUBLIC_USE_MOCK_DATA=true
```
- Data lưu trong localStorage
- Không cần backend
- Tốt cho development và demo

### Test Với API Thật:
```env
NEXT_PUBLIC_USE_MOCK_DATA=false
NEXT_PUBLIC_API_URL=http://localhost:8000
```
- Kết nối với backend thật
- Test integration
- Tốt cho staging và production

---

## 🐛 Troubleshooting

### Lỗi CORS
Nếu gặp lỗi CORS, backend cần thêm headers:
```
Access-Control-Allow-Origin: http://localhost:3002
Access-Control-Allow-Methods: GET, POST, PUT, DELETE
Access-Control-Allow-Headers: Content-Type, Authorization
```

### Lỗi 401 Unauthorized
- Kiểm tra token có được set chưa
- Kiểm tra token có expired không
- Kiểm tra format header Authorization

### Lỗi Timeout
- Tăng timeout trong config
- Kiểm tra backend có phản hồi chậm không

---

## 📋 Checklist Khi Deploy

### Development
- [ ] `NEXT_PUBLIC_USE_MOCK_DATA=true`
- [ ] `NEXT_PUBLIC_API_URL=http://localhost:8000`

### Staging
- [ ] `NEXT_PUBLIC_USE_MOCK_DATA=false`
- [ ] `NEXT_PUBLIC_API_URL=https://api-staging.yourdomain.com`
- [ ] Test all API endpoints
- [ ] Test authentication flow

### Production
- [ ] `NEXT_PUBLIC_USE_MOCK_DATA=false`
- [ ] `NEXT_PUBLIC_API_URL=https://api.yourdomain.com`
- [ ] All APIs working
- [ ] CORS configured
- [ ] SSL/HTTPS enabled
- [ ] Error handling tested

---

## 💡 Tips

1. **Giữ Mock Data Cập Nhật**: Đảm bảo mock data structure giống với API response
2. **Test Cả 2 Modes**: Test cả mock và real API để đảm bảo tương thích
3. **Error Handling**: Backend nên trả về error format nhất quán
4. **Loading States**: Component đã có loading states sẵn
5. **Type Safety**: Tất cả API đều có TypeScript types

---

## 📞 Support

Nếu có vấn đề:
1. Check console.log trong browser
2. Check Network tab trong DevTools
3. Kiểm tra backend logs
4. Đọc lại docs này 😊
