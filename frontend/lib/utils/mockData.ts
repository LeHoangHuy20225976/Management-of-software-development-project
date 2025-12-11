/**
 * Mock Data System using LocalStorage
 * Simulates a full backend with diverse data for testing
 */

import type { User, Booking, Review, Hotel, RoomType, TourismSpot, Coupon } from '@/types';
import { mockTourismSpots, mockRoomTypes } from '../mock/data';

// Increment this to force refresh seeded mock data in localStorage
const MOCK_DATA_VERSION = '4';

const normalizeHotel = (hotel: any, index: number): Hotel => ({
  hotel_id: hotel.hotel_id ?? Number((hotel.id ?? index + 1).toString().replace(/\D/g, '') || index + 1),
  hotel_owner: hotel.hotel_owner ?? 1,
  name: hotel.name ?? 'Khách sạn chưa đặt tên',
  address: hotel.address ?? [hotel.city, hotel.district].filter(Boolean).join(', ') ?? '',
  status: typeof hotel.status === 'number' ? hotel.status : 1,
  rating: typeof hotel.rating === 'number' ? hotel.rating : 0,
  longitude: typeof hotel.longitude === 'number' ? hotel.longitude : 0,
  latitude: typeof hotel.latitude === 'number' ? hotel.latitude : 0,
  description: hotel.description ?? '',
  contact_phone: hotel.contact_phone ?? hotel.phone ?? '0123 456 789',
  thumbnail: hotel.thumbnail ?? hotel.images?.[0] ?? '',
  ...hotel,
});

const normalizeTourismSpot = (spot: any, index: number): TourismSpot => ({
  destination_id: spot.destination_id ?? Number((spot.id ?? index + 1).toString().replace(/\D/g, '') || index + 1),
  name: spot.name ?? 'Điểm đến chưa đặt tên',
  rating: typeof spot.rating === 'number' ? spot.rating : 0,
  location: spot.location ?? '',
  transportation: spot.transportation ?? 'Tự túc',
  entry_fee: typeof spot.entry_fee === 'number' ? spot.entry_fee : 0,
  description: spot.description ?? spot.fullDescription ?? '',
  latitude: typeof spot.latitude === 'number' ? spot.latitude : 0,
  longitude: typeof spot.longitude === 'number' ? spot.longitude : 0,
  type: spot.type ?? spot.category ?? 'Đang cập nhật',
  thumbnail: spot.thumbnail ?? spot.images?.[0] ?? '',
  ...spot,
});

// Force reinitialize (useful when updating mock data structure)
export const forceReinitializeMockData = () => {
  clearMockData();
  initializeMockData();
};

const defaultRoomTypesByHotel = (): Record<string, RoomType[]> => ({
  h1: (mockRoomTypes['1'] || []).map((room, idx) => ({
    ...room,
    id: room.id ? `h1-${room.id}` : `h1-r${idx + 1}`,
    hotelId: 'h1',
  })),
  h2: (mockRoomTypes['2'] || []).map((room, idx) => ({
    ...room,
    id: room.id ? `h2-${room.id}` : `h2-r${idx + 1}`,
    hotelId: 'h2',
  })),
  h3: (mockRoomTypes['1'] || []).map((room, idx) => ({
    ...room,
    id: room.id ? `h3-${room.id}` : `h3-r${idx + 1}`,
    hotelId: 'h3',
  })),
});

// Initialize mock data in localStorage
export const initializeMockData = () => {
  const alreadyInitialized = localStorage.getItem('mockDataInitialized') === 'true';
  const currentVersion = localStorage.getItem('mockDataVersion');
  const shouldRefreshData = currentVersion !== MOCK_DATA_VERSION;

  if (!alreadyInitialized || shouldRefreshData) {
    // Clean old data if structure/version changed
    if (shouldRefreshData) {
      clearMockData();
    }
    // User Profile
    const mockUser: User = {
      user_id: 1,
      email: 'nguyen.van.a@gmail.com',
      name: 'Nguyễn Văn A',
      phone_number: '0901234567',
      gender: 'male',
      date_of_birth: '1990-01-15',
      role: 'customer',
      profile_image: 'https://i.pravatar.cc/150?u=user001',
      memberSince: '2023-01-15',
      totalBookings: 12,
      points: 450,
    };
    localStorage.setItem('currentUser', JSON.stringify(mockUser));

    // Hotels - Diverse data across Vietnam
    const mockHotels = [
      {
        id: 'h1',
        name: 'Grand Hotel Saigon',
        slug: 'grand-hotel-saigon',
        description: 'Khách sạn 5 sao sang trọng tại trung tâm Sài Gòn với thiết kế hiện đại, view toàn cảnh thành phố. Gần các điểm tham quan như Nhà hát Thành phố, Phố đi bộ Nguyễn Huệ.',
        stars: 5,
        address: '123 Đường Nguyễn Huệ',
        city: 'Hồ Chí Minh',
        district: 'Quận 1',
        images: [
          'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
          'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800',
          'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800',
        ],
        thumbnail: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400',
        basePrice: 2000000,
        amenities: ['pool', 'gym', 'spa', 'restaurant', 'wifi', 'parking', 'bar', 'concierge'],
        rating: 4.8,
        reviewCount: 324,
        latitude: 10.7769,
        longitude: 106.7009,
        policies: {
          checkIn: '14:00',
          checkOut: '12:00',
          cancellation: 'Miễn phí hủy trước 24 giờ',
        },
      },
      {
        id: 'h2',
        name: 'Hanoi Pearl Hotel',
        slug: 'hanoi-pearl-hotel',
        description: 'Khách sạn boutique sang trọng nằm trong khu phố cổ Hà Nội, gần Hồ Hoàn Kiếm. Thiết kế kết hợp giữa phong cách cổ điển và hiện đại.',
        stars: 4,
        address: '45 Hàng Bông',
        city: 'Hà Nội',
        district: 'Hoàn Kiếm',
        images: [
          'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800',
          'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800',
          'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800',
        ],
        thumbnail: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=400',
        basePrice: 1500000,
        amenities: ['wifi', 'restaurant', 'bar', 'concierge', 'parking'],
        rating: 4.5,
        reviewCount: 156,
        latitude: 21.0285,
        longitude: 105.8542,
        policies: {
          checkIn: '14:00',
          checkOut: '12:00',
          cancellation: 'Miễn phí hủy trước 48 giờ',
        },
      },
      {
        id: 'h3',
        name: 'Da Nang Beach Resort',
        slug: 'da-nang-beach-resort',
        description: 'Resort 5 sao view biển tuyệt đẹp với bãi biển riêng, hồ bơi vô cực và các dịch vụ spa cao cấp. Lý tưởng cho kỳ nghỉ gia đình và honeymoon.',
        stars: 5,
        address: 'Đường Võ Nguyên Giáp',
        city: 'Đà Nẵng',
        district: 'Ngũ Hành Sơn',
        images: [
          'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800',
          'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800',
          'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800',
        ],
        thumbnail: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400',
        basePrice: 3500000,
        amenities: ['pool', 'gym', 'spa', 'restaurant', 'wifi', 'beach', 'bar', 'concierge'],
        rating: 4.9,
        reviewCount: 487,
        latitude: 16.0471,
        longitude: 108.2068,
        policies: {
          checkIn: '15:00',
          checkOut: '11:00',
          cancellation: 'Miễn phí hủy trước 72 giờ',
        },
      },
      {
        id: 'h4',
        name: 'Nha Trang Seaside Hotel',
        slug: 'nha-trang-seaside-hotel',
        description: 'Khách sạn 4 sao ven biển Nha Trang với view biển tuyệt đẹp. Gần chợ Đầm, Vinpearl Land và các điểm du lịch nổi tiếng.',
        stars: 4,
        address: '88 Trần Phú',
        city: 'Nha Trang',
        district: 'Trung tâm',
        images: [
          'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800',
          'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800',
        ],
        thumbnail: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=400',
        basePrice: 1800000,
        amenities: ['pool', 'gym', 'restaurant', 'wifi', 'beach', 'parking'],
        rating: 4.6,
        reviewCount: 278,
        latitude: 12.2388,
        longitude: 109.1967,
        policies: {
          checkIn: '14:00',
          checkOut: '12:00',
          cancellation: 'Miễn phí hủy trước 24 giờ',
        },
      },
      {
        id: 'h5',
        name: 'Dalat Palace Heritage Hotel',
        slug: 'dalat-palace-heritage-hotel',
        description: 'Khách sạn di sản 5 sao với kiến trúc Pháp cổ điển, nằm bên hồ Xuân Hương. Không gian lãng mạn, lý tưởng cho các cặp đôi.',
        stars: 5,
        address: '2 Trần Phú',
        city: 'Đà Lạt',
        district: 'Trung tâm',
        images: [
          'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800',
          'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800',
        ],
        thumbnail: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400',
        basePrice: 2800000,
        amenities: ['restaurant', 'wifi', 'spa', 'bar', 'concierge', 'parking'],
        rating: 4.7,
        reviewCount: 195,
        latitude: 11.9404,
        longitude: 108.4583,
        policies: {
          checkIn: '14:00',
          checkOut: '12:00',
          cancellation: 'Miễn phí hủy trước 48 giờ',
        },
      },
      {
        id: 'h6',
        name: 'Phu Quoc Paradise Resort',
        slug: 'phu-quoc-paradise-resort',
        description: 'Resort nghỉ dưỡng 5 sao trên đảo ngọc Phú Quốc với bãi biển riêng tuyệt đẹp, villa sang trọng và các hoạt động thể thao nước.',
        stars: 5,
        address: 'Bãi Trường',
        city: 'Phú Quốc',
        district: 'Dương Đông',
        images: [
          'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800',
          'https://images.unsplash.com/photo-1559599746-8f29ad814c12?w=800',
        ],
        thumbnail: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400',
        basePrice: 4200000,
        amenities: ['pool', 'gym', 'spa', 'restaurant', 'wifi', 'beach', 'bar'],
        rating: 4.8,
        reviewCount: 412,
        latitude: 10.2223,
        longitude: 103.9674,
        policies: {
          checkIn: '15:00',
          checkOut: '11:00',
          cancellation: 'Miễn phí hủy trước 72 giờ',
        },
      },
      {
        id: 'h7',
        name: 'Hoi An Ancient House',
        slug: 'hoi-an-ancient-house',
        description: 'Khách sạn boutique trong lòng phố cổ Hội An, thiết kế truyền thống kết hợp hiện đại. Gần chợ đêm và Cầu Nhật Bản.',
        stars: 4,
        address: '35 Nguyễn Thái Học',
        city: 'Hội An',
        district: 'Phố cổ',
        images: [
          'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800',
          'https://images.unsplash.com/photo-1587985064135-0366536eab42?w=800',
        ],
        thumbnail: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400',
        basePrice: 1200000,
        amenities: ['wifi', 'restaurant', 'pool', 'concierge'],
        rating: 4.7,
        reviewCount: 203,
        latitude: 15.8801,
        longitude: 108.3380,
        policies: {
          checkIn: '14:00',
          checkOut: '12:00',
          cancellation: 'Miễn phí hủy trước 24 giờ',
        },
      },
      {
        id: 'h8',
        name: 'Halong Bay Cruise Hotel',
        slug: 'halong-bay-cruise-hotel',
        description: 'Khách sạn du thuyền sang trọng tại Vịnh Hạ Long. Trải nghiệm nghỉ dưỡng độc đáo giữa di sản thiên nhiên thế giới.',
        stars: 5,
        address: 'Bãi Cháy',
        city: 'Hạ Long',
        district: 'Quảng Ninh',
        images: [
          'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800',
          'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800',
        ],
        thumbnail: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400',
        basePrice: 3800000,
        amenities: ['restaurant', 'wifi', 'spa', 'bar', 'concierge'],
        rating: 4.9,
        reviewCount: 567,
        latitude: 20.9594,
        longitude: 107.0431,
        policies: {
          checkIn: '13:00',
          checkOut: '11:00',
          cancellation: 'Miễn phí hủy trước 72 giờ',
        },
      },
      {
        id: 'h9',
        name: 'Can Tho Riverside Hotel',
        slug: 'can-tho-riverside-hotel',
        description: 'Khách sạn 4 sao bên bờ sông Hậu với view chợ nổi Cái Răng. Điểm xuất phát lý tưởng để khám phá miền Tây.',
        stars: 4,
        address: '38 Hải Bà Trưng',
        city: 'Cần Thơ',
        district: 'Ninh Kiều',
        images: [
          'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800',
          'https://images.unsplash.com/photo-1587985064135-0366536eab42?w=800',
        ],
        thumbnail: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=400',
        basePrice: 1400000,
        amenities: ['pool', 'restaurant', 'wifi', 'gym', 'parking'],
        rating: 4.4,
        reviewCount: 167,
        latitude: 10.0452,
        longitude: 105.7469,
        policies: {
          checkIn: '14:00',
          checkOut: '12:00',
          cancellation: 'Miễn phí hủy trước 24 giờ',
        },
      },
      {
        id: 'h10',
        name: 'Sapa Mountain View Lodge',
        slug: 'sapa-mountain-view-lodge',
        description: 'Khách sạn 3 sao view núi non hùng vĩ và ruộng bậc thang. Gần chợ tình Sapa và điểm leo núi Fansipan.',
        stars: 3,
        address: '22 Mường Hoa',
        city: 'Sapa',
        district: 'Lào Cai',
        images: [
          'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800',
          'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800',
        ],
        thumbnail: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400',
        basePrice: 900000,
        amenities: ['wifi', 'restaurant', 'parking', 'concierge'],
        rating: 4.3,
        reviewCount: 142,
        latitude: 22.3364,
        longitude: 103.8438,
        policies: {
          checkIn: '14:00',
          checkOut: '12:00',
          cancellation: 'Miễn phí hủy trước 24 giờ',
        },
      },
    ].map((hotel, index) => normalizeHotel(hotel, index));
    localStorage.setItem('hotels', JSON.stringify(mockHotels));

    // Bookings with diverse statuses
    const mockBookings: Booking[] = [
      {
        booking_id: 1,
        user_id: 1,
        room_id: 1,
        hotelName: 'Grand Hotel Saigon',
        hotelImage: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400',
        roomType: 'Deluxe Room',
        check_in_date: '2025-12-20',
        check_out_date: '2025-12-23',
        nights: 3,
        people: 2,
        total_price: 6900000,
        status: 'accepted',
        created_at: '2025-12-01',
        paymentStatus: 'paid',
        paymentMethod: 'Thẻ tín dụng',
      },
      {
        booking_id: 2,
        user_id: 1,
        room_id: 2,
        hotelName: 'Da Nang Beach Resort',
        hotelImage: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400',
        roomType: 'Ocean View Suite',
        check_in_date: '2026-01-15',
        check_out_date: '2026-01-18',
        nights: 3,
        people: 4,
        total_price: 12075000,
        status: 'accepted',
        created_at: '2025-11-28',
        paymentStatus: 'paid',
        paymentMethod: 'Chuyển khoản',
      },
      {
        booking_id: 3,
        user_id: 1,
        room_id: 3,
        hotelName: 'Hanoi Pearl Hotel',
        hotelImage: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=400',
        roomType: 'Superior Room',
        check_in_date: '2025-11-10',
        check_out_date: '2025-11-12',
        nights: 2,
        people: 2,
        total_price: 3450000,
        status: 'maintained',
        created_at: '2025-10-25',
        paymentStatus: 'paid',
        paymentMethod: 'Thẻ tín dụng',
      },
      {
        booking_id: 4,
        user_id: 1,
        room_id: 1,
        hotelName: 'Grand Hotel Saigon',
        hotelImage: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400',
        roomType: 'Premium Room',
        check_in_date: '2025-10-15',
        check_out_date: '2025-10-17',
        nights: 2,
        people: 2,
        total_price: 5520000,
        status: 'maintained',
        created_at: '2025-09-30',
        paymentStatus: 'paid',
        paymentMethod: 'Tiền mặt',
      },
      {
        booking_id: 5,
        user_id: 1,
        room_id: 2,
        hotelName: 'Da Nang Beach Resort',
        hotelImage: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400',
        roomType: 'Family Suite',
        check_in_date: '2025-09-20',
        check_out_date: '2025-09-25',
        nights: 5,
        people: 4,
        total_price: 20125000,
        status: 'maintained',
        created_at: '2025-08-15',
        paymentStatus: 'paid',
        paymentMethod: 'Thẻ tín dụng',
      },
      {
        booking_id: 6,
        user_id: 1,
        room_id: 3,
        hotelName: 'Hanoi Pearl Hotel',
        hotelImage: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=400',
        roomType: 'Deluxe Room',
        check_in_date: '2025-08-10',
        check_out_date: '2025-08-13',
        nights: 3,
        people: 2,
        total_price: 5175000,
        status: 'maintained',
        created_at: '2025-07-20',
        paymentStatus: 'paid',
        paymentMethod: 'Chuyển khoản',
      },
      {
        booking_id: 7,
        user_id: 1,
        room_id: 1,
        hotelName: 'Grand Hotel Saigon',
        hotelImage: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400',
        roomType: 'Standard Room',
        check_in_date: '2025-07-05',
        check_out_date: '2025-07-07',
        nights: 2,
        people: 1,
        total_price: 3680000,
        status: 'cancelled',
        created_at: '2025-06-20',
        paymentStatus: 'refunded',
        paymentMethod: 'Thẻ tín dụng',
      },
      {
        booking_id: 8,
        user_id: 1,
        room_id: 2,
        hotelName: 'Da Nang Beach Resort',
        hotelImage: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400',
        roomType: 'Beach Villa',
        check_in_date: '2025-06-01',
        check_out_date: '2025-06-04',
        nights: 3,
        people: 2,
        total_price: 15525000,
        status: 'maintained',
        created_at: '2025-05-10',
        paymentStatus: 'paid',
        paymentMethod: 'Thẻ tín dụng',
      },
    ];
    localStorage.setItem('userBookings', JSON.stringify(mockBookings));

    // Reviews
    const mockReviews: Review[] = [
      {
        review_id: 1,
        hotel_id: 1,
        destination_id: null,
        room_id: null,
        user_id: 1,
        userName: 'Nguyễn Văn A',
        userAvatar: 'https://i.pravatar.cc/150?u=user001',
        rating: 5,
        title: 'Trải nghiệm tuyệt vời!',
        comment: 'Khách sạn rất đẹp, phòng sạch sẽ, nhân viên thân thiện. View từ phòng nhìn ra thành phố rất đẹp. Bữa sáng buffet đa dạng và ngon. Chắc chắn sẽ quay lại!',
        images: [],
        date_created: '2025-10-20',
        helpful: 12,
        verified: true,
      },
      {
        review_id: 2,
        hotel_id: 2,
        destination_id: null,
        room_id: null,
        user_id: 1,
        userName: 'Nguyễn Văn A',
        userAvatar: 'https://i.pravatar.cc/150?u=user001',
        rating: 4,
        title: 'Tốt nhưng có thể cải thiện',
        comment: 'Vị trí khách sạn thuận tiện, gần phố cổ. Phòng đẹp và sạch sẽ. Tuy nhiên wifi hơi chậm, hy vọng khách sạn sẽ cải thiện điểm này.',
        images: [],
        date_created: '2025-11-15',
        helpful: 5,
        verified: true,
      },
      {
        review_id: 3,
        hotel_id: 3,
        destination_id: null,
        room_id: null,
        user_id: 1,
        userName: 'Nguyễn Văn A',
        userAvatar: 'https://i.pravatar.cc/150?u=user001',
        rating: 5,
        title: 'Hoàn hảo cho kỳ nghỉ gia đình',
        comment: 'Resort view biển tuyệt đẹp! Hồ bơi rộng rãi, bãi biển riêng sạch sẽ. Con tôi rất thích khu vui chơi trẻ em. Staff nhiệt tình và chu đáo.',
        images: [],
        date_created: '2025-09-28',
        helpful: 18,
        verified: true,
      },
    ];
    localStorage.setItem('userReviews', JSON.stringify(mockReviews));

    // Coupons
    const mockCoupons: Coupon[] = [
      {
        id: 'coupon1',
        code: 'WELCOME15',
        hotelId: 'h1',
        hotelName: 'Grand Hotel Saigon',
        discount: 15,
        expiryDate: '2026-12-31',
      },
      {
        id: 'coupon2',
        code: 'DANANG20',
        hotelId: 'h3',
        hotelName: 'Da Nang Beach Resort',
        discount: 20,
        expiryDate: '2026-06-30',
      },
      {
        id: 'coupon3',
        code: 'HANOI10',
        hotelId: 'h2',
        hotelName: 'Hanoi Pearl Hotel',
        discount: 10,
        expiryDate: '2025-12-31',
      },
      {
        id: 'coupon4',
        code: 'LASTMINUTE',
        hotelId: 'h5',
        hotelName: 'Dalat Palace Heritage Hotel',
        discount: 25,
        expiryDate: '2025-12-20',
      },
    ];
    localStorage.setItem('userCoupons', JSON.stringify(mockCoupons));
  }

  if (!localStorage.getItem('tourismSpots')) {
    setMockTourismSpots(mockTourismSpots.map((spot, index) => normalizeTourismSpot(spot, index)));
  }

  if (!localStorage.getItem('roomTypes')) {
    setMockRoomTypes(defaultRoomTypesByHotel());
  }

  localStorage.setItem('mockDataInitialized', 'true');
  localStorage.setItem('mockDataVersion', MOCK_DATA_VERSION);
  console.log('✅ Mock data initialized successfully!');
};

// Helper functions to get data
export const getMockUser = (): User | null => {
  const data = localStorage.getItem('currentUser');
  return data ? JSON.parse(data) : null;
};

export const updateMockUser = (user: Partial<User>) => {
  const current = getMockUser();
  if (current) {
    const updated = { ...current, ...user };
    localStorage.setItem('currentUser', JSON.stringify(updated));
  }
};

export const getMockBookings = (): Booking[] => {
  const data = localStorage.getItem('userBookings');
  return data ? JSON.parse(data) : [];
};

export const setMockBookings = (bookings: Booking[]) => {
  localStorage.setItem('userBookings', JSON.stringify(bookings));
};

export const addMockBooking = (booking: Booking) => {
  const bookings = getMockBookings();
  bookings.unshift(booking);
  setMockBookings(bookings);
};

export const updateMockBooking = (id: number, updates: Partial<Booking>) => {
  const bookings = getMockBookings();
  const index = bookings.findIndex(b => b.booking_id === id);
  if (index !== -1) {
    bookings[index] = { ...bookings[index], ...updates };
    setMockBookings(bookings);
  }
};

export const getMockReviews = (): Review[] => {
  const data = localStorage.getItem('userReviews');
  return data ? JSON.parse(data) : [];
};

export const setMockReviews = (reviews: Review[]) => {
  localStorage.setItem('userReviews', JSON.stringify(reviews));
};

export const addMockReview = (review: Review) => {
  const reviews = getMockReviews();
  reviews.unshift(review);
  setMockReviews(reviews);
};

export const getMockHotels = (): Hotel[] => {
  const data = localStorage.getItem('hotels');
  const hotels = data ? JSON.parse(data) : [];
  return hotels.map((hotel: Hotel, index: number) => normalizeHotel(hotel, index));
};

export const getMockCoupons = (): Coupon[] => {
  const data = localStorage.getItem('userCoupons');
  return data ? JSON.parse(data) : [];
};

export const getMockTourismSpots = (): TourismSpot[] => {
  const data = localStorage.getItem('tourismSpots');
  const spots = data ? JSON.parse(data) : mockTourismSpots;
  return spots.map((spot: TourismSpot, index: number) => normalizeTourismSpot(spot, index));
};

export const setMockTourismSpots = (spots: TourismSpot[]) => {
  localStorage.setItem('tourismSpots', JSON.stringify(spots));
};

export const getMockRoomTypes = (): Record<string, RoomType[]> => {
  const data = localStorage.getItem('roomTypes');
  return data ? JSON.parse(data) : defaultRoomTypesByHotel();
};

export const setMockRoomTypes = (roomTypes: Record<string, RoomType[]>) => {
  localStorage.setItem('roomTypes', JSON.stringify(roomTypes));
};

export const getMockRoomTypesByHotel = (hotelId: string): RoomType[] => {
  const roomTypes = getMockRoomTypes();
  return roomTypes[hotelId] || [];
};

// Clear all mock data
export const clearMockData = () => {
  localStorage.removeItem('mockDataInitialized');
  localStorage.removeItem('mockDataVersion');
  localStorage.removeItem('currentUser');
  localStorage.removeItem('userBookings');
  localStorage.removeItem('userReviews');
  localStorage.removeItem('userCoupons');
  localStorage.removeItem('hotels');
  localStorage.removeItem('tourismSpots');
  localStorage.removeItem('roomTypes');
  console.log('🗑️ Mock data cleared!');
};
