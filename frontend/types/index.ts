/**
 * TypeScript Type Definitions
 */

// Re-export auth types
export * from './auth';

export interface Hotel {
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
  // Optional frontend fields
  slug?: string;
  stars?: number;
  city?: string;
  district?: string;
  images?: string[];
  basePrice?: number;
  amenities?: string[];
  reviewCount?: number;
  policies?: {
    checkIn: string;
    checkOut: string;
    cancellation: string;
  };
}

export interface RoomType {
  type_id: number;
  hotel_id: number;
  type: string;
  availability: boolean;
  max_guests: number;
  description: string;
  quantity: number;
  // Optional frontend fields
  size?: number;
  beds?: string;
  basePrice?: number;
  images?: string[];
  amenities?: string[];
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
}

export interface Destination {
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
  // Optional frontend fields
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
  review_id: number;
  user_id: number;
  destination_id: number | null;
  hotel_id: number | null;
  room_id: number | null;
  rating: number; // 1-5
  comment: string;
  date_created: string;
  // Optional frontend fields
  userName?: string;
  userAvatar?: string;
  title?: string;
  images?: string[];
  helpful?: number;
  verified?: boolean;
}

export interface Booking {
  booking_id: number;
  user_id: number | null;
  room_id: number;
  status: 'accepted' | 'pending' | 'rejected' | 'cancel requested' | 'cancelled' | 'maintained';
  total_price: number | null;
  check_in_date: string;
  check_out_date: string;
  created_at: string;
  people: number | null;
  // Optional frontend fields
  hotelName?: string;
  hotelImage?: string;
  roomType?: string;
  nights?: number;
  paymentStatus?: 'pending' | 'paid' | 'refunded';
  paymentMethod?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  avatar: string;
  memberSince: string;
  totalBookings: number;
  points: number;
}

export interface SearchFilters {
  location?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
  minPrice?: number;
  maxPrice?: number;
  stars?: number[];
  amenities?: string[];
  sortBy?: 'price' | 'rating' | 'popularity';
}

export interface Amenity {
  id: string;
  name: string;
  icon: string;
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

export interface Coupon {
  id: string;
  hotelId: string;
  hotelName: string;
  discount: number;
  expiryDate: string;
  code: string;
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
}

export interface RoomLog {
  log_id: number;
  room_id: number;
  event_type: 'BOOK_CREATED' | 'BOOK_CANCELLED' | 'BOOK_CHECKIN' | 'BOOK_CHECKOUT' | 'MAINTAIN_START' | 'MAINTAIN_END';
  extra_context: string | null;
  created_at: string;
}

export interface LovingList {
  id: number;
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
