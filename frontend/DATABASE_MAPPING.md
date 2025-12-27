# Database to Frontend Type Mapping

Tài liệu này mô tả mapping chính xác giữa database schema và TypeScript types trong frontend.

## 1. User Table

**Database:** `User`
```sql
user_id SERIAL PRIMARY KEY
name VARCHAR(100)
email VARCHAR(100)
phone_number VARCHAR(20)
gender VARCHAR(100)
date_of_birth DATE
role VARCHAR(100)
password VARCHAR(100)
profile_image VARCHAR(255)
```

**TypeScript:** `User`
```typescript
user_id: number
name: string | null
email: string | null
phone_number: string | null
gender: string | null
date_of_birth: string | null
role: string | null
password: string
profile_image: string | null
```

✅ **Status:** Đã match chính xác với database

---

## 2. Hotel Table

**Database:** `Hotel`
```sql
hotel_id SERIAL PRIMARY KEY
hotel_owner INTEGER REFERENCES User(user_id)
name VARCHAR(100)
address VARCHAR(100)
status INTEGER
rating DOUBLE PRECISION
longitude DOUBLE PRECISION
latitude DOUBLE PRECISION
description TEXT
contact_phone VARCHAR(100)
thumbnail VARCHAR(255)
```

**TypeScript:** `Hotel`
```typescript
hotel_id: number
hotel_owner: number
name: string
address: string
status: number
rating: number
longitude: number
latitude: number
description: string
contact_phone: string
thumbnail: string
```

✅ **Status:** Đã match chính xác với database

**Lưu ý:** Các field optional như `slug`, `stars`, `city`, `district`, `images`, `basePrice`, `amenities`, `reviewCount`, `policies` là các field frontend-only, không có trong database.

---

## 3. RoomType Table

**Database:** `RoomType`
```sql
type_id SERIAL PRIMARY KEY
hotel_id INTEGER REFERENCES Hotel(hotel_id)
type VARCHAR(100)
availability BOOLEAN
max_guests INTEGER
description TEXT
quantity INTEGER
```

**TypeScript:** `RoomType`
```typescript
type_id: number
hotel_id: number
type: string
availability: boolean
max_guests: number
description: string
quantity: number
```

✅ **Status:** Đã match chính xác với database

**Lưu ý:** Các field optional như `size`, `beds`, `basePrice`, `images`, `amenities` là frontend-only.

---

## 4. Room Table

**Database:** `Room`
```sql
room_id SERIAL PRIMARY KEY
type_id INTEGER REFERENCES RoomType(type_id)
name VARCHAR(100)
location VARCHAR(100)
status INTEGER CHECK (status IN (0, 1))
estimated_available_time DATE
number_of_single_beds INTEGER
number_of_double_beds INTEGER
room_view VARCHAR(50)
room_size DOUBLE PRECISION
notes TEXT
```

**TypeScript:** `Room`
```typescript
room_id: number
type_id: number
name: string
location: string
status: number
estimated_available_time: string | null
number_of_single_beds: number
number_of_double_beds: number
room_view: string
room_size: number
notes: string | null
```

✅ **Status:** Đã match chính xác với database

---

## 5. Destination Table

**Database:** `Destination`
```sql
destination_id SERIAL PRIMARY KEY
name VARCHAR(100)
rating INTEGER
location VARCHAR(100)
transportation VARCHAR(100)
entry_fee BIGINT
description TEXT
latitude DOUBLE PRECISION
longitude DOUBLE PRECISION
type VARCHAR(100)
thumbnail VARCHAR(255)
```

**TypeScript:** `Destination`
```typescript
destination_id: number
name: string
rating: number
location: string
transportation: string
entry_fee: number
description: string
latitude: number
longitude: number
type: string
thumbnail: string
```

✅ **Status:** Đã match chính xác với database

---

## 6. Review Table

**Database:** `Review`
```sql
review_id SERIAL PRIMARY KEY
user_id INTEGER REFERENCES User(user_id)
destination_id INTEGER REFERENCES Destination(destination_id) -- nullable
hotel_id INTEGER REFERENCES Hotel(hotel_id) -- nullable
room_id INTEGER REFERENCES Room(room_id) -- nullable
rating INTEGER CHECK (rating >= 1 AND rating <= 5)
comment TEXT
date_created DATE
```

**TypeScript:** `Review`
```typescript
review_id: number
user_id: number
destination_id: number | null
hotel_id: number | null
room_id: number | null
rating: number
comment: string
date_created: string
```

✅ **Status:** Đã match chính xác với database

**Constraint:** Đúng 1 trong 3 field (destination_id, hotel_id, room_id) phải có giá trị.

---

## 7. Booking Table

**Database:** `Booking`
```sql
booking_id SERIAL PRIMARY KEY
user_id INTEGER REFERENCES User(user_id)
room_id INTEGER REFERENCES Room(room_id)
status VARCHAR(50) CHECK (status IN ('accepted', 'pending', 'rejected', 'cancel requested', 'cancelled', 'maintained'))
total_price BIGINT
check_in_date DATE
check_out_date DATE
created_at DATE
people INTEGER
```

**TypeScript:** `Booking`
```typescript
booking_id: number
user_id: number | null
room_id: number
status: 'accepted' | 'pending' | 'rejected' | 'cancel requested' | 'cancelled' | 'maintained'
total_price: number | null
check_in_date: string
check_out_date: string
created_at: string
people: number | null
```

✅ **Status:** Đã match chính xác với database

---

## 8. RoomPrice Table

**Database:** `RoomPrice`
```sql
price_id SERIAL PRIMARY KEY
type_id INTEGER REFERENCES RoomType(type_id)
start_date DATE
end_date DATE
special_price BIGINT
event VARCHAR(100)
basic_price BIGINT
discount DOUBLE PRECISION
```

**TypeScript:** `RoomPrice`
```typescript
price_id: number
type_id: number
start_date: string | null
end_date: string | null
special_price: number | null
event: string | null
basic_price: number
discount: number
```

✅ **Status:** Đã match chính xác với database

---

## 9. room_logs Table

**Database:** `room_logs`
```sql
log_id SERIAL PRIMARY KEY
room_id INTEGER REFERENCES Room(room_id)
event_type VARCHAR(30) CHECK (event_type IN ('BOOK_CREATED', 'BOOK_CANCELLED', 'BOOK_CHECKIN', 'BOOK_CHECKOUT', 'MAINTAIN_START', 'MAINTAIN_END'))
extra_context TEXT
created_at TIMESTAMP
```

**TypeScript:** `RoomLog`
```typescript
log_id: number
room_id: number
event_type: 'BOOK_CREATED' | 'BOOK_CANCELLED' | 'BOOK_CHECKIN' | 'BOOK_CHECKOUT' | 'MAINTAIN_START' | 'MAINTAIN_END'
extra_context: string | null
created_at: string
```

✅ **Status:** Đã match chính xác với database

---

## 10. LovingList Table

**Database:** `LovingList`
```sql
id SERIAL PRIMARY KEY
user_id INTEGER REFERENCES User(user_id)
destination_id INTEGER REFERENCES Destination(destination_id)
hotel_id INTEGER REFERENCES Hotel(hotel_id)
```

**TypeScript:** `LovingList`
```typescript
id: number
user_id: number
destination_id: number | null
hotel_id: number | null
```

✅ **Status:** Đã match chính xác với database

**Constraint:** Đúng 1 trong 2 field (destination_id, hotel_id) phải có giá trị.

---

## 11. HotelFacilities Table

**Database:** `HotelFacilities`
```sql
facility_id SERIAL PRIMARY KEY
name VARCHAR(100)
```

**TypeScript:** `HotelFacility`
```typescript
facility_id: number
name: string
```

✅ **Status:** Đã match chính xác với database

---

## 12. FacilitiesPossessing Table

**Database:** `FacilitiesPossessing`
```sql
facility_id INTEGER REFERENCES HotelFacilities(facility_id)
hotel_id INTEGER REFERENCES Hotel(hotel_id)
description TEXT
PRIMARY KEY (facility_id, hotel_id)
```

**TypeScript:** `FacilityPossessing`
```typescript
facility_id: number
hotel_id: number
description: string | null
```

✅ **Status:** Đã match chính xác với database

---

## 13. RoomService Table

**Database:** `RoomService`
```sql
service_id SERIAL PRIMARY KEY
name VARCHAR(100)
```

**TypeScript:** `RoomService`
```typescript
service_id: number
name: string
```

✅ **Status:** Đã match chính xác với database

---

## 14. ServicePossessing Table

**Database:** `ServicePossessing`
```sql
service_id INTEGER REFERENCES RoomService(service_id)
type_id INTEGER REFERENCES RoomType(type_id)
description TEXT
PRIMARY KEY (service_id, type_id)
```

**TypeScript:** `ServicePossessing`
```typescript
service_id: number
type_id: number
description: string | null
```

✅ **Status:** Đã match chính xác với database

---

## 15. Image Table

**Database:** `Image`
```sql
image_id SERIAL PRIMARY KEY
destination_id INTEGER REFERENCES Destination(destination_id)
hotel_id INTEGER REFERENCES Hotel(hotel_id)
room_id INTEGER REFERENCES Room(room_id)
image_url VARCHAR(255)
```

**TypeScript:** `Image`
```typescript
image_id: number
destination_id: number | null
hotel_id: number | null
room_id: number | null
image_url: string
```

✅ **Status:** Đã match chính xác với database

---

## 16. Payment Table

**Database:** `Payment`
```sql
payment_id SERIAL PRIMARY KEY
booking_id INTEGER REFERENCES Booking(booking_id) NOT NULL
amount BIGINT NOT NULL
payment_method VARCHAR(50) DEFAULT 'vnpay'
status VARCHAR(50) DEFAULT 'pending'
vnp_txn_ref VARCHAR(100) UNIQUE
vnp_transaction_no VARCHAR(100)
vnp_response_code VARCHAR(10)
vnp_bank_code VARCHAR(50)
vnp_pay_date VARCHAR(20)
vnp_order_info TEXT
payment_url TEXT
ip_address VARCHAR(50)
created_at TIMESTAMP
updated_at TIMESTAMP
```

**TypeScript:** `Payment`
```typescript
payment_id: number
booking_id: number
amount: number
payment_method: 'vnpay' | 'momo' | 'cash' | 'bank_transfer'
status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' | 'cancelled'
vnp_txn_ref: string | null
vnp_transaction_no: string | null
vnp_response_code: string | null
vnp_bank_code: string | null
vnp_pay_date: string | null
vnp_order_info: string | null
payment_url: string | null
ip_address: string | null
created_at: string
updated_at: string
```

✅ **Status:** Đã match chính xác với database

---

## Lưu ý quan trọng

### 1. Primary Key Naming
- Database sử dụng các tên như `user_id`, `hotel_id`, `type_id`, `room_id`, v.v.
- Frontend types phải sử dụng đúng tên này, **KHÔNG** dùng `id`

### 2. Property Name Mapping
Một số thuộc tính có tên khác nhau cần lưu ý:

| Database | Frontend Code | ✅ Correct Property |
|----------|---------------|---------------------|
| `type` (RoomType) | Thường bị nhầm thành `name` | `type` |
| `max_guests` | Thường bị nhầm thành `maxGuests` | `max_guests` |
| `phone_number` | Thường bị nhầm thành `phone` | `phone_number` |
| `profile_image` | Thường bị nhầm thành `avatar` | `profile_image` |
| `date_of_birth` | - | `date_of_birth` |

### 3. Nullable Fields
Các field được đánh dấu `| null` trong TypeScript nghĩa là có thể NULL trong database.

### 4. Optional Frontend Fields
Các field đánh dấu `?` (optional) là các field chỉ dùng cho frontend, **KHÔNG** có trong database:
- `slug`, `stars`, `city`, `district` trong Hotel
- `size`, `beds`, `basePrice`, `images`, `amenities` trong RoomType
- Các field hiển thị như `hotelName`, `roomType`, `nights` trong Booking

---

## Checklist khi code

✅ Luôn sử dụng tên field chính xác từ database (`type_id`, không phải `id`)
✅ Sử dụng snake_case cho property names (`phone_number`, không phải `phoneNumber`)
✅ Check nullable fields trước khi sử dụng
✅ Không expect các optional frontend fields từ API
✅ Convert camelCase sang snake_case khi gọi API
✅ Convert snake_case sang camelCase khi hiển thị UI (nếu cần)
