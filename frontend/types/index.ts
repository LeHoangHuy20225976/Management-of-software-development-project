/**
 * TypeScript Type Definitions
 */

// Re-export auth types
export * from './auth';

export interface Hotel {
  // Database fields
  hotel_id: number;
  hotel_owner: number;
  name: string;
  address: string;
  status: number; // 1 = Active, 0 = Inactive
  rating: number;
  longitude: number;
  latitude: number;
  description: string;
  contact_phone: string;
  thumbnail: string;
  // Sequelize timestamps
  createdAt?: string;
  updatedAt?: string;
  // Frontend-only fields (computed/extended)
  slug?: string;
  stars?: number;
  city?: string;
  district?: string;
  images?: string[];
  basePrice?: number;
  amenities?: string[];
  facilities?: Array<{
    facility_id: number;
    name: string;
  }>;
  reviewCount?: number;
  policies?: {
    checkIn?: string;
    checkOut?: string;
    cancellation?: string;
  };
}

export interface RoomType {
  // Database fields
  type_id: number;
  hotel_id: number;
  type: string;
  availability: boolean;
  max_guests: number;
  description: string;
  quantity: number;
  // Sequelize timestamps
  createdAt?: string;
  updatedAt?: string;
  // Backend-added fields
  services?: Array<{
    service_id: number;
    name: string;
  }>;
  // Frontend-only fields (computed/extended)
  id?: string;
  hotelId?: string;
  name?: string;
  size?: number;
  beds?: string;
  basePrice?: number;
  images?: string[];
  amenities?: string[];
  available?: number;
}

export interface Room {
  room_id: number;
  type_id: number;
  name: string;
  location: string;
  status: number; // 1 = Active, 0 = Inactive
  estimated_available_time: string | null;
  number_of_single_beds: number;
  number_of_double_beds: number;
  room_view: string;
  room_size: number;
  notes: string | null;
  // Sequelize timestamps
  createdAt?: string;
  updatedAt?: string;
}

export interface Destination {
  // Database fields
  destination_id: number;
  name: string;
  rating: number;
  location: string;
  transportation: string;
  entry_fee: number;
  description: string;
  latitude: number;
  longitude: number;
  type: string;
  thumbnail: string;
  // Sequelize timestamps
  createdAt?: string;
  updatedAt?: string;
  // Frontend-only fields
  slug?: string;
  category?: string;
  fullDescription?: string;
  images?: string[];
  visitCount?: number;
  tags?: string[];
}

// Keep old name as alias for backward compatibility
export type TourismSpot = Destination;

export interface Review {
  // Database fields
  review_id: number;
  user_id: number;
  destination_id: number | null;
  hotel_id: number | null;
  room_id: number | null;
  rating: number; // 1-5
  comment: string;
  date_created: string;
  // Sequelize timestamps
  createdAt?: string;
  updatedAt?: string;
  // Frontend-only fields
  userName?: string;
  userAvatar?: string;
  title?: string;
  images?: string[];
  helpful?: number;
  verified?: boolean;
  hotelName?: string;
  hotelImage?: string;
  destinationName?: string;
  destinationImage?: string;
  reply?: {
    content: string;
    date: string;
    authorName: string;
  };
  replied?: boolean;
}

export interface Booking {
  // Database fields
  booking_id: number;
  user_id: number | null;
  room_id: number;
  status: string; // Backend uses STRING, common values: 'accepted' | 'pending' | 'rejected' | 'cancel requested' | 'cancelled' | 'maintained' | 'checked_in' | 'checked_out'
  total_price: number | null;
  check_in_date: string;
  check_out_date: string;
  created_at: string;
  people: number | null;
  // Sequelize timestamps
  createdAt?: string;
  updatedAt?: string;
  // Frontend-only fields
  hotelName?: string;
  hotelImage?: string;
  roomType?: string;
  nights?: number;
  paymentStatus?: 'pending' | 'paid' | 'refunded';
  paymentMethod?: string;
  note?: string;
  guestName?: string;
  guestPhone?: string;
  guestEmail?: string;
}

export interface User {
  // Database fields
  user_id: number;
  name: string | null;
  email: string | null;
  phone_number: string | null;
  gender: string | null; // 'male' | 'female' | 'Nam' | 'Nữ' or null
  date_of_birth: string | null;
  role: 'customer' | 'hotel_manager' | 'admin' | null;
  password: string;
  profile_image: string | null;
  // Sequelize timestamps
  createdAt?: string;
  updatedAt?: string;
  // Frontend-only fields
  memberSince?: string;
  totalBookings?: number;
  points?: number;
}

// Frontend-only utility types
export interface SearchFilters {
  location?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  stars?: number[];
  sortBy?: 'price' | 'rating' | 'popularity';
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// New types based on database schema

export interface RoomPrice {
  price_id: number;
  type_id: number;
  start_date: string | null;
  end_date: string | null;
  special_price: number | null;
  event: string | null;
  basic_price: number;
  discount: number;
  // Sequelize timestamps
  createdAt?: string;
  updatedAt?: string;
}

export interface RoomLog {
  log_id: number;
  room_id: number;
  event_type: string; // Backend uses STRING, common values: 'BOOK_CREATED' | 'BOOK_CANCELLED' | 'BOOK_CHECKIN' | 'BOOK_CHECKOUT' | 'MAINTAIN_START' | 'MAINTAIN_END'
  extra_context: string | null;
  created_at: string;
}

export interface LovingList {
  // Composite primary key (no auto-increment id)
  user_id: number;
  destination_id: number | null;
  hotel_id: number | null;
}

export interface HotelFacility {
  facility_id: number;
  name: string;
}

export interface FacilityPossessing {
  facility_id: number;
  hotel_id: number;
  description: string | null;
}

export interface RoomService {
  service_id: number;
  name: string;
}

export interface ServicePossessing {
  service_id: number;
  type_id: number;
  description: string | null;
}

export interface Image {
  image_id: number;
  destination_id: number | null;
  hotel_id: number | null;
  room_id: number | null;
  image_url: string;
}

// Payment type based on backend model
export interface Payment {
  payment_id: number;
  booking_id: number;
  amount: number;
  payment_method: string; // Backend uses STRING, common values: 'vnpay' | 'momo' | 'cash' | 'bank_transfer'
  status: string; // Backend uses STRING, common values: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' | 'cancelled'
  vnp_txn_ref: string | null;
  vnp_transaction_no: string | null;
  vnp_response_code: string | null;
  vnp_bank_code: string | null;
  vnp_pay_date: string | null;
  vnp_order_info: string | null;
  payment_url: string | null;
  ip_address: string | null;
  created_at: string;
  updated_at: string;
}

// Coupon / Voucher type for discount codes
export interface Coupon {
  coupon_id: number;
  code: string;
  description?: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrder: number;
  maxDiscount?: number;
  expiryDate: string;
  usageCount?: number;
  maxUsage?: number;
  // Legacy fields for backward compatibility
  id?: string;
  discount?: number;
  hotelId?: string;
  hotelName?: string;
  minBookingAmount?: number;
  usageLimit?: number;
  usedCount?: number;
}

// Admin Types
export interface AdminDashboard {
  // Frontend format (for backward compatibility)
  totalUsers: number;
  totalHotels: number;
  totalBookings: number;
  totalRevenue: number;
  pendingHotels: number;
  activeHotels: number;
  activeBookings: number;
  todayBookings: number;
  todayRevenue: number;
  recentActivity: AdminActivity[];
  revenueChart?: {
    labels: string[];
    data: number[];
  };
  bookingKPIs?: {
    totalBookings: number;
    confirmedBookings: number;
    cancelledBookings: number;
    pendingBookings: number;
    completedBookings: number;
    conversionRate: number;
    averageBookingValue: number;
  };
}

// Backend response structure
export interface AdminDashboardResponse {
  metrics: {
    users: {
      total: number;
      byRole: {
        hotel_manager: number;
        admin: number;
        customer: number;
      };
    };
    hotels: {
      total: number;
      active: number;
      pending: number;
      byStatus: Record<string, number>;
    };
    bookings: {
      total: number;
      byStatus: Record<string, number>;
    };
    rooms: {
      total: number;
      active: number;
    };
    revenue: {
      total: number;
      formatted: string;
    };
  };
}

export interface AdminActivity {
  id: number;
  type: 'booking' | 'hotel' | 'user' | 'payment' | 'review';
  description: string;
  timestamp: string;
  userId?: number;
  userName?: string;
  hotelId?: number;
  hotelName?: string;
}

export interface AdminUser extends User {
  bookingCount?: number;
  totalSpent?: number;
  lastLogin?: string;
  status?: 'active' | 'inactive' | 'blocked';
  lastActivity?: string;
  totalOrders?: number;
  averageOrderValue?: number;
}

export interface AdminHotel extends Hotel {
  approvalStatus?: 'pending' | 'approved' | 'locked' | 'rejected';
  approvedAt?: string;
  approvedBy?: number;
  rejectedReason?: string;
  ownerEmail?: string;
  ownerPhone?: string;
}

export interface RevenueMetrics {
  totalRevenue: number;
  thisMonthRevenue: number;
  lastMonthRevenue: number;
  growth: number;
  dailyRevenue: {
    date: string;
    revenue: number;
  }[];
  topHotels: {
    hotel_id: number;
    hotel_name: string;
    revenue: number;
    bookings: number;
  }[];
}
