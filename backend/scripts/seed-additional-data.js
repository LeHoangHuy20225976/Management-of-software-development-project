const db = require("../models");
const bcrypt = require("bcryptjs");

const FACILITIES = [
  { facility_id: 1, name: "WiFi miễn phí" },
  { facility_id: 2, name: "Lễ tân 24/7" },
  { facility_id: 3, name: "Thang máy" },
  { facility_id: 4, name: "Két an toàn" },
  { facility_id: 5, name: "Dịch vụ giặt ủi" },
  { facility_id: 6, name: "Dịch vụ phòng" },
  { facility_id: 7, name: "Điều hòa" },
  { facility_id: 8, name: "TV màn hình phẳng" },
  { facility_id: 9, name: "Minibar" },
  { facility_id: 10, name: "Máy sấy tóc" },
  { facility_id: 11, name: "Bồn tắm" },
  { facility_id: 12, name: "Ban công" },
  { facility_id: 13, name: "Nhà hàng" },
  { facility_id: 14, name: "Quầy bar" },
  { facility_id: 15, name: "Bữa sáng buffet" },
  { facility_id: 16, name: "Phục vụ phòng 24h" },
  { facility_id: 17, name: "Hồ bơi" },
  { facility_id: 18, name: "Phòng gym" },
  { facility_id: 19, name: "Sân tennis" },
  { facility_id: 20, name: "Khu vui chơi trẻ em" },
  { facility_id: 21, name: "Phòng họp" },
  { facility_id: 22, name: "Trung tâm hội nghị" },
  { facility_id: 23, name: "Máy in/Fax" },
  { facility_id: 24, name: "Spa" },
  { facility_id: 25, name: "Phòng xông hơi" },
  { facility_id: 26, name: "Massage" },
  { facility_id: 27, name: "Bãi đậu xe miễn phí" },
  { facility_id: 28, name: "Đưa đón sân bay" },
  { facility_id: 29, name: "Thuê xe" },
  { facility_id: 30, name: "Dịch vụ taxi" },
];

// Helper function to generate random data
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomDate = (start, end) => new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
const randomElement = (arr) => arr[randomInt(0, arr.length - 1)];

// Vietnamese names
const firstNames = ["Nguyễn", "Trần", "Lê", "Phạm", "Hoàng", "Phan", "Vũ", "Đặng", "Bùi", "Đỗ", "Hồ", "Ngô", "Dương", "Lý"];
const middleNames = ["Văn", "Thị", "Minh", "Thu", "Quốc", "Hải", "Lan", "Anh", "Tuấn", "Hùng", "Thanh", "Phương"];
const lastNames = [
  "Anh",
  "Bình",
  "Châu",
  "Cường",
  "Dũng",
  "Đạt",
  "Đức",
  "Giang",
  "Hà",
  "Hải",
  "Hiếu",
  "Hoàng",
  "Hùng",
  "Huy",
  "Khánh",
  "Kiên",
  "Lan",
  "Linh",
  "Long",
  "Mai",
  "Minh",
  "My",
  "Nam",
  "Ngân",
  "Nhi",
  "Phúc",
  "Phương",
  "Quân",
  "Quang",
  "Sơn",
  "Thảo",
  "Thành",
  "Thắng",
  "Trang",
  "Trung",
  "Tú",
  "Tuấn",
  "Vân",
  "Việt",
  "Vinh"
];

const hotelNames = [
  "Golden Palace", "Royal Garden", "Paradise Beach", "Mountain View", "Sunset Resort",
  "Ocean Pearl", "Sky Tower", "Grand Riverside", "Diamond Hotel", "Emerald Bay",
  "Silver Star", "Crystal Palace", "Rainbow Resort", "Jade Garden", "Sapphire Beach",
  "Ruby Hotel", "Pearl Harbor", "Golden Gate", "Azure Sky", "Platinum Tower",
  "Crown Plaza", "Majestic Hotel", "Imperial Suite", "Dynasty Resort", "Heritage Inn"
];

const cities = [
  {name: "Hà Nội", lat: 21.0285, lng: 105.8542},
  {name: "TP.HCM", lat: 10.7769, lng: 106.7009},
  {name: "Đà Nẵng", lat: 16.0544, lng: 108.2441},
  {name: "Nha Trang", lat: 12.2388, lng: 109.1967},
  {name: "Đà Lạt", lat: 11.9404, lng: 108.4583},
  {name: "Phú Quốc", lat: 10.2167, lng: 103.9598},
  {name: "Hội An", lat: 15.8801, lng: 108.3271},
  {name: "Vũng Tàu", lat: 10.3459, lng: 107.0843},
  {name: "Huế", lat: 16.4637, lng: 107.5885},
  {name: "Sa Pa", lat: 22.3364, lng: 103.8438}
];

const roomTypes = ["Standard Room", "Deluxe Room", "Suite", "Executive Suite", "Presidential Suite",
                   "Family Room", "Ocean View Room", "Garden View Room", "City View Room", "Mountain View Room"];

const bookingStatuses = ["pending", "accepted", "checked_in", "maintained", "cancelled", "completed"];

const isEmptyTable = async (model) => {
  if (!model) return true;
  const count = await model.count();
  return count === 0;
};

async function seedHotelFacilitiesIfNeeded() {
  const qi = db.sequelize.getQueryInterface();
  const tables = (await qi.showAllTables()) || [];
  const hasHotelFacilitiesTable = tables.some(
    (t) => String(t).toLowerCase() === "hotelfacilities"
  );

  if (!hasHotelFacilitiesTable || !db.HotelFacilities) {
    console.log("HotelFacilities table does not exist yet. Skipping HotelFacilities seed.");
    return;
  }

  const existingCount = await db.HotelFacilities.count();
  if (existingCount > 0) {
    console.log(`HotelFacilities already has ${existingCount} rows. Skipping HotelFacilities seed.`);
    return;
  }

  console.log("Seeding HotelFacilities...");
  const tx = await db.sequelize.transaction();
  try {
    for (const facility of FACILITIES) {
      await db.HotelFacilities.upsert(facility, { transaction: tx });
    }
    await tx.commit();
  } catch (e) {
    await tx.rollback();
    throw e;
  }

  const count = await db.HotelFacilities.count();
  console.log(`Done. HotelFacilities count: ${count}`);
}

async function seedAdditionalData() {
  try {
    console.log("🌱 Bắt đầu thêm nhiều dữ liệu...\n");

    const hashedPassword = await bcrypt.hash("password123", 10);

    await seedHotelFacilitiesIfNeeded();

    let createdUsers = [];
    const shouldSeedUsers = await isEmptyTable(db.User);
    if (shouldSeedUsers) {

    // 1. Tạo thêm 100 users
    console.log("👤 Tạo thêm 100 users...");
    const additionalUsers = [];
    for (let i = 0; i < 100; i++) {
      const firstName = randomElement(firstNames);
      const middleName = randomElement(middleNames);
      const lastName = randomElement(lastNames);
      const fullName = `${firstName} ${middleName} ${lastName}`;
      const email = `user${i + 100}@example.com`;
      const phone = `090${randomInt(1000000, 9999999)}`;
      const gender = randomElement(["Nam", "Nữ"]);
      let role = "customer";
      if (i < 10) {
        role = "hotel_manager";
      } else if (i < 12) {
        role = "admin";
      }
      additionalUsers.push({
        name: fullName,
        email: email,
        phone_number: phone,
        gender: gender,
        date_of_birth: randomDate(new Date("1970-01-01"), new Date("2000-12-31")),
        role: role,
        password: hashedPassword,
        profile_image: `https://i.pravatar.cc/150?img=${randomInt(1, 70)}`,
      });
    }

    createdUsers = await db.User.bulkCreate(additionalUsers);
    console.log(`✅ Đã tạo ${createdUsers.length} users\n`);

    } else {
      console.log("User table is not empty. Skipping users seed.");
      createdUsers = await db.User.findAll({ limit: 500 });
    }

    // Get hotel managers for hotels
    const hotelManagers = createdUsers.filter(u => u.role === "hotel_manager");
    const customers = createdUsers.filter(u => u.role === "customer");

    const shouldSeedHotels = await isEmptyTable(db.Hotel);
    let createdHotels = [];
    if (shouldSeedHotels) {
    // 2. Tạo thêm 50 hotels
    console.log("🏨 Tạo thêm 50 hotels...");
    const additionalHotels = [];
    for (let i = 0; i < 50; i++) {
      const city = randomElement(cities);
      const hotelName = `${randomElement(hotelNames)} ${city.name}`;
      const rating = (randomInt(35, 50) / 10).toFixed(1);

      additionalHotels.push({
        hotel_owner: randomElement(hotelManagers).user_id,
        name: hotelName,
        address: `${randomInt(1, 999)} Đường ${randomElement(["Lê Lợi", "Trần Hưng Đạo", "Nguyễn Huệ", "Hai Bà Trưng"])}, ${city.name}`,
        status: 1,
        rating: rating,
        longitude: city.lng + (Math.random() - 0.5) * 0.1,
        latitude: city.lat + (Math.random() - 0.5) * 0.1,
        description: `Khách sạn ${randomInt(3, 5)} sao tại ${city.name} với đầy đủ tiện nghi hiện đại.`,
        contact_phone: `028${randomInt(10000000, 99999999)}`,
        thumbnail: `https://images.unsplash.com/photo-${randomInt(1540541338287, 1582719508461)}?w=800`,
      });
    }

    createdHotels = await db.Hotel.bulkCreate(additionalHotels);
    console.log(`✅ Đã tạo ${createdHotels.length} hotels\n`);
    } else {
      console.log("Hotel table is not empty. Skipping hotels seed.");
      createdHotels = await db.Hotel.findAll({ limit: 200 });
    }

    const shouldSeedRoomTypes = await isEmptyTable(db.RoomType);
    let createdRoomTypes = [];
    if (shouldSeedRoomTypes) {
      // 3. Tạo room types cho mỗi hotel (3-5 types per hotel)
      console.log("🛏️  Tạo room types...");
      const allRoomTypes = [];
      for (const hotel of createdHotels) {
        const numTypes = randomInt(3, 5);
        for (let i = 0; i < numTypes; i++) {
          const pickedType = randomElement(roomTypes);
          allRoomTypes.push({
            hotel_id: hotel.hotel_id,
            type: pickedType,
            availability: true,
            max_guests: randomInt(2, 6),
            description: `Phòng ${pickedType} tại ${hotel.name}`,
            quantity: randomInt(5, 20),
          });
        }
      }

      createdRoomTypes = await db.RoomType.bulkCreate(allRoomTypes);
      console.log(`✅ Đã tạo ${createdRoomTypes.length} room types\n`);
    } else {
      console.log("RoomType table is not empty. Skipping room types seed.");
      createdRoomTypes = await db.RoomType.findAll({ limit: 500 });
    }

    const shouldSeedRoomPrices = await isEmptyTable(db.RoomPrice);
    let allPrices = [];
    if (shouldSeedRoomPrices) {
      // 4. Tạo prices cho room types
      console.log("💰 Tạo room prices...");
      allPrices = [];
      for (const roomType of createdRoomTypes) {
        const basePrice = randomInt(500000, 10000000);
        const hasDiscount = Math.random() > 0.5;
        const discount = hasDiscount ? (0.05 + Math.random() * 0.45) : 0;
        const specialPrice = hasDiscount ? Math.floor(basePrice * (1 - discount)) : null;

        allPrices.push({
          type_id: roomType.type_id,
          start_date: new Date("2025-01-01"),
          end_date: new Date("2025-12-31"),
          basic_price: basePrice,
          special_price: specialPrice,
          discount: discount,
          event: hasDiscount ? randomElement(["Flash Sale", "Khuyến mãi", "Ưu đãi đặc biệt"]) : null,
        });
      }

      await db.RoomPrice.bulkCreate(allPrices);
      console.log(`✅ Đã tạo ${allPrices.length} room prices\n`);
    } else {
      console.log("RoomPrice table is not empty. Skipping room prices seed.");
      allPrices = await db.RoomPrice.findAll({ limit: 500 });
    }

    // 5. Tạo rooms từ room types
    console.log("🚪 Tạo rooms...");
    let createdRooms = [];
    if (!(await isEmptyTable(db.Room))) {
      console.log("Room table is not empty. Skipping rooms seed.");
      createdRooms = await db.Room.findAll({ limit: 500 });
    } else {
    const allRooms = [];
    for (const roomType of createdRoomTypes) {
      for (let i = 1; i <= roomType.quantity; i++) {
        allRooms.push({
          type_id: roomType.type_id,
          name: `Room ${Math.floor(randomInt(1, 20))}${i.toString().padStart(2, "0")}`,
          location: `Floor ${randomInt(1, 20)}`,
          status: 1,
          estimated_available_time: new Date(),
          number_of_single_beds: randomInt(0, 2),
          number_of_double_beds: randomInt(0, 2),
          room_view: randomElement(["city", "sea", "garden", "mountain"]),
          room_size: randomInt(18, 60),
          notes: "Mock room notes",
        });
      }
    }

    createdRooms = await db.Room.bulkCreate(allRooms);
    console.log(`✅ Đã tạo ${createdRooms.length} rooms\n`);

    // 6. Tạo nhiều bookings (500 bookings)
    console.log("📅 Tạo 500 bookings...");
    }

    let createdBookings = [];
    if (await isEmptyTable(db.Booking)) {
      const allBookings = [];
      const startDate = new Date("2025-01-01");
      const endDate = new Date("2025-12-31");

      for (let i = 0; i < 500; i++) {
        const customer = randomElement(customers);
        const room = randomElement(createdRooms);
        const checkIn = randomDate(startDate, endDate);
        const nights = randomInt(1, 7);
        const checkOut = new Date(checkIn);
        checkOut.setDate(checkOut.getDate() + nights);
        const createdAt = new Date(checkIn);
        createdAt.setDate(createdAt.getDate() - randomInt(1, 30));

        const pricePerNight = randomInt(500000, 5000000);
        const totalPrice = pricePerNight * nights;

        allBookings.push({
          user_id: customer.user_id,
          room_id: room.room_id,
          status: randomElement(bookingStatuses),
          total_price: totalPrice,
          check_in_date: checkIn,
          check_out_date: checkOut,
          created_at: createdAt,
          people: randomInt(1, 4),
        });
      }

      createdBookings = await db.Booking.bulkCreate(allBookings);
      console.log(`✅ Đã tạo ${createdBookings.length} bookings\n`);
    } else {
      console.log("Booking table is not empty. Skipping bookings seed.");
      createdBookings = await db.Booking.findAll({ limit: 500 });
    }

    // 7. Tạo reviews (300 reviews)
    console.log("⭐ Tạo 300 reviews...");
    const comments = [
      "Khách sạn rất tốt, nhân viên thân thiện!",
      "Phòng sạch sẽ, view đẹp, rất hài lòng!",
      "Giá cả hợp lý, dịch vụ tốt.",
      "Địa điểm thuận tiện, gần trung tâm.",
      "Sẽ quay lại lần sau!",
      "Tuyệt vời, đáng để thử!",
      "Phòng hơi nhỏ nhưng đầy đủ tiện nghi.",
      "Nhân viên nhiệt tình, chu đáo.",
      "Bữa sáng ngon, đa dạng món.",
      "Hồ bơi đẹp, sạch sẽ."
    ];

    let reviewsCount = 0;
    if (await isEmptyTable(db.Review)) {
      const allReviews = [];
      for (let i = 0; i < 300; i++) {
        const booking = randomElement(createdBookings);
        const rating = randomInt(3, 5);

        allReviews.push({
          user_id: booking.user_id,
          booking_id: booking.booking_id,
          destination_id: null,
          hotel_id: null,
          room_id: booking.room_id,
          rating: rating,
          comment: randomElement(comments),
          date_created: randomDate(booking.check_out_date, new Date()),
        });
      }

      await db.Review.bulkCreate(allReviews);
      reviewsCount = allReviews.length;
      console.log(`✅ Đã tạo ${allReviews.length} reviews\n`);
    } else {
      console.log("Review table is not empty. Skipping reviews seed.");
      reviewsCount = await db.Review.count();
    }

    // 8. Tạo payments
    console.log("💳 Tạo payments...");
    let paymentsCount = 0;
    if (await isEmptyTable(db.Payment)) {
      const allPayments = [];
      const paidBookings = createdBookings.filter((b) => b.status !== "cancelled");

      for (const booking of paidBookings) {
        allPayments.push({
          booking_id: booking.booking_id,
          amount: booking.total_price,
          payment_method: randomElement(["credit_card", "bank_transfer", "cash", "vnpay"]),
          status: randomElement(["completed", "pending", "failed"]),
          vnp_txn_ref: `TXN${Date.now()}_${booking.booking_id}_${randomInt(100000, 999999)}`,
          vnp_order_info: `Payment for booking ${booking.booking_id}`,
          ip_address: "127.0.0.1",
        });
      }

      await db.Payment.bulkCreate(allPayments);
      paymentsCount = allPayments.length;
      console.log(`✅ Đã tạo ${allPayments.length} payments\n`);
    } else {
      console.log("Payment table is not empty. Skipping payments seed.");
      paymentsCount = await db.Payment.count();
    }

    console.log("\n✅ Hoàn tất! Đã thêm rất nhiều dữ liệu:");
    console.log(`   - ${createdUsers.length} users`);
    console.log(`   - ${createdHotels.length} hotels`);
    console.log(`   - ${createdRoomTypes.length} room types`);
    console.log(`   - ${createdRooms.length} rooms`);
    console.log(`   - ${createdBookings.length} bookings`);
    console.log(`   - ${reviewsCount} reviews`);
    console.log(`   - ${paymentsCount} payments`);

  } catch (error) {
    console.error("\n❌ Lỗi:", error);
    throw error;
  }
}

// Run the seeder
seedAdditionalData()
  .then(() => {
    console.log("\n✅ Seed additional data hoàn tất!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Seed additional data thất bại:", error);
    process.exit(1);
  });
