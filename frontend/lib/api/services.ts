/**
 * API Services
 * Automatically switches between mock and real API based on API_CONFIG.USE_MOCK_DATA
 * Mock data is stored in localStorage for persistence
 */

import { API_CONFIG } from "./config";
import { apiClient } from "./client";
import {
  getMockUser,
  updateMockUser,
  initializeMockData,
  getMockHotels,
} from "../utils/mockData";
import type {
  Hotel,
  TourismSpot,
  Review,
  Booking,
  User,
  SearchFilters,
  RoomType,
  Payment,
  Room,
  Destination,
  Image,
  Coupon,
  AdminDashboard,
  AdminActivity,
  AdminUser,
  AdminHotel,
  RevenueMetrics,
} from "@/types";

// Helper to simulate API delay for mock data
const mockDelay = (ms: number = 500) =>
  new Promise((resolve) => setTimeout(resolve, ms));

const ensureMockLayerReady = () => {
  if (typeof window === "undefined") {
    return;
  }
  initializeMockData();
};

// ============= HOTELS API =============
export const hotelsApi = {
  /**
   * Get all hotels (public endpoint)
   * GET /hotel-profile/all-hotels
   */
  async getAll(filters?: SearchFilters): Promise<Hotel[]> {
    return apiClient.get<Hotel[]>(API_CONFIG.ENDPOINTS.ALL_HOTELS);
  },

  async getById(id: string): Promise<Hotel | null> {
    return apiClient.get<Hotel>(API_CONFIG.ENDPOINTS.VIEW_HOTEL, {
      hotel_id: id,
    });
  },

  async getBySlug(slug: string): Promise<Hotel | null> {
    return apiClient.get<Hotel>(`/hotels/slug/${slug}`);
  },

  async getRooms(hotelId: string): Promise<RoomType[]> {
    return apiClient.get<RoomType[]>(API_CONFIG.ENDPOINTS.VIEW_ALL_ROOMS, {
      hotel_id: hotelId,
    });
  },

  async getRoomTypes(hotelId: string): Promise<RoomType[]> {
    return apiClient.get<RoomType[]>(API_CONFIG.ENDPOINTS.VIEW_ROOM_TYPES, {
      hotel_id: hotelId,
    });
  },

  async getReviews(hotelId: string): Promise<Review[]> {
    return apiClient.get<Review[]>(API_CONFIG.ENDPOINTS.ALL_REVIEWS, {
      hotel_id: hotelId,
    });
  },

  /**
   * Get all rooms across all hotels (public endpoint)
   * Useful for admin/search functionality
   * GET /hotel-profile/all-rooms
   */
  async getAllRooms(): Promise<Room[]> {
    return apiClient.get<Room[]>(API_CONFIG.ENDPOINTS.ALL_ROOMS);
  },
};

// ============= TOURISM API =============
export const tourismApi = {
  async getAll(): Promise<TourismSpot[]> {
    return apiClient.get<TourismSpot[]>(API_CONFIG.ENDPOINTS.ALL_DESTINATIONS);
  },

  async getById(id: string): Promise<TourismSpot | null> {
    return apiClient.get<TourismSpot>(API_CONFIG.ENDPOINTS.VIEW_DESTINATION, {
      destination_id: id,
    });
  },

  async getBySlug(slug: string): Promise<TourismSpot | null> {
    return apiClient.get<TourismSpot>(`/tourism/slug/${slug}`);
  },

  async search(query: string): Promise<TourismSpot[]> {
    return apiClient.get<TourismSpot[]>(
      API_CONFIG.ENDPOINTS.SEARCH_DESTINATIONS,
      { q: query }
    );
  },

  async getByType(type: string): Promise<TourismSpot[]> {
    return apiClient.get<TourismSpot[]>(
      API_CONFIG.ENDPOINTS.DESTINATIONS_BY_TYPE.replace(":type", type)
    );
  },

  // Admin methods
  async create(data: Partial<Destination>): Promise<Destination> {
    return apiClient.post<Destination>(
      API_CONFIG.ENDPOINTS.CREATE_DESTINATION,
      data
    );
  },

  async update(id: number, data: Partial<Destination>): Promise<Destination> {
    return apiClient.put<Destination>(
      API_CONFIG.ENDPOINTS.UPDATE_DESTINATION.replace(":id", id.toString()),
      data
    );
  },

  async delete(id: number): Promise<{ success: boolean }> {
    return apiClient.delete<any>(
      API_CONFIG.ENDPOINTS.DELETE_DESTINATION.replace(":id", id.toString())
    );
  },

  async uploadThumbnail(
    id: number | string,
    file: File
  ): Promise<{ success: boolean; url: string }> {
    const formData = new FormData();
    formData.append("thumbnail", file);
    return apiClient.post<any>(
      API_CONFIG.ENDPOINTS.DESTINATION_THUMBNAIL.replace(":id", id.toString()),
      formData,
      { 'Content-Type': 'multipart/form-data' }
    );
  },

  async uploadImage(
    id: number | string,
    file: File
  ): Promise<{ success: boolean; url: string }> {
    const formData = new FormData();
    formData.append("image", file);
    return apiClient.post<any>(
      API_CONFIG.ENDPOINTS.DESTINATION_IMAGES.replace(":id", id.toString()),
      formData,
      { 'Content-Type': 'multipart/form-data' }
    );
  },

  async getImages(id: number | string): Promise<Image[]> {
    return apiClient.get<Image[]>(
      API_CONFIG.ENDPOINTS.DESTINATION_IMAGES.replace(":id", id.toString())
    );
  },

  async deleteImage(
    destinationId: number | string,
    imageId: number | string
  ): Promise<{ success: boolean }> {
    return apiClient.delete<any>(
      API_CONFIG.ENDPOINTS.DELETE_DESTINATION_IMAGE.replace(
        ":id",
        destinationId.toString()
      ).replace(":imageId", imageId.toString())
    );
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
    return apiClient.post<Booking>(
      API_CONFIG.ENDPOINTS.ADD_BOOKING,
      bookingData
    );
  },

  async cancel(id: string): Promise<boolean> {
    return apiClient.post<boolean>(API_CONFIG.ENDPOINTS.CANCEL_BOOKING, { id });
  },

  async update(id: string, bookingData: Partial<Booking>): Promise<Booking> {
    return apiClient.put<Booking>(API_CONFIG.ENDPOINTS.UPDATE_BOOKING, {
      id,
      ...bookingData,
    });
  },

  async checkAvailability(data: {
    room_id: number;
    check_in_date: string;
    check_out_date: string;
  }): Promise<{ available: boolean }> {
    return apiClient.post<{ available: boolean }>(
      API_CONFIG.ENDPOINTS.CHECK_AVAILABILITY,
      data
    );
  },

  async calculatePrice(data: {
    room_id: number;
    check_in_date: string;
    check_out_date: string;
    people: number;
  }): Promise<{ total_price: number }> {
    return apiClient.post<{ total_price: number }>(
      API_CONFIG.ENDPOINTS.CALCULATE_PRICE,
      data
    );
  },

  async getAvailableRooms(
    hotelId: string,
    checkInDate: string,
    checkOutDate: string,
    guests: number
  ): Promise<any[]> {
    return apiClient.get<any[]>(
      API_CONFIG.ENDPOINTS.AVAILABLE_ROOMS.replace(":hotelId", hotelId),
      {
        check_in_date: checkInDate,
        check_out_date: checkOutDate,
        guests: guests.toString(),
      }
    );
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
      const notifications = localStorage.getItem("userNotifications");
      if (notifications) return JSON.parse(notifications);

      // Default mock notifications
      const defaultNotifications = [
        {
          id: 1,
          type: "booking",
          title: "Booking Confirmed",
          message: "Your booking at Vinpearl Resort has been confirmed",
          timestamp: new Date().toISOString(),
          read: false,
        },
        {
          id: 2,
          type: "payment",
          title: "Payment Received",
          message: "Payment of 2,500,000₫ received successfully",
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          read: false,
        },
      ];
      localStorage.setItem(
        "userNotifications",
        JSON.stringify(defaultNotifications)
      );
      return defaultNotifications;
    }
    // When backend implements this, replace with:
    // return apiClient.get<any[]>(API_CONFIG.ENDPOINTS.USER_NOTIFICATIONS);
    return [];
  },

  async markNotificationRead(id: number): Promise<boolean> {
    if (API_CONFIG.USE_MOCK_DATA) {
      await mockDelay();
      const notifications = JSON.parse(
        localStorage.getItem("userNotifications") || "[]"
      );
      const updated = notifications.map((n: any) =>
        n.id === id ? { ...n, read: true } : n
      );
      localStorage.setItem("userNotifications", JSON.stringify(updated));
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
    return apiClient.get<Review[]>(API_CONFIG.ENDPOINTS.ALL_REVIEWS, {
      hotel_id: hotelId,
    });
  },

  async create(reviewData: Partial<Review>): Promise<Review> {
    return apiClient.post<Review>(API_CONFIG.ENDPOINTS.ADD_REVIEW, reviewData);
  },

  async update(id: string, reviewData: Partial<Review>): Promise<Review> {
    return apiClient.put<Review>(API_CONFIG.ENDPOINTS.UPDATE_REVIEW, {
      review_id: id,
      ...reviewData,
    });
  },

  async delete(id: string): Promise<boolean> {
    return apiClient.delete<boolean>(API_CONFIG.ENDPOINTS.DELETE_REVIEW, {
      review_id: id,
    });
  },
};

// ============= COUPONS API =============
export const couponsApi = {
  async getAll(): Promise<Coupon[]> {
    if (API_CONFIG.USE_MOCK_DATA) {
      ensureMockLayerReady();
      await mockDelay();
      // Get coupons from localStorage or return default coupons
      const cached = localStorage.getItem("userCoupons");
      if (cached) {
        return JSON.parse(cached);
      }
      // Default coupons for mock
      const defaultCoupons: Coupon[] = [
        {
          coupon_id: 1,
          code: "WELCOME2024",
          description: "Giảm 10% cho đơn đặt phòng đầu tiên",
          discountType: "percentage",
          discountValue: 10,
          minOrder: 500000,
          maxDiscount: 200000,
          expiryDate: "2025-03-31",
          usageCount: 0,
          maxUsage: 1,
        },
        {
          coupon_id: 2,
          code: "NEWYEAR25",
          description: "Giảm 500K cho đơn từ 2 triệu",
          discountType: "fixed",
          discountValue: 500000,
          minOrder: 2000000,
          expiryDate: "2025-01-31",
          usageCount: 0,
          maxUsage: 2,
        },
        {
          coupon_id: 3,
          code: "SUMMER2024",
          description: "Giảm 15% cho kỳ nghỉ hè",
          discountType: "percentage",
          discountValue: 15,
          minOrder: 1000000,
          maxDiscount: 500000,
          expiryDate: "2024-09-30",
          usageCount: 1,
          maxUsage: 1,
        },
      ];
      localStorage.setItem("userCoupons", JSON.stringify(defaultCoupons));
      return defaultCoupons;
    }

    // Real API - backend may need to implement this endpoint
    try {
      return await apiClient.get<Coupon[]>("/coupons/user");
    } catch {
      console.warn("Coupons API endpoint not available, returning empty array");
      return [];
    }
  },

  async validateCoupon(
    code: string,
    orderAmount: number
  ): Promise<{ valid: boolean; discount?: number; message?: string }> {
    if (API_CONFIG.USE_MOCK_DATA) {
      await mockDelay();
      const coupons = await this.getAll();
      const coupon = coupons.find((c) => c.code === code);

      if (!coupon) {
        return { valid: false, message: "Mã giảm giá không tồn tại" };
      }

      if (new Date(coupon.expiryDate) < new Date()) {
        return { valid: false, message: "Mã giảm giá đã hết hạn" };
      }

      if (orderAmount < coupon.minOrder) {
        return {
          valid: false,
          message: `Đơn hàng tối thiểu ${coupon.minOrder.toLocaleString()}đ`,
        };
      }

      let discount = 0;
      if (coupon.discountType === "percentage") {
        discount = (orderAmount * coupon.discountValue) / 100;
        if (coupon.maxDiscount) {
          discount = Math.min(discount, coupon.maxDiscount);
        }
      } else {
        discount = coupon.discountValue;
      }

      return { valid: true, discount };
    }

    return apiClient.post<{
      valid: boolean;
      discount?: number;
      message?: string;
    }>("/coupons/validate", { code, orderAmount });
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
        "Hanoi",
        "Ho Chi Minh City",
        "Da Nang",
        "Hoi An",
        "Nha Trang",
        "Phu Quoc",
      ].filter((s) => s.toLowerCase().includes(query.toLowerCase()));
      return suggestions.slice(0, 5);
    }
    // When backend implements this, replace with:
    // return apiClient.get<string[]>(API_CONFIG.ENDPOINTS.SEARCH_SUGGESTIONS, { q: query });
    return [];
  },
};

// ============= HOTEL MANAGER API =============
export const hotelManagerApi = {
  async getMyHotels(): Promise<Hotel[]> {
    if (API_CONFIG.USE_MOCK_DATA) {
      ensureMockLayerReady();
      await mockDelay();
      const userHotels = getMockHotels();
      return userHotels;
    }

    return apiClient.get<Hotel[]>(API_CONFIG.ENDPOINTS.HOTEL_MANAGER_HOTELS);
  },

  // Rooms Management

  async createRoom(
    hotelId: string,
    roomData: Partial<RoomType>
  ): Promise<RoomType> {
    return apiClient.post<RoomType>(API_CONFIG.ENDPOINTS.ADD_ROOM, {
      roomData,
    });
  },

  async updateRoom(roomId: string, updates: Partial<Room>): Promise<Room> {
    return apiClient.put<Room>(
      API_CONFIG.ENDPOINTS.UPDATE_ROOM,
      { roomData: updates },
      { room_id: roomId }
    );
  },

  async deleteRoom(roomId: string): Promise<void> {
    return apiClient.delete(API_CONFIG.ENDPOINTS.ROOM_INVENTORY_DELETE, {
      room_id: roomId,
    });
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
      end_date?: string; // ISO8601 format
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

  // Reviews Management
  async replyToReview(reviewId: string, reply: string): Promise<Review> {
    return apiClient.post<any>(API_CONFIG.ENDPOINTS.REPLY_REVIEW, {
      review_id: reviewId,
      reply,
    });
  },
  // Hotel Info Management
  async getHotelInfo(
    hotelId: string = "h1"
  ): Promise<Hotel & { settings?: Record<string, unknown> }> {
    return apiClient.get<any>(API_CONFIG.ENDPOINTS.VIEW_HOTEL, {
      hotel_id: hotelId,
    });
  },

  async updateHotelInfo(
    hotelId: string,
    updates: Partial<Hotel> & {
      phone?: string;
      email?: string;
      settings?: Record<string, unknown>;
    }
  ): Promise<{ success: boolean }> {
    return apiClient.put<any>(API_CONFIG.ENDPOINTS.UPDATE_HOTEL, {
      hotel_id: hotelId,
      hotelData: updates,
    });
  },

  /**
   * Delete/disable hotel
   * DELETE /hotel-profile/delete-hotel/:hotel_id
   */
  async deleteHotel(hotelId: string): Promise<void> {
    return apiClient.delete(API_CONFIG.ENDPOINTS.DELETE_HOTEL, {
      hotel_id: hotelId,
    });
  },

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
      formData.append("thumbnail", hotelData.thumbnail);
    }
    const { thumbnail, ...data } = hotelData;
    formData.append("hotelData", JSON.stringify(data));

    return apiClient.post<Hotel>(API_CONFIG.ENDPOINTS.ADD_HOTEL, formData);
  },

  // Booking Management for Hotel Manager
  async getHotelBookings(hotelId: string): Promise<Booking[]> {
    return apiClient.get<Booking[]>(API_CONFIG.ENDPOINTS.BOOKING_HISTORY, {
      hotelId,
    });
  },

  async updateBookingStatus(
    bookingId: string,
    status: string
  ): Promise<Booking> {
    return apiClient.patch<Booking>(
      API_CONFIG.ENDPOINTS.UPDATE_BOOKING_STATUS,
      { status },
      { id: bookingId }
    );
  },

  async checkInBooking(bookingId: string): Promise<Booking> {
    return apiClient.post<Booking>(
      API_CONFIG.ENDPOINTS.BOOKING_CHECKIN,
      {},
      { id: bookingId }
    );
  },

  async checkOutBooking(bookingId: string): Promise<Booking> {
    return apiClient.post<Booking>(
      API_CONFIG.ENDPOINTS.BOOKING_CHECKOUT,
      {},
      { id: bookingId }
    );
  },

  // Room Types Management

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

  /**
   * Update room type details
   * PUT /hotel-profile/update-room-type/:type_id
   */
  async updateRoomType(
    typeId: string,
    data: Partial<RoomType>
  ): Promise<RoomType> {
    return apiClient.put<RoomType>(
      API_CONFIG.ENDPOINTS.UPDATE_ROOM_TYPE,
      data,
      { type_id: typeId }
    );
  },

  async updateRoomPrice(typeId: string, newPrice: number): Promise<RoomType> {
    return apiClient.put<RoomType>(API_CONFIG.ENDPOINTS.UPDATE_PRICE, {
      type_id: typeId,
      base_price: newPrice,
    });
  },

  /**
   * Get single room by ID
   * GET /hotel-profile/view-room/:room_id
   */
  async getRoom(roomId: string): Promise<Room> {
    return apiClient.get<Room>(API_CONFIG.ENDPOINTS.VIEW_ROOM, {
      room_id: roomId,
    });
  },

  // Facilities Management
  async getFacilities(hotelId: string): Promise<
    {
      id: number;
      name: string;
      icon: string;
      category: string;
      isActive: boolean;
    }[]
  > {
    if (API_CONFIG.USE_MOCK_DATA) {
      ensureMockLayerReady();
      await mockDelay();
      const cached = localStorage.getItem(`hotelFacilities_${hotelId}`);
      if (cached) {
        return JSON.parse(cached);
      }
      return [];
    }
    const data = await apiClient.get<{
      facilities: Array<{ facility_id: number; name: string }>;
      hotel_facilities: Array<{ facility_id: number }>;
    }>(API_CONFIG.ENDPOINTS.VIEW_FACILITIES, { hotel_id: hotelId });

    const activeIds = new Set(
      (data.hotel_facilities ?? []).map((f) => Number(f.facility_id))
    );
    return (data.facilities ?? []).map((f) => ({
      id: Number(f.facility_id),
      name: String(f.name ?? ""),
      icon: "",
      category: "general",
      isActive: activeIds.has(Number(f.facility_id)),
    }));
  },

  async updateFacilities(
    hotelId: string,
    facilities: {
      id: number;
      name: string;
      icon: string;
      category: string;
      isActive: boolean;
    }[]
  ): Promise<{ success: boolean }> {
    if (API_CONFIG.USE_MOCK_DATA) {
      ensureMockLayerReady();
      await mockDelay();
      localStorage.setItem(
        `hotelFacilities_${hotelId}`,
        JSON.stringify(facilities)
      );
      return { success: true };
    }
    const selected = facilities
      .filter((f) => f.isActive)
      .map((f) => ({ facility_id: f.id }));
    await apiClient.post(
      API_CONFIG.ENDPOINTS.ADD_FACILITY,
      { facilityData: { hotel_id: Number(hotelId), facilities: selected } },
      { hotel_id: hotelId }
    );
    return { success: true };
  },

  // Images Management
  async getImages(hotelId: string): Promise<
    {
      id: number;
      url: string;
      type: string;
      caption: string;
      isThumbnail: boolean;
    }[]
  > {
    if (API_CONFIG.USE_MOCK_DATA) {
      ensureMockLayerReady();
      await mockDelay();
      const cached = localStorage.getItem(`hotelImages_${hotelId}`);
      if (cached) {
        return JSON.parse(cached);
      }
      return [];
    }
    try {
      const hotelData = await apiClient.get<any>(
        API_CONFIG.ENDPOINTS.VIEW_HOTEL,
        { hotel_id: hotelId }
      );
      // Extract images from hotel data
      return Array.isArray(hotelData?.images) ? hotelData.images : [];
    } catch (error) {
      console.error("Error fetching hotel images:", error);
      return [];
    }
  },

  async getAllImages(hotelId: string): Promise<{
    thumbnail: string | null;
    hotelImages: { image_id: number; url: string }[];
    rooms: {
      room_id: number;
      room_name: string | null;
      images: { image_id: number; url: string }[];
    }[];
    all: any[];
  }> {
    return apiClient.get<any>(API_CONFIG.ENDPOINTS.HOTEL_ALL_IMAGES, {
      hotel_id: hotelId,
    });
  },

  async uploadImages(
    hotelId: string,
    files: File[],
    imageType: string,
    caption: string
  ): Promise<{ id: number; url: string; type: string; caption: string }[]> {
    if (API_CONFIG.USE_MOCK_DATA) {
      ensureMockLayerReady();
      await mockDelay();
      const newImages = files.map((file, index) => ({
        id: Date.now() + index,
        url: URL.createObjectURL(file),
        type: imageType,
        caption: caption,
        isThumbnail: false,
        uploadedAt: new Date().toISOString().split("T")[0],
      }));
      const cached = localStorage.getItem(`hotelImages_${hotelId}`);
      const existingImages = cached ? JSON.parse(cached) : [];
      const allImages = [...existingImages, ...newImages];
      localStorage.setItem(`hotelImages_${hotelId}`, JSON.stringify(allImages));
      return newImages;
    }
    // Real API: Use FormData for file upload
    const formData = new FormData();
    files.forEach((file) => formData.append("images", file));
    formData.append("type", imageType);
    formData.append("caption", caption);
    return apiClient.postFormData<any[]>(
      API_CONFIG.ENDPOINTS.UPLOAD_HOTEL_IMAGES,
      { hotel_id: hotelId },
      formData
    );
  },

  async deleteImage(
    hotelId: string,
    imageId: number
  ): Promise<{ success: boolean }> {
    if (API_CONFIG.USE_MOCK_DATA) {
      ensureMockLayerReady();
      await mockDelay();
      const cached = localStorage.getItem(`hotelImages_${hotelId}`);
      if (cached) {
        const images = JSON.parse(cached);
        const filtered = images.filter((img: any) => img.id !== imageId);
        localStorage.setItem(
          `hotelImages_${hotelId}`,
          JSON.stringify(filtered)
        );
      }
      return { success: true };
    }
    return apiClient.delete<any>("/hotel-profile/delete-image/:image_id", {
      image_id: String(imageId),
    });
  },

  async setThumbnail(
    hotelId: string,
    imageId: number
  ): Promise<{ success: boolean }> {
    if (API_CONFIG.USE_MOCK_DATA) {
      ensureMockLayerReady();
      await mockDelay();
      const cached = localStorage.getItem(`hotelImages_${hotelId}`);
      if (cached) {
        const images = JSON.parse(cached);
        const updatedImages = images.map((img: any) => ({
          ...img,
          isThumbnail: img.id === imageId,
        }));
        localStorage.setItem(
          `hotelImages_${hotelId}`,
          JSON.stringify(updatedImages)
        );
      }
      return { success: true };
    }
    return apiClient.put<any>("/hotel-profile/set-thumbnail/:hotel_id", {
      hotel_id: hotelId,
      image_id: imageId,
    });
  },

  /**
   * Upload multiple images for room
   * POST /hotel-profile/upload-images-for-room/:room_id
   */
  async uploadRoomImages(roomId: string, images: File[]): Promise<Image[]> {
    const formData = new FormData();
    images.forEach((image) => formData.append("images", image));

    return apiClient.post<Image[]>(
      API_CONFIG.ENDPOINTS.UPLOAD_ROOM_IMAGES,
      formData,
      { room_id: roomId }
    );
  },
};

// ============= PAYMENT API =============
export const paymentApi = {
  async getConfig(): Promise<{
    supportedMethods: string[];
    bankCodes: { code: string; name: string }[];
  }> {
    return apiClient.get<any>(API_CONFIG.ENDPOINTS.PAYMENT_CONFIG);
  },

  async createPayment(data: {
    bookingId: number;
    amount: number;
    paymentMethod: "vnpay" | "momo" | "cash" | "bank_transfer";
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
    return apiClient.get<Payment>(API_CONFIG.ENDPOINTS.PAYMENT_DETAILS, {
      id: paymentId,
    });
  },

  async getByBooking(bookingId: string): Promise<Payment | null> {
    return apiClient.get<Payment>(API_CONFIG.ENDPOINTS.PAYMENT_BY_BOOKING, {
      bookingId,
    });
  },

  async queryStatus(
    paymentId: string
  ): Promise<{ status: string; vnp_response_code?: string }> {
    return apiClient.get<any>(API_CONFIG.ENDPOINTS.PAYMENT_QUERY_STATUS, {
      id: paymentId,
    });
  },

  async refund(
    paymentId: string,
    amount?: number
  ): Promise<{ success: boolean; refund_id?: string }> {
    return apiClient.post<any>(API_CONFIG.ENDPOINTS.PAYMENT_REFUND, {
      id: paymentId,
      amount,
    });
  },

  async cancelPayment(paymentId: string): Promise<void> {
    return apiClient.post(API_CONFIG.ENDPOINTS.PAYMENT_CANCEL, {}, { id: paymentId });
  },

  // Mark payment as completed (for mock/testing)
  async completePayment(paymentId: string): Promise<Payment> {
    // Real API would handle this via VNPay callback
    throw new Error("Use VNPay callback for completing payments");
  },
};

// ============= PRICING ENGINE API =============
export const pricingEngineApi = {
  async calculatePrice(data: {
    type_id: number;
    check_in_date: string;
    check_out_date: string;
    guests?: number;
    promo_code?: string;
  }): Promise<{
    totalPrice: number;
    breakdown: {
      nights: number;
      guests: number;
      subtotal: number;
      totalDiscount: number;
      finalTotal: number;
      dailyBreakdown: Array<{
        date: string;
        base_price: number;
        event?: string;
        discount_rate: number;
        discount_amount: number;
        final_price: number;
      }>;
      promoCode?: string;
      eventApplied?: string;
    };
  }> {
    return apiClient.post(API_CONFIG.ENDPOINTS.PRICING_CALCULATE, data);
  },

  async getPriceForDate(
    typeId: number,
    date: string
  ): Promise<{
    price: number;
    base_price: number;
    event?: string;
    discount: number;
  }> {
    return apiClient.get(API_CONFIG.ENDPOINTS.PRICING_GET_PRICE, {
      typeId: typeId.toString(),
      date,
    });
  },

  async getPriceRange(
    typeId: number,
    startDate: string,
    endDate: string
  ): Promise<{
    minPrice: number;
    maxPrice: number;
    averagePrice: number;
    dailyPrices: Array<{
      date: string;
      price: number;
      base_price: number;
      event?: string;
      discount: number;
    }>;
  }> {
    return apiClient.get(API_CONFIG.ENDPOINTS.PRICING_GET_RANGE, {
      typeId: typeId.toString(),
      start_date: startDate,
      end_date: endDate,
    });
  },

  async updatePricing(
    typeId: number,
    pricingData: {
      basic_price?: number;
      special_price?: number;
      discount?: number;
      event?: string;
      start_date?: string;
      end_date?: string;
    }
  ): Promise<{
    message: string;
    pricing: {
      type_id: number;
      basic_price: number;
      special_price?: number;
      discount: number;
      event?: string;
      start_date?: string;
      end_date?: string;
    };
  }> {
    return apiClient.put(API_CONFIG.ENDPOINTS.PRICING_UPDATE, pricingData, {
      typeId: typeId.toString(),
    });
  },
};

// ============= SYNCHRONIZATION API =============
export const synchronizationApi = {
  async syncHotelAvailability(
    hotelId: number,
    startDate: string,
    endDate: string
  ): Promise<{
    synced: boolean;
    records: number;
    timestamp: string;
    data: {
      hotel_id: number;
      hotel_name: string;
      sync_timestamp: string;
      availability: Array<{
        room_type_id: number;
        room_type: string;
        rooms: Array<{
          room_id: number;
          room_name: string;
          status: number;
          calendar: Array<{
            date: string;
            available: boolean;
          }>;
        }>;
      }>;
    };
  }> {
    return apiClient.post(
      API_CONFIG.ENDPOINTS.SYNC_HOTEL_AVAILABILITY,
      {
        start_date: startDate,
        end_date: endDate,
      },
      { hotelId: hotelId.toString() }
    );
  },

  async syncHotelPricing(hotelId: number): Promise<{
    synced: boolean;
    records: number;
    timestamp: string;
    data: {
      hotel_id: number;
      hotel_name: string;
      sync_timestamp: string;
      pricing: Array<{
        room_type_id: number;
        room_type: string;
        base_price: number;
        special_price?: number;
        special_price_start?: string;
        special_price_end?: string;
        event?: string;
        discount: number;
      }>;
    };
  }> {
    return apiClient.post(
      API_CONFIG.ENDPOINTS.SYNC_HOTEL_PRICING,
      {},
      { hotelId: hotelId.toString() }
    );
  },

  async syncHotelData(
    hotelId: number,
    startDate: string,
    endDate: string
  ): Promise<{
    availability: any;
    pricing: any;
    synced_at: string;
  }> {
    return apiClient.post(
      API_CONFIG.ENDPOINTS.SYNC_HOTEL_DATA,
      {
        start_date: startDate,
        end_date: endDate,
      },
      { hotelId: hotelId.toString() }
    );
  },

  async syncMultipleHotels(data: {
    hotel_ids: number[];
    start_date: string;
    end_date: string;
  }): Promise<
    Array<{
      hotel_id: number;
      success: boolean;
      error?: string;
      availability?: any;
      pricing?: any;
    }>
  > {
    return apiClient.post(API_CONFIG.ENDPOINTS.SYNC_MULTIPLE_HOTELS, data);
  },

  async getSyncStatus(hotelId: number): Promise<{
    hotel_id: number;
    last_sync: string | null;
    status: string;
    room_types_count: number;
    pricing_configured: boolean;
  }> {
    return apiClient.get(API_CONFIG.ENDPOINTS.SYNC_STATUS, {
      hotelId: hotelId.toString(),
    });
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
    return apiClient.post<any>(
      API_CONFIG.ENDPOINTS.ROOM_CHECK_AVAILABILITY,
      data
    );
  },

  async getAvailableRooms(
    hotelId: string,
    checkIn?: string,
    checkOut?: string
  ): Promise<RoomType[]> {
    const params: Record<string, string> = { hotelId };
    if (checkIn) params.checkIn = checkIn;
    if (checkOut) params.checkOut = checkOut;
    return apiClient.get<RoomType[]>(
      API_CONFIG.ENDPOINTS.ROOM_AVAILABLE,
      params
    );
  },

  async getRoomType(typeId: string): Promise<RoomType | null> {
    return apiClient.get<RoomType>(API_CONFIG.ENDPOINTS.ROOM_TYPE_BY_ID, {
      id: typeId,
    });
  },

  async getRoomTypesByHotel(hotelId: string): Promise<RoomType[]> {
    return apiClient.get<RoomType[]>(API_CONFIG.ENDPOINTS.ROOM_TYPES_BY_HOTEL, {
      hotelId,
    });
  },

  async getRoom(roomId: string): Promise<Room | null> {
    return apiClient.get<Room>(API_CONFIG.ENDPOINTS.ROOM_BY_ID, { id: roomId });
  },

  async getRoomsByType(typeId: string): Promise<Room[]> {
    return apiClient.get<Room[]>(API_CONFIG.ENDPOINTS.ROOMS_BY_TYPE, {
      typeId,
    });
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
    return apiClient.post<any>(API_CONFIG.ENDPOINTS.ROOM_HOLD_RELEASE, {
      holdId,
    });
  },

  async getInventoryCalendar(
    typeId: string,
    startDate: string,
    endDate: string
  ): Promise<
    {
      date: string;
      available: number;
      booked: number;
      held: number;
    }[]
  > {
    return apiClient.get<any>(API_CONFIG.ENDPOINTS.ROOM_INVENTORY_CALENDAR, {
      typeId,
      startDate,
      endDate,
    });
  },
};

// ============= DESTINATIONS EXTENDED API =============
export const destinationsApi = {
  async getAll(): Promise<Destination[]> {
    return apiClient.get<Destination[]>(API_CONFIG.ENDPOINTS.ALL_DESTINATIONS);
  },

  async getById(id: string): Promise<Destination | null> {
    return apiClient.get<Destination>(
      API_CONFIG.ENDPOINTS.VIEW_DESTINATION.replace(":destination_id", id)
    );
  },

  async search(query: string): Promise<Destination[]> {
    return apiClient.get<Destination[]>(
      API_CONFIG.ENDPOINTS.SEARCH_DESTINATIONS,
      { q: query }
    );
  },

  async getByType(type: string): Promise<Destination[]> {
    return apiClient.get<Destination[]>(
      API_CONFIG.ENDPOINTS.DESTINATIONS_BY_TYPE.replace(":type", type)
    );
  },

  async create(data: Partial<Destination>): Promise<Destination> {
    return apiClient.post<Destination>(
      API_CONFIG.ENDPOINTS.CREATE_DESTINATION,
      data
    );
  },

  async update(id: string, data: Partial<Destination>): Promise<Destination> {
    return apiClient.put<Destination>(
      API_CONFIG.ENDPOINTS.UPDATE_DESTINATION.replace(":id", id),
      data
    );
  },

  async delete(id: string): Promise<{ success: boolean; message: string }> {
    return apiClient.delete<{ success: boolean; message: string }>(
      API_CONFIG.ENDPOINTS.DELETE_DESTINATION.replace(":id", id)
    );
  },

  async addReview(
    destinationId: string,
    reviewData: Partial<Review>
  ): Promise<Review> {
    return apiClient.post<Review>(
      API_CONFIG.ENDPOINTS.ADD_DESTINATION_REVIEW.replace(":id", destinationId),
      reviewData
    );
  },

  async getImages(destinationId: number | string): Promise<Image[]> {
    return apiClient.get<Image[]>(
      API_CONFIG.ENDPOINTS.DESTINATION_IMAGES.replace(
        ":id",
        destinationId.toString()
      )
    );
  },

  async uploadThumbnail(
    id: number | string,
    file: File
  ): Promise<{ success: boolean; url: string; thumbnail: string }> {
    const formData = new FormData();
    formData.append("thumbnail", file);

    const response = await fetch(
      `${
        API_CONFIG.BASE_URL
      }${API_CONFIG.ENDPOINTS.DESTINATION_THUMBNAIL.replace(
        ":id",
        id.toString()
      )}`,
      {
        method: "POST",
        credentials: "include",
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error("Failed to upload thumbnail");
    }

    return response.json();
  },

  async deleteThumbnail(
    id: number | string
  ): Promise<{ success: boolean; message: string }> {
    return apiClient.delete<{ success: boolean; message: string }>(
      API_CONFIG.ENDPOINTS.DESTINATION_THUMBNAIL.replace(":id", id.toString())
    );
  },

  async uploadImage(
    id: number | string,
    file: File
  ): Promise<{ success: boolean; url: string; image: Image }> {
    const formData = new FormData();
    formData.append("image", file);

    const response = await fetch(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.DESTINATION_IMAGES.replace(
        ":id",
        id.toString()
      )}`,
      {
        method: "POST",
        credentials: "include",
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error("Failed to upload image");
    }

    return response.json();
  },

  async deleteImage(
    destinationId: number | string,
    imageId: number | string
  ): Promise<{ success: boolean; message: string }> {
    return apiClient.delete<{ success: boolean; message: string }>(
      API_CONFIG.ENDPOINTS.DELETE_DESTINATION_IMAGE.replace(
        ":id",
        destinationId.toString()
      ).replace(":imageId", imageId.toString())
    );
  },

  async getReviews(destinationId: string): Promise<Review[]> {
    return apiClient.get<Review[]>(
      API_CONFIG.ENDPOINTS.GET_DESTINATION_REVIEWS,
      { id: destinationId }
    );
  },

  async addToLovingList(
    destinationId: string
  ): Promise<{ message: string; data: any }> {
    console.log(
      API_CONFIG.ENDPOINTS.ADD_TO_LOVING_LIST.replace(":id", destinationId)
    );
    return apiClient.post<any>(
      API_CONFIG.ENDPOINTS.ADD_TO_LOVING_LIST.replace(":id", destinationId),
      { id: destinationId }
    );
  },

  async removeFromLovingList(
    destinationId: string
  ): Promise<{ message: string }> {
    return apiClient.delete<{ message: string }>(
      API_CONFIG.ENDPOINTS.REMOVE_FROM_LOVING_LIST.replace(":id", destinationId)
    );
  },

  async getLovingList(): Promise<Destination[]> {
    console.log(100);
    return apiClient.get<Destination[]>(API_CONFIG.ENDPOINTS.GET_LOVING_LIST);
  },

  async checkLovingListStatus(
    destinationId: string
  ): Promise<{ isInLovingList: boolean }> {
    return apiClient.get<{ isInLovingList: boolean }>(
      API_CONFIG.ENDPOINTS.CHECK_LOVING_LIST_STATUS.replace(
        ":id",
        destinationId
      )
    );
  },
};

// ============= USER PROFILE EXTENDED API =============
export const userProfileApi = {
  ...userApi,

  async deleteAccount(): Promise<boolean> {
    return apiClient.delete<boolean>(API_CONFIG.ENDPOINTS.DELETE_PROFILE);
  },

  async uploadProfileImage(
    file: File
  ): Promise<{ imageUrl: string; message: string }> {
    const formData = new FormData();
    formData.append("image", file);

    const response = await fetch(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.UPLOAD_PROFILE_IMAGE}`,
      {
        method: "POST",
        credentials: "include",
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error("Failed to upload image");
    }

    const data = await response.json();
    return {
      imageUrl: data.profile_image,
      message: data.message,
    };
  },

  async getProfileImage(): Promise<{ imageUrl: string | null }> {
    return apiClient.get<{ imageUrl: string | null }>(
      API_CONFIG.ENDPOINTS.GET_PROFILE_IMAGE
    );
  },

  async deleteProfileImage(): Promise<boolean> {
    return apiClient.delete<boolean>(API_CONFIG.ENDPOINTS.DELETE_PROFILE_IMAGE);
  },

  async getAllUsers(): Promise<User[]> {
    return apiClient.get<User[]>(API_CONFIG.ENDPOINTS.GET_ALL_USERS);
  },

  async getUserBookings(): Promise<Booking[]> {
    return apiClient.get<Booking[]>(API_CONFIG.ENDPOINTS.USER_BOOKINGS);
  },

  async createUser(userData: Partial<User>): Promise<User> {
    return apiClient.post<User>(API_CONFIG.ENDPOINTS.CREATE_USER, userData);
  },

  // User coupons/vouchers - KEEP MOCK (backend doesn't have this)
  async getCoupons(): Promise<any[]> {
    if (API_CONFIG.USE_MOCK_DATA) {
      await mockDelay();
      const coupons = localStorage.getItem("userCoupons");
      if (coupons) return JSON.parse(coupons);

      // Default mock coupons
      const defaultCoupons = [
        {
          id: 1,
          code: "SUMMER2024",
          discount: 15,
          type: "percentage",
          minAmount: 500000,
          expiresAt: "2024-12-31",
          isActive: true,
        },
        {
          id: 2,
          code: "NEWUSER",
          discount: 100000,
          type: "fixed",
          minAmount: 200000,
          expiresAt: "2024-12-31",
          isActive: true,
        },
      ];
      localStorage.setItem("userCoupons", JSON.stringify(defaultCoupons));
      return defaultCoupons;
    }
    // When backend implements this, replace with:
    // return apiClient.get<any[]>(API_CONFIG.ENDPOINTS.USER_COUPONS);
    return [];
  },

  async applyCoupon(
    code: string,
    bookingAmount: number
  ): Promise<{ valid: boolean; discount: number }> {
    if (API_CONFIG.USE_MOCK_DATA) {
      await mockDelay();
      const coupons = JSON.parse(localStorage.getItem("userCoupons") || "[]");
      const coupon = coupons.find((c: any) => c.code === code && c.isActive);

      if (!coupon) {
        return { valid: false, discount: 0 };
      }

      if (bookingAmount < coupon.minAmount) {
        return { valid: false, discount: 0 };
      }

      const discount =
        coupon.type === "percentage"
          ? Math.floor((bookingAmount * coupon.discount) / 100)
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
    return apiClient.post<any>(API_CONFIG.ENDPOINTS.NOTIFICATION_TEST, {
      email,
    });
  },

  async sendBookingConfirmation(bookingData: {
    userEmail: string;
    userName: string;
    bookingId: number;
    hotelName: string;
    roomType: string;
    roomName: string;
    guests: number;
    check_in_date: string;
    check_out_date: string;
    totalPrice: number;
  }): Promise<{ success: boolean }> {
    return apiClient.post<any>(
      API_CONFIG.ENDPOINTS.NOTIFICATION_BOOKING_CONFIRM,
      bookingData
    );
  },

  async sendBookingCancellation(
    bookingId: number,
    email: string
  ): Promise<{ success: boolean }> {
    return apiClient.post<any>(
      API_CONFIG.ENDPOINTS.NOTIFICATION_BOOKING_CANCEL,
      { bookingId, email }
    );
  },

  async sendPasswordReset(
    email: string,
    resetUrl: string
  ): Promise<{ success: boolean }> {
    return apiClient.post<any>(
      API_CONFIG.ENDPOINTS.NOTIFICATION_PASSWORD_RESET,
      { email, resetUrl }
    );
  },

  async sendWelcomeEmail(
    email: string,
    name: string
  ): Promise<{ success: boolean }> {
    return apiClient.post<any>(API_CONFIG.ENDPOINTS.NOTIFICATION_WELCOME, {
      email,
      name,
    });
  },

  async sendPaymentConfirmation(
    paymentId: number,
    email: string
  ): Promise<{ success: boolean }> {
    return apiClient.post<any>(
      API_CONFIG.ENDPOINTS.NOTIFICATION_PAYMENT_CONFIRM,
      { paymentId, email }
    );
  },
};

// ============= ADMIN API =============
export const adminApi = {
  async getDashboard(): Promise<AdminDashboard> {
    const response = await apiClient.get<any>(API_CONFIG.ENDPOINTS.ADMIN_DASHBOARD);
    
    // Transform backend response to frontend format
    const metrics = response.metrics || response;
    
    return {
      totalUsers: metrics.users?.total || 0,
      totalHotels: metrics.hotels?.total || 0,
      totalBookings: metrics.bookings?.total || 0,
      totalRevenue: metrics.revenue?.total || 0,
      pendingHotels: metrics.hotels?.pending || 0,
      activeHotels: metrics.hotels?.active || 0,
      activeBookings: metrics.rooms?.active || 0,
      todayBookings: 0, // Backend doesn't provide this
      todayRevenue: 0, // Backend doesn't provide this
      recentActivity: [], // Backend doesn't provide this
      bookingKPIs: {
        totalBookings: metrics.bookings?.total || 0,
        confirmedBookings: metrics.bookings?.byStatus?.confirmed || 0,
        cancelledBookings: metrics.bookings?.byStatus?.cancelled || 0,
        pendingBookings: metrics.bookings?.byStatus?.pending || 0,
        completedBookings: metrics.bookings?.byStatus?.completed || 0,
        conversionRate: 0,
        averageBookingValue: metrics.revenue?.total && metrics.bookings?.total 
          ? Math.round(metrics.revenue.total / metrics.bookings.total)
          : 0,
      },
    };
  },

  async getAllUsers(): Promise<AdminUser[]> {
    const response = await apiClient.get<{ users: AdminUser[]; total: number; limit: number; offset: number }>(
      API_CONFIG.ENDPOINTS.ADMIN_USERS
    );
    // Backend returns { data: { users: [...], total, limit, offset } }
    // apiClient already unwraps to response.data, so we get { users, total, limit, offset }
    return (response as any).users || response;
  },

  async getUserById(userId: string): Promise<AdminUser | null> {
    return apiClient.get<AdminUser>(
      API_CONFIG.ENDPOINTS.ADMIN_USER_BY_ID.replace(':id', userId)
    );
  },

  async updateUserRole(userId: string, newRole: 'customer' | 'hotel_manager' | 'admin'): Promise<{ success: boolean }> {
    return apiClient.patch<any>(
      API_CONFIG.ENDPOINTS.ADMIN_UPDATE_USER_ROLE.replace(':id', userId),
      { role: newRole }
    );
  },

  async deleteUser(userId: string): Promise<{ success: boolean }> {
    return apiClient.delete<any>(
      API_CONFIG.ENDPOINTS.ADMIN_DELETE_USER.replace(':id', userId)
    );
  },

  async getPendingHotels(): Promise<AdminHotel[]> {
    return apiClient.get<AdminHotel[]>(API_CONFIG.ENDPOINTS.ADMIN_PENDING_HOTELS);
  },

  async approveHotel(hotelId: string): Promise<{ success: boolean }> {
    return apiClient.post<any>(
      API_CONFIG.ENDPOINTS.ADMIN_APPROVE_HOTEL.replace(':id', hotelId),
      {}
    );
  },

  async rejectHotel(hotelId: string, reason: string): Promise<{ success: boolean }> {
    return apiClient.post<any>(
      `/api/v1/admin/hotels/${hotelId}/reject`,
      { reason }
    );
  },

  async lockHotel(hotelId: string): Promise<{ success: boolean }> {
    return apiClient.post<any>(
      API_CONFIG.ENDPOINTS.ADMIN_LOCK_HOTEL.replace(':id', hotelId),
      {}
    );
  },

  async getRevenueMetrics(): Promise<RevenueMetrics> {
    return apiClient.get<RevenueMetrics>(API_CONFIG.ENDPOINTS.ADMIN_REVENUE_METRICS);
  },

  async getBookingKPIs(): Promise<AdminDashboard['bookingKPIs']> {
    return apiClient.get<AdminDashboard['bookingKPIs']>(API_CONFIG.ENDPOINTS.ADMIN_BOOKING_KPIS);
  },

  async getRecentActivity(): Promise<AdminActivity[]> {
    return apiClient.get<AdminActivity[]>(API_CONFIG.ENDPOINTS.ADMIN_RECENT_ACTIVITY);
  },
};

// Export types for convenience
export type {
  AdminDashboard,
  AdminActivity,
  AdminUser,
  AdminHotel,
  RevenueMetrics,
};
