/**
 * Script to seed mock data from Frontend into Backend Database
 * Run: node scripts/seed-mock-data.js
 */

const { User, Destination, Hotel, HotelFacilities, RoomType, Room, Booking, RoomPrice } = require('../models');
const bcrypt = require('bcryptjs');

// Mock data (copied from frontend/lib/mock/data.ts)
const mockHotels = [
  {
    name: "Elegance Luxury Hotel & Spa",
    address: "123 Đường Lê Lợi, Quận 1, TP.HCM",
    contact_phone: "028-1234-5678",
    description: "Khách sạn 5 sao sang trọng với đầy đủ tiện nghi hiện đại, nằm ngay trung tâm thành phố.",
    thumbnail: "https://images.unsplash.com/photo-1566073771259-6a8506099945",
    longitude: 106.7009,
    latitude: 10.7769,
    status: 1,
    rating: 5.0,
  },
  {
    name: "Seaside Paradise Resort",
    address: "45 Trần Phú, Nha Trang",
    contact_phone: "0258-1234-5678",
    description: "Resort bên bờ biển tuyệt đẹp, view hoàng hôn tuyệt vời và bãi biển riêng.",
    thumbnail: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4",
    longitude: 109.1967,
    latitude: 12.2388,
    status: 1,
    rating: 4.8,
  },
  {
    name: "Modern City Hotel",
    address: "789 Hoàng Diệu, Hà Nội",
    contact_phone: "024-1234-5678",
    description: "Khách sạn hiện đại, tiện nghi, gần các điểm tham quan nổi tiếng.",
    thumbnail: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb",
    longitude: 105.8542,
    latitude: 21.0285,
    status: 1,
    rating: 4.5,
  },
];

const mockUsers = [
  {
    name: "Admin User",
    email: "admin@hotel.com",
    phone_number: "0901234567",
    gender: "male",
    date_of_birth: "1990-01-01",
    role: "admin",
    password: "admin123",
  },
  {
    name: "Hotel Owner",
    email: "owner@hotel.com",
    phone_number: "0901234568",
    gender: "male",
    date_of_birth: "1985-05-15",
    role: "hotel_owner",
    password: "owner123",
  },
  {
    name: "Customer User",
    email: "customer@example.com",
    phone_number: "0901234569",
    gender: "female",
    date_of_birth: "1995-10-20",
    role: "customer",
    password: "customer123",
  },
];

const mockDestinations = [
  {
    name: "Nha Trang",
    location: "Khánh Hòa, Việt Nam",
    description: "Thành phố biển xinh đẹp với bãi biển trắng và nước biển trong xanh",
    thumbnail: "https://images.unsplash.com/photo-1559827260-dc66d52bef19",
    type: "beach",
    rating: 5,
    latitude: 12.2388,
    longitude: 109.1967,
    transportation: "Máy bay, Xe khách, Tàu hỏa",
    entry_fee: 0,
  },
  {
    name: "Đà Lạt",
    location: "Lâm Đồng, Việt Nam",
    description: "Thành phố ngàn hoa với khí hậu mát mẻ quanh năm",
    thumbnail: "https://images.unsplash.com/photo-1528127269322-539801943592",
    type: "mountain",
    rating: 5,
    latitude: 11.9404,
    longitude: 108.4583,
    transportation: "Máy bay, Xe khách",
    entry_fee: 0,
  },
  {
    name: "Vịnh Hạ Long",
    location: "Quảng Ninh, Việt Nam",
    description: "Di sản thiên nhiên thế giới với vịnh biển tuyệt đẹp",
    thumbnail: "https://images.unsplash.com/photo-1528127269322-539801943592",
    type: "nature",
    rating: 5,
    latitude: 20.9101,
    longitude: 107.1839,
    transportation: "Xe khách, Xe riêng",
    entry_fee: 250000,
  },
];

const mockRoomTypes = [
  {
    hotelName: "Elegance Luxury Hotel & Spa",
    type: "Deluxe Room",
    availability: true,
    max_guests: 2,
    description: "Phòng Deluxe rộng rãi với view thành phố tuyệt đẹp",
    basic_price: 2500000,
    quantity: 10,
  },
  {
    hotelName: "Elegance Luxury Hotel & Spa",
    type: "Suite Room",
    availability: true,
    max_guests: 4,
    description: "Suite sang trọng với phòng khách riêng",
    basic_price: 4500000,
    quantity: 5,
  },
  {
    hotelName: "Seaside Paradise Resort",
    type: "Ocean View Room",
    availability: true,
    max_guests: 2,
    description: "Phòng view biển tuyệt đẹp",
    basic_price: 3200000,
    quantity: 15,
  },
  {
    hotelName: "Modern City Hotel",
    type: "Standard Room",
    availability: true,
    max_guests: 2,
    description: "Phòng tiêu chuẩn tiện nghi",
    basic_price: 1800000,
    quantity: 20,
  },
];

async function seedData() {
  try {
    console.log('🌱 Starting to seed data...');

    // 1. Seed Users
    console.log('\n📝 Seeding Users...');
    for (const userData of mockUsers) {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      await User.findOrCreate({
        where: { email: userData.email },
        defaults: {
          ...userData,
          password: hashedPassword,
        },
      });
    }
    console.log('✅ Users seeded');

    // Get hotel owner ID for hotels
    const hotelOwner = await User.findOne({ where: { role: 'hotel_owner' } });

    // 2. Seed Destinations
    console.log('\n🏖️ Seeding Destinations...');
    for (const dest of mockDestinations) {
      await Destination.findOrCreate({
        where: { name: dest.name },
        defaults: dest,
      });
    }
    console.log('✅ Destinations seeded');

    // 3. Seed Hotels
    console.log('\n🏨 Seeding Hotels...');
    for (const hotelData of mockHotels) {
      await Hotel.findOrCreate({
        where: { name: hotelData.name },
        defaults: {
          ...hotelData,
          hotel_owner: hotelOwner.user_id,
        },
      });
    }
    console.log('✅ Hotels seeded');

    // 4. Seed Room Types with Prices
    console.log('\n🛏️ Seeding Room Types and Prices...');
    for (const rtData of mockRoomTypes) {
      const hotel = await Hotel.findOne({ where: { name: rtData.hotelName } });
      if (hotel) {
        const [roomType, created] = await RoomType.findOrCreate({
          where: { 
            hotel_id: hotel.hotel_id,
            type: rtData.type 
          },
          defaults: {
            hotel_id: hotel.hotel_id,
            type: rtData.type,
            availability: rtData.availability,
            max_guests: rtData.max_guests,
            description: rtData.description,
            quantity: rtData.quantity,
          },
        });

        // Seed RoomPrice for this RoomType
        await RoomPrice.findOrCreate({
          where: { type_id: roomType.type_id },
          defaults: {
            type_id: roomType.type_id,
            basic_price: rtData.basic_price,
            discount: 0,
          },
        });
      }
    }
    console.log('✅ Room Types and Prices seeded');

    // 5. Seed Rooms
    console.log('\n🚪 Seeding Rooms...');
    const roomTypes = await RoomType.findAll();
    for (const roomType of roomTypes) {
      // Create 5 rooms for each room type
      for (let i = 1; i <= 5; i++) {
        await Room.findOrCreate({
          where: {
            type_id: roomType.type_id,
            name: `${roomType.type} - ${String(i).padStart(3, '0')}`,
          },
          defaults: {
            type_id: roomType.type_id,
            name: `${roomType.type} - ${String(i).padStart(3, '0')}`,
            location: `Tầng ${Math.ceil(i / 2)}`,
            status: 1, // Available
            number_of_single_beds: roomType.max_guests === 2 ? 2 : 0,
            number_of_double_beds: roomType.max_guests === 4 ? 2 : 1,
            room_view: 'City View',
            room_size: 30 + (i * 5),
            notes: 'Phòng đã được vệ sinh',
          },
        });
      }
    }
    console.log('✅ Rooms seeded');

    console.log('\n🎉 All data seeded successfully!');
    console.log('\n📊 Summary:');
    console.log(`- Users: ${await User.count()}`);
    console.log(`- Destinations: ${await Destination.count()}`);
    console.log(`- Hotels: ${await Hotel.count()}`);
    console.log(`- Room Types: ${await RoomType.count()}`);
    console.log(`- Room Prices: ${await RoomPrice.count()}`);
    console.log(`- Rooms: ${await Room.count()}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

// Run the seeder
seedData();
