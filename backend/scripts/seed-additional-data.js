const db = require("../models");
const bcrypt = require("bcryptjs");

// Helper function to generate random data
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomDate = (start, end) => new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
const randomElement = (arr) => arr[randomInt(0, arr.length - 1)];

// Vietnamese names
const firstNames = ["Nguyễn", "Trần", "Lê", "Phạm", "Hoàng", "Phan", "Vũ", "Đặng", "Bùi", "Đỗ", "Hồ", "Ngô", "Dương", "Lý"];
const middleNames = ["Văn", "Thị", "Minh", "Thu", "Quốc", "Hải", "Lan", "Anh", "Tuấn", "Hùng", "Thanh", "Phương"];
const lastNames = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "X", "Y"];

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

async function seedAdditionalData() {
  try {
    console.log("🌱 Bắt đầu thêm nhiều dữ liệu...\n");

    const hashedPassword = await bcrypt.hash("password123", 10);

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
      const role = i < 10 ? "hotel_manager" : "customer"; // 10 hotel managers, 90 customers

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

    const createdUsers = await db.User.bulkCreate(additionalUsers);
    console.log(`✅ Đã tạo ${createdUsers.length} users\n`);

    // Get hotel managers for hotels
    const hotelManagers = createdUsers.filter(u => u.role === "hotel_manager");
    const customers = createdUsers.filter(u => u.role === "customer");

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

    const createdHotels = await db.Hotel.bulkCreate(additionalHotels);
    console.log(`✅ Đã tạo ${createdHotels.length} hotels\n`);

    // 3. Tạo room types cho mỗi hotel (3-5 types per hotel)
    console.log("🛏️  Tạo room types...");
    const allRoomTypes = [];
    for (const hotel of createdHotels) {
      const numTypes = randomInt(3, 5);
      for (let i = 0; i < numTypes; i++) {
        allRoomTypes.push({
          hotel_id: hotel.hotel_id,
          type: randomElement(roomTypes),
          availability: true,
          max_guests: randomInt(2, 6),
          description: `Phòng ${randomElement(roomTypes)} tại ${hotel.name}`,
          quantity: randomInt(5, 20),
        });
      }
    }

    const createdRoomTypes = await db.RoomType.bulkCreate(allRoomTypes);
    console.log(`✅ Đã tạo ${createdRoomTypes.length} room types\n`);

    // 4. Tạo prices cho room types
    console.log("💰 Tạo room prices...");
    const allPrices = [];
    for (const roomType of createdRoomTypes) {
      const basePrice = randomInt(500000, 10000000);
      const hasDiscount = Math.random() > 0.5;
      const discount = hasDiscount ? randomInt(5, 25) : 0;
      const specialPrice = hasDiscount ? Math.floor(basePrice * (1 - discount / 100)) : null;

      allPrices.push({
        type_id: roomType.type_id,
        start_date: new Date("2025-01-01"),
        end_date: new Date("2025-12-31"),
        basic_price: basePrice,
        special_price: specialPrice,
        discount: discount.toString(),
        event: hasDiscount ? randomElement(["Flash Sale", "Khuyến mãi", "Ưu đãi đặc biệt"]) : null,
      });
    }

    await db.RoomPrice.bulkCreate(allPrices);
    console.log(`✅ Đã tạo ${allPrices.length} room prices\n`);

    // 5. Tạo rooms từ room types
    console.log("🚪 Tạo rooms...");
    const allRooms = [];
    for (const roomType of createdRoomTypes) {
      for (let i = 1; i <= roomType.quantity; i++) {
        allRooms.push({
          type_id: roomType.type_id,
          room_number: `${Math.floor(randomInt(1, 20))}${i.toString().padStart(2, '0')}`,
          location: `Floor ${randomInt(1, 20)}`,
          availability: Math.random() > 0.3, // 70% available
        });
      }
    }

    const createdRooms = await db.Room.bulkCreate(allRooms);
    console.log(`✅ Đã tạo ${createdRooms.length} rooms\n`);

    // 6. Tạo nhiều bookings (500 bookings)
    console.log("📅 Tạo 500 bookings...");
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

    const createdBookings = await db.Booking.bulkCreate(allBookings);
    console.log(`✅ Đã tạo ${createdBookings.length} bookings\n`);

    // 7. Tạo reviews (300 reviews)
    console.log("⭐ Tạo 300 reviews...");
    const allReviews = [];
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

    for (let i = 0; i < 300; i++) {
      const booking = randomElement(createdBookings);
      const rating = randomInt(3, 5);

      allReviews.push({
        user_id: booking.user_id,
        booking_id: booking.booking_id,
        room_id: booking.room_id,
        rating: rating,
        comment: randomElement(comments),
        date_created: randomDate(booking.check_out_date, new Date()),
      });
    }

    await db.Review.bulkCreate(allReviews);
    console.log(`✅ Đã tạo ${allReviews.length} reviews\n`);

    // 8. Tạo payments
    console.log("💳 Tạo payments...");
    const allPayments = [];
    const paidBookings = createdBookings.filter(b => b.status !== "cancelled");

    for (const booking of paidBookings) {
      allPayments.push({
        booking_id: booking.booking_id,
        amount: booking.total_price,
        payment_method: randomElement(["credit_card", "bank_transfer", "cash", "vnpay"]),
        status: randomElement(["completed", "pending", "failed"]),
        transaction_id: `TXN${Date.now()}${randomInt(1000, 9999)}`,
        payment_date: randomDate(booking.created_at, booking.check_in_date),
      });
    }

    await db.Payment.bulkCreate(allPayments);
    console.log(`✅ Đã tạo ${allPayments.length} payments\n`);

    console.log("\n✅ Hoàn tất! Đã thêm rất nhiều dữ liệu:");
    console.log(`   - ${createdUsers.length} users`);
    console.log(`   - ${createdHotels.length} hotels`);
    console.log(`   - ${createdRoomTypes.length} room types`);
    console.log(`   - ${createdRooms.length} rooms`);
    console.log(`   - ${createdBookings.length} bookings`);
    console.log(`   - ${allReviews.length} reviews`);
    console.log(`   - ${allPayments.length} payments`);

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
