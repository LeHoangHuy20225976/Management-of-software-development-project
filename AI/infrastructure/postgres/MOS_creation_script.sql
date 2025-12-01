/*
Small changes:
1. Remove MaintenanceRecord, using room_logs instead for tracking room status (goals: for analyzing the trend/quality of room)
2. Add new columns: estimated_available_time DATE, number of single bed, number of double bed, room_view, room_size for Room table
3, Add new column: status for Hotel table
4. LovingList: use for both hotel love and destination love? (can be used for ranking or recommendation?)
*/

/*
Questions:
1. Why has avalability column in table RoomType?
answer : room availabilty và room status giống nhau : giá trị 1 là active, tức là mình có thể bảo trì hoặc đặt phòng ko vấn đề gì,
còn = 0 tức là chúng nó sẽ bị vô hiệu hóa vô thời hạn (tức là có thể vì một lý do nào đó , ví dụ như sắp đập đi hoặc đơn giản là ko muốn kinh doanh loại đó nữa).
Nhỡ trong tương lai nếu chủ ks đổi ý thì vẫn có thể set lại.



2. What is the usecase of HotelAround
answer : Ban đầu hồi hc SE, bọn tôi thiết kế để chứa thông tin về các khách sạn xung quanh một điểm du lịch cụ thể. Về sau thì bọn tôi
quyết định tự tính toán khoảng cách rồi cho AI lọc ra ngay trên code FE luôn, nên cái bảng này bị bỏ trống. Ae thích có thể sử dụng hoặc ko thì bỏ đi cũng được. Tôi giữ lại nếu ae cần thì dùng

*/

-- 1. USER TABLE
CREATE TABLE "User" (
    user_id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100),
    phone_number VARCHAR(20), -- Changed from Integer to VARCHAR for flexibility
    gender VARCHAR(100),
    date_of_birth DATE,
    role VARCHAR(100),
    password VARCHAR(100),
    profile_image VARCHAR(255)
);

-- 2. DESTINATION TABLE
CREATE TABLE Destination (
    destination_id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    rating INTEGER,
    location VARCHAR(100),
    transportation VARCHAR(100),
    entry_fee BIGINT, -- Using BIGINT for money values
    description TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    type VARCHAR(100),
    thumbnail VARCHAR(255)
);

-- 3. HOTEL TABLE
CREATE TABLE Hotel (
    hotel_id SERIAL PRIMARY KEY,
    hotel_owner INTEGER REFERENCES "User"(user_id),
    name VARCHAR(100),
    address VARCHAR(100),
    status INTEGER, -- AVAILABLE, NON-AVAILABLE?
    rating DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    latitude DOUBLE PRECISION,
    description TEXT,
    contact_phone VARCHAR(100),
    thumbnail VARCHAR(255) -- Added to match INSERT script utility
);

-- 4. HOTEL FACILITIES TABLE
CREATE TABLE HotelFacilities (
    facility_id SERIAL PRIMARY KEY,
    name VARCHAR(100)
);

-- 5. FACILITIES POSSESSING TABLE (Linking Hotel & Facilities)
CREATE TABLE FacilitiesPossessing (
    facility_id INTEGER REFERENCES HotelFacilities(facility_id),
    hotel_id INTEGER REFERENCES Hotel(hotel_id),
    description TEXT,
    PRIMARY KEY (facility_id, hotel_id)
);

-- 6. HOTEL AROUND TABLE (Linking Hotel & Destination)
CREATE TABLE HotelAround (
    hotel_id INTEGER REFERENCES Hotel(hotel_id),
    destination_id INTEGER REFERENCES Destination(destination_id),
    PRIMARY KEY (hotel_id, destination_id)
);

-- 7. ROOM TYPE TABLE
CREATE TABLE RoomType (
    type_id SERIAL PRIMARY KEY,
    hotel_id INTEGER REFERENCES Hotel(hotel_id),
    type VARCHAR(100),
    availability BOOLEAN, -- Why this existed??????
    max_guests INTEGER,
    description TEXT,
    quantity INTEGER
);

-- 8. ROOM PRICE TABLE
CREATE TABLE RoomPrice (
    price_id SERIAL PRIMARY KEY,
    type_id INTEGER REFERENCES RoomType(type_id),
    -- These are now NULL if no event exists
    start_date DATE,
    end_date DATE,
    special_price BIGINT,
    event VARCHAR(100),
    basic_price BIGINT, -- Always present
    discount DOUBLE PRECISION
);

-- 9. ROOM TABLE (Physical Room Instances)
CREATE TABLE Room (
    room_id SERIAL PRIMARY KEY,
    type_id INTEGER REFERENCES RoomType(type_id),
    name VARCHAR(100),
    location VARCHAR(100),
    status INTEGER CHECK (status IN (0, 1)) DEFAULT 1,
    estimated_available_time DATE,
    number_of_single_beds INTEGER,
    number_of_double_beds INTEGER,
    room_view VARCHAR(50),
    room_size DOUBLE PRECISION,
    notes TEXT
);


-- 3. CREATE MAINTENANCE RECORD TABLE (New)
-- CREATE TABLE MaintenanceRecord (
--     maintenance_id SERIAL PRIMARY KEY,
--     room_id INTEGER REFERENCES Room(room_id),
--     start_date DATE,
--     end_date DATE,
--     notes TEXT
-- );

-- Simple version of maintenance record, keep tracking for status of room, this is the real tracking for room.

CREATE TABLE room_logs (
    log_id      SERIAL PRIMARY KEY,
    room_id     INTEGER NOT NULL REFERENCES room(room_id),
    event_type  VARCHAR(30) NOT NULL CHECK (
        event_type IN (
            'BOOK_CREATED',      -- tạo booking
            'BOOK_CANCELLED',    -- hủy booking
            'BOOK_CHECKIN',      -- khách nhận phòng
            'BOOK_CHECKOUT',     -- khách trả phòng
            'MAINTAIN_START',    -- bắt đầu bảo trì
            'MAINTAIN_END'       -- kết thúc bảo trì
        )
    ),
    extra_context   TEXT,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);



-- 10. ROOM SERVICE TABLE
CREATE TABLE RoomService (
    service_id SERIAL PRIMARY KEY,
    name VARCHAR(100)
);

-- 11. SERVICE POSSESSING TABLE (Linking Service & RoomType)
CREATE TABLE ServicePossessing (
    service_id INTEGER REFERENCES RoomService(service_id),
    type_id INTEGER REFERENCES RoomType(type_id),
    description TEXT, -- Optional description column if needed
    PRIMARY KEY (service_id, type_id)
);

-- 12. IMAGE TABLE (Polymorphic-style links)
CREATE TABLE Image (
    image_id SERIAL PRIMARY KEY,
    destination_id INTEGER REFERENCES Destination(destination_id),
    hotel_id INTEGER REFERENCES Hotel(hotel_id),
    room_id INTEGER REFERENCES Room(room_id),
    image_url VARCHAR(255)
);

-- 13. REVIEW TABLE (Hotel Reviews)
CREATE TABLE Review (
    review_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES "User"(user_id),
    
    -- These three columns must be nullable (no "NOT NULL" keyword)
    destination_id INTEGER REFERENCES Destination(destination_id),
    hotel_id INTEGER REFERENCES Hotel(hotel_id),
    room_id INTEGER REFERENCES Room(room_id),
    
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    date_created DATE,

    -- THIS IS THE CRITICAL PART
    -- This constraint calculates the sum of non-null IDs. 
    -- It MUST equal exactly 1.
    CONSTRAINT chk_review_target_strict CHECK (
        (CASE WHEN destination_id IS NOT NULL THEN 1 ELSE 0 END +
         CASE WHEN hotel_id IS NOT NULL THEN 1 ELSE 0 END +
         CASE WHEN room_id IS NOT NULL THEN 1 ELSE 0 END) = 1
    )
);

-- 14. DES REVIEW TABLE (Destination Reviews)
-- CREATE TABLE DesReview (
--     review_id SERIAL PRIMARY KEY,
--     user_id INTEGER REFERENCES "User"(user_id),
--     destination_id INTEGER REFERENCES Destination(destination_id),
--     rating DOUBLE PRECISION,
--     comment TEXT,
--     date_created DATE
-- );

-- 15. LOVING LIST TABLE (User Favorites)
CREATE TABLE LovingList (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES "User"(user_id),
    destination_id INTEGER REFERENCES Destination(destination_id),
    hotel_id INTEGER REFERENCES Hotel(hotel_id),
    CHECK (
      (CASE WHEN destination_id IS NOT NULL THEN 1 ELSE 0 END +
       CASE WHEN hotel_id IS NOT NULL THEN 1 ELSE 0 END) = 1
    )
);


-- 16. BOOKING TABLE
CREATE TABLE Booking (
    booking_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES "User"(user_id),
    room_id INTEGER REFERENCES Room(room_id),
    status VARCHAR(50) CHECK (status IN ('accepted', 'pending', 'rejected', 'cancel requested', 'cancelled', 'maintained')),
    total_price BIGINT,
    check_in_date DATE,
    check_out_date DATE,
    created_at DATE,
    people INTEGER
);