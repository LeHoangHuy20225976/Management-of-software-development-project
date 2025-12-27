/**
 * API Services
 * Automatically switches between mock and real API based on API_CONFIG.USE_MOCK_DATA
 * Mock data is stored in localStorage for persistence
 */

import { API_CONFIG } from './config';
import { apiClient } from './client';
import {
  getMockUser,
  updateMockUser,
  initializeMockData,
} from '../utils/mockData';
import type { Hotel, TourismSpot, Review, Booking, User, SearchFilters, RoomType, Payment, Room, Destination, Image, Coupon } from '@/types';

// Helper to simulate API delay for mock data
const mockDelay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));

const ensureMockLayerReady = () => {
  if (typeof window === 'undefined') {
    return;
  }
  initializeMockData();
};

// ============= HOTELS API =============
export const hotelsApi = {
  async getAll(filters?: SearchFilters): Promise<Hotel[]> {
    return apiClient.get<Hotel[]>(API_CONFIG.ENDPOINTS.ALL_HOTELS);
  },

  async getById(id: string): Promise<Hotel | null> {
    return apiClient.get<Hotel>(API_CONFIG.ENDPOINTS.VIEW_HOTEL, { hotel_id: id });
  },

  async getBySlug(slug: string): Promise<Hotel | null> {
    return apiClient.get<Hotel>(`/hotels/slug/${slug}`);
  },

  async getRooms(hotelId: string): Promise<RoomType[]> {
    return apiClient.get<RoomType[]>(API_CONFIG.ENDPOINTS.VIEW_ALL_ROOMS, { hotel_id: hotelId });
  },

  async getReviews(hotelId: string): Promise<Review[]> {
    return apiClient.get<Review[]>(API_CONFIG.ENDPOINTS.ALL_REVIEWS, { hotel_id: hotelId });
  },
};

// ============= TOURISM API =============
export const tourismApi = {
  async getAll(): Promise<TourismSpot[]> {
    return apiClient.get<TourismSpot[]>(API_CONFIG.ENDPOINTS.ALL_DESTINATIONS);
  },

  async getById(id: string): Promise<TourismSpot | null> {
    return apiClient.get<TourismSpot>(API_CONFIG.ENDPOINTS.VIEW_DESTINATION, { destination_id: id });
  },

  async getBySlug(slug: string): Promise<TourismSpot | null> {
    return apiClient.get<TourismSpot>(`/tourism/slug/${slug}`);
  },
};

// ============= BOOKINGS API =============
export const bookingsApi = {
  async getAll(): Promise<Booking[]> {
    return apiClient.get<Booking[]>(API_CONFIG.ENDPOINTS.BOOKING_HISTORY);
  },

  async getById(id: string): Promise<Booking | null> {
    return apiClient.get<Booking>(API_CONFIG.ENDPOINTS.BOOKING_DETAILS, { id });
  },

  async create(bookingData: Partial<Booking>): Promise<Booking> {
    return apiClient.post<Booking>(API_CONFIG.ENDPOINTS.ADD_BOOKING, bookingData);
  },

  async cancel(id: string): Promise<boolean> {
    return apiClient.post<boolean>(API_CONFIG.ENDPOINTS.CANCEL_BOOKING, { id });
  },

  async update(id: string, bookingData: Partial<Booking>): Promise<Booking> {
    return apiClient.put<Booking>(API_CONFIG.ENDPOINTS.UPDATE_BOOKING, { id, ...bookingData });
  },

  async checkAvailability(data: { room_id: number; check_in_date: string; check_out_date: string }): Promise<{ available: boolean }> {
    return apiClient.post<{ available: boolean }>(API_CONFIG.ENDPOINTS.CHECK_AVAILABILITY, data);
  },

  async calculatePrice(data: { room_id: number; check_in_date: string; check_out_date: string; people: number }): Promise<{ total_price: number }> {
    return apiClient.post<{ total_price: number }>(API_CONFIG.ENDPOINTS.CALCULATE_PRICE, data);
  },
};

// ============= USER API =============
export const userApi = {
  async getProfile(): Promise<User> {
    return apiClient.get<User>(API_CONFIG.ENDPOINTS.VIEW_PROFILE);
  },

  async updateProfile(data: Partial<User>): Promise<User> {
    return apiClient.put<User>(API_CONFIG.ENDPOINTS.UPDATE_PROFILE, data);
  },

  // User notifications - KEEP MOCK (backend doesn't have this)
  async getNotifications(): Promise<any[]> {
    if (API_CONFIG.USE_MOCK_DATA) {
      await mockDelay();
      const notifications = localStorage.getItem('userNotifications');
      if (notifications) return JSON.parse(notifications);

      // Default mock notifications
      const defaultNotifications = [
        {
          id: 1,
          type: 'booking',
          title: 'Booking Confirmed',
          message: 'Your booking at Vinpearl Resort has been confirmed',
          timestamp: new Date().toISOString(),
          read: false,
        },
        {
          id: 2,
          type: 'payment',
          title: 'Payment Received',
          message: 'Payment of 2,500,000₫ received successfully',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          read: false,
        },
      ];
      localStorage.setItem('userNotifications', JSON.stringify(defaultNotifications));
      return defaultNotifications;
    }
    // When backend implements this, replace with:
    // return apiClient.get<any[]>(API_CONFIG.ENDPOINTS.USER_NOTIFICATIONS);
    return [];
  },

  async markNotificationRead(id: number): Promise<boolean> {
    if (API_CONFIG.USE_MOCK_DATA) {
      await mockDelay();
      const notifications = JSON.parse(localStorage.getItem('userNotifications') || '[]');
      const updated = notifications.map((n: any) =>
        n.id === id ? { ...n, read: true } : n
      );
      localStorage.setItem('userNotifications', JSON.stringify(updated));
      return true;
    }
    // When backend implements this, replace with:
    // return apiClient.post<boolean>(API_CONFIG.ENDPOINTS.MARK_NOTIFICATION_READ, { id });
    return true;
  },
};

// ============= REVIEWS API =============
export const reviewsApi = {
  async getAll(hotelId: string): Promise<Review[]> {
    return apiClient.get<Review[]>(API_CONFIG.ENDPOINTS.ALL_REVIEWS, { hotel_id: hotelId });
  },

  async create(reviewData: Partial<Review>): Promise<Review> {
    return apiClient.post<Review>(API_CONFIG.ENDPOINTS.ADD_REVIEW, reviewData);
  },

  async update(id: string, reviewData: Partial<Review>): Promise<Review> {
    return apiClient.put<Review>(API_CONFIG.ENDPOINTS.UPDATE_REVIEW, { review_id: id, ...reviewData });
  },

  async delete(id: string): Promise<boolean> {
    return apiClient.delete<boolean>(API_CONFIG.ENDPOINTS.DELETE_REVIEW, { review_id: id });
  },
};

// ============= COUPONS API =============
export const couponsApi = {
  async getAll(): Promise<Coupon[]> {
    if (API_CONFIG.USE_MOCK_DATA) {
      ensureMockLayerReady();
      await mockDelay();
      // Get coupons from localStorage or return default coupons
      const cached = localStorage.getItem('userCoupons');
      if (cached) {
        return JSON.parse(cached);
      }
      // Default coupons for mock
      const defaultCoupons: Coupon[] = [
        {
          coupon_id: 1,
          code: 'WELCOME2024',
          description: 'Giảm 10% cho đơn đặt phòng đầu tiên',
          discountType: 'percentage',
          discountValue: 10,
          minOrder: 500000,
          maxDiscount: 200000,
          expiryDate: '2025-03-31',
          usageCount: 0,
          maxUsage: 1,
        },
        {
          coupon_id: 2,
          code: 'NEWYEAR25',
          description: 'Giảm 500K cho đơn từ 2 triệu',
          discountType: 'fixed',
          discountValue: 500000,
          minOrder: 2000000,
          expiryDate: '2025-01-31',
          usageCount: 0,
          maxUsage: 2,
        },
        {
          coupon_id: 3,
          code: 'SUMMER2024',
          description: 'Giảm 15% cho kỳ nghỉ hè',
          discountType: 'percentage',
          discountValue: 15,
          minOrder: 1000000,
          maxDiscount: 500000,
          expiryDate: '2024-09-30',
          usageCount: 1,
          maxUsage: 1,
        },
      ];
      localStorage.setItem('userCoupons', JSON.stringify(defaultCoupons));
      return defaultCoupons;
    }

    // Real API - backend may need to implement this endpoint
    try {
      return await apiClient.get<Coupon[]>('/coupons/user');
    } catch {
      console.warn('Coupons API endpoint not available, returning empty array');
      return [];
    }
  },

  async validateCoupon(code: string, orderAmount: number): Promise<{ valid: boolean; discount?: number; message?: string }> {
    if (API_CONFIG.USE_MOCK_DATA) {
      await mockDelay();
      const coupons = await this.getAll();
      const coupon = coupons.find(c => c.code === code);
      
      if (!coupon) {
        return { valid: false, message: 'Mã giảm giá không tồn tại' };
      }
      
      if (new Date(coupon.expiryDate) < new Date()) {
        return { valid: false, message: 'Mã giảm giá đã hết hạn' };
      }
      
      if (orderAmount < coupon.minOrder) {
        return { valid: false, message: `Đơn hàng tối thiểu ${coupon.minOrder.toLocaleString()}đ` };
      }
      
      let discount = 0;
      if (coupon.discountType === 'percentage') {
        discount = (orderAmount * coupon.discountValue) / 100;
        if (coupon.maxDiscount) {
          discount = Math.min(discount, coupon.maxDiscount);
        }
      } else {
        discount = coupon.discountValue;
      }
      
      return { valid: true, discount };
    }

    return apiClient.post<{ valid: boolean; discount?: number; message?: string }>('/coupons/validate', { code, orderAmount });
  },
};

// ============= SEARCH API =============
export const searchApi = {
  async hotels(query: string, filters?: SearchFilters): Promise<Hotel[]> {
    // Backend doesn't have search endpoint yet, use ALL_ROOMS with filters
    return apiClient.get<Hotel[]>(API_CONFIG.ENDPOINTS.ALL_ROOMS);
  },

  // Search suggestions - KEEP MOCK (backend doesn't have this)
  async suggestions(query: string): Promise<string[]> {
    if (API_CONFIG.USE_MOCK_DATA) {
      await mockDelay(200);
      // Simple mock suggestions
      const suggestions = [
        'Hanoi',
        'Ho Chi Minh City',
        'Da Nang',
        'Hoi An',
        'Nha Trang',
        'Phu Quoc',
      ].filter(s => s.toLowerCase().includes(query.toLowerCase()));
      return suggestions.slice(0, 5);
    }
    // When backend implements this, replace with:
    // return apiClient.get<string[]>(API_CONFIG.ENDPOINTS.SEARCH_SUGGESTIONS, { q: query });
    return [];
  },
};

// ============= HOTEL MANAGER API =============
export const hotelManagerApi = {
  // Rooms Management
  async getRooms(hotelId: string = 'h1'): Promise<RoomType[]> {
    return apiClient.get<RoomType[]>(API_CONFIG.ENDPOINTS.VIEW_ALL_ROOMS, { hotel_id: hotelId });
  },

  async createRoom(hotelId: string, roomData: Partial<RoomType>): Promise<RoomType> {
    return apiClient.post<RoomType>(API_CONFIG.ENDPOINTS.ADD_ROOM, { roomData });
  },

  async updateRoom(roomId: string, updates: Partial<RoomType>): Promise<RoomType> {
    return apiClient.put<RoomType>(API_CONFIG.ENDPOINTS.ROOM_INVENTORY_UPDATE, { room_id: roomId, ...updates });
  },

  async deleteRoom(roomId: string): Promise<void> {
    return apiClient.delete(API_CONFIG.ENDPOINTS.ROOM_INVENTORY_DELETE, { room_id: roomId });
  },

  // Pricing Management
  // NOTE: Backend pricing is PER ROOM TYPE, not per hotel
  // To get pricing, use getRoomTypes() - each room type contains pricing fields

  /**
   * Update pricing for a specific room type
   * Backend API: PUT /hotel-profile/update-price
   * @param typeId - Room type ID (REQUIRED)
   * @param priceData - Pricing data object
   */
  async updateRoomTypePrice(
    typeId: number,
    priceData: {
      basic_price?: number;
      special_price?: number;
      discount?: number;
      event?: string;
      start_date?: string; // ISO8601 format
      end_date?: string;   // ISO8601 format
    }
  ): Promise<{ message: string }> {
    return apiClient.put<{ message: string }>(
      API_CONFIG.ENDPOINTS.UPDATE_PRICE,
      {
        priceData: {
          type_id: typeId,
          ...priceData,
        },
      }
    );
  },

  // DEPRECATED: Kept for backward compatibility - use getRoomTypes() instead
  async getPricing(hotelId: string = 'h1'): Promise<Record<string, unknown>> {
    console.warn('getPricing() is deprecated. Use getRoomTypes() to get pricing per room type.');

    if (API_CONFIG.USE_MOCK_DATA) {
      ensureMockLayerReady();
      await mockDelay();
      const pricing = localStorage.getItem(`hotelPricing_${hotelId}`);
      if (pricing) return JSON.parse(pricing) as Record<string, unknown>;
      const defaultPricing = { basePrice: 1500000, weekendPrice: 2000000, holidayPrice: 2500000, seasonalRates: [] };
      localStorage.setItem(`hotelPricing_${hotelId}`, JSON.stringify(defaultPricing));
      return defaultPricing;
    }
    return {};
  },

  // DEPRECATED: Use updateRoomTypePrice() instead
  async updatePricing(hotelId: string, pricing: Record<string, unknown>): Promise<Record<string, unknown>> {
    console.warn('updatePricing() is deprecated. Use updateRoomTypePrice() instead.');

    if (API_CONFIG.USE_MOCK_DATA) {
      ensureMockLayerReady();
      await mockDelay();
      localStorage.setItem(`hotelPricing_${hotelId}`, JSON.stringify(pricing));
      return pricing;
    }

    if (pricing.type_id) {
      return this.updateRoomTypePrice(pricing.type_id as number, pricing as any);
    }
    throw new Error('updatePricing() requires type_id. Use updateRoomTypePrice() instead.');
  },

  // Reviews Management
  async replyToReview(reviewId: string, reply: string): Promise<Review> {
    return apiClient.post<any>(API_CONFIG.ENDPOINTS.REPLY_REVIEW, { review_id: reviewId, reply });
  },
  // Hotel Info Management
  async getHotelInfo(hotelId: string = 'h1'): Promise<Hotel & { settings?: Record<string, unknown> }> {
    return apiClient.get<any>(API_CONFIG.ENDPOINTS.VIEW_HOTEL, { hotel_id: hotelId });
  },

  async updateHotelInfo(hotelId: string, updates: Partial<Hotel> & { phone?: string; email?: string; settings?: Record<string, unknown> }): Promise<{ success: boolean }> {
    return apiClient.put<any>(API_CONFIG.ENDPOINTS.UPDATE_HOTEL, { hotel_id: hotelId, hotelData: updates });
  },

  // Booking Management for Hotel Manager
  async getHotelBookings(hotelId: string): Promise<Booking[]> {
    return apiClient.get<Booking[]>(API_CONFIG.ENDPOINTS.BOOKING_HISTORY, { hotelId });
  },

  async updateBookingStatus(bookingId: string, status: string): Promise<Booking> {
    return apiClient.patch<Booking>(API_CONFIG.ENDPOINTS.UPDATE_BOOKING_STATUS, { id: bookingId, status });
  },

  async checkInBooking(bookingId: string): Promise<Booking> {
    return apiClient.post<Booking>(API_CONFIG.ENDPOINTS.BOOKING_CHECKIN, { id: bookingId });
  },

  async checkOutBooking(bookingId: string): Promise<Booking> {
    return apiClient.post<Booking>(API_CONFIG.ENDPOINTS.BOOKING_CHECKOUT, { id: bookingId });
  },

  // Room Types Management
  async getRoomTypes(hotelId: string = 'h1'): Promise<RoomType[]> {
    return apiClient.get<RoomType[]>(API_CONFIG.ENDPOINTS.VIEW_ROOM_TYPES, { hotel_id: hotelId });
  },

  async addRoomType(data: {
    type: string;
    description?: string;
    max_guests: number;
    base_price?: number;
    quantity?: number;
    hotel_id: number;
  }): Promise<RoomType> {
    return apiClient.post<RoomType>(API_CONFIG.ENDPOINTS.ADD_ROOM_TYPE, data);
  },

  async updateRoomPrice(typeId: string, newPrice: number): Promise<RoomType> {
    return apiClient.put<RoomType>(API_CONFIG.ENDPOINTS.UPDATE_PRICE, { type_id: typeId, base_price: newPrice });
  },

  // Facilities Management
  async getFacilities(hotelId: string): Promise<{ id: number; name: string; icon: string; category: string; isActive: boolean }[]> {
    if (API_CONFIG.USE_MOCK_DATA) {
      ensureMockLayerReady();
      await mockDelay();
      const cached = localStorage.getItem(`hotelFacilities_${hotelId}`);
      if (cached) {
        return JSON.parse(cached);
      }
      return [];
    }
    return apiClient.get<any[]>(API_CONFIG.ENDPOINTS.VIEW_HOTEL, { hotel_id: hotelId }).then(data => (data as any).facilities || []);
  },

  async updateFacilities(hotelId: string, facilities: { id: number; name: string; icon: string; category: string; isActive: boolean }[]): Promise<{ success: boolean }> {
    if (API_CONFIG.USE_MOCK_DATA) {
      ensureMockLayerReady();
      await mockDelay();
      localStorage.setItem(`hotelFacilities_${hotelId}`, JSON.stringify(facilities));
      return { success: true };
    }
    return apiClient.post<any>(API_CONFIG.ENDPOINTS.ADD_FACILITY, { hotel_id: hotelId, facilities });
  },

  // Images Management
  async getImages(hotelId: string): Promise<{ id: number; url: string; type: string; caption: string; isThumbnail: boolean }[]> {
    if (API_CONFIG.USE_MOCK_DATA) {
      ensureMockLayerReady();
      await mockDelay();
      const cached = localStorage.getItem(`hotelImages_${hotelId}`);
      if (cached) {
        return JSON.parse(cached);
      }
      return [];
    }
    return apiClient.get<any[]>(API_CONFIG.ENDPOINTS.VIEW_HOTEL, { hotel_id: hotelId }).then(data => (data as any).images || []);
  },

  async uploadImages(hotelId: string, files: File[], imageType: string, caption: string): Promise<{ id: number; url: string; type: string; caption: string }[]> {
    if (API_CONFIG.USE_MOCK_DATA) {
      ensureMockLayerReady();
      await mockDelay();
      const newImages = files.map((file, index) => ({
        id: Date.now() + index,
        url: URL.createObjectURL(file),
        type: imageType,
        caption: caption,
        isThumbnail: false,
        uploadedAt: new Date().toISOString().split('T')[0],
      }));
      const cached = localStorage.getItem(`hotelImages_${hotelId}`);
      const existingImages = cached ? JSON.parse(cached) : [];
      const allImages = [...existingImages, ...newImages];
      localStorage.setItem(`hotelImages_${hotelId}`, JSON.stringify(allImages));
      return newImages;
    }
    // Real API: Use FormData for file upload
    const formData = new FormData();
    files.forEach(file => formData.append('images', file));
    formData.append('type', imageType);
    formData.append('caption', caption);
    return apiClient.postFormData<any[]>(API_CONFIG.ENDPOINTS.UPLOAD_HOTEL_IMAGES, { hotel_id: hotelId }, formData);
  },

  async deleteImage(hotelId: string, imageId: number): Promise<{ success: boolean }> {
    if (API_CONFIG.USE_MOCK_DATA) {
      ensureMockLayerReady();
      await mockDelay();
      const cached = localStorage.getItem(`hotelImages_${hotelId}`);
      if (cached) {
        const images = JSON.parse(cached);
        const filtered = images.filter((img: any) => img.id !== imageId);
        localStorage.setItem(`hotelImages_${hotelId}`, JSON.stringify(filtered));
      }
      return { success: true };
    }
    return apiClient.delete<any>('/hotel-profile/delete-image/:image_id', { image_id: String(imageId) });
  },

  async setThumbnail(hotelId: string, imageId: number): Promise<{ success: boolean }> {
    if (API_CONFIG.USE_MOCK_DATA) {
      ensureMockLayerReady();
      await mockDelay();
      const cached = localStorage.getItem(`hotelImages_${hotelId}`);
      if (cached) {
        const images = JSON.parse(cached);
        const updatedImages = images.map((img: any) => ({
          ...img,
          isThumbnail: img.id === imageId
        }));
        localStorage.setItem(`hotelImages_${hotelId}`, JSON.stringify(updatedImages));
      }
      return { success: true };
    }
    return apiClient.put<any>('/hotel-profile/set-thumbnail/:hotel_id', { hotel_id: hotelId, image_id: imageId });
  },
};

// ============= PAYMENT API =============
export const paymentApi = {
  async getConfig(): Promise<{ supportedMethods: string[]; bankCodes: { code: string; name: string }[] }> {
    return apiClient.get<any>(API_CONFIG.ENDPOINTS.PAYMENT_CONFIG);
  },

  async createPayment(data: {
    bookingId: number;
    amount: number;
    paymentMethod: 'vnpay' | 'momo' | 'cash' | 'bank_transfer';
    bankCode?: string;
    orderInfo?: string;
    returnUrl?: string;
  }): Promise<{ payment_id: number; payment_url?: string; status: string }> {
    return apiClient.post<any>(API_CONFIG.ENDPOINTS.PAYMENT_CREATE, data);
  },

  async getAll(): Promise<Payment[]> {
    return apiClient.get<Payment[]>(API_CONFIG.ENDPOINTS.PAYMENT_LIST);
  },

  async getById(paymentId: string): Promise<Payment | null> {
    return apiClient.get<Payment>(API_CONFIG.ENDPOINTS.PAYMENT_DETAILS, { id: paymentId });
  },

  async getByBooking(bookingId: string): Promise<Payment | null> {
    return apiClient.get<Payment>(API_CONFIG.ENDPOINTS.PAYMENT_BY_BOOKING, { bookingId });
  },

  async queryStatus(paymentId: string): Promise<{ status: string; vnp_response_code?: string }> {
    return apiClient.get<any>(API_CONFIG.ENDPOINTS.PAYMENT_QUERY_STATUS, { id: paymentId });
  },

  async refund(paymentId: string, amount?: number): Promise<{ success: boolean; refund_id?: string }> {
    return apiClient.post<any>(API_CONFIG.ENDPOINTS.PAYMENT_REFUND, { id: paymentId, amount });
  },

  // Mark payment as completed (for mock/testing)
  async completePayment(paymentId: string): Promise<Payment> {
    // Real API would handle this via VNPay callback
    throw new Error('Use VNPay callback for completing payments');
  },
};

// ============= ROOM INVENTORY API =============
export const roomInventoryApi = {
  async checkAvailability(data: {
    roomTypeId: number;
    checkInDate: string;
    checkOutDate: string;
    quantity?: number;
  }): Promise<{ available: boolean; availableCount: number }> {
    return apiClient.post<any>(API_CONFIG.ENDPOINTS.ROOM_CHECK_AVAILABILITY, data);
  },

  async getAvailableRooms(hotelId: string, checkIn?: string, checkOut?: string): Promise<RoomType[]> {
    const params: Record<string, string> = { hotelId };
    if (checkIn) params.checkIn = checkIn;
    if (checkOut) params.checkOut = checkOut;
    return apiClient.get<RoomType[]>(API_CONFIG.ENDPOINTS.ROOM_AVAILABLE, params);
  },

  async getRoomType(typeId: string): Promise<RoomType | null> {
    return apiClient.get<RoomType>(API_CONFIG.ENDPOINTS.ROOM_TYPE_BY_ID, { id: typeId });
  },

  async getRoomTypesByHotel(hotelId: string): Promise<RoomType[]> {
    return apiClient.get<RoomType[]>(API_CONFIG.ENDPOINTS.ROOM_TYPES_BY_HOTEL, { hotelId });
  },

  async getRoom(roomId: string): Promise<Room | null> {
    return apiClient.get<Room>(API_CONFIG.ENDPOINTS.ROOM_BY_ID, { id: roomId });
  },

  async getRoomsByType(typeId: string): Promise<Room[]> {
    return apiClient.get<Room[]>(API_CONFIG.ENDPOINTS.ROOMS_BY_TYPE, { typeId });
  },

  async createHold(data: {
    roomTypeId: number;
    checkInDate: string;
    checkOutDate: string;
    quantity: number;
    holdDurationMinutes?: number;
  }): Promise<{ holdId: string; expiresAt: string }> {
    return apiClient.post<any>(API_CONFIG.ENDPOINTS.ROOM_HOLD, data);
  },

  async releaseHold(holdId: string): Promise<{ success: boolean }> {
    return apiClient.post<any>(API_CONFIG.ENDPOINTS.ROOM_HOLD_RELEASE, { holdId });
  },

  async getInventoryCalendar(typeId: string, startDate: string, endDate: string): Promise<{
    date: string;
    available: number;
    booked: number;
    held: number;
  }[]> {
    return apiClient.get<any>(API_CONFIG.ENDPOINTS.ROOM_INVENTORY_CALENDAR, { typeId, startDate, endDate });
  },
};

// ============= DESTINATIONS EXTENDED API =============
export const destinationsApi = {
  ...tourismApi,

  async search(query: string): Promise<Destination[]> {
    return apiClient.get<Destination[]>(API_CONFIG.ENDPOINTS.SEARCH_DESTINATIONS, { q: query });
  },

  async getByType(type: string): Promise<Destination[]> {
    return apiClient.get<Destination[]>(API_CONFIG.ENDPOINTS.DESTINATIONS_BY_TYPE, { type });
  },

  async create(data: Partial<Destination>): Promise<Destination> {
    return apiClient.post<Destination>(API_CONFIG.ENDPOINTS.CREATE_DESTINATION, data);
  },

  async update(id: string, data: Partial<Destination>): Promise<Destination> {
    return apiClient.put<Destination>(API_CONFIG.ENDPOINTS.UPDATE_DESTINATION, data, { id });
  },

  async delete(id: string): Promise<boolean> {
    return apiClient.delete<boolean>(API_CONFIG.ENDPOINTS.DELETE_DESTINATION, { id });
  },

  async addReview(destinationId: string, reviewData: Partial<Review>): Promise<Review> {
    return apiClient.post<Review>(API_CONFIG.ENDPOINTS.ADD_DESTINATION_REVIEW, { id: destinationId, ...reviewData });
  },

  async getImages(destinationId: string): Promise<Image[]> {
    return apiClient.get<Image[]>(API_CONFIG.ENDPOINTS.DESTINATION_IMAGES, { id: destinationId });
  },
};

// ============= USER PROFILE EXTENDED API =============
export const userProfileApi = {
  ...userApi,

  async deleteAccount(): Promise<boolean> {
    return apiClient.delete<boolean>(API_CONFIG.ENDPOINTS.DELETE_PROFILE);
  },

  async uploadProfileImage(file: File): Promise<{ imageUrl: string }> {
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.UPLOAD_PROFILE_IMAGE}`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to upload image');
    }

    return response.json();
  },

  async getProfileImage(): Promise<{ imageUrl: string | null }> {
    return apiClient.get<{ imageUrl: string | null }>(API_CONFIG.ENDPOINTS.GET_PROFILE_IMAGE);
  },

  async deleteProfileImage(): Promise<boolean> {
    return apiClient.delete<boolean>(API_CONFIG.ENDPOINTS.DELETE_PROFILE_IMAGE);
  },

  async getAllUsers(): Promise<User[]> {
    return apiClient.get<User[]>(API_CONFIG.ENDPOINTS.GET_ALL_USERS);
  },

  // User coupons/vouchers - KEEP MOCK (backend doesn't have this)
  async getCoupons(): Promise<any[]> {
    if (API_CONFIG.USE_MOCK_DATA) {
      await mockDelay();
      const coupons = localStorage.getItem('userCoupons');
      if (coupons) return JSON.parse(coupons);

      // Default mock coupons
      const defaultCoupons = [
        {
          id: 1,
          code: 'SUMMER2024',
          discount: 15,
          type: 'percentage',
          minAmount: 500000,
          expiresAt: '2024-12-31',
          isActive: true,
        },
        {
          id: 2,
          code: 'NEWUSER',
          discount: 100000,
          type: 'fixed',
          minAmount: 200000,
          expiresAt: '2024-12-31',
          isActive: true,
        },
      ];
      localStorage.setItem('userCoupons', JSON.stringify(defaultCoupons));
      return defaultCoupons;
    }
    // When backend implements this, replace with:
    // return apiClient.get<any[]>(API_CONFIG.ENDPOINTS.USER_COUPONS);
    return [];
  },

  async applyCoupon(code: string, bookingAmount: number): Promise<{ valid: boolean; discount: number }> {
    if (API_CONFIG.USE_MOCK_DATA) {
      await mockDelay();
      const coupons = JSON.parse(localStorage.getItem('userCoupons') || '[]');
      const coupon = coupons.find((c: any) => c.code === code && c.isActive);

      if (!coupon) {
        return { valid: false, discount: 0 };
      }

      if (bookingAmount < coupon.minAmount) {
        return { valid: false, discount: 0 };
      }

      const discount = coupon.type === 'percentage'
        ? Math.floor(bookingAmount * coupon.discount / 100)
        : coupon.discount;

      return { valid: true, discount };
    }
    // When backend implements this, replace with:
    // return apiClient.post<any>(API_CONFIG.ENDPOINTS.APPLY_COUPON, { code, bookingAmount });
    return { valid: false, discount: 0 };
  },
};

// ============= NOTIFICATION API =============
export const notificationApi = {
  async sendTestEmail(email: string): Promise<{ success: boolean }> {
    return apiClient.post<any>(API_CONFIG.ENDPOINTS.NOTIFICATION_TEST, { email });
  },

  async sendBookingConfirmation(bookingId: number, email: string): Promise<{ success: boolean }> {
    return apiClient.post<any>(API_CONFIG.ENDPOINTS.NOTIFICATION_BOOKING_CONFIRM, { bookingId, email });
  },

  async sendBookingCancellation(bookingId: number, email: string): Promise<{ success: boolean }> {
    return apiClient.post<any>(API_CONFIG.ENDPOINTS.NOTIFICATION_BOOKING_CANCEL, { bookingId, email });
  },

  async sendPasswordReset(email: string, resetUrl: string): Promise<{ success: boolean }> {
    return apiClient.post<any>(API_CONFIG.ENDPOINTS.NOTIFICATION_PASSWORD_RESET, { email, resetUrl });
  },

  async sendWelcomeEmail(email: string, name: string): Promise<{ success: boolean }> {
    return apiClient.post<any>(API_CONFIG.ENDPOINTS.NOTIFICATION_WELCOME, { email, name });
  },

  async sendPaymentConfirmation(paymentId: number, email: string): Promise<{ success: boolean }> {
    return apiClient.post<any>(API_CONFIG.ENDPOINTS.NOTIFICATION_PAYMENT_CONFIRM, { paymentId, email });
  },
};

// ============= CHAT/MESSAGING API - KEEP MOCK (backend doesn't have this) =============
export const chatApi = {
  async getConversations(): Promise<any[]> {
    if (API_CONFIG.USE_MOCK_DATA) {
      await mockDelay();
      const conversations = localStorage.getItem('chatConversations');
      if (conversations) return JSON.parse(conversations);

      const defaultConversations = [
        {
          id: 1,
          hotelName: 'Vinpearl Resort',
          lastMessage: 'Thank you for your inquiry',
          timestamp: new Date().toISOString(),
          unread: 2,
        },
      ];
      localStorage.setItem('chatConversations', JSON.stringify(defaultConversations));
      return defaultConversations;
    }
    // When backend implements this, replace with:
    // return apiClient.get<any[]>(API_CONFIG.ENDPOINTS.CHAT_CONVERSATIONS);
    return [];
  },

  async getMessages(conversationId: number): Promise<any[]> {
    if (API_CONFIG.USE_MOCK_DATA) {
      await mockDelay();
      const messages = localStorage.getItem(`chatMessages_${conversationId}`);
      if (messages) return JSON.parse(messages);

      const defaultMessages = [
        {
          id: 1,
          conversationId,
          sender: 'hotel',
          text: 'Hello! How can we help you?',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          id: 2,
          conversationId,
          sender: 'user',
          text: 'I would like to know about room availability',
          timestamp: new Date(Date.now() - 1800000).toISOString(),
        },
      ];
      localStorage.setItem(`chatMessages_${conversationId}`, JSON.stringify(defaultMessages));
      return defaultMessages;
    }
    // When backend implements this, replace with:
    // return apiClient.get<any[]>(API_CONFIG.ENDPOINTS.CHAT_MESSAGES, { conversationId });
    return [];
  },

  async sendMessage(conversationId: number, text: string): Promise<any> {
    if (API_CONFIG.USE_MOCK_DATA) {
      await mockDelay();
      const messages = JSON.parse(localStorage.getItem(`chatMessages_${conversationId}`) || '[]');
      const newMessage = {
        id: Date.now(),
        conversationId,
        sender: 'user',
        text,
        timestamp: new Date().toISOString(),
      };
      messages.push(newMessage);
      localStorage.setItem(`chatMessages_${conversationId}`, JSON.stringify(messages));
      return newMessage;
    }
    // When backend implements this, replace with:
    // return apiClient.post<any>(API_CONFIG.ENDPOINTS.CHAT_SEND_MESSAGE, { conversationId, text });
    return null;
  },
};

// ============= ADMIN API =============
export interface AdminDashboard {
  totalUsers: number;
  totalHotels: number;
  totalBookings: number;
  totalRevenue: number;
  pendingHotels: number;
  activeBookings: number;
  recentActivity: AdminActivity[];
}

export interface AdminActivity {
  id: number;
  type: string;
  description: string;
  timestamp: string;
  userId?: number;
  userName?: string;
}

export interface AdminUser {
  user_id: number;
  name: string;
  email: string;
  phone?: string;
  role: 'customer' | 'hotel_manager' | 'admin';
  status: 'active' | 'inactive' | 'banned';
  created_at: string;
  last_login?: string;
  bookings_count?: number;
}

export interface AdminHotel {
  hotel_id: number;
  name: string;
  city: string;
  district: string;
  status: 'pending' | 'approved' | 'rejected' | 'locked';
  manager_name: string;
  manager_email: string;
  rooms_count: number;
  created_at: string;
}

export const adminApi = {
  // Dashboard
  async getDashboard(): Promise<AdminDashboard> {
    return apiClient.get<AdminDashboard>(API_CONFIG.ENDPOINTS.ADMIN_DASHBOARD);
  },

  async getRevenueMetrics(): Promise<any> {
    return apiClient.get<any>(API_CONFIG.ENDPOINTS.ADMIN_REVENUE_METRICS);
  },

  async getBookingKPIs(): Promise<any> {
    return apiClient.get<any>(API_CONFIG.ENDPOINTS.ADMIN_BOOKING_KPIS);
  },

  async getRecentActivity(): Promise<AdminActivity[]> {
    return apiClient.get<AdminActivity[]>(API_CONFIG.ENDPOINTS.ADMIN_RECENT_ACTIVITY);
  },

  // User Management
  async getAllUsers(): Promise<AdminUser[]> {
    return apiClient.get<AdminUser[]>(API_CONFIG.ENDPOINTS.ADMIN_USERS);
  },

  async getUserById(id: string): Promise<AdminUser> {
    return apiClient.get<AdminUser>(API_CONFIG.ENDPOINTS.ADMIN_USER_BY_ID, { id });
  },

  async updateUserRole(id: string, role: AdminUser['role']): Promise<AdminUser> {
    return apiClient.patch<AdminUser>(API_CONFIG.ENDPOINTS.ADMIN_UPDATE_USER_ROLE, { role }, { id });
  },

  async updateUser(id: string, data: Partial<AdminUser>): Promise<AdminUser> {
    return apiClient.put<AdminUser>(API_CONFIG.ENDPOINTS.ADMIN_UPDATE_USER, data, { id });
  },

  async deleteUser(id: string): Promise<{ success: boolean }> {
    return apiClient.delete<any>(API_CONFIG.ENDPOINTS.ADMIN_DELETE_USER, { id });
  },

  // Hotel Manager Management
  async getHotelManagers(): Promise<AdminUser[]> {
    return apiClient.get<AdminUser[]>(API_CONFIG.ENDPOINTS.ADMIN_HOTEL_MANAGERS);
  },

  async getPendingHotels(): Promise<AdminHotel[]> {
    return apiClient.get<AdminHotel[]>(API_CONFIG.ENDPOINTS.ADMIN_PENDING_HOTELS);
  },

  async approveHotel(id: string): Promise<AdminHotel> {
    return apiClient.post<AdminHotel>(API_CONFIG.ENDPOINTS.ADMIN_APPROVE_HOTEL, {}, { id });
  },

  async lockHotel(id: string): Promise<AdminHotel> {
    return apiClient.post<AdminHotel>(API_CONFIG.ENDPOINTS.ADMIN_LOCK_HOTEL, {}, { id });
  },

  async updateHotelStatus(id: string, status: AdminHotel['status']): Promise<AdminHotel> {
    return apiClient.patch<AdminHotel>(API_CONFIG.ENDPOINTS.ADMIN_UPDATE_HOTEL_STATUS, { status }, { id });
  },

  // Admin settings - KEEP MOCK (backend doesn't have this)
  async getSettings(): Promise<any> {
    if (API_CONFIG.USE_MOCK_DATA) {
      await mockDelay();
      const settings = localStorage.getItem('adminSettings');
      if (settings) return JSON.parse(settings);

      const defaultSettings = {
        siteName: 'Hotel Booking System',
        siteEmail: 'admin@hotelbooking.com',
        currency: 'VND',
        timezone: 'Asia/Ho_Chi_Minh',
        maintenanceMode: false,
        bookingApprovalRequired: false,
        defaultCommissionRate: 15,
      };
      localStorage.setItem('adminSettings', JSON.stringify(defaultSettings));
      return defaultSettings;
    }
    // When backend implements this, replace with:
    // return apiClient.get<any>(API_CONFIG.ENDPOINTS.ADMIN_SETTINGS);
    return {};
  },

  async updateSettings(settings: any): Promise<any> {
    if (API_CONFIG.USE_MOCK_DATA) {
      await mockDelay();
      localStorage.setItem('adminSettings', JSON.stringify(settings));
      return settings;
    }
    // When backend implements this, replace with:
    // return apiClient.put<any>(API_CONFIG.ENDPOINTS.ADMIN_UPDATE_SETTINGS, settings);
    return settings;
  },

  // NEW: Create user (admin only)
  async createUser(userData: {
    name: string;
    email: string;
    phone_number: string;
    gender: string;
    date_of_birth: string;
    role: 'customer' | 'hotel_manager' | 'admin';
    password: string;
  }): Promise<User> {
    return apiClient.post<User>(API_CONFIG.ENDPOINTS.CREATE_USER, userData);
  },
};

// ============= EXTENDED HOTEL MANAGER API =============
// Additional functions for unused APIs
export const hotelManagerApiExtended = {
  /**
   * Create a new hotel
   * POST /hotel-profile/add-hotel
   */
  async createHotel(hotelData: {
    name: string;
    address: string;
    description: string;
    contact_phone: string;
    longitude: number;
    latitude: number;
    thumbnail?: File;
  }): Promise<Hotel> {
    const formData = new FormData();
    if (hotelData.thumbnail) {
      formData.append('thumbnail', hotelData.thumbnail);
    }
    const { thumbnail, ...data } = hotelData;
    formData.append('hotelData', JSON.stringify(data));

    return apiClient.post<Hotel>(
      API_CONFIG.ENDPOINTS.ADD_HOTEL,
      formData
    );
  },

  /**
   * Delete/disable hotel
   * DELETE /hotel-profile/delete-hotel/:hotel_id
   */
  async deleteHotel(hotelId: string): Promise<void> {
    return apiClient.delete(
      API_CONFIG.ENDPOINTS.DELETE_HOTEL,
      { hotel_id: hotelId }
    );
  },

  /**
   * Add facilities to hotel
   * POST /hotel-profile/add-facility/:hotel_id
   */
  async addFacilities(hotelId: string, facilities: string[]): Promise<void> {
    return apiClient.post(
      API_CONFIG.ENDPOINTS.ADD_FACILITY,
      { facilities },
      { hotel_id: hotelId }
    );
  },

  /**
   * Upload multiple images for hotel
   * POST /hotel-profile/upload-images-for-hotel/:hotel_id
   */
  async uploadHotelImages(hotelId: string, images: File[]): Promise<Image[]> {
    const formData = new FormData();
    images.forEach(image => formData.append('images', image));

    return apiClient.post<Image[]>(
      API_CONFIG.ENDPOINTS.UPLOAD_HOTEL_IMAGES,
      formData,
      { hotel_id: hotelId }
    );
  },

  /**
   * Upload multiple images for room
   * POST /hotel-profile/upload-images-for-room/:room_id
   */
  async uploadRoomImages(roomId: string, images: File[]): Promise<Image[]> {
    const formData = new FormData();
    images.forEach(image => formData.append('images', image));

    return apiClient.post<Image[]>(
      API_CONFIG.ENDPOINTS.UPLOAD_ROOM_IMAGES,
      formData,
      { room_id: roomId }
    );
  },
};

// ============= EXTENDED USER PROFILE API =============
export const userProfileApiExtended = {
  /**
   * Get user's bookings
   * GET /users/bookings
   */
  async getUserBookings(): Promise<Booking[]> {
    return apiClient.get<Booking[]>(API_CONFIG.ENDPOINTS.USER_BOOKINGS);
  },

  /**
   * Get profile image URL
   * GET /users/profile/image
   */
  async getProfileImageUrl(): Promise<{ url: string }> {
    return apiClient.get<{ url: string }>(API_CONFIG.ENDPOINTS.GET_PROFILE_IMAGE);
  },
};

// ============= EXTENDED DESTINATIONS API =============
export const destinationsApiExtended = {
  /**
   * Upload thumbnail for destination
   * POST /destinations/:id/thumbnail
   */
  async uploadThumbnail(destinationId: string, thumbnail: File): Promise<void> {
    const formData = new FormData();
    formData.append('thumbnail', thumbnail);

    return apiClient.post(
      API_CONFIG.ENDPOINTS.DESTINATION_THUMBNAIL,
      formData,
      { id: destinationId }
    );
  },

  /**
   * Delete destination thumbnail
   * DELETE /destinations/:id/thumbnail
   */
  async deleteThumbnail(destinationId: string): Promise<void> {
    return apiClient.delete(
      API_CONFIG.ENDPOINTS.DESTINATION_THUMBNAIL,
      { id: destinationId }
    );
  },

  /**
   * Get all images for destination
   * GET /destinations/:id/images
   */
  async getImages(destinationId: string): Promise<Image[]> {
    return apiClient.get<Image[]>(
      API_CONFIG.ENDPOINTS.DESTINATION_IMAGES,
      { id: destinationId }
    );
  },

  /**
   * Upload image for destination
   * POST /destinations/:id/images
   */
  async uploadImage(destinationId: string, image: File): Promise<Image> {
    const formData = new FormData();
    formData.append('image', image);

    return apiClient.post<Image>(
      API_CONFIG.ENDPOINTS.DESTINATION_IMAGES,
      formData,
      { id: destinationId }
    );
  },

  /**
   * Delete destination image
   * DELETE /destinations/:id/images/:imageId
   */
  async deleteImage(destinationId: string, imageId: string): Promise<void> {
    return apiClient.delete(
      API_CONFIG.ENDPOINTS.DELETE_DESTINATION_IMAGE,
      { id: destinationId, imageId }
    );
  },
};

// ============= EXTENDED ROOM INVENTORY API =============
export const roomInventoryApiExtended = {
  /**
   * Get room type by ID
   * GET /rooms/types/:id
   */
  async getRoomTypeById(typeId: string): Promise<RoomType> {
    return apiClient.get<RoomType>(
      API_CONFIG.ENDPOINTS.ROOM_TYPE_BY_ID,
      { id: typeId }
    );
  },

  /**
   * Get room by ID
   * GET /rooms/:id
   */
  async getRoomById(roomId: string): Promise<Room> {
    return apiClient.get<Room>(
      API_CONFIG.ENDPOINTS.ROOM_BY_ID,
      { id: roomId }
    );
  },

  /**
   * Get all rooms of a specific room type
   * GET /rooms/type/:typeId
   */
  async getRoomsByType(typeId: string): Promise<Room[]> {
    return apiClient.get<Room[]>(
      API_CONFIG.ENDPOINTS.ROOMS_BY_TYPE,
      { typeId }
    );
  },
};

// ============= EXTENDED PAYMENT API =============
export const paymentApiExtended = {
  /**
   * Cancel pending payment
   * POST /payments/:id/cancel
   */
  async cancelPayment(paymentId: string): Promise<void> {
    return apiClient.post(
      API_CONFIG.ENDPOINTS.PAYMENT_CANCEL,
      {},
      { id: paymentId }
    );
  },
};
