/**
 * TypeScript Type Definitions
 */

export interface Hotel {
  id: string;
  name: string;
  slug: string;
  description: string;
  stars: number;
  address: string;
  city: string;
  district: string;
  images: string[];
  thumbnail: string;
  basePrice: number;
  amenities: string[];
  rating: number;
  reviewCount: number;
  latitude: number;
  longitude: number;
  policies: {
    checkIn: string;
    checkOut: string;
    cancellation: string;
  };
}

export interface RoomType {
  id: string;
  hotelId: string;
  name: string;
  description: string;
  size: number;
  maxGuests: number;
  beds: string;
  basePrice: number;
  images: string[];
  amenities: string[];
  available: number;
}

export interface TourismSpot {
  id: string;
  name: string;
  slug: string;
  category: string;
  description: string;
  fullDescription: string;
  location: string;
  images: string[];
  thumbnail: string;
  rating: number;
  visitCount: number;
  tags: string[];
}

export interface Review {
  id: string;
  hotelId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  rating: number;
  title: string;
  comment: string;
  images: string[];
  date: string;
  helpful: number;
  verified: boolean;
}

export interface Booking {
  id: string;
  userId: string;
  hotelId: string;
  hotelName: string;
  hotelImage: string;
  roomType: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  guests: number;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  bookingDate: string;
  paymentStatus: 'pending' | 'paid' | 'refunded';
  paymentMethod: string;
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
