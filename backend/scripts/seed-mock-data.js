const db = require("../models");
const bcrypt = require("bcryptjs");

// Mock Images từ frontend
const mockImages = {
  hotels: {
    luxury1: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800",
    luxury2: "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800",
    luxury3: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800",
    beach1: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800",
    beach2: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800",
    city1: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800",
    city2: "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=800",
    resort1: "https://images.unsplash.com/photo-1540541338287-41700207dee6?w=800",
    resort2: "https://images.unsplash.com/photo-1549294413-26f195200c16?w=800",
  },
  rooms: {
    deluxe: "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800",
    suite: "https://images.unsplash.com/photo-1591088398332-8a7791972843?w=800",
    standard: "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=800",
    penthouse: "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800",
  },
  tourism: {
    halong: "https://images.unsplash.com/photo-1528127269322-539801943592?w=800",
    hoian: "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800",
    sapa: "https://images.unsplash.com/photo-1583417267826-aebc4d1542e1?w=800",
    danang: "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800",
    nhatrang: "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=800",
    dalat: "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800",
    phuquoc: "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=800",
    hue: "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800",
  },
  avatars: {
    default: "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=200",
    user1: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200",
    user2: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200",
    user3: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200",
  },
};

async function seedDatabase() {
  try {
    console.log("🌱 Bắt đầu seed database...");

    // Xóa dữ liệu cũ (theo thứ tự để tránh lỗi foreign key)
    console.log("🗑️  Xóa dữ liệu cũ...");
    await db.Payment.destroy({ where: {} });
    await db.Booking.destroy({ where: {} });
    await db.RoomLog.destroy({ where: {} });
    await db.ServicePossessing.destroy({ where: {} });
    await db.FacilitiesPossessing.destroy({ where: {} });
    await db.Review.destroy({ where: {} });
    await db.LovingList.destroy({ where: {} });
    await db.Image.destroy({ where: {} });
    await db.Room.destroy({ where: {} });
    await db.RoomPrice.destroy({ where: {} });
    await db.RoomType.destroy({ where: {} });
    await db.Hotel.destroy({ where: {} });
    await db.Destination.destroy({ where: {} });
    await db.RoomService.destroy({ where: {} });
    await db.HotelFacilities.destroy({ where: {} });
    await db.User.destroy({ where: {} });

    // 1. Tạo Users
    console.log("👤 Tạo users...");
    const hashedPassword = await bcrypt.hash("password123", 10);
    
    const users = await db.User.bulkCreate([
      {
        name: "Admin User",
        email: "admin@hotel.com",
        phone_number: "0901234567",
        gender: "Nam",
        date_of_birth: new Date("1990-01-15"),
        role: "admin",
        password: hashedPassword,
        profile_image: mockImages.avatars.default,
      },
      {
        name: "Nguyễn Văn A",
        email: "user@example.com",
        phone_number: "0901234568",
        gender: "Nam",
        date_of_birth: new Date("1995-03-20"),
        role: "customer",
        password: hashedPassword,
        profile_image: mockImages.avatars.user1,
      },
      {
        name: "Trần Thị B",
        email: "tranthib@example.com",
        phone_number: "0901234569",
        gender: "Nữ",
        date_of_birth: new Date("1992-07-10"),
        role: "customer",
        password: hashedPassword,
        profile_image: mockImages.avatars.user2,
      },
      {
        name: "Lê Văn C",
        email: "levanc@example.com",
        phone_number: "0901234570",
        gender: "Nam",
        date_of_birth: new Date("1988-11-05"),
        role: "hotel_owner",
        password: hashedPassword,
        profile_image: mockImages.avatars.user3,
      },
    ]);
    console.log(`✅ Đã tạo ${users.length} users`);

    // 2. Tạo Hotel Facilities
    console.log("🏨 Tạo hotel facilities...");
    const facilities = await db.HotelFacilities.bulkCreate([
      { name: "Hồ bơi" },
      { name: "Phòng gym" },
      { name: "Spa" },
      { name: "Nhà hàng" },
      { name: "WiFi miễn phí" },
      { name: "Bãi đỗ xe" },
      { name: "Quầy bar" },
      { name: "Bãi biển riêng" },
      { name: "Lễ tân 24/7" },
      { name: "Phòng họp" },
    ]);
    console.log(`✅ Đã tạo ${facilities.length} facilities`);

    // 3. Tạo Room Services
    console.log("🛎️  Tạo room services...");
    const services = await db.RoomService.bulkCreate([
      { name: "TV màn hình phẳng" },
      { name: "Minibar" },
      { name: "Két an toàn" },
      { name: "Điều hòa" },
      { name: "Bồn tắm" },
      { name: "Ban công" },
      { name: "WiFi" },
    ]);
    console.log(`✅ Đã tạo ${services.length} room services`);

    // 4. Tạo Hotels
    console.log("🏨 Tạo hotels...");
    const hotelOwner = users.find((u) => u.role === "hotel_owner");
    
    const hotels = await db.Hotel.bulkCreate([
      {
        hotel_owner: hotelOwner.user_id,
        name: "Elegance Luxury Hotel & Spa",
        address: "123 Đường Lê Lợi, Quận 1, TP.HCM",
        status: 1,
        rating: 4.8,
        longitude: 106.7009,
        latitude: 10.7769,
        description: "Khách sạn 5 sao sang trọng với đầy đủ tiện nghi hiện đại, nằm ngay trung tâm thành phố.",
        contact_phone: "02812345678",
        thumbnail: mockImages.hotels.luxury1,
      },
      {
        hotel_owner: hotelOwner.user_id,
        name: "Seaside Paradise Resort",
        address: "45 Trần Phú, Nha Trang",
        status: 1,
        rating: 4.9,
        longitude: 109.1967,
        latitude: 12.2388,
        description: "Resort bên bờ biển tuyệt đẹp, view hoàng hôn tuyệt vời và bãi biển riêng.",
        contact_phone: "02583456789",
        thumbnail: mockImages.hotels.beach1,
      },
      {
        hotel_owner: hotelOwner.user_id,
        name: "Modern City Hotel",
        address: "789 Hoàng Diệu, Hà Nội",
        status: 1,
        rating: 4.5,
        longitude: 105.8542,
        latitude: 21.0285,
        description: "Khách sạn hiện đại, tiện nghi, gần các điểm tham quan nổi tiếng.",
        contact_phone: "02432345678",
        thumbnail: mockImages.hotels.city1,
      },
    ]);
    console.log(`✅ Đã tạo ${hotels.length} hotels`);

    // 5. Tạo Hotel Images
    console.log("🖼️  Tạo hotel images...");
    const now = new Date();
    const hotelImages = [];
    hotelImages.push(
      { hotel_id: hotels[0].hotel_id, image_url: mockImages.hotels.luxury1, createdAt: now, updatedAt: now },
      { hotel_id: hotels[0].hotel_id, image_url: mockImages.hotels.luxury2, createdAt: now, updatedAt: now },
      { hotel_id: hotels[0].hotel_id, image_url: mockImages.hotels.luxury3, createdAt: now, updatedAt: now },
      { hotel_id: hotels[1].hotel_id, image_url: mockImages.hotels.beach1, createdAt: now, updatedAt: now },
      { hotel_id: hotels[1].hotel_id, image_url: mockImages.hotels.beach2, createdAt: now, updatedAt: now },
      { hotel_id: hotels[1].hotel_id, image_url: mockImages.hotels.resort1, createdAt: now, updatedAt: now },
      { hotel_id: hotels[2].hotel_id, image_url: mockImages.hotels.city1, createdAt: now, updatedAt: now },
      { hotel_id: hotels[2].hotel_id, image_url: mockImages.hotels.city2, createdAt: now, updatedAt: now },
      { hotel_id: hotels[2].hotel_id, image_url: mockImages.hotels.resort2, createdAt: now, updatedAt: now }
    );
    await db.Image.bulkCreate(hotelImages, { fields: ['hotel_id', 'image_url', 'createdAt', 'updatedAt'] });
    console.log(`✅ Đã tạo ${hotelImages.length} hotel images`);

    // 6. Liên kết Hotel với Facilities
    console.log("🔗 Liên kết hotels với facilities...");
    await db.FacilitiesPossessing.bulkCreate([
      // Hotel 1: Elegance Luxury
      { hotel_id: hotels[0].hotel_id, facility_id: facilities[0].facility_id }, // Pool
      { hotel_id: hotels[0].hotel_id, facility_id: facilities[1].facility_id }, // Gym
      { hotel_id: hotels[0].hotel_id, facility_id: facilities[2].facility_id }, // Spa
      { hotel_id: hotels[0].hotel_id, facility_id: facilities[3].facility_id }, // Restaurant
      { hotel_id: hotels[0].hotel_id, facility_id: facilities[4].facility_id }, // WiFi
      { hotel_id: hotels[0].hotel_id, facility_id: facilities[5].facility_id }, // Parking
      { hotel_id: hotels[0].hotel_id, facility_id: facilities[6].facility_id }, // Bar
      { hotel_id: hotels[0].hotel_id, facility_id: facilities[8].facility_id }, // Concierge
      
      // Hotel 2: Seaside Paradise
      { hotel_id: hotels[1].hotel_id, facility_id: facilities[0].facility_id }, // Pool
      { hotel_id: hotels[1].hotel_id, facility_id: facilities[2].facility_id }, // Spa
      { hotel_id: hotels[1].hotel_id, facility_id: facilities[3].facility_id }, // Restaurant
      { hotel_id: hotels[1].hotel_id, facility_id: facilities[4].facility_id }, // WiFi
      { hotel_id: hotels[1].hotel_id, facility_id: facilities[6].facility_id }, // Bar
      { hotel_id: hotels[1].hotel_id, facility_id: facilities[7].facility_id }, // Beach
      
      // Hotel 3: Modern City
      { hotel_id: hotels[2].hotel_id, facility_id: facilities[1].facility_id }, // Gym
      { hotel_id: hotels[2].hotel_id, facility_id: facilities[3].facility_id }, // Restaurant
      { hotel_id: hotels[2].hotel_id, facility_id: facilities[4].facility_id }, // WiFi
      { hotel_id: hotels[2].hotel_id, facility_id: facilities[5].facility_id }, // Parking
      { hotel_id: hotels[2].hotel_id, facility_id: facilities[9].facility_id }, // Meeting room
    ]);
    console.log("✅ Đã liên kết hotels với facilities");

    // 7. Tạo Room Types
    console.log("🛏️  Tạo room types...");
    const roomTypes = await db.RoomType.bulkCreate([
      // Hotel 1
      {
        hotel_id: hotels[0].hotel_id,
        type: "Deluxe Room",
        availability: true,
        max_guests: 2,
        description: "Phòng Deluxe rộng rãi với view thành phố tuyệt đẹp",
        quantity: 5,
      },
      {
        hotel_id: hotels[0].hotel_id,
        type: "Executive Suite",
        availability: true,
        max_guests: 3,
        description: "Suite sang trọng với phòng khách riêng biệt",
        quantity: 3,
      },
      // Hotel 2
      {
        hotel_id: hotels[1].hotel_id,
        type: "Ocean View Room",
        availability: true,
        max_guests: 2,
        description: "Phòng view biển tuyệt đẹp",
        quantity: 8,
      },
      {
        hotel_id: hotels[1].hotel_id,
        type: "Beachfront Villa",
        availability: true,
        max_guests: 4,
        description: "Villa riêng biệt ngay bờ biển",
        quantity: 4,
      },
      // Hotel 3
      {
        hotel_id: hotels[2].hotel_id,
        type: "Standard Room",
        availability: true,
        max_guests: 2,
        description: "Phòng tiêu chuẩn hiện đại, tiện nghi",
        quantity: 10,
      },
      {
        hotel_id: hotels[2].hotel_id,
        type: "Business Suite",
        availability: true,
        max_guests: 2,
        description: "Suite dành cho doanh nhân với không gian làm việc riêng",
        quantity: 5,
      },
    ]);
    console.log(`✅ Đã tạo ${roomTypes.length} room types`);

    // 8. Tạo Room Prices
    console.log("💰 Tạo room prices...");
    const roomPrices = await db.RoomPrice.bulkCreate([
      {
        type_id: roomTypes[0].type_id,
        start_date: new Date("2025-01-01"),
        end_date: new Date("2025-12-31"),
        basic_price: 2500000,
        special_price: null,
        event: null,
        discount: 0,
      },
      {
        type_id: roomTypes[1].type_id,
        start_date: new Date("2025-01-01"),
        end_date: new Date("2025-12-31"),
        basic_price: 4500000,
        special_price: null,
        event: null,
        discount: 0,
      },
      {
        type_id: roomTypes[2].type_id,
        start_date: new Date("2025-01-01"),
        end_date: new Date("2025-12-31"),
        basic_price: 3200000,
        special_price: null,
        event: null,
        discount: 0,
      },
      {
        type_id: roomTypes[3].type_id,
        start_date: new Date("2025-01-01"),
        end_date: new Date("2025-12-31"),
        basic_price: 5500000,
        special_price: null,
        event: null,
        discount: 0,
      },
      {
        type_id: roomTypes[4].type_id,
        start_date: new Date("2025-01-01"),
        end_date: new Date("2025-12-31"),
        basic_price: 1800000,
        special_price: null,
        event: null,
        discount: 0,
      },
      {
        type_id: roomTypes[5].type_id,
        start_date: new Date("2025-01-01"),
        end_date: new Date("2025-12-31"),
        basic_price: 2800000,
        special_price: null,
        event: null,
        discount: 0,
      },
    ]);
    console.log(`✅ Đã tạo ${roomPrices.length} room prices`);

    // 9. Liên kết Room Types với Services
    console.log("🔗 Liên kết room types với services...");
    const servicePossessing = [];
    // Tất cả room types đều có các dịch vụ cơ bản
    roomTypes.forEach((rt) => {
      servicePossessing.push(
        { type_id: rt.type_id, service_id: services[0].service_id }, // TV
        { type_id: rt.type_id, service_id: services[1].service_id }, // Minibar
        { type_id: rt.type_id, service_id: services[2].service_id }, // Safe
        { type_id: rt.type_id, service_id: services[3].service_id }, // AC
        { type_id: rt.type_id, service_id: services[6].service_id }  // WiFi
      );
    });
    // Các loại phòng cao cấp có thêm dịch vụ
    [roomTypes[1], roomTypes[3], roomTypes[5]].forEach((rt) => {
      servicePossessing.push(
        { type_id: rt.type_id, service_id: services[4].service_id }, // Bathtub
        { type_id: rt.type_id, service_id: services[5].service_id }  // Balcony
      );
    });
    await db.ServicePossessing.bulkCreate(servicePossessing);
    console.log(`✅ Đã tạo ${servicePossessing.length} service possessing records`);

    // 10. Tạo Rooms
    console.log("🚪 Tạo rooms...");
    const rooms = [];
    // Tạo rooms cho mỗi room type dựa trên quantity
    for (const roomType of roomTypes) {
      for (let i = 1; i <= roomType.quantity; i++) {
        rooms.push({
          type_id: roomType.type_id,
          name: `${roomType.type} ${String(i).padStart(3, "0")}`,
          location: `Tầng ${Math.ceil(i / 5)}`,
          status: 1, // Available
          estimated_available_time: null,
          number_of_single_beds: roomType.max_guests === 2 ? 0 : 1,
          number_of_double_beds: 1,
          room_view: roomType.type.includes("Ocean") ? "Biển" : roomType.type.includes("City") ? "Thành phố" : "Vườn",
          room_size: roomType.max_guests * 15 + 10,
          notes: null,
        });
      }
    }
    const createdRooms = await db.Room.bulkCreate(rooms);
    console.log(`✅ Đã tạo ${createdRooms.length} rooms`);

    // 11. Tạo Room Images
    console.log("🖼️  Tạo room images...");
    const roomImages = [];
    createdRooms.forEach((room, index) => {
      const roomTypeIndex = roomTypes.findIndex(rt => rt.type_id === room.type_id);
      const imageKey = roomTypeIndex % 2 === 0 ? "deluxe" : "suite";
      roomImages.push({
        room_id: room.room_id,
        image_url: mockImages.rooms[imageKey],
        createdAt: now,
        updatedAt: now,
      });
    });
    await db.Image.bulkCreate(roomImages, { fields: ['room_id', 'image_url', 'createdAt', 'updatedAt'] });
    console.log(`✅ Đã tạo ${roomImages.length} room images`);

    // 12. Tạo Destinations (Tourism Spots)
    console.log("🗺️  Tạo destinations...");
    const destinations = await db.Destination.bulkCreate([
      {
        name: "Vịnh Hạ Long",
        rating: 5,
        location: "Quảng Ninh",
        transportation: "Xe bus, taxi, tour",
        entry_fee: 250000,
        description: "Di sản thiên nhiên thế giới với hàng nghìn đảo đá vôi kỳ vĩ. Vịnh Hạ Long là một vịnh nhỏ thuộc phần bờ tây vịnh Bắc Bộ tại khu vực biển Đông Bắc Việt Nam.",
        latitude: 20.9101,
        longitude: 107.1839,
        type: "UNESCO Heritage",
        thumbnail: mockImages.tourism.halong,
      },
      {
        name: "Phố Cổ Hội An",
        rating: 5,
        location: "Quảng Nam",
        transportation: "Xe bus, taxi, xe máy",
        entry_fee: 120000,
        description: "Thành phố cổ kính với kiến trúc độc đáo và văn hóa đa dạng. Phố cổ Hội An là di sản văn hóa thế giới với kiến trúc cổ kính được bảo tồn nguyên vẹn.",
        latitude: 15.8801,
        longitude: 108.3380,
        type: "UNESCO Heritage",
        thumbnail: mockImages.tourism.hoian,
      },
      {
        name: "Sapa - Thị Trấn Sương Mù",
        rating: 5,
        location: "Lào Cai",
        transportation: "Xe khách, tàu hỏa",
        entry_fee: 0,
        description: "Vùng núi non hùng vĩ với ruộng bậc thang và văn hóa dân tộc. Nơi đây nổi tiếng với khí hậu mát mẻ quanh năm.",
        latitude: 22.3364,
        longitude: 103.8438,
        type: "Mountain Tourism",
        thumbnail: mockImages.tourism.sapa,
      },
      {
        name: "Cầu Vàng Đà Nẵng",
        rating: 5,
        location: "Đà Nẵng",
        transportation: "Taxi, xe khách",
        entry_fee: 750000,
        description: "Cây cầu vàng độc đáo được nâng đỡ bởi đôi bàn tay khổng lồ. Cầu Vàng tại Bà Nà Hills là một trong những công trình kiến trúc độc đáo nhất Việt Nam.",
        latitude: 15.9959,
        longitude: 107.9983,
        type: "Modern Attraction",
        thumbnail: mockImages.tourism.danang,
      },
      {
        name: "Đảo Phú Quốc",
        rating: 5,
        location: "Kiên Giang",
        transportation: "Máy bay, tàu cao tốc",
        entry_fee: 0,
        description: "Đảo ngọc với bãi biển xanh trong và rừng nhiệt đới hoang sơ. Phú Quốc là hòn đảo lớn nhất Việt Nam.",
        latitude: 10.2899,
        longitude: 103.9840,
        type: "Beach & Island",
        thumbnail: mockImages.tourism.phuquoc,
      },
    ]);
    console.log(`✅ Đã tạo ${destinations.length} destinations`);

    // 13. Tạo Destination Images
    console.log("🖼️  Tạo destination images...");
    const destinationImages = [
      { destination_id: destinations[0].destination_id, image_url: mockImages.tourism.halong, createdAt: now, updatedAt: now },
      { destination_id: destinations[0].destination_id, image_url: "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800", createdAt: now, updatedAt: now },
      { destination_id: destinations[1].destination_id, image_url: mockImages.tourism.hoian, createdAt: now, updatedAt: now },
      { destination_id: destinations[1].destination_id, image_url: "https://images.unsplash.com/photo-1555618254-84e5be5e2e91?w=800", createdAt: now, updatedAt: now },
      { destination_id: destinations[2].destination_id, image_url: mockImages.tourism.sapa, createdAt: now, updatedAt: now },
      { destination_id: destinations[3].destination_id, image_url: mockImages.tourism.danang, createdAt: now, updatedAt: now },
      { destination_id: destinations[4].destination_id, image_url: mockImages.tourism.phuquoc, createdAt: now, updatedAt: now },
    ];
    await db.Image.bulkCreate(destinationImages, { fields: ['destination_id', 'image_url', 'createdAt', 'updatedAt'] });
    console.log(`✅ Đã tạo ${destinationImages.length} destination images`);

    // 14. Tạo Reviews cho Hotels
    console.log("⭐ Tạo reviews...");
    const customer1 = users.find((u) => u.name === "Nguyễn Văn A");
    const customer2 = users.find((u) => u.name === "Trần Thị B");
    
    const reviews = await db.Review.bulkCreate([
      {
        user_id: customer1.user_id,
        hotel_id: hotels[0].hotel_id,
        room_id: null,
        destination_id: null,
        rating: 5,
        comment: "Khách sạn rất đẹp, phòng ốc sạch sẽ, nhân viên thân thiện. Tôi sẽ quay lại lần sau.",
        date_created: new Date("2025-11-15"),
      },
      {
        user_id: customer2.user_id,
        hotel_id: hotels[0].hotel_id,
        room_id: null,
        destination_id: null,
        rating: 4,
        comment: "Khách sạn tốt, vị trí thuận tiện nhưng ban đêm hơi ồn vì ở trung tâm.",
        date_created: new Date("2025-11-10"),
      },
      {
        user_id: customer1.user_id,
        hotel_id: hotels[1].hotel_id,
        room_id: null,
        destination_id: null,
        rating: 5,
        comment: "Resort tuyệt vời! View biển đẹp, dịch vụ chu đáo. Rất đáng để trải nghiệm.",
        date_created: new Date("2025-11-20"),
      },
      {
        user_id: customer2.user_id,
        destination_id: destinations[0].destination_id,
        hotel_id: null,
        room_id: null,
        rating: 5,
        comment: "Vịnh Hạ Long thật sự rất đẹp, cảnh quan hùng vĩ. Một trải nghiệm khó quên!",
        date_created: new Date("2025-10-05"),
      },
      {
        user_id: customer1.user_id,
        destination_id: destinations[1].destination_id,
        hotel_id: null,
        room_id: null,
        rating: 5,
        comment: "Phố cổ Hội An rất đẹp và cổ kính. Đèn lồng buổi tối rất lãng mạn.",
        date_created: new Date("2025-09-15"),
      },
    ]);
    console.log(`✅ Đã tạo ${reviews.length} reviews`);

    // 15. Tạo Bookings
    console.log("📅 Tạo bookings...");
    const bookings = await db.Booking.bulkCreate([
      {
        user_id: customer1.user_id,
        room_id: createdRooms[0].room_id,
        status: "confirmed",
        total_price: 7500000,
        check_in_date: new Date("2025-12-20"),
        check_out_date: new Date("2025-12-23"),
        created_at: new Date("2025-12-01"),
        people: 2,
      },
      {
        user_id: customer1.user_id,
        room_id: createdRooms[10].room_id,
        status: "completed",
        total_price: 9600000,
        check_in_date: new Date("2025-11-15"),
        check_out_date: new Date("2025-11-18"),
        created_at: new Date("2025-11-01"),
        people: 2,
      },
      {
        user_id: customer2.user_id,
        room_id: createdRooms[5].room_id,
        status: "confirmed",
        total_price: 5400000,
        check_in_date: new Date("2025-12-25"),
        check_out_date: new Date("2025-12-27"),
        created_at: new Date("2025-12-05"),
        people: 2,
      },
    ]);
    console.log(`✅ Đã tạo ${bookings.length} bookings`);

    // 16. Tạo Payments
    console.log("💳 Tạo payments...");
    const payments = await db.Payment.bulkCreate([
      {
        booking_id: bookings[0].booking_id,
        amount: 7500000,
        payment_method: "vnpay",
        payment_status: "completed",
        transaction_id: "VNP" + Date.now(),
        payment_date: new Date("2025-12-01"),
      },
      {
        booking_id: bookings[1].booking_id,
        amount: 9600000,
        payment_method: "momo",
        payment_status: "completed",
        transaction_id: "MOMO" + Date.now(),
        payment_date: new Date("2025-11-01"),
      },
      {
        booking_id: bookings[2].booking_id,
        amount: 5400000,
        payment_method: "vnpay",
        payment_status: "completed",
        transaction_id: "VNP" + (Date.now() + 1000),
        payment_date: new Date("2025-12-05"),
      },
    ]);
    console.log(`✅ Đã tạo ${payments.length} payments`);

    // 17. Tạo Loving Lists (Favorites)
    console.log("❤️  Tạo loving lists...");
    const lovingLists = await db.LovingList.bulkCreate([
      {
        user_id: customer1.user_id,
        hotel_id: hotels[1].hotel_id,
        destination_id: null,
      },
      {
        user_id: customer1.user_id,
        hotel_id: null,
        destination_id: destinations[0].destination_id,
      },
      {
        user_id: customer2.user_id,
        hotel_id: hotels[0].hotel_id,
        destination_id: null,
      },
      {
        user_id: customer2.user_id,
        hotel_id: null,
        destination_id: destinations[1].destination_id,
      },
    ]);
    console.log(`✅ Đã tạo ${lovingLists.length} loving lists`);

    console.log("\n✨ Seed database hoàn tất!");
    console.log("\n📊 Tóm tắt:");
    console.log(`   - ${users.length} users`);
    console.log(`   - ${facilities.length} hotel facilities`);
    console.log(`   - ${services.length} room services`);
    console.log(`   - ${hotels.length} hotels`);
    console.log(`   - ${roomTypes.length} room types`);
    console.log(`   - ${createdRooms.length} rooms`);
    console.log(`   - ${destinations.length} destinations`);
    console.log(`   - ${reviews.length} reviews`);
    console.log(`   - ${bookings.length} bookings`);
    console.log(`   - ${payments.length} payments`);
    console.log(`   - ${lovingLists.length} favorites`);

    console.log("\n🔐 Thông tin đăng nhập:");
    console.log("   Admin: admin@hotel.com / password123");
    console.log("   User: user@example.com / password123");
    console.log("   Hotel Owner: levanc@example.com / password123");

  } catch (error) {
    console.error("❌ Lỗi khi seed database:", error);
    throw error;
  }
}

// Chạy seed
seedDatabase()
  .then(() => {
    console.log("\n✅ Seed script hoàn tất!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Seed script thất bại:", error);
    process.exit(1);
  });
