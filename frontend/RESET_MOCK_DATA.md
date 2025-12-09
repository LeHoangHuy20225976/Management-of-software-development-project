# Reset Mock Data - Hướng Dẫn

## Khi Nào Cần Reset?

Khi bạn:
- Thêm hotels mới vào mock data
- Thay đổi cấu trúc data
- Dữ liệu bị lỗi hoặc không đúng
- Muốn test lại từ đầu

## Cách Reset Mock Data

### Cách 1: Qua Browser Console (Khuyến nghị)

1. Mở trang web
2. Bấm F12 để mở Developer Tools
3. Vào tab **Console**
4. Chạy lệnh:

```javascript
localStorage.clear()
location.reload()
```

Hoặc chi tiết hơn:

```javascript
// Xóa từng item cụ thể
localStorage.removeItem('mockDataInitialized')
localStorage.removeItem('currentUser')
localStorage.removeItem('userBookings')
localStorage.removeItem('userReviews')
localStorage.removeItem('hotels')
location.reload()
```

### Cách 2: Qua Application Tab

1. Mở Developer Tools (F12)
2. Vào tab **Application**
3. Bên trái chọn **Local Storage** → URL của bạn
4. Bấm **Clear All** hoặc xóa từng item
5. Refresh lại trang (F5)

### Cách 3: Code trong Component

Thêm button tạm để test:

```typescript
import { forceReinitializeMockData } from '@/lib/utils/mockData';

// Trong component
<button onClick={() => {
  forceReinitializeMockData();
  window.location.reload();
}}>
  Reset Mock Data
</button>
```

## Kiểm Tra Data Đã Load

Sau khi reset, mở Console và chạy:

```javascript
// Xem hotels
JSON.parse(localStorage.getItem('hotels'))

// Xem user
JSON.parse(localStorage.getItem('currentUser'))

// Xem bookings
JSON.parse(localStorage.getItem('userBookings'))

// Xem reviews
JSON.parse(localStorage.getItem('userReviews'))
```

## Lỗi Thường Gặp

### Hotel không tìm thấy

**Nguyên nhân:** Mock data cũ chưa được update

**Giải pháp:**
```javascript
localStorage.clear()
location.reload()
```

### User không login được

**Nguyên nhân:** User data bị xóa hoặc chưa khởi tạo

**Giải pháp:**
1. Clear localStorage
2. Reload page → MockDataInitializer sẽ tạo user mới

### Data không thay đổi sau khi cập nhật code

**Nguyên nhân:** `mockDataInitialized` flag vẫn là `true`

**Giải pháp:**
```javascript
localStorage.removeItem('mockDataInitialized')
location.reload()
```

## Tips

1. **Dev Mode:** Luôn có button "Reset Data" để test nhanh
2. **Production:** Không nên có mock data trong production
3. **Version Control:** Khi cập nhật mock data structure, increment version:

```typescript
const MOCK_DATA_VERSION = '2.0';
if (localStorage.getItem('mockDataVersion') !== MOCK_DATA_VERSION) {
  clearMockData();
  localStorage.setItem('mockDataVersion', MOCK_DATA_VERSION);
}
```

## User Mặc Định

Sau khi reset, user mặc định:

```
Email: nguyen.van.a@gmail.com
Name: Nguyễn Văn A
Phone: 0901234567
```

User này sẽ tự động login (có trong localStorage).

## Hotels Có Sẵn

Sau khi reset, có 10 hotels:

1. Grand Hotel Saigon (TP.HCM)
2. Hanoi Pearl Hotel (Hà Nội)
3. **Da Nang Beach Resort** (Đà Nẵng) ← URL: `/hotel/da-nang-beach-resort`
4. Nha Trang Seaside Hotel
5. Dalat Palace Heritage Hotel
6. Phu Quoc Paradise Resort
7. Hoi An Ancient House
8. Halong Bay Cruise Hotel
9. Can Tho Riverside Hotel
10. Sapa Mountain View Lodge

## Test URLs

```
http://localhost:3002/hotel/grand-hotel-saigon
http://localhost:3002/hotel/da-nang-beach-resort
http://localhost:3002/hotel/hanoi-pearl-hotel
http://localhost:3002/hotel/phu-quoc-paradise-resort
...
```

---

**Tóm tắt:** Để reset mock data, chỉ cần:
```javascript
localStorage.clear()
location.reload()
```
