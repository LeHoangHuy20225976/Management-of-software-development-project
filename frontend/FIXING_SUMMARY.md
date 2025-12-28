# Summary - Database Mapping Fix

## ✅ Đã hoàn thành:

### 1. Types (`types/index.ts`)
- ✅ Xóa tất cả optional fields không có trong database
- ✅ User, Hotel, RoomType, Room, Destination, Review, Booking đã 100% match database
- ✅ SearchFilters updated

### 2. Pages đã fix hoàn toàn:
- ✅ `app/search/page.tsx` - Xóa stars, amenities, basePrice, slug
- ✅ `app/hotel/[hotel_id]/page.tsx` - Viết lại hoàn toàn, chỉ dùng DB fields
- ✅ `app/page.tsx` - Đổi slug → hotel_id/destination_id

### 3. Directories đã rename:
- ✅ `app/hotel/[slug]` → `app/hotel/[hotel_id]`
- ✅ `app/tourism/[slug]` → `app/tourism/[destination_id]`

## 📋 Còn cần fix (10+ files):

### Các file rooms (6 files):
1. `app/hotel/rooms/page.tsx`
2. `app/hotel/rooms/[id]/edit/page.tsx`
3. `app/hotel/rooms/create/page.tsx`
4. `app/hotel-manager/rooms/page.tsx` - ĐÃ FIX 1 PHẦN (convertRoomType)
5. `app/hotel-manager/rooms/[id]/edit/page.tsx` - ĐÃ FIX 1 PHẦN
6. `app/hotel-manager/rooms/create/page.tsx`

### Các file profile (3 files):
7. `app/hotel/dashboard/profile/page.tsx`
8. `app/hotel-manager/dashboard/profile/page.tsx`
9. `app/hotel-manager/profile/page.tsx`
10. `app/user/dashboard/profile/page.tsx`

### Các file pricing (2 files):
11. `app/hotel/pricing/page.tsx`
12. `app/hotel-manager/pricing/page.tsx`

### Các file tourism (2 files):
13. `app/tourism/page.tsx`
14. `app/tourism/[destination_id]/page.tsx`

## 🔧 Cần thay thế toàn bộ:

### Find & Replace cần làm:

#### 1. Hotel fields:
```bash
# Slug → hotel_id
hotel.slug → hotel.hotel_id
hotelSlug → hotel.hotel_id

# Stars (xóa hoặc dùng rating thay thế)
hotel.stars → hotel.rating
formatStars(hotel.stars) → `⭐ ${hotel.rating}`

# BasePrice (xóa hoặc fetch từ RoomPrice)
hotel.basePrice → [CẦN FETCH TỪ ROOMPRICE TABLE]

# Amenities (xóa hoặc fetch từ FacilitiesPossessing)
hotel.amenities → [CẦN FETCH TỪ FACILITIESPOSSESSING]

# ReviewCount (xóa hoặc count từ Review table)
hotel.reviewCount → [CẦN COUNT TỪ REVIEW TABLE]

# City, district (xóa - không có trong DB)
hotel.city → [XÓA]
hotel.district → [XÓA]
```

#### 2. RoomType fields:
```bash
# ID field
roomType.id → roomType.type_id
room.id → room.type_id (trong convertRoomType)

# Name field
roomType.name → roomType.type
room.name → roomType.type

# MaxGuests
roomType.maxGuests → roomType.max_guests

# Size, beds, basePrice, images, amenities
roomType.size → [XÓA - không có trong DB]
roomType.beds → [XÓA]
roomType.basePrice → [CẦN FETCH TỪ ROOMPRICE]
roomType.images → [XÓA hoặc fetch từ Image table]
roomType.amenities → [CẦN FETCH TỪ SERVICEPOSSESSING]
```

#### 3. User fields:
```bash
user.id → user.user_id
user.phone → user.phone_number
user.avatar → user.profile_image
user.memberSince → user.date_of_birth (hoặc created_at nếu có)
```

#### 4. Destination fields:
```bash
destination.slug → destination.destination_id
spot.slug → spot.destination_id
```

## ⚠️ Lưu ý quan trọng:

### Các field CẦN FETCH từ table khác:

1. **Hotel.basePrice** → Cần query `RoomPrice` table:
```sql
SELECT MIN(basic_price) FROM RoomPrice
WHERE type_id IN (SELECT type_id FROM RoomType WHERE hotel_id = ?)
```

2. **Hotel.amenities** → Cần query `FacilitiesPossessing`:
```sql
SELECT f.name FROM HotelFacilities f
JOIN FacilitiesPossessing fp ON f.facility_id = fp.facility_id
WHERE fp.hotel_id = ?
```

3. **RoomType.basePrice** → Cần query `RoomPrice`:
```sql
SELECT basic_price FROM RoomPrice WHERE type_id = ?
```

4. **RoomType.amenities** → Cần query `ServicePossessing`:
```sql
SELECT s.name FROM RoomService s
JOIN ServicePossessing sp ON s.service_id = sp.service_id
WHERE sp.type_id = ?
```

5. **Hotel.reviewCount** → Cần count từ `Review`:
```sql
SELECT COUNT(*) FROM Review WHERE hotel_id = ?
```

### Các field có thể XÓA (không cần):

- `hotel.slug` → dùng `hotel_id` cho URL
- `hotel.stars` → dùng `rating` thay thế
- `hotel.city`, `hotel.district` → parse từ `address` hoặc xóa
- `roomType.size`, `roomType.beds` → không có trong DB, xóa
- `destination.slug` → dùng `destination_id` cho URL
- `destination.tags`, `destination.visitCount` → không có, xóa

## 🚀 Hướng dẫn fix nhanh còn lại:

### Bước 1: Fix các imports
```bash
# Xóa imports không dùng
- import { formatStars } from '@/lib/utils/format';
- import { amenitiesList } from '@/lib/mock/data';
```

### Bước 2: Fix URL routing
```bash
# Tất cả links dạng:
/hotel/${hotel.slug} → /hotel/${hotel.hotel_id}
/tourism/${spot.slug} → /tourism/${spot.destination_id}
```

### Bước 3: Fix display fields
```bash
# Thay thế display:
{hotel.stars && formatStars(hotel.stars)} → ⭐ {hotel.rating}
{hotel.basePrice} → [Xóa hoặc "Liên hệ"]
{hotel.amenities.map(...)} → [Xóa section này]
{hotel.reviewCount} → [Xóa hoặc fetch từ DB]
```

### Bước 4: Fix form fields (trong create/edit pages)
```bash
# RoomType forms:
- Xóa fields: size, beds, basePrice input
- Giữ: type, max_guests, description, quantity, availability
- Price phải lưu vào RoomPrice table riêng
```

## 📊 Tiến độ:

- ✅ Types: 100%
- ✅ Search page: 100%
- ✅ Hotel detail: 100%
- ✅ Homepage: 100%
- ⏳ Rooms pages: 50% (convertRoomType đã fix)
- ⏳ Profile pages: 0%
- ⏳ Pricing pages: 0%
- ⏳ Tourism pages: 30% (routing đã fix)

## 🎯 Next steps:

1. Fix tất cả rooms pages (create, edit, list)
2. Fix profile pages - chú ý User fields
3. Fix pricing pages
4. Fix tourism pages
5. Test build
6. Fix các lỗi TypeScript còn lại
