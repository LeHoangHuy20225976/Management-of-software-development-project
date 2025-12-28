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
        role: "hotel_manager",
        password: hashedPassword,
        profile_image: mockImages.avatars.user3,
      },
      {
        name: "Phạm Minh D",
        email: "phaminhd@example.com",
        phone_number: "0901234571",
        gender: "Nam",
        date_of_birth: new Date("1993-05-12"),
        role: "customer",
        password: hashedPassword,
        profile_image: mockImages.avatars.user1,
      },
      {
        name: "Hoàng Thu E",
        email: "hoangthue@example.com",
        phone_number: "0901234572",
        gender: "Nữ",
        date_of_birth: new Date("1991-08-25"),
        role: "customer",
        password: hashedPassword,
        profile_image: mockImages.avatars.user2,
      },
      {
        name: "Đặng Quốc F",
        email: "dangquocf@example.com",
        phone_number: "0901234573",
        gender: "Nam",
        date_of_birth: new Date("1989-12-30"),
        role: "customer",
        password: hashedPassword,
        profile_image: mockImages.avatars.user3,
      },
      {
        name: "Vũ Hải G",
        email: "vuhaig@example.com",
        phone_number: "0901234574",
        gender: "Nam",
        date_of_birth: new Date("1994-02-18"),
        role: "customer",
        password: hashedPassword,
        profile_image: mockImages.avatars.user1,
      },
      {
        name: "Bùi Lan H",
        email: "builanh@example.com",
        phone_number: "0901234575",
        gender: "Nữ",
        date_of_birth: new Date("1996-06-22"),
        role: "customer",
        password: hashedPassword,
        profile_image: mockImages.avatars.user2,
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
    const hotelOwner = users.find((u) => u.role === "hotel_manager");

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
      {
        hotel_owner: hotelOwner.user_id,
        name: "Grand Palace Hotel Hanoi",
        address: "56 Nguyễn Du, Hoàn Kiếm, Hà Nội",
        status: 1,
        rating: 4.7,
        longitude: 105.8516,
        latitude: 21.0245,
        description: "Khách sạn cao cấp gần Hồ Hoàn Kiếm, kết hợp kiến trúc Pháp cổ điển và nội thất hiện đại.",
        contact_phone: "02438765432",
        thumbnail: mockImages.hotels.luxury2,
      },
      {
        hotel_owner: hotelOwner.user_id,
        name: "Đà Nẵng Beach Resort",
        address: "120 Võ Nguyên Giáp, Sơn Trà, Đà Nẵng",
        status: 1,
        rating: 4.6,
        longitude: 108.2441,
        latitude: 16.0544,
        description: "Resort bên bãi biển Mỹ Khê nổi tiếng, view biển tuyệt đẹp, cách Cầu Rồng 5km.",
        contact_phone: "02363456789",
        thumbnail: mockImages.hotels.beach2,
      },
      {
        hotel_owner: hotelOwner.user_id,
        name: "Hội An Ancient Town Hotel",
        address: "22 Trần Phú, Phố Cổ, Hội An",
        status: 1,
        rating: 4.8,
        longitude: 108.3271,
        latitude: 15.8801,
        description: "Khách sạn boutique giữa lòng phố cổ, kiến trúc truyền thống Việt Nam kết hợp tiện nghi hiện đại.",
        contact_phone: "02353654321",
        thumbnail: mockImages.hotels.resort1,
      },
      {
        hotel_owner: hotelOwner.user_id,
        name: "Phú Quốc Pearl Resort",
        address: "88 Trường Beach, Dương Đông, Phú Quốc",
        status: 1,
        rating: 4.9,
        longitude: 103.9598,
        latitude: 10.2167,
        description: "Resort 5 sao trên đảo ngọc Phú Quốc, bãi biển riêng tuyệt đẹp và dịch vụ đẳng cấp.",
        contact_phone: "02973456789",
        thumbnail: mockImages.hotels.resort2,
      },
      {
        hotel_owner: hotelOwner.user_id,
        name: "Sapa Mountain View Hotel",
        address: "15 Fansipan Road, Sa Pa, Lào Cai",
        status: 1,
        rating: 4.4,
        longitude: 103.8438,
        latitude: 22.3364,
        description: "Khách sạn view núi tuyệt đẹp, gần trung tâm thị trấn Sapa, lý tưởng để khám phá vùng cao.",
        contact_phone: "02143456789",
        thumbnail: mockImages.hotels.city2,
      },
      {
        hotel_owner: hotelOwner.user_id,
        name: "Vũng Tàu Ocean Hotel",
        address: "67 Thùy Vân, Thắng Tam, Vũng Tàu",
        status: 1,
        rating: 4.3,
        longitude: 107.0843,
        latitude: 10.3459,
        description: "Khách sạn ven biển Vũng Tàu, view đại dương tuyệt đẹp, gần bãi Sau.",
        contact_phone: "02543456789",
        thumbnail: mockImages.hotels.beach1,
      },
      {
        hotel_owner: hotelOwner.user_id,
        name: "Huế Imperial Hotel",
        address: "32 Lê Lợi, Thành phố Huế",
        status: 1,
        rating: 4.6,
        longitude: 107.5885,
        latitude: 16.4637,
        description: "Khách sạn sang trọng ở cố đô Huế, gần Đại Nội, mang phong cách hoàng gia.",
        contact_phone: "02343456789",
        thumbnail: mockImages.hotels.luxury3,
      },
    ]);
    console.log(`✅ Đã tạo ${hotels.length} hotels`);

    // 5. Tạo Hotel Images
    console.log("🖼️  Tạo hotel images...");
    const now = new Date();
    const hotelImages = [];
    // Hotel 0: Elegance Luxury
    hotelImages.push(
      { hotel_id: hotels[0].hotel_id, image_url: mockImages.hotels.luxury1, createdAt: now, updatedAt: now },
      { hotel_id: hotels[0].hotel_id, image_url: mockImages.hotels.luxury2, createdAt: now, updatedAt: now },
      { hotel_id: hotels[0].hotel_id, image_url: mockImages.hotels.luxury3, createdAt: now, updatedAt: now }
    );
    // Hotel 1: Seaside Paradise
    hotelImages.push(
      { hotel_id: hotels[1].hotel_id, image_url: mockImages.hotels.beach1, createdAt: now, updatedAt: now },
      { hotel_id: hotels[1].hotel_id, image_url: mockImages.hotels.beach2, createdAt: now, updatedAt: now },
      { hotel_id: hotels[1].hotel_id, image_url: mockImages.hotels.resort1, createdAt: now, updatedAt: now }
    );
    // Hotel 2: Modern City
    hotelImages.push(
      { hotel_id: hotels[2].hotel_id, image_url: mockImages.hotels.city1, createdAt: now, updatedAt: now },
      { hotel_id: hotels[2].hotel_id, image_url: mockImages.hotels.city2, createdAt: now, updatedAt: now },
      { hotel_id: hotels[2].hotel_id, image_url: mockImages.hotels.resort2, createdAt: now, updatedAt: now }
    );
    // Hotel 3: Grand Palace Hanoi
    hotelImages.push(
      { hotel_id: hotels[3].hotel_id, image_url: mockImages.hotels.luxury2, createdAt: now, updatedAt: now },
      { hotel_id: hotels[3].hotel_id, image_url: mockImages.hotels.luxury3, createdAt: now, updatedAt: now },
      { hotel_id: hotels[3].hotel_id, image_url: mockImages.hotels.city1, createdAt: now, updatedAt: now }
    );
    // Hotel 4: Đà Nẵng Beach
    hotelImages.push(
      { hotel_id: hotels[4].hotel_id, image_url: mockImages.hotels.beach2, createdAt: now, updatedAt: now },
      { hotel_id: hotels[4].hotel_id, image_url: mockImages.hotels.resort1, createdAt: now, updatedAt: now },
      { hotel_id: hotels[4].hotel_id, image_url: mockImages.hotels.beach1, createdAt: now, updatedAt: now }
    );
    // Hotel 5: Hội An
    hotelImages.push(
      { hotel_id: hotels[5].hotel_id, image_url: mockImages.hotels.resort1, createdAt: now, updatedAt: now },
      { hotel_id: hotels[5].hotel_id, image_url: mockImages.hotels.resort2, createdAt: now, updatedAt: now },
      { hotel_id: hotels[5].hotel_id, image_url: mockImages.hotels.city2, createdAt: now, updatedAt: now }
    );
    // Hotel 6: Phú Quốc
    hotelImages.push(
      { hotel_id: hotels[6].hotel_id, image_url: mockImages.hotels.resort2, createdAt: now, updatedAt: now },
      { hotel_id: hotels[6].hotel_id, image_url: mockImages.hotels.beach1, createdAt: now, updatedAt: now },
      { hotel_id: hotels[6].hotel_id, image_url: mockImages.hotels.beach2, createdAt: now, updatedAt: now }
    );
    // Hotel 7: Sapa
    hotelImages.push(
      { hotel_id: hotels[7].hotel_id, image_url: mockImages.hotels.city2, createdAt: now, updatedAt: now },
      { hotel_id: hotels[7].hotel_id, image_url: mockImages.hotels.resort1, createdAt: now, updatedAt: now }
    );
    // Hotel 8: Vũng Tàu
    hotelImages.push(
      { hotel_id: hotels[8].hotel_id, image_url: mockImages.hotels.beach1, createdAt: now, updatedAt: now },
      { hotel_id: hotels[8].hotel_id, image_url: mockImages.hotels.city1, createdAt: now, updatedAt: now }
    );
    // Hotel 9: Huế
    hotelImages.push(
      { hotel_id: hotels[9].hotel_id, image_url: mockImages.hotels.luxury3, createdAt: now, updatedAt: now },
      { hotel_id: hotels[9].hotel_id, image_url: mockImages.hotels.city2, createdAt: now, updatedAt: now }
    );
    await db.Image.bulkCreate(hotelImages, { fields: ['hotel_id', 'image_url', 'createdAt', 'updatedAt'] });
    console.log(`✅ Đã tạo ${hotelImages.length} hotel images`);

    // 6. Liên kết Hotel với Facilities
    console.log("🔗 Liên kết hotels với facilities...");
    const facilitiesPossessing = [];
    // Hotel 0: Elegance Luxury - Full luxury facilities
    [0, 1, 2, 3, 4, 5, 6, 8].forEach(i =>
      facilitiesPossessing.push({ hotel_id: hotels[0].hotel_id, facility_id: facilities[i].facility_id })
    );
    // Hotel 1: Seaside Paradise - Beach resort
    [0, 2, 3, 4, 6, 7, 8].forEach(i =>
      facilitiesPossessing.push({ hotel_id: hotels[1].hotel_id, facility_id: facilities[i].facility_id })
    );
    // Hotel 2: Modern City - Business hotel
    [1, 3, 4, 5, 8, 9].forEach(i =>
      facilitiesPossessing.push({ hotel_id: hotels[2].hotel_id, facility_id: facilities[i].facility_id })
    );
    // Hotel 3: Grand Palace Hanoi - Luxury
    [0, 1, 2, 3, 4, 5, 6, 8, 9].forEach(i =>
      facilitiesPossessing.push({ hotel_id: hotels[3].hotel_id, facility_id: facilities[i].facility_id })
    );
    // Hotel 4: Đà Nẵng Beach - Beach resort
    [0, 2, 3, 4, 5, 6, 7, 8].forEach(i =>
      facilitiesPossessing.push({ hotel_id: hotels[4].hotel_id, facility_id: facilities[i].facility_id })
    );
    // Hotel 5: Hội An - Boutique
    [2, 3, 4, 5, 8].forEach(i =>
      facilitiesPossessing.push({ hotel_id: hotels[5].hotel_id, facility_id: facilities[i].facility_id })
    );
    // Hotel 6: Phú Quốc - Premium resort
    [0, 1, 2, 3, 4, 6, 7, 8].forEach(i =>
      facilitiesPossessing.push({ hotel_id: hotels[6].hotel_id, facility_id: facilities[i].facility_id })
    );
    // Hotel 7: Sapa - Mountain hotel
    [1, 3, 4, 5, 8].forEach(i =>
      facilitiesPossessing.push({ hotel_id: hotels[7].hotel_id, facility_id: facilities[i].facility_id })
    );
    // Hotel 8: Vũng Tàu - Beach hotel
    [0, 3, 4, 5, 6, 7, 8].forEach(i =>
      facilitiesPossessing.push({ hotel_id: hotels[8].hotel_id, facility_id: facilities[i].facility_id })
    );
    // Hotel 9: Huế - Imperial hotel
    [0, 2, 3, 4, 5, 6, 8, 9].forEach(i =>
      facilitiesPossessing.push({ hotel_id: hotels[9].hotel_id, facility_id: facilities[i].facility_id })
    );
    await db.FacilitiesPossessing.bulkCreate(facilitiesPossessing);
    console.log(`✅ Đã tạo ${facilitiesPossessing.length} hotel-facility relationships`);

    // 7. Tạo Room Types
    console.log("🛏️  Tạo room types...");
    const roomTypes = await db.RoomType.bulkCreate([
      // Hotel 0: Elegance Luxury Hotel & Spa
      {
        hotel_id: hotels[0].hotel_id,
        type: "Deluxe Room",
        availability: true,
        max_guests: 2,
        description: "Phòng Deluxe rộng rãi với view thành phố tuyệt đẹp",
        quantity: 8,
      },
      {
        hotel_id: hotels[0].hotel_id,
        type: "Executive Suite",
        availability: true,
        max_guests: 3,
        description: "Suite sang trọng với phòng khách riêng biệt",
        quantity: 5,
      },
      {
        hotel_id: hotels[0].hotel_id,
        type: "Presidential Suite",
        availability: true,
        max_guests: 4,
        description: "Suite cao cấp nhất với 2 phòng ngủ và phòng khách rộng",
        quantity: 2,
      },
      // Hotel 1: Seaside Paradise Resort
      {
        hotel_id: hotels[1].hotel_id,
        type: "Ocean View Room",
        availability: true,
        max_guests: 2,
        description: "Phòng view biển tuyệt đẹp với ban công riêng",
        quantity: 10,
      },
      {
        hotel_id: hotels[1].hotel_id,
        type: "Beachfront Villa",
        availability: true,
        max_guests: 4,
        description: "Villa riêng biệt ngay bờ biển với hồ bơi riêng",
        quantity: 6,
      },
      {
        hotel_id: hotels[1].hotel_id,
        type: "Deluxe Bungalow",
        availability: true,
        max_guests: 3,
        description: "Bungalow sang trọng giữa vườn nhiệt đới",
        quantity: 4,
      },
      // Hotel 2: Modern City Hotel
      {
        hotel_id: hotels[2].hotel_id,
        type: "Standard Room",
        availability: true,
        max_guests: 2,
        description: "Phòng tiêu chuẩn hiện đại, tiện nghi đầy đủ",
        quantity: 12,
      },
      {
        hotel_id: hotels[2].hotel_id,
        type: "Business Suite",
        availability: true,
        max_guests: 2,
        description: "Suite dành cho doanh nhân với không gian làm việc riêng",
        quantity: 6,
      },
      {
        hotel_id: hotels[2].hotel_id,
        type: "Family Room",
        availability: true,
        max_guests: 4,
        description: "Phòng rộng dành cho gia đình, 2 giường đôi",
        quantity: 5,
      },
      // Hotel 3: Grand Palace Hotel Hanoi
      {
        hotel_id: hotels[3].hotel_id,
        type: "Classic Room",
        availability: true,
        max_guests: 2,
        description: "Phòng cổ điển với nội thất gỗ cao cấp",
        quantity: 10,
      },
      {
        hotel_id: hotels[3].hotel_id,
        type: "Superior Room",
        availability: true,
        max_guests: 2,
        description: "Phòng cao cấp view Hồ Hoàn Kiếm",
        quantity: 8,
      },
      {
        hotel_id: hotels[3].hotel_id,
        type: "Junior Suite",
        availability: true,
        max_guests: 3,
        description: "Suite nhỏ với góc làm việc và sofa",
        quantity: 4,
      },
      {
        hotel_id: hotels[3].hotel_id,
        type: "Royal Suite",
        availability: true,
        max_guests: 4,
        description: "Suite hoàng gia với kiến trúc Pháp cổ điển",
        quantity: 2,
      },
      // Hotel 4: Đà Nẵng Beach Resort
      {
        hotel_id: hotels[4].hotel_id,
        type: "Sea View Room",
        availability: true,
        max_guests: 2,
        description: "Phòng view biển Mỹ Khê tuyệt đẹp",
        quantity: 15,
      },
      {
        hotel_id: hotels[4].hotel_id,
        type: "Pool Villa",
        availability: true,
        max_guests: 4,
        description: "Villa có hồ bơi riêng và sân vườn",
        quantity: 5,
      },
      {
        hotel_id: hotels[4].hotel_id,
        type: "Deluxe Suite",
        availability: true,
        max_guests: 3,
        description: "Suite sang trọng với jacuzzi và ban công lớn",
        quantity: 3,
      },
      // Hotel 5: Hội An Ancient Town Hotel
      {
        hotel_id: hotels[5].hotel_id,
        type: "Traditional Room",
        availability: true,
        max_guests: 2,
        description: "Phòng phong cách truyền thống Việt Nam",
        quantity: 8,
      },
      {
        hotel_id: hotels[5].hotel_id,
        type: "Garden View Room",
        availability: true,
        max_guests: 2,
        description: "Phòng view vườn trong lành, yên tĩnh",
        quantity: 6,
      },
      {
        hotel_id: hotels[5].hotel_id,
        type: "Heritage Suite",
        availability: true,
        max_guests: 3,
        description: "Suite di sản với nội thất cổ kính",
        quantity: 3,
      },
      // Hotel 6: Phú Quốc Pearl Resort
      {
        hotel_id: hotels[6].hotel_id,
        type: "Island View Room",
        availability: true,
        max_guests: 2,
        description: "Phòng view đảo và biển xanh trong",
        quantity: 12,
      },
      {
        hotel_id: hotels[6].hotel_id,
        type: "Beach Villa",
        availability: true,
        max_guests: 4,
        description: "Villa bên bãi biển riêng với hồ bơi",
        quantity: 8,
      },
      {
        hotel_id: hotels[6].hotel_id,
        type: "Overwater Bungalow",
        availability: true,
        max_guests: 2,
        description: "Bungalow trên mặt nước độc đáo",
        quantity: 4,
      },
      {
        hotel_id: hotels[6].hotel_id,
        type: "Presidential Villa",
        availability: true,
        max_guests: 6,
        description: "Villa cao cấp nhất với 3 phòng ngủ",
        quantity: 2,
      },
      // Hotel 7: Sapa Mountain View Hotel
      {
        hotel_id: hotels[7].hotel_id,
        type: "Mountain View Room",
        availability: true,
        max_guests: 2,
        description: "Phòng view núi Fansipan hùng vĩ",
        quantity: 10,
      },
      {
        hotel_id: hotels[7].hotel_id,
        type: "Valley View Room",
        availability: true,
        max_guests: 2,
        description: "Phòng view thung lũng ruộng bậc thang",
        quantity: 8,
      },
      {
        hotel_id: hotels[7].hotel_id,
        type: "Family Suite",
        availability: true,
        max_guests: 4,
        description: "Suite rộng cho gia đình với lò sưởi",
        quantity: 4,
      },
      // Hotel 8: Vũng Tàu Ocean Hotel
      {
        hotel_id: hotels[8].hotel_id,
        type: "City View Room",
        availability: true,
        max_guests: 2,
        description: "Phòng view thành phố biển Vũng Tàu",
        quantity: 12,
      },
      {
        hotel_id: hotels[8].hotel_id,
        type: "Ocean View Room",
        availability: true,
        max_guests: 2,
        description: "Phòng view biển trực diện tuyệt đẹp",
        quantity: 10,
      },
      {
        hotel_id: hotels[8].hotel_id,
        type: "Deluxe Suite",
        availability: true,
        max_guests: 3,
        description: "Suite cao cấp với ban công lớn view biển",
        quantity: 4,
      },
      // Hotel 9: Huế Imperial Hotel
      {
        hotel_id: hotels[9].hotel_id,
        type: "Imperial Room",
        availability: true,
        max_guests: 2,
        description: "Phòng phong cách hoàng gia Huế",
        quantity: 10,
      },
      {
        hotel_id: hotels[9].hotel_id,
        type: "River View Suite",
        availability: true,
        max_guests: 3,
        description: "Suite view sông Hương thơ mộng",
        quantity: 6,
      },
      {
        hotel_id: hotels[9].hotel_id,
        type: "Royal Palace Suite",
        availability: true,
        max_guests: 4,
        description: "Suite hoàng cung với nội thất cổ điển",
        quantity: 3,
      },
    ]);
    console.log(`✅ Đã tạo ${roomTypes.length} room types`);

    // 8. Tạo Room Prices
    console.log("💰 Tạo room prices...");
    const roomPrices = await db.RoomPrice.bulkCreate([
      // Hotel 0: Elegance Luxury
      { type_id: roomTypes[0].type_id, start_date: new Date("2025-01-01"), end_date: new Date("2025-12-31"), basic_price: 2500000, special_price: 2200000, event: "Khuyến mãi Tết 2025", discount: 12 },
      { type_id: roomTypes[1].type_id, start_date: new Date("2025-01-01"), end_date: new Date("2025-12-31"), basic_price: 4500000, special_price: null, event: null, discount: 0 },
      { type_id: roomTypes[2].type_id, start_date: new Date("2025-01-01"), end_date: new Date("2025-12-31"), basic_price: 8500000, special_price: null, event: null, discount: 0 },

      // Hotel 1: Seaside Paradise
      { type_id: roomTypes[3].type_id, start_date: new Date("2025-01-01"), end_date: new Date("2025-12-31"), basic_price: 3200000, special_price: 2800000, event: "Giảm giá mùa hè", discount: 13 },
      { type_id: roomTypes[4].type_id, start_date: new Date("2025-01-01"), end_date: new Date("2025-12-31"), basic_price: 6500000, special_price: 5500000, event: "Ưu đãi Villa", discount: 15 },
      { type_id: roomTypes[5].type_id, start_date: new Date("2025-01-01"), end_date: new Date("2025-12-31"), basic_price: 4800000, special_price: null, event: null, discount: 0 },

      // Hotel 2: Modern City
      { type_id: roomTypes[6].type_id, start_date: new Date("2025-01-01"), end_date: new Date("2025-12-31"), basic_price: 1800000, special_price: null, event: null, discount: 0 },
      { type_id: roomTypes[7].type_id, start_date: new Date("2025-01-01"), end_date: new Date("2025-12-31"), basic_price: 2800000, special_price: 2500000, event: "Khuyến mãi doanh nhân", discount: 11 },
      { type_id: roomTypes[8].type_id, start_date: new Date("2025-01-01"), end_date: new Date("2025-12-31"), basic_price: 3500000, special_price: null, event: null, discount: 0 },

      // Hotel 3: Grand Palace Hanoi
      { type_id: roomTypes[9].type_id, start_date: new Date("2025-01-01"), end_date: new Date("2025-12-31"), basic_price: 2200000, special_price: null, event: null, discount: 0 },
      { type_id: roomTypes[10].type_id, start_date: new Date("2025-01-01"), end_date: new Date("2025-12-31"), basic_price: 2800000, special_price: 2400000, event: "Ưu đãi cuối tuần", discount: 14 },
      { type_id: roomTypes[11].type_id, start_date: new Date("2025-01-01"), end_date: new Date("2025-12-31"), basic_price: 3800000, special_price: null, event: null, discount: 0 },
      { type_id: roomTypes[12].type_id, start_date: new Date("2025-01-01"), end_date: new Date("2025-12-31"), basic_price: 6500000, special_price: null, event: null, discount: 0 },

      // Hotel 4: Đà Nẵng Beach
      { type_id: roomTypes[13].type_id, start_date: new Date("2025-01-01"), end_date: new Date("2025-12-31"), basic_price: 2900000, special_price: 2500000, event: "Flash Sale", discount: 14 },
      { type_id: roomTypes[14].type_id, start_date: new Date("2025-01-01"), end_date: new Date("2025-12-31"), basic_price: 7200000, special_price: null, event: null, discount: 0 },
      { type_id: roomTypes[15].type_id, start_date: new Date("2025-01-01"), end_date: new Date("2025-12-31"), basic_price: 4500000, special_price: 3900000, event: "Khuyến mãi Spa", discount: 13 },

      // Hotel 5: Hội An
      { type_id: roomTypes[16].type_id, start_date: new Date("2025-01-01"), end_date: new Date("2025-12-31"), basic_price: 1600000, special_price: null, event: null, discount: 0 },
      { type_id: roomTypes[17].type_id, start_date: new Date("2025-01-01"), end_date: new Date("2025-12-31"), basic_price: 1400000, special_price: 1200000, event: "Ưu đãi đặt sớm", discount: 14 },
      { type_id: roomTypes[18].type_id, start_date: new Date("2025-01-01"), end_date: new Date("2025-12-31"), basic_price: 2600000, special_price: null, event: null, discount: 0 },

      // Hotel 6: Phú Quốc
      { type_id: roomTypes[19].type_id, start_date: new Date("2025-01-01"), end_date: new Date("2025-12-31"), basic_price: 3800000, special_price: 3200000, event: "Khuyến mãi đảo ngọc", discount: 16 },
      { type_id: roomTypes[20].type_id, start_date: new Date("2025-01-01"), end_date: new Date("2025-12-31"), basic_price: 7800000, special_price: 6500000, event: "Ưu đãi Villa biển", discount: 17 },
      { type_id: roomTypes[21].type_id, start_date: new Date("2025-01-01"), end_date: new Date("2025-12-31"), basic_price: 5500000, special_price: null, event: null, discount: 0 },
      { type_id: roomTypes[22].type_id, start_date: new Date("2025-01-01"), end_date: new Date("2025-12-31"), basic_price: 12000000, special_price: null, event: null, discount: 0 },

      // Hotel 7: Sapa
      { type_id: roomTypes[23].type_id, start_date: new Date("2025-01-01"), end_date: new Date("2025-12-31"), basic_price: 1200000, special_price: 1000000, event: "Khuyến mãi mùa đông", discount: 17 },
      { type_id: roomTypes[24].type_id, start_date: new Date("2025-01-01"), end_date: new Date("2025-12-31"), basic_price: 1400000, special_price: null, event: null, discount: 0 },
      { type_id: roomTypes[25].type_id, start_date: new Date("2025-01-01"), end_date: new Date("2025-12-31"), basic_price: 2200000, special_price: 1900000, event: "Ưu đãi gia đình", discount: 14 },

      // Hotel 8: Vũng Tàu
      { type_id: roomTypes[26].type_id, start_date: new Date("2025-01-01"), end_date: new Date("2025-12-31"), basic_price: 1500000, special_price: null, event: null, discount: 0 },
      { type_id: roomTypes[27].type_id, start_date: new Date("2025-01-01"), end_date: new Date("2025-12-31"), basic_price: 2200000, special_price: 1900000, event: "Khuyến mãi biển", discount: 14 },
      { type_id: roomTypes[28].type_id, start_date: new Date("2025-01-01"), end_date: new Date("2025-12-31"), basic_price: 3200000, special_price: null, event: null, discount: 0 },

      // Hotel 9: Huế
      { type_id: roomTypes[29].type_id, start_date: new Date("2025-01-01"), end_date: new Date("2025-12-31"), basic_price: 1900000, special_price: null, event: null, discount: 0 },
      { type_id: roomTypes[30].type_id, start_date: new Date("2025-01-01"), end_date: new Date("2025-12-31"), basic_price: 2800000, special_price: 2400000, event: "Ưu đãi cố đô", discount: 14 },
      { type_id: roomTypes[31].type_id, start_date: new Date("2025-01-01"), end_date: new Date("2025-12-31"), basic_price: 4500000, special_price: 3800000, event: "Flash Sale Hoàng Cung", discount: 16 },
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
    const customers = users.filter((u) => u.role === "customer");

    const reviews = await db.Review.bulkCreate([
      // Hotel 0: Elegance Luxury - 5 reviews
      { user_id: customers[0].user_id, hotel_id: hotels[0].hotel_id, room_id: null, destination_id: null, rating: 5, comment: "Khách sạn rất đẹp, phòng ốc sạch sẽ, nhân viên thân thiện. Tôi sẽ quay lại lần sau.", date_created: new Date("2025-11-15") },
      { user_id: customers[1].user_id, hotel_id: hotels[0].hotel_id, room_id: null, destination_id: null, rating: 4, comment: "Khách sạn tốt, vị trí thuận tiện nhưng ban đêm hơi ồn vì ở trung tâm.", date_created: new Date("2025-11-10") },
      { user_id: customers[2].user_id, hotel_id: hotels[0].hotel_id, room_id: null, destination_id: null, rating: 5, comment: "Dịch vụ spa tuyệt vời, phòng Executive Suite rộng rãi và sang trọng.", date_created: new Date("2025-10-20") },
      { user_id: customers[3].user_id, hotel_id: hotels[0].hotel_id, room_id: null, destination_id: null, rating: 5, comment: "Bữa sáng buffet đa dạng, nhân viên nhiệt tình. Khách sạn đẳng cấp!", date_created: new Date("2025-10-05") },
      { user_id: customers[4].user_id, hotel_id: hotels[0].hotel_id, room_id: null, destination_id: null, rating: 3, comment: "Khách sạn ok nhưng giá hơi cao so với chất lượng dịch vụ.", date_created: new Date("2025-09-25") },

      // Hotel 1: Seaside Paradise - 5 reviews
      { user_id: customers[0].user_id, hotel_id: hotels[1].hotel_id, room_id: null, destination_id: null, rating: 5, comment: "Resort tuyệt vời! View biển đẹp, dịch vụ chu đáo. Rất đáng để trải nghiệm.", date_created: new Date("2025-11-20") },
      { user_id: customers[1].user_id, hotel_id: hotels[1].hotel_id, room_id: null, destination_id: null, rating: 5, comment: "Bãi biển riêng tuyệt đẹp, villa rộng rãi. Kỳ nghỉ hoàn hảo!", date_created: new Date("2025-11-05") },
      { user_id: customers[2].user_id, hotel_id: hotels[1].hotel_id, room_id: null, destination_id: null, rating: 4, comment: "Resort đẹp, dịch vụ tốt. Chỉ có điều xa trung tâm một chút.", date_created: new Date("2025-10-15") },
      { user_id: customers[5].user_id, hotel_id: hotels[1].hotel_id, room_id: null, destination_id: null, rating: 5, comment: "Hoàng hôn ở đây tuyệt đẹp! Nhà hàng seafood ngon tuyệt vời.", date_created: new Date("2025-09-30") },
      { user_id: customers[4].user_id, hotel_id: hotels[1].hotel_id, room_id: null, destination_id: null, rating: 5, comment: "Honeymoon tại đây rất lãng mạn. Bungalow sang trọng và riêng tư.", date_created: new Date("2025-09-10") },

      // Hotel 2: Modern City - 4 reviews
      { user_id: customers[0].user_id, hotel_id: hotels[2].hotel_id, room_id: null, destination_id: null, rating: 4, comment: "Khách sạn hiện đại, tiện lợi cho công tác. WiFi nhanh, phòng họp tốt.", date_created: new Date("2025-11-12") },
      { user_id: customers[1].user_id, hotel_id: hotels[2].hotel_id, room_id: null, destination_id: null, rating: 4, comment: "Vị trí trung tâm, gần các điểm tham quan. Giá cả hợp lý.", date_created: new Date("2025-10-25") },
      { user_id: customers[3].user_id, hotel_id: hotels[2].hotel_id, room_id: null, destination_id: null, rating: 5, comment: "Business Suite rất tiện cho làm việc. Nhân viên chuyên nghiệp.", date_created: new Date("2025-10-08") },
      { user_id: customers[2].user_id, hotel_id: hotels[2].hotel_id, room_id: null, destination_id: null, rating: 3, comment: "Phòng Standard hơi nhỏ cho gia đình 4 người.", date_created: new Date("2025-09-20") },

      // Hotel 3: Grand Palace Hanoi - 5 reviews
      { user_id: customers[0].user_id, hotel_id: hotels[3].hotel_id, room_id: null, destination_id: null, rating: 5, comment: "Khách sạn sang trọng, kiến trúc Pháp đẹp mắt. Gần Hồ Hoàn Kiếm.", date_created: new Date("2025-11-18") },
      { user_id: customers[1].user_id, hotel_id: hotels[3].hotel_id, room_id: null, destination_id: null, rating: 5, comment: "Royal Suite tuyệt đẹp! Nội thất cổ điển sang trọng.", date_created: new Date("2025-11-01") },
      { user_id: customers[4].user_id, hotel_id: hotels[3].hotel_id, room_id: null, destination_id: null, rating: 4, comment: "Khách sạn đẹp nhưng parking hơi xa. Nhân viên thân thiện.", date_created: new Date("2025-10-22") },
      { user_id: customers[5].user_id, hotel_id: hotels[3].hotel_id, room_id: null, destination_id: null, rating: 5, comment: "Superior Room view hồ tuyệt đẹp. Bữa sáng ngon.", date_created: new Date("2025-10-10") },
      { user_id: customers[3].user_id, hotel_id: hotels[3].hotel_id, room_id: null, destination_id: null, rating: 4, comment: "Vị trí đắc địa, dịch vụ tốt. Giá hơi cao vào cuối tuần.", date_created: new Date("2025-09-28") },

      // Hotel 4: Đà Nẵng Beach - 4 reviews
      { user_id: customers[0].user_id, hotel_id: hotels[4].hotel_id, room_id: null, destination_id: null, rating: 5, comment: "Pool Villa tuyệt vời! Hồ bơi riêng, view biển đẹp. Highly recommended!", date_created: new Date("2025-11-22") },
      { user_id: customers[2].user_id, hotel_id: hotels[4].hotel_id, room_id: null, destination_id: null, rating: 4, comment: "Bãi biển Mỹ Khê đẹp, resort tiện nghi. Gần Cầu Rồng.", date_created: new Date("2025-10-28") },
      { user_id: customers[1].user_id, hotel_id: hotels[4].hotel_id, room_id: null, destination_id: null, rating: 5, comment: "Deluxe Suite có jacuzzi rất tuyệt. Nhân viên nhiệt tình.", date_created: new Date("2025-10-18") },
      { user_id: customers[3].user_id, hotel_id: hotels[4].hotel_id, room_id: null, destination_id: null, rating: 4, comment: "Khách sạn đẹp, dịch vụ tốt. Giá flash sale rất hợp lý.", date_created: new Date("2025-09-22") },

      // Hotel 5: Hội An - 4 reviews
      { user_id: customers[0].user_id, hotel_id: hotels[5].hotel_id, room_id: null, destination_id: null, rating: 5, comment: "Khách sạn boutique xinh xắn giữa phố cổ. Heritage Suite rất đặc biệt.", date_created: new Date("2025-11-08") },
      { user_id: customers[1].user_id, hotel_id: hotels[5].hotel_id, room_id: null, destination_id: null, rating: 4, comment: "Nội thất truyền thống đẹp, nhân viên thân thiện. Vị trí trung tâm phố cổ.", date_created: new Date("2025-10-26") },
      { user_id: customers[4].user_id, hotel_id: hotels[5].hotel_id, room_id: null, destination_id: null, rating: 5, comment: "Garden View Room yên tĩnh, thư giãn. Bữa sáng món Việt rất ngon.", date_created: new Date("2025-10-12") },
      { user_id: customers[2].user_id, hotel_id: hotels[5].hotel_id, room_id: null, destination_id: null, rating: 5, comment: "Khách sạn nhỏ xinh, mang đậm bản sắc Hội An. Rất đáng ở!", date_created: new Date("2025-09-18") },

      // Hotel 6: Phú Quốc Pearl - 5 reviews
      { user_id: customers[0].user_id, hotel_id: hotels[6].hotel_id, room_id: null, destination_id: null, rating: 5, comment: "Resort 5 sao tuyệt vời! Beach Villa có hồ bơi riêng, view biển tuyệt đẹp.", date_created: new Date("2025-11-25") },
      { user_id: customers[1].user_id, hotel_id: hotels[6].hotel_id, room_id: null, destination_id: null, rating: 5, comment: "Overwater Bungalow độc đáo! Trải nghiệm tuyệt vời tại Phú Quốc.", date_created: new Date("2025-11-10") },
      { user_id: customers[2].user_id, hotel_id: hotels[6].hotel_id, room_id: null, destination_id: null, rating: 4, comment: "Presidential Villa rất rộng, phù hợp cho gia đình lớn. Dịch vụ cao cấp.", date_created: new Date("2025-10-30") },
      { user_id: customers[5].user_id, hotel_id: hotels[6].hotel_id, room_id: null, destination_id: null, rating: 5, comment: "Bãi biển riêng sạch đẹp, nước biển trong xanh. Spa tuyệt vời!", date_created: new Date("2025-10-14") },
      { user_id: customers[3].user_id, hotel_id: hotels[6].hotel_id, room_id: null, destination_id: null, rating: 5, comment: "Kỳ nghỉ tuyệt vời nhất! Island View Room đẹp, buffet sáng phong phú.", date_created: new Date("2025-09-24") },

      // Hotel 7: Sapa Mountain - 3 reviews
      { user_id: customers[0].user_id, hotel_id: hotels[7].hotel_id, room_id: null, destination_id: null, rating: 5, comment: "Mountain View Room nhìn Fansipan tuyệt đẹp! Không khí mát mẻ, sảng khoái.", date_created: new Date("2025-11-14") },
      { user_id: customers[2].user_id, hotel_id: hotels[7].hotel_id, room_id: null, destination_id: null, rating: 4, comment: "Family Suite có lò sưởi rất ấm. Vị trí thuận tiện đi chợ tình.", date_created: new Date("2025-10-24") },
      { user_id: customers[1].user_id, hotel_id: hotels[7].hotel_id, room_id: null, destination_id: null, rating: 4, comment: "Valley View đẹp, view ruộng bậc thang tuyệt. Giá hợp lý.", date_created: new Date("2025-10-06") },

      // Hotel 8: Vũng Tàu Ocean - 3 reviews
      { user_id: customers[0].user_id, hotel_id: hotels[8].hotel_id, room_id: null, destination_id: null, rating: 4, comment: "Ocean View Room nhìn biển đẹp. Gần bãi Sau, đi bộ được.", date_created: new Date("2025-11-16") },
      { user_id: customers[3].user_id, hotel_id: hotels[8].hotel_id, room_id: null, destination_id: null, rating: 4, comment: "Khách sạn tốt cho nghỉ cuối tuần. Deluxe Suite ban công rộng.", date_created: new Date("2025-10-20") },
      { user_id: customers[2].user_id, hotel_id: hotels[8].hotel_id, room_id: null, destination_id: null, rating: 3, comment: "City View Room view thành phố ok. Giá cả hợp lý nhưng phòng hơi nhỏ.", date_created: new Date("2025-09-16") },

      // Hotel 9: Huế Imperial - 4 reviews
      { user_id: customers[0].user_id, hotel_id: hotels[9].hotel_id, room_id: null, destination_id: null, rating: 5, comment: "Royal Palace Suite sang trọng như hoàng cung! Kiến trúc Huế đẹp mắt.", date_created: new Date("2025-11-19") },
      { user_id: customers[1].user_id, hotel_id: hotels[9].hotel_id, room_id: null, destination_id: null, rating: 5, comment: "River View Suite nhìn sông Hương thơ mộng. Bữa sáng có món cung đình.", date_created: new Date("2025-11-02") },
      { user_id: customers[4].user_id, hotel_id: hotels[9].hotel_id, room_id: null, destination_id: null, rating: 4, comment: "Imperial Room mang phong cách hoàng gia. Gần Đại Nội, rất tiện.", date_created: new Date("2025-10-16") },
      { user_id: customers[5].user_id, hotel_id: hotels[9].hotel_id, room_id: null, destination_id: null, rating: 5, comment: "Khách sạn tuyệt vời! Flash sale rất đáng. Nhân viên thân thiện.", date_created: new Date("2025-09-26") },

      // Destination Reviews - 5 reviews
      { user_id: customers[1].user_id, destination_id: destinations[0].destination_id, hotel_id: null, room_id: null, rating: 5, comment: "Vịnh Hạ Long thật sự rất đẹp, cảnh quan hùng vĩ. Một trải nghiệm khó quên!", date_created: new Date("2025-10-05") },
      { user_id: customers[0].user_id, destination_id: destinations[1].destination_id, hotel_id: null, room_id: null, rating: 5, comment: "Phố cổ Hội An rất đẹp và cổ kính. Đèn lồng buổi tối rất lãng mạn.", date_created: new Date("2025-09-15") },
      { user_id: customers[2].user_id, destination_id: destinations[2].destination_id, hotel_id: null, room_id: null, rating: 5, comment: "Sapa mùa lúa chín đẹp tuyệt vời! Không khí trong lành, người dân thân thiện.", date_created: new Date("2025-10-02") },
      { user_id: customers[3].user_id, destination_id: destinations[3].destination_id, hotel_id: null, room_id: null, rating: 4, comment: "Cầu Vàng Đà Nẵng rất độc đáo. Bàn tay khổng lồ ấn tượng. Hơi đông người.", date_created: new Date("2025-09-28") },
      { user_id: customers[4].user_id, destination_id: destinations[4].destination_id, hotel_id: null, room_id: null, rating: 5, comment: "Đảo Phú Quốc thiên đường! Biển xanh trong, bãi cát trắng. Rất đáng đi!", date_created: new Date("2025-09-12") },
    ]);
    console.log(`✅ Đã tạo ${reviews.length} reviews`);

    // 15. Tạo Bookings
    console.log("📅 Tạo bookings...");
    const bookings = await db.Booking.bulkCreate([
      // Completed bookings (past)
      { user_id: customers[0].user_id, room_id: createdRooms[0].room_id, status: "completed", total_price: 6600000, check_in_date: new Date("2025-10-10"), check_out_date: new Date("2025-10-13"), created_at: new Date("2025-09-25"), people: 2 },
      { user_id: customers[1].user_id, room_id: createdRooms[20].room_id, status: "completed", total_price: 9600000, check_in_date: new Date("2025-10-05"), check_out_date: new Date("2025-10-08"), created_at: new Date("2025-09-20"), people: 2 },
      { user_id: customers[2].user_id, room_id: createdRooms[30].room_id, status: "completed", total_price: 7200000, check_in_date: new Date("2025-09-15"), check_out_date: new Date("2025-09-18"), created_at: new Date("2025-09-01"), people: 4 },
      { user_id: customers[3].user_id, room_id: createdRooms[45].room_id, status: "completed", total_price: 5400000, check_in_date: new Date("2025-09-20"), check_out_date: new Date("2025-09-22"), created_at: new Date("2025-09-05"), people: 2 },
      { user_id: customers[4].user_id, room_id: createdRooms[60].room_id, status: "completed", total_price: 16500000, check_in_date: new Date("2025-10-20"), check_out_date: new Date("2025-10-25"), created_at: new Date("2025-10-05"), people: 4 },
      { user_id: customers[5].user_id, room_id: createdRooms[75].room_id, status: "completed", total_price: 3000000, check_in_date: new Date("2025-10-15"), check_out_date: new Date("2025-10-18"), created_at: new Date("2025-10-01"), people: 2 },
      { user_id: customers[0].user_id, room_id: createdRooms[90].room_id, status: "completed", total_price: 6600000, check_in_date: new Date("2025-11-01"), check_out_date: new Date("2025-11-04"), created_at: new Date("2025-10-20"), people: 2 },
      { user_id: customers[1].user_id, room_id: createdRooms[105].room_id, status: "completed", total_price: 5700000, check_in_date: new Date("2025-11-10"), check_out_date: new Date("2025-11-13"), created_at: new Date("2025-10-28"), people: 3 },

      // Confirmed bookings (upcoming)
      { user_id: customers[0].user_id, room_id: createdRooms[5].room_id, status: "confirmed", total_price: 13500000, check_in_date: new Date("2025-12-20"), check_out_date: new Date("2025-12-23"), created_at: new Date("2025-12-01"), people: 3 },
      { user_id: customers[1].user_id, room_id: createdRooms[25].room_id, status: "confirmed", total_price: 8400000, check_in_date: new Date("2025-12-25"), check_out_date: new Date("2025-12-27"), created_at: new Date("2025-12-05"), people: 2 },
      { user_id: customers[2].user_id, room_id: createdRooms[40].room_id, status: "confirmed", total_price: 4800000, check_in_date: new Date("2025-12-28"), check_out_date: new Date("2025-12-30"), created_at: new Date("2025-12-10"), people: 2 },
      { user_id: customers[3].user_id, room_id: createdRooms[55].room_id, status: "confirmed", total_price: 11700000, check_in_date: new Date("2026-01-02"), check_out_date: new Date("2026-01-05"), created_at: new Date("2025-12-15"), people: 4 },
      { user_id: customers[4].user_id, room_id: createdRooms[70].room_id, status: "confirmed", total_price: 4800000, check_in_date: new Date("2026-01-10"), check_out_date: new Date("2026-01-14"), created_at: new Date("2025-12-18"), people: 2 },
      { user_id: customers[5].user_id, room_id: createdRooms[85].room_id, status: "confirmed", total_price: 9600000, check_in_date: new Date("2026-01-15"), check_out_date: new Date("2026-01-20"), created_at: new Date("2025-12-20"), people: 3 },
      { user_id: customers[0].user_id, room_id: createdRooms[100].room_id, status: "confirmed", total_price: 5700000, check_in_date: new Date("2026-01-20"), check_out_date: new Date("2026-01-23"), created_at: new Date("2025-12-22"), people: 2 },
      { user_id: customers[1].user_id, room_id: createdRooms[115].room_id, status: "confirmed", total_price: 7200000, check_in_date: new Date("2026-02-01"), check_out_date: new Date("2026-02-04"), created_at: new Date("2025-12-24"), people: 3 },

      // Pending bookings (awaiting payment)
      { user_id: customers[2].user_id, room_id: createdRooms[10].room_id, status: "pending", total_price: 6600000, check_in_date: new Date("2026-02-10"), check_out_date: new Date("2026-02-13"), created_at: new Date("2025-12-26"), people: 2 },
      { user_id: customers[3].user_id, room_id: createdRooms[35].room_id, status: "pending", total_price: 5400000, check_in_date: new Date("2026-02-15"), check_out_date: new Date("2026-02-17"), created_at: new Date("2025-12-26"), people: 2 },
      { user_id: customers[4].user_id, room_id: createdRooms[50].room_id, status: "pending", total_price: 3600000, check_in_date: new Date("2026-02-20"), check_out_date: new Date("2026-02-23"), created_at: new Date("2025-12-27"), people: 2 },
      { user_id: customers[5].user_id, room_id: createdRooms[65].room_id, status: "pending", total_price: 9600000, check_in_date: new Date("2026-02-25"), check_out_date: new Date("2026-02-28"), created_at: new Date("2025-12-27"), people: 4 },

      // Cancelled bookings
      { user_id: customers[0].user_id, room_id: createdRooms[15].room_id, status: "cancelled", total_price: 8500000, check_in_date: new Date("2025-11-05"), check_out_date: new Date("2025-11-08"), created_at: new Date("2025-10-20"), people: 4 },
      { user_id: customers[1].user_id, room_id: createdRooms[80].room_id, status: "cancelled", total_price: 6400000, check_in_date: new Date("2025-11-20"), check_out_date: new Date("2025-11-24"), created_at: new Date("2025-11-05"), people: 2 },
      { user_id: customers[2].user_id, room_id: createdRooms[95].room_id, status: "cancelled", total_price: 9000000, check_in_date: new Date("2025-12-15"), check_out_date: new Date("2025-12-18"), created_at: new Date("2025-12-01"), people: 3 },
    ]);
    console.log(`✅ Đã tạo ${bookings.length} bookings`);

    // 16. Tạo Payments
    console.log("💳 Tạo payments...");
    const baseTimestamp = Date.now();
    const payments = await db.Payment.bulkCreate([
      // Payments for completed bookings
      { booking_id: bookings[0].booking_id, amount: bookings[0].total_price, payment_method: "vnpay", payment_status: "completed", transaction_id: "VNP" + (baseTimestamp + 1), payment_date: new Date("2025-09-25") },
      { booking_id: bookings[1].booking_id, amount: bookings[1].total_price, payment_method: "momo", payment_status: "completed", transaction_id: "MOMO" + (baseTimestamp + 2), payment_date: new Date("2025-09-20") },
      { booking_id: bookings[2].booking_id, amount: bookings[2].total_price, payment_method: "cash", payment_status: "completed", transaction_id: "CASH" + (baseTimestamp + 3), payment_date: new Date("2025-09-01") },
      { booking_id: bookings[3].booking_id, amount: bookings[3].total_price, payment_method: "vnpay", payment_status: "completed", transaction_id: "VNP" + (baseTimestamp + 4), payment_date: new Date("2025-09-05") },
      { booking_id: bookings[4].booking_id, amount: bookings[4].total_price, payment_method: "vnpay", payment_status: "completed", transaction_id: "VNP" + (baseTimestamp + 5), payment_date: new Date("2025-10-05") },
      { booking_id: bookings[5].booking_id, amount: bookings[5].total_price, payment_method: "momo", payment_status: "completed", transaction_id: "MOMO" + (baseTimestamp + 6), payment_date: new Date("2025-10-01") },
      { booking_id: bookings[6].booking_id, amount: bookings[6].total_price, payment_method: "vnpay", payment_status: "completed", transaction_id: "VNP" + (baseTimestamp + 7), payment_date: new Date("2025-10-20") },
      { booking_id: bookings[7].booking_id, amount: bookings[7].total_price, payment_method: "momo", payment_status: "completed", transaction_id: "MOMO" + (baseTimestamp + 8), payment_date: new Date("2025-10-28") },

      // Payments for confirmed bookings
      { booking_id: bookings[8].booking_id, amount: bookings[8].total_price, payment_method: "vnpay", payment_status: "completed", transaction_id: "VNP" + (baseTimestamp + 9), payment_date: new Date("2025-12-01") },
      { booking_id: bookings[9].booking_id, amount: bookings[9].total_price, payment_method: "momo", payment_status: "completed", transaction_id: "MOMO" + (baseTimestamp + 10), payment_date: new Date("2025-12-05") },
      { booking_id: bookings[10].booking_id, amount: bookings[10].total_price, payment_method: "vnpay", payment_status: "completed", transaction_id: "VNP" + (baseTimestamp + 11), payment_date: new Date("2025-12-10") },
      { booking_id: bookings[11].booking_id, amount: bookings[11].total_price, payment_method: "cash", payment_status: "completed", transaction_id: "CASH" + (baseTimestamp + 12), payment_date: new Date("2025-12-15") },
      { booking_id: bookings[12].booking_id, amount: bookings[12].total_price, payment_method: "vnpay", payment_status: "completed", transaction_id: "VNP" + (baseTimestamp + 13), payment_date: new Date("2025-12-18") },
      { booking_id: bookings[13].booking_id, amount: bookings[13].total_price, payment_method: "momo", payment_status: "completed", transaction_id: "MOMO" + (baseTimestamp + 14), payment_date: new Date("2025-12-20") },
      { booking_id: bookings[14].booking_id, amount: bookings[14].total_price, payment_method: "vnpay", payment_status: "completed", transaction_id: "VNP" + (baseTimestamp + 15), payment_date: new Date("2025-12-22") },
      { booking_id: bookings[15].booking_id, amount: bookings[15].total_price, payment_method: "momo", payment_status: "completed", transaction_id: "MOMO" + (baseTimestamp + 16), payment_date: new Date("2025-12-24") },

      // Note: Pending bookings (bookings[16-19]) don't have payments yet
      // Note: Cancelled bookings (bookings[20-22]) may have refunds or no payment
    ]);
    console.log(`✅ Đã tạo ${payments.length} payments`);

    // 17. Tạo Loving Lists (Favorites)
    console.log("❤️  Tạo loving lists...");
    const lovingLists = await db.LovingList.bulkCreate([
      // Favorite hotels
      { user_id: customers[0].user_id, hotel_id: hotels[1].hotel_id, destination_id: null },
      { user_id: customers[0].user_id, hotel_id: hotels[6].hotel_id, destination_id: null },
      { user_id: customers[1].user_id, hotel_id: hotels[0].hotel_id, destination_id: null },
      { user_id: customers[1].user_id, hotel_id: hotels[3].hotel_id, destination_id: null },
      { user_id: customers[2].user_id, hotel_id: hotels[5].hotel_id, destination_id: null },
      { user_id: customers[3].user_id, hotel_id: hotels[4].hotel_id, destination_id: null },
      { user_id: customers[4].user_id, hotel_id: hotels[2].hotel_id, destination_id: null },
      { user_id: customers[5].user_id, hotel_id: hotels[9].hotel_id, destination_id: null },

      // Favorite destinations
      { user_id: customers[0].user_id, hotel_id: null, destination_id: destinations[0].destination_id },
      { user_id: customers[1].user_id, hotel_id: null, destination_id: destinations[1].destination_id },
      { user_id: customers[2].user_id, hotel_id: null, destination_id: destinations[2].destination_id },
      { user_id: customers[3].user_id, hotel_id: null, destination_id: destinations[3].destination_id },
      { user_id: customers[4].user_id, hotel_id: null, destination_id: destinations[4].destination_id },
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
