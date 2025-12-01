-- 1. USERS
INSERT INTO "User" (name, email, phone_number, gender, date_of_birth, role, password, profile_image) VALUES
('John Nguyen', 'a@example.com', '901234561', 'Male', '1990-01-01', 'customer', 'pass123', 'a.jpg'), -- ID 1
('Mary Tran', 'b@example.com', '901234562', 'Female', '1992-02-02', 'customer', 'pass123', 'b.jpg'), -- ID 2
('Peter Le', 'c@example.com', '901234563', 'Male', '1988-03-03', 'hotel owner', 'pass123', 'c.jpg'), -- ID 3 (Owner)
('Anna Pham', 'd@example.com', '901234564', 'Female', '1995-04-04', 'customer', 'pass123', 'd.jpg'),
('David Do', 'e@example.com', '901234565', 'Male', '1993-05-05', 'admin', 'admin123', 'e.jpg'),
('Emma Ngo', 'f@example.com', '901234566', 'Female', '1994-06-06', 'customer', 'pass123', 'f.jpg'),
('Michael Hoang', 'g@example.com', '901234567', 'Male', '1991-07-07', 'customer', 'pass123', 'g.jpg'),
('Sophie Vu', 'h@example.com', '901234568', 'Female', '1996-08-08', 'hotel owner', 'pass123', 'h.jpg'), -- ID 8 (Owner)
('James Bui', 'i@example.com', '901234569', 'Male', '1990-09-09', 'customer', 'pass123', 'i.jpg'),
('Linda Nguyen', 'j@example.com', '901234570', 'Female', '1998-10-10', 'customer', 'pass123', 'j.jpg'),
('Thomas Trinh', 'k@example.com', '901234571', 'Male', '1992-11-11', 'customer', 'pass123', 'k.jpg'),
('Sarah Ha', 'l@example.com', '901234572', 'Female', '1993-12-12', 'customer', 'pass123', 'l.jpg'),
('William Dinh', 'm@example.com', '901234573', 'Male', '1989-01-13', 'customer', 'pass123', 'm.jpg'),
('Emily Phan', 'n@example.com', '901234574', 'Female', '1995-02-14', 'customer', 'pass123', 'n.jpg'),
('Daniel Ly', 'o@example.com', '901234575', 'Male', '1994-03-15', 'customer', 'pass123', 'o.jpg'),
('Olivia Mai', 'p@example.com', '901234576', 'Female', '1990-04-16', 'hotel owner', 'pass123', 'p.jpg'), -- ID 16 (Owner)
('Ethan To', 'q@example.com', '901234577', 'Male', '1997-05-17', 'customer', 'pass123', 'q.jpg'),
('Isabella Duong', 'r@example.com', '901234578', 'Female', '1996-06-18', 'customer', 'pass123', 'r.jpg'),
('Henry Luong', 's@example.com', '901234579', 'Male', '1991-07-19', 'customer', 'pass123', 's.jpg'),
('Sophia Chau', 't@example.com', '901234580', 'Female', '1993-08-20', 'admin', 'admin123', 't.jpg'),
('Liam Kieu', 'u@example.com', '901234581', 'Male', '1992-09-21', 'customer', 'pass123', 'u.jpg'),
('Mia Tra', 'v@example.com', '901234582', 'Female', '1994-10-22', 'customer', 'pass123', 'v.jpg'),
('Noah Doan', 'w@example.com', '901234583', 'Male', '1996-11-23', 'customer', 'pass123', 'w.jpg'),
('Charlotte Ho', 'x@example.com', '901234584', 'Female', '1990-12-24', 'customer', 'pass123', 'x.jpg'),
('Lucas Nguyen', 'y@example.com', '901234585', 'Male', '1995-01-25', 'hotel owner', 'pass123', 'y.jpg'), -- ID 25 (Owner)
('Amelia Tran', 'z@example.com', '901234586', 'Female', '1993-02-26', 'customer', 'pass123', 'z.jpg'),
('Mason Quach', 'aa@example.com', '901234587', 'Male', '1997-03-27', 'customer', 'pass123', 'aa.jpg'),
('Harper Luu', 'bb@example.com', '901234588', 'Female', '1991-04-28', 'customer', 'pass123', 'bb.jpg'),
('Elijah Cao', 'cc@example.com', '901234589', 'Male', '1998-05-29', 'customer', 'pass123', 'cc.jpg'),
('Ava Tong', 'dd@example.com', '901234590', 'Female', '1996-06-30', 'customer', 'pass123', 'dd.jpg');

-- 2. DESTINATIONS
INSERT INTO Destination (name, rating, location, transportation, entry_fee, description, latitude, longitude, type, thumbnail) VALUES
('Ho Guom Lake', 5, 'Hanoi', 'Motorbike, Bus, Taxi', 0, 'A famous tourist attraction in Hanoi', 21.0285, 105.8542, 'Historical', 'ho_guom.jpg'),
('Ba Na Hills', 5, 'Da Nang', 'Cable car, Bus', 350000, 'A renowned mountain-top resort', 15.996, 107.996, 'Resort', 'ba_na_hills.jpg'),
('Turtle Tower', 4, 'Hanoi', 'Walking, Motorbike', 0, 'A cultural symbol of Hanoi', 21.0288, 105.8525, 'Historical', 'thap_rua.jpg'),
('One Pillar Pagoda', 4, 'Hanoi', 'Motorbike, Bus', 30000, 'A famous pagoda with unique architecture', 21.0359, 105.8341, 'Religious', 'chua_mot_cot.jpg'),
('Notre-Dame Basilica', 5, 'Ho Chi Minh City', 'Taxi, Motorbike, Bus', 0, 'An elegant French-style architectural landmark', 10.7798, 106.6992, 'Religious', 'nha_tho_duc_ba.jpg'),
('Ben Thanh Market', 4, 'Ho Chi Minh City', 'Motorbike, Bus', 0, 'A famous traditional market in Saigon', 10.772, 106.6984, 'Market', 'cho_ben_thanh.jpg'),
('Dragon Bridge', 5, 'Da Nang', 'Motorbike, Taxi', 0, 'A famous bridge with a fire-breathing dragon design', 16.0617, 108.227, 'Modern', 'cau_rong.jpg'),
('Hoi An Ancient Town', 5, 'Quang Nam', 'Bicycle, Walking', 120000, 'A UNESCO World Heritage riverside ancient town', 15.8801, 108.338, 'Historical', 'pho_co_hoi_an.jpg'),
('Mui Ne', 4, 'Binh Thuan', 'Coach, Motorbike', 0, 'A famous resort area with sand dunes', 10.961, 108.25, 'Nature', 'mui_ne.jpg'),
('Ha Long Bay', 5, 'Quang Ninh', 'Coach, Cruise', 290000, 'A UNESCO World Heritage natural wonder', 20.9101, 107.1839, 'Nature', 'vinh_ha_long.jpg'),
('Ba Den Mountain', 4, 'Tay Ninh', 'Cable car, Motorbike', 160000, 'The highest peak in Southern Vietnam', 11.3767, 106.1787, 'Nature', 'nui_ba_den.jpg'),
('My Khe Beach', 5, 'Da Nang', 'Motorbike, Taxi', 0, 'One of the most beautiful beaches in Vietnam', 16.059, 108.241, 'Nature', 'bien_my_khe.jpg'),
('Ban Gioc Waterfall', 5, 'Cao Bang', 'Coach, Motorbike', 45000, 'A majestic waterfall on the Vietnam-China border', 22.8531, 106.728, 'Nature', 'thac_ban_gioc.jpg'),
('Fansipan', 5, 'Sa Pa, Lao Cai', 'Cable car, Coach', 750000, 'The Roof of Indochina at 3,143m', 22.303, 103.773, 'Nature', 'fansipan.jpg'),
('Xuan Huong Lake', 4, 'Lam Dong', 'Bicycle, Motorbike', 0, 'The poetic central lake of Da Lat', 11.944, 108.445, 'Nature', 'ho_xuan_huong.jpg'),
('Valley of Love', 4, 'Lam Dong', 'Motorbike, Taxi', 100000, 'A romantic destination for couples', 11.969, 108.457, 'Nature', 'thung_lung_tinh_yeu.jpg'),
('Duong Lam Ancient Village', 4, 'Hanoi', 'Motorbike, Bus', 20000, 'An ancient village preserving traditional charm', 21.132, 105.469, 'Historical', 'duong_lam.jpg'),
('Nha Trang Beach', 5, 'Khanh Hoa', 'Motorbike, Taxi', 0, 'A famous beach with crystal-clear water', 12.238, 109.196, 'Nature', 'bien_nha_trang.jpg'),
('Hue Imperial City', 5, 'Hue', 'Motorbike, Bicycle', 150000, 'A UNESCO World Heritage site with imperial architecture', 16.463, 107.590, 'Historical', 'co_do_hue.jpg'),
('Langbiang Peak', 4, 'Lam Dong', 'Jeep, Hiking', 50000, 'A vantage point for panoramic views of Da Lat', 12.020, 108.437, 'Nature', 'langbiang.jpg');

-- 3. HOTELS
-- Included new 'status' column (1 = Active)
INSERT INTO Hotel (hotel_owner, name, address, rating, status, longitude, latitude, description, thumbnail, contact_phone) VALUES
(3, 'Hanoi Grand Hotel', '123 Tran Hung Dao, Hanoi', 4.5, 1, 105.854, 21.028, 'Luxury in heart of Hanoi', 'hanoi_grand.jpg', '0901234567'),
(3, 'Da Nang Ocean View', '456 Vo Nguyen Giap, Da Nang', 4.7, 1, 108.241, 16.059, 'Beachfront views', 'danang_ocean.jpg', '0902345678'),
(3, 'Saigon Luxury Stay', '789 Le Loi, HCM City', 4.6, 1, 106.700, 10.776, 'Ideal Saigon stay', 'saigon_luxury.jpg', '0903456789'),
(3, 'Nha Trang Seaview', '12 Tran Phu, Nha Trang', 4.8, 1, 109.196, 12.238, 'Close to beach', 'nha_trang_seaview.jpg', '0904567890'),
(3, 'Hue Imperial Hotel', '45 Le Loi, Hue', 4.4, 1, 107.590, 16.463, 'Classic Hue style', 'hue_imperial.jpg', '0905678901'),
(8, 'Dalat Pine Hill', '67 Phan Dinh Phung, Da Lat', 4.3, 1, 108.437, 12.020, 'Pine forest resort', 'dalat_pine.jpg', '0906789012'),
(8, 'Sapa Valley View', '89 Fansipan, Sa Pa', 4.9, 1, 103.773, 22.303, 'Mountain views', 'sapa_valley.jpg', '0907890123'),
(8, 'Phu Quoc Resort', '100 Tran Hung Dao, Phu Quoc', 4.6, 1, 103.963, 10.227, 'Premium resort', 'phuquoc_resort.jpg', '0908901234'),
(8, 'Hoi An Ancient Hotel', '23 Nguyen Thai Hoc, Hoi An', 4.7, 1, 108.338, 15.880, 'Classic ancient style', 'hoian_ancient.jpg', '0909012345'),
(8, 'Ba Na Hills Hotel', 'Sunworld Ba Na Hills', 4.8, 1, 107.996, 15.996, 'Mountain top hotel', 'banahills_hotel.jpg', '0910123456'),
(16, 'Mui Ne Sands', '300 Nguyen Dinh Chieu, Mui Ne', 4.2, 1, 108.250, 10.961, 'Sand dunes nearby', 'muine_sands.jpg', '0911234567'),
(16, 'Can Tho Riverfront', '15 Hai Ba Trung, Can Tho', 4.3, 1, 105.784, 10.033, 'Poetic river views', 'cantho_river.jpg', '0912345678'),
(16, 'Quy Nhon Blue Sea', '10 An Duong Vuong, Quy Nhon', 4.4, 1, 109.219, 13.782, 'Beachfront ideal', 'quynhon_blue.jpg', '0913456789'),
(16, 'Tay Ninh Mountain', 'Ba Den Mountain, Tay Ninh', 4.1, 1, 106.178, 11.376, 'Cable car views', 'tayninh_mountain.jpg', '0914567890'),
(16, 'Vung Tau Plaza', '1 Thuy Van, Vung Tau', 4.6, 1, 107.086, 10.346, 'Vibrant city center', 'vungtau_plaza.jpg', '0915678901'),
(25, 'Ha Long Pearl', '88 Ha Long, Quang Ninh', 4.7, 1, 107.183, 20.910, 'Overlooking the bay', 'halong_pearl.jpg', '0916789012'),
(25, 'Langbiang Hotel', 'Langbiang, Da Lat', 4.3, 1, 108.437, 12.020, 'Mountain foot hotel', 'langbiang_hotel.jpg', '0917890123'),
(25, 'Bien Hoa City Hotel', '45 Pham Van Thuan, Bien Hoa', 4.0, 1, 106.830, 10.958, 'Industrial heart', 'bienhoa_city.jpg', '0918901234'),
(25, 'My Tho Riverside', '3 Le Loi, My Tho', 4.1, 1, 106.360, 10.360, 'Peaceful Tien River', 'mytho_riverside.jpg', '0919012345'),
(25, 'Dong Hoi Garden', '68 Quang Trung, Dong Hoi', 4.2, 1, 106.617, 17.468, 'Tranquil garden', 'donghoi_garden.jpg', '0920123456');

-- 4. HOTEL FACILITIES
INSERT INTO HotelFacilities (name) VALUES
('Free Wi-Fi'), ('Swimming Pool'), ('Parking Lot'), ('Airport Shuttle'),
('Gym'), ('Spa & Massage'), ('Restaurant'), ('Bar'),
('24/7 Reception'), ('Laundry Service');

-- 5. FACILITIES POSSESSING
INSERT INTO FacilitiesPossessing (facility_id, hotel_id, description) VALUES
(1, 1, 'High speed wifi'), (2, 2, 'Infinity pool'), (3, 3, 'Secure parking'),
(5, 4, 'Modern gym'), (7, 5, 'Imperial cuisine'), (2, 6, 'Heated pool'),
(6, 7, 'Herbal spa'), (1, 8, 'Resort wide wifi'), (7, 9, 'Local specialties'),
(9, 10, 'Concierge desk'), (3, 11, 'Free parking'), (7, 12, 'River view dining'),
(2, 13, 'Ocean pool'), (4, 14, 'Cable car shuttle'), (8, 15, 'Rooftop bar'),
(10, 16, 'Express laundry'), (3, 17, 'Mountain parking'), (9, 18, 'Business center'),
(7, 19, 'Floating restaurant'), (1, 20, 'Garden wifi');

-- 6. HOTEL AROUND
-- INSERT INTO HotelAround (hotel_id, destination_id) VALUES
-- (1, 1), (1, 3), (1, 4),
-- (2, 2), (2, 7), (2, 12),
-- (3, 5), (3, 6),
-- (4, 18),
-- (5, 19),
-- (6, 15), (6, 16), (6, 20),
-- (7, 14),
-- (9, 8),
-- (10, 2),
-- (11, 9),
-- (14, 11),
-- (16, 10),
-- (17, 20);

-- 7. ROOM TYPE
-- Note: Room Type 12 (Hotel 16) is set to unavailable as an example.
INSERT INTO RoomType (hotel_id, type, availability, max_guests, description, quantity) VALUES
(1, 'Standard Single', true, 1, 'Cozy single room', 5), -- ID 1
(1, 'Deluxe Double', true, 2, 'City view double', 5), -- ID 2
(1, 'Grand Suite', true, 4, 'Luxury suite', 2),    -- ID 3
(2, 'Standard Single', true, 1, 'Garden view', 5),    -- ID 4
(2, 'Ocean Double', true, 2, 'Direct ocean view', 5), -- ID 5
(2, 'Family Ocean', true, 4, 'Spacious family room', 3),-- ID 6
(3, 'Business Single', true, 1, 'Work desk included', 10),-- ID 7
(3, 'City Double', true, 2, 'District 1 view', 8),    -- ID 8
(3, 'Luxury Suite', true, 3, 'Top floor suite', 2),   -- ID 9
(4, 'Standard', true, 2, 'Basic room', 10),           -- ID 10
(10, 'Mountain View', true, 2, 'High altitude view', 20),-- ID 11
(16, 'Bay View Suite', false, 4, 'Overlooking Ha Long', 5);-- ID 12 (UNAVAILABLE)

-- 8. ROOM PRICE
INSERT INTO RoomPrice (type_id, start_date, end_date, special_price, basic_price, event, discount) VALUES
(1, NULL, NULL, NULL, 900000, NULL, 0.1),
(2, '2025-01-01', '2025-05-01', 1100000, 1200000, 'Spring Sale', 0.0),
(3, '2025-11-01', '2025-12-31', 1800000, 2000000, 'Winter Holiday', 0.1),
(4, NULL, NULL, NULL, 800000, NULL, 0.0),
(5, '2024-12-01', '2025-01-31', 1400000, 1500000, 'New Year 2025', 0.0),
(6, '2025-10-01', '2026-02-28', 1600000, 1800000, 'Long Stay Deal', 0.1),
(7, NULL, NULL, NULL, 950000, NULL, 0.0),
(8, '2025-06-01', '2025-08-31', 1300000, 1400000, 'Summer Vibes', 0.0),
(9, '2025-11-15', '2025-12-25', 2300000, 2500000, 'Christmas Early Bird', 0.0);

-- 9. ROOMS
-- IMPORTANT: Data consistency rules applied based on RoomType.
-- ID 1 (Type 1 - Std Single): 1 Single Bed, 0 Double, City View, ~25m2
-- ID 3 (Type 2 - Dlx Double): 0 Single, 1 Double, City View, ~35m2
-- ID 4 (Type 3 - Suite): 0 Single, 2 Double, City View, ~60m2
-- ID 6 (Type 5 - Ocean Double): 0 Single, 1 Double, Ocean View, ~40m2
-- ID 7 (Type 6 - Family): 2 Single, 1 Double, Ocean View, ~60m2

INSERT INTO Room (type_id, name, location, status, estimated_available_time, number_of_single_beds, number_of_double_beds, room_view, room_size, notes) VALUES
(1, 'Room 101', 'Floor 1', 1, NULL, 1, 0, 'City View', 25.0, 'Quiet corner'),          -- ID 1
(1, 'Room 102', 'Floor 1', 1, NULL, 1, 0, 'City View', 25.0, 'Near elevator'),  -- ID 2 (Has Maintenance later)
(2, 'Room 201', 'Floor 2', 1, NULL, 0, 1, 'City View', 35.0, 'Balcony'),               -- ID 3
(3, 'Room 501', 'Floor 5', 0, '2039-01-01', 0, 2, 'City View', 60.0, 'Not used'),    -- ID 4 (Closed)
(4, 'Room 101', 'Floor 1', 1, NULL, 1, 0, 'Garden View', 28.0, 'Garden side'),           -- ID 5
(5, 'Room 205', 'Floor 2', 1, NULL, 0, 1, 'Ocean View', 40.0, 'Sea view'),              -- ID 6
(6, 'Room 305', 'Floor 3', 1, NULL, 2, 1, 'Ocean View', 65.0, 'Two beds'),              -- ID 7
(7, 'Room 202', 'Floor 2', 1, NULL, 1, 0, 'Street View', 26.0, 'Street view'),           -- ID 8
(9, 'Room 601', 'Floor 6', 1, NULL, 0, 2, 'City View', 80.0, 'Penthouse');             -- ID 9

-- 10. ROOM LOGS
INSERT INTO room_logs (room_id, event_type, extra_context) VALUES
(1, 'BOOK_CREATED', 'Booking #1 created for June'),
(2, 'MAINTAIN_START', 'Scheduled AC maintenance'),
(4, 'MAINTAIN_START', 'Emergency water damage repair start'),
(6, 'BOOK_CHECKIN', 'Guest arrived early'),
(9, 'BOOK_CHECKOUT', 'Guest left, room needs cleaning');

-- 11. ROOM SERVICE
INSERT INTO RoomService (name) VALUES
('Daily Housekeeping'), ('Breakfast in Bed'), ('Wake-up Call'), ('Minibar');

-- 12. SERVICE POSSESSING
INSERT INTO ServicePossessing (service_id, type_id) VALUES
(1, 1), (3, 1), 
(1, 2), (2, 2), (3, 2), 
(1, 3), (2, 3), (3, 3), (4, 3), 
(1, 4), (3, 4), 
(1, 5), (2, 5), (4, 5); 

-- 13. IMAGES
INSERT INTO Image (destination_id, hotel_id, room_id, image_url) VALUES
(1, NULL, NULL, '/ho_guom_sunset.jpg'),
(2, NULL, NULL, '/bana_bridge.jpg'),
(NULL, 1, NULL, '/hanoi_grand_lobby.jpg'),
(NULL, 2, NULL, '/danang_ocean_pool.jpg'),
(NULL, NULL, 1, '/room_101_interior.jpg'), 
(NULL, NULL, 4, '/suite_501_living.jpg');  

-- 14. REVIEW
INSERT INTO Review (user_id, destination_id, hotel_id, room_id, rating, comment, date_created) VALUES
(1, NULL, NULL, 1, 5, 'Great room layout and clean!', '2024-11-12'),
(2, NULL, NULL, 3, 4, 'Room was spacious but noisy.', '2024-06-25'),
(4, NULL, NULL, 6, 5, 'The ocean view is stunning.', '2024-08-15'),
(5, NULL, NULL, 9, 5, 'Very luxurious suite.', '2024-09-22'),
(7, NULL, 1, NULL, 5, 'The lobby and hotel bar were excellent.', '2024-10-15'),
(15, NULL, 11, NULL, 4, 'Good value for money near the dunes.', '2024-07-09'),
(2, NULL, 6, NULL, 4, 'The hotel is a bit old but decent.', '2024-08-21'),
(1, 1, NULL, NULL, 5, 'Walking around the lake is peaceful.', '2024-10-01'),
(2, 2, NULL, NULL, 5, 'The cable car ride is amazing.', '2024-09-15'),
(3, 10, NULL, NULL, 5, 'Ha Long Bay is a must see!', '2024-08-20'),
(4, 8, NULL, NULL, 5, 'Hoi An is beautiful at night.', '2024-11-05');

-- 15. LOVING LIST
-- Now mixes Destinations (ID) and Hotels (ID)
INSERT INTO LovingList (user_id, destination_id, hotel_id) VALUES
(1, 1, NULL), -- Loves Ho Guom
(1, 10, NULL),-- Loves Ha Long
(1, NULL, 1), -- Loves Hanoi Grand Hotel
(2, 2, NULL),
(2, NULL, 2), -- Loves Da Nang Ocean View
(3, 5, NULL),
(4, 8, NULL),
(5, 14, NULL);

-- 16. BOOKINGS
-- Logic applied:
-- 1. Normal bookings have UserID, Price, People.
-- 2. Maintenance bookings (Room 2) have status='maintained', NULL User/Price/People.
-- 3. Room 4 is closed (Status 0), so booking is 'rejected'.

INSERT INTO Booking (user_id, room_id, status, total_price, check_in_date, check_out_date, created_at, people) VALUES
-- Normal Booking (Room 1)
(1, 1, 'accepted', 2400000, '2025-06-01', '2025-06-03', '2025-05-15', 2),

-- Normal Booking (Room 3)
(1, 3, 'pending', 3000000, '2025-07-10', '2025-07-12', '2025-06-25', 2),

-- Normal Booking (Room 6)
(2, 6, 'accepted', 1800000, '2025-06-05', '2025-06-07', '2025-05-20', 2),

-- Normal Booking (Room 9)
(3, 9, 'accepted', 6000000, '2025-07-01', '2025-07-04', '2025-06-10', 4),

-- MAINTENANCE BOOKING (Room 2)
-- Status = 'maintained'. User, Price, People set to NULL.
(NULL, 2, 'maintained', NULL, '2025-06-10', '2025-06-15', '2025-05-25', NULL),

-- Normal Booking (Room 7)
(5, 7, 'cancel requested', 3600000, '2025-08-01', '2025-08-03', '2025-07-15', 4),

-- Rejected Booking (Room 4 is Closed/Status 0)
(6, 4, 'rejected', 5400000, '2025-06-20', '2025-06-23', '2025-06-05', 4);