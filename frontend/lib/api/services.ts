/**
 * API Services
 * Automatically switches between mock and real API based on API_CONFIG.USE_MOCK_DATA
 * Mock data is stored in localStorage for persistence
 */

import { API_CONFIG } from "./config";
import { apiClient } from "./client";
import {
  mockTourismSpots,
  mockReviews as defaultMockReviews,
  mockBookings as defaultMockBookings,
  mockUser as defaultMockUser,
} from "../mock/data";
import {
  getMockUser,
  getMockBookings,
  getMockReviews,
  getMockHotels,
  getMockTourismSpots,
  getMockRoomTypesByHotel,
  getMockRoomTypes,
  updateMockUser,
  addMockBooking,
  addMockReview,
  updateMockBooking,
  setMockReviews,
  setMockRoomTypes,
  initializeMockData,
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
  async getAll(filters?: SearchFilters): Promise<Hotel[]> {
    if (API_CONFIG.USE_MOCK_DATA) {
      ensureMockLayerReady();
      await mockDelay();
      // Get hotels from localStorage
      let hotels = getMockHotels();

      // Apply filters
      if (filters?.location) {
        hotels = hotels.filter(
          (h) =>
            (typeof h.city === "string" &&
              h.city.toLowerCase().includes(filters.location!.toLowerCase())) ||
            (typeof h.district === "string" &&
              h.district
                .toLowerCase()
                .includes(filters.location!.toLowerCase()))
        );
      }

      if (filters?.minPrice) {
        hotels = hotels.filter(
          (h) =>
            typeof h.basePrice === "number" && h.basePrice >= filters.minPrice!
        );
      }

      if (filters?.maxPrice) {
        hotels = hotels.filter(
          (h) =>
            typeof h.basePrice === "number" && h.basePrice <= filters.maxPrice!
        );
      }

      if (filters?.stars && filters.stars.length > 0) {
        hotels = hotels.filter(
          (h: Hotel) =>
            h.stars !== undefined && filters.stars!.includes(h.stars)
        );
      }

      // Sort
      if (filters?.sortBy === "price") {
        hotels = hotels
          .slice()
          .sort(
            (a: Hotel, b: Hotel) => (a.basePrice ?? 0) - (b.basePrice ?? 0)
          );
      } else if (filters?.sortBy === "rating") {
        hotels = hotels
          .slice()
          .sort((a: Hotel, b: Hotel) => (b.rating ?? 0) - (a.rating ?? 0));
      }

      return hotels;
    }

    // Real API call - Use ALL_HOTELS endpoint
    return apiClient.get<Hotel[]>(API_CONFIG.ENDPOINTS.ALL_HOTELS);
  },

  async getById(id: string): Promise<Hotel | null> {
    if (API_CONFIG.USE_MOCK_DATA) {
      ensureMockLayerReady();
      await mockDelay();
      const hotels = getMockHotels();
      return (
        hotels.find(
          (h) => String((h as any).hotel_id ?? (h as any).id) === String(id)
        ) || null
      );
    }

    return apiClient.get<Hotel>(API_CONFIG.ENDPOINTS.VIEW_HOTEL, {
      hotel_id: id,
    });
  },

  async getBySlug(slug: string): Promise<Hotel | null> {
    if (API_CONFIG.USE_MOCK_DATA) {
      ensureMockLayerReady();
      await mockDelay();
      const hotels = getMockHotels();
      return hotels.find((h) => h.slug === slug) || null;
    }

    // Real API call - adjust endpoint as needed
    return apiClient.get<Hotel>(`/hotels/slug/${slug}`);
  },

  async getRooms(hotelId: string): Promise<RoomType[]> {
    if (API_CONFIG.USE_MOCK_DATA) {
      ensureMockLayerReady();
      await mockDelay();
      return getMockRoomTypesByHotel(hotelId);
    }

    return apiClient.get<RoomType[]>(API_CONFIG.ENDPOINTS.VIEW_ALL_ROOMS, {
      hotel_id: hotelId,
    });
  },

  async getReviews(hotelId: string): Promise<Review[]> {
    if (API_CONFIG.USE_MOCK_DATA) {
      ensureMockLayerReady();
      await mockDelay();
      const reviews = getMockReviews();
      return reviews.filter(
        (r) => String(r.hotel_id ?? (r as any).hotelId) === String(hotelId)
      );
    }

    return apiClient.get<Review[]>(API_CONFIG.ENDPOINTS.ALL_REVIEWS, {
      hotel_id: hotelId,
    });
  },
};

// ============= TOURISM API =============
export const tourismApi = {
  async getAll(): Promise<TourismSpot[]> {
    // if (API_CONFIG.USE_MOCK_DATA) {
    //   ensureMockLayerReady();
    //   await mockDelay();
    //   return getMockTourismSpots();
    // }

    return apiClient.get<TourismSpot[]>(API_CONFIG.ENDPOINTS.ALL_DESTINATIONS);
  },

  async getById(id: string): Promise<TourismSpot | null> {
    // if (API_CONFIG.USE_MOCK_DATA) {
    //   ensureMockLayerReady();
    //   await mockDelay();
    //   const spots = getMockTourismSpots();
    //   return (
    //     spots.find(
    //       (t) =>
    //         String((t as any).destination_id ?? (t as any).id) === String(id)
    //     ) || null
    //   );
    // }

    return apiClient.get<TourismSpot>(API_CONFIG.ENDPOINTS.VIEW_DESTINATION, {
      destination_id: id,
    });
  },

  async getBySlug(slug: string): Promise<TourismSpot | null> {
    // if (API_CONFIG.USE_MOCK_DATA) {
    //   ensureMockLayerReady();
    //   await mockDelay();
    //   const spots = getMockTourismSpots();
    //   return spots.find((t) => t.slug === slug) || null;
    // }

    return apiClient.get<TourismSpot>(`/tourism/slug/${slug}`);
  },
};

// ============= BOOKINGS API =============
export const bookingsApi = {
  async getAll(): Promise<Booking[]> {
    if (API_CONFIG.USE_MOCK_DATA) {
      ensureMockLayerReady();
      await mockDelay();
      // Get bookings from localStorage
      return getMockBookings();
    }

    return apiClient.get<Booking[]>(API_CONFIG.ENDPOINTS.BOOKING_HISTORY);
  },

  async getById(id: string): Promise<Booking | null> {
    if (API_CONFIG.USE_MOCK_DATA) {
      ensureMockLayerReady();
      await mockDelay();
      const bookings = getMockBookings();
      return (
        bookings.find(
          (b) => String((b as any).booking_id ?? (b as any).id) === String(id)
        ) || null
      );
    }

    return apiClient.get<Booking>(API_CONFIG.ENDPOINTS.BOOKING_DETAILS, { id });
  },

  async create(bookingData: Partial<Booking>): Promise<Booking> {
    if (API_CONFIG.USE_MOCK_DATA) {
      ensureMockLayerReady();
      await mockDelay();
      const nowId = Date.now();
      const newBooking: Booking = {
        booking_id: nowId,
        user_id: bookingData.user_id ?? null,
        room_id: bookingData.room_id ?? 0,
        status: bookingData.status ?? "pending",
        total_price: bookingData.total_price ?? null,
        check_in_date: bookingData.check_in_date ?? "",
        check_out_date: bookingData.check_out_date ?? "",
        created_at: bookingData.created_at ?? new Date().toISOString(),
        people: bookingData.people ?? null,
        hotelName: bookingData.hotelName,
        hotelImage: bookingData.hotelImage,
        roomType: bookingData.roomType,
        nights: bookingData.nights,
        paymentStatus: bookingData.paymentStatus ?? "pending",
        paymentMethod: bookingData.paymentMethod,
      };
      // Save to localStorage
      addMockBooking(newBooking);
      return newBooking;
    }

    return apiClient.post<Booking>(
      API_CONFIG.ENDPOINTS.ADD_BOOKING,
      bookingData
    );
  },

  async cancel(id: string): Promise<boolean> {
    if (API_CONFIG.USE_MOCK_DATA) {
      ensureMockLayerReady();
      await mockDelay();
      // Update booking status in localStorage
      updateMockBooking(Number(id), {
        status: "cancelled",
        paymentStatus: "refunded",
      });
      return true;
    }

    return apiClient.post<boolean>(API_CONFIG.ENDPOINTS.CANCEL_BOOKING, { id });
  },

  async update(id: string, bookingData: Partial<Booking>): Promise<Booking> {
    if (API_CONFIG.USE_MOCK_DATA) {
      ensureMockLayerReady();
      await mockDelay();
      updateMockBooking(Number(id), bookingData);
      const bookings = getMockBookings();
      return (
        bookings.find((b) => b.booking_id === Number(id)) ||
        (bookingData as Booking)
      );
    }

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
    if (API_CONFIG.USE_MOCK_DATA) {
      await mockDelay();
      return { available: true };
    }

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
    if (API_CONFIG.USE_MOCK_DATA) {
      await mockDelay();
      // Mock calculation
      const nights = Math.ceil(
        (new Date(data.check_out_date).getTime() -
          new Date(data.check_in_date).getTime()) /
          (1000 * 60 * 60 * 24)
      );
      return { total_price: nights * 500000 };
    }

    return apiClient.post<{ total_price: number }>(
      API_CONFIG.ENDPOINTS.CALCULATE_PRICE,
      data
    );
  },
};

// ============= USER API =============
export const userApi = {
  async getProfile(): Promise<User> {
    // if (API_CONFIG.USE_MOCK_DATA) {
    //   ensureMockLayerReady();
    //   await mockDelay();
    //   // Get user from localStorage
    //   const user = getMockUser();
    //   return user || defaultMockUser;
    // }

    return apiClient.get<User>(API_CONFIG.ENDPOINTS.VIEW_PROFILE);
  },

  async updateProfile(data: Partial<User>): Promise<User> {
    // if (API_CONFIG.USE_MOCK_DATA) {
    //   ensureMockLayerReady();
    //   await mockDelay();
    //   // Update user in localStorage
    //   updateMockUser(data);
    //   const user = getMockUser();
    //   return user || defaultMockUser;
    // }

    return apiClient.put<User>(API_CONFIG.ENDPOINTS.UPDATE_PROFILE, data);
  },
};

// ============= REVIEWS API =============
export const reviewsApi = {
  async getAll(): Promise<Review[]> {
    if (API_CONFIG.USE_MOCK_DATA) {
      ensureMockLayerReady();
      await mockDelay();
      return getMockReviews();
    }

    // Real API: get reviews - backend may need a general endpoint
    // For now, return empty array if no general endpoint exists
    try {
      return await apiClient.get<Review[]>("/reviews");
    } catch {
      console.warn("Reviews API endpoint not available, returning empty array");
      return [];
    }
  },

  async getByHotelId(hotelId: string): Promise<Review[]> {
    if (API_CONFIG.USE_MOCK_DATA) {
      ensureMockLayerReady();
      await mockDelay();
      const reviews = getMockReviews();
      return reviews.filter((r) => String(r.hotel_id) === String(hotelId));
    }

    return apiClient.get<Review[]>(API_CONFIG.ENDPOINTS.ALL_REVIEWS, {
      hotel_id: hotelId,
    });
  },

  async create(reviewData: Partial<Review>): Promise<Review> {
    if (API_CONFIG.USE_MOCK_DATA) {
      ensureMockLayerReady();
      await mockDelay();
      const nowId = Date.now();
      const newReview: Review = {
        review_id: nowId,
        user_id: reviewData.user_id ?? 0,
        destination_id: reviewData.destination_id ?? null,
        hotel_id: reviewData.hotel_id ?? null,
        room_id: reviewData.room_id ?? null,
        rating: reviewData.rating ?? 0,
        comment: reviewData.comment ?? "",
        date_created: reviewData.date_created ?? new Date().toISOString(),
        userName: reviewData.userName,
        userAvatar: reviewData.userAvatar,
        title: reviewData.title,
        images: reviewData.images,
        helpful: reviewData.helpful ?? 0,
        verified: reviewData.verified ?? true,
      };
      // Save to localStorage
      addMockReview(newReview);
      return newReview;
    }

    return apiClient.post<Review>(API_CONFIG.ENDPOINTS.ADD_REVIEW, reviewData);
  },

  async update(id: string, reviewData: Partial<Review>): Promise<Review> {
    if (API_CONFIG.USE_MOCK_DATA) {
      ensureMockLayerReady();
      await mockDelay();
      const reviews = getMockReviews();
      const review = reviews.find(
        (r) => String(r.review_id ?? (r as any).id) === String(id)
      );
      const updatedReview = { ...review!, ...reviewData };
      // Update in localStorage
      const allReviews = reviews.map((r) =>
        String(r.review_id ?? (r as any).id) === String(id) ? updatedReview : r
      );
      setMockReviews(allReviews);
      return updatedReview;
    }

    return apiClient.put<Review>(API_CONFIG.ENDPOINTS.UPDATE_REVIEW, {
      review_id: id,
      ...reviewData,
    });
  },

  async delete(id: string): Promise<boolean> {
    if (API_CONFIG.USE_MOCK_DATA) {
      ensureMockLayerReady();
      await mockDelay();
      // Delete from localStorage
      const reviews = getMockReviews();
      const filtered = reviews.filter(
        (r) => String(r.review_id ?? (r as any).id) !== String(id)
      );
      setMockReviews(filtered);
      return true;
    }

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
    if (API_CONFIG.USE_MOCK_DATA) {
      ensureMockLayerReady();
      await mockDelay();

      // Apply additional filters
      return hotelsApi.getAll(filters);
    }

    // Backend doesn't have search endpoint yet, use ALL_ROOMS with filters
    return apiClient.get<Hotel[]>(API_CONFIG.ENDPOINTS.ALL_ROOMS);
  },

  async suggestions(query: string): Promise<string[]> {
    if (API_CONFIG.USE_MOCK_DATA) {
      await mockDelay(200);
      const hotels = getMockHotels();
      const suggestions = hotels
        .filter((h) => h.name.toLowerCase().includes(query.toLowerCase()))
        .map((h) => h.name)
        .slice(0, 5);
      return suggestions;
    }

    // Backend doesn't have search suggestions endpoint yet
    // Temporary: return empty array or implement client-side search
    return [];
  },
};

// ============= HOTEL MANAGER API =============
export const hotelManagerApi = {
  // Rooms Management
  async getRooms(hotelId: string = "h1"): Promise<RoomType[]> {
    if (API_CONFIG.USE_MOCK_DATA) {
      ensureMockLayerReady();
      await mockDelay();
      return getMockRoomTypesByHotel(hotelId);
    }
    return apiClient.get<RoomType[]>(API_CONFIG.ENDPOINTS.VIEW_ALL_ROOMS, {
      hotel_id: hotelId,
    });
  },

  async createRoom(
    hotelId: string,
    roomData: Partial<RoomType>
  ): Promise<RoomType> {
    if (API_CONFIG.USE_MOCK_DATA) {
      ensureMockLayerReady();
      await mockDelay();

      const typeId = Date.now();
      const providedName = (roomData as any).name;
      const providedAvailable = (roomData as any).available;
      const providedMaxGuests =
        roomData.max_guests ?? (roomData as any).maxGuests ?? 2;
      const baseRoom: RoomType = {
        type_id: typeId,
        hotel_id: Number(hotelId),
        type: roomData.type ?? providedName ?? "New Room",
        availability: roomData.availability ?? true,
        max_guests: providedMaxGuests,
        description: roomData.description ?? "",
        quantity: roomData.quantity ?? Number(providedAvailable ?? 0),
        size: roomData.size ? Number(roomData.size) : undefined,
        beds: roomData.beds,
        basePrice: roomData.basePrice,
        images: roomData.images,
        amenities: roomData.amenities,
      };

      // Keep extra frontend-friendly fields for compatibility
      const roomWithExtras = {
        ...baseRoom,
        id: `${hotelId}-r${typeId}`,
        hotelId,
        name: providedName ?? baseRoom.type,
        available: providedAvailable ?? baseRoom.quantity ?? 0,
      } as RoomType;

      const allRoomTypes = getMockRoomTypes();
      const hotelRooms = allRoomTypes[hotelId] || [];
      hotelRooms.push(roomWithExtras);
      allRoomTypes[hotelId] = hotelRooms;
      setMockRoomTypes(allRoomTypes);

      return roomWithExtras;
    }
    return apiClient.post<RoomType>(API_CONFIG.ENDPOINTS.ADD_ROOM, {
      roomData,
    });
  },

  async updateRoom(
    roomId: string,
    updates: Partial<RoomType>
  ): Promise<RoomType> {
    if (API_CONFIG.USE_MOCK_DATA) {
      ensureMockLayerReady();
      await mockDelay();

      const allRoomTypes = getMockRoomTypes();
      let updatedRoom: RoomType | null = null;

      for (const hotelId in allRoomTypes) {
        const rooms = allRoomTypes[hotelId];
        const index = rooms.findIndex(
          (r) => String((r as any).id ?? r.type_id) === String(roomId)
        );
        if (index !== -1) {
          updatedRoom = { ...rooms[index], ...updates };
          rooms[index] = updatedRoom;
          break;
        }
      }

      if (updatedRoom) {
        setMockRoomTypes(allRoomTypes);
        return updatedRoom;
      }
      throw new Error("Room not found");
    }
    return apiClient.put<RoomType>(API_CONFIG.ENDPOINTS.ROOM_INVENTORY_UPDATE, {
      room_id: roomId,
      ...updates,
    });
  },

  async deleteRoom(roomId: string): Promise<void> {
    if (API_CONFIG.USE_MOCK_DATA) {
      ensureMockLayerReady();
      await mockDelay();

      const allRoomTypes = getMockRoomTypes();
      for (const hotelId in allRoomTypes) {
        const rooms = allRoomTypes[hotelId];
        const index = rooms.findIndex(
          (r) => String((r as any).id ?? r.type_id) === String(roomId)
        );
        if (index !== -1) {
          rooms.splice(index, 1);
          setMockRoomTypes(allRoomTypes);
          return;
        }
      }
      throw new Error("Room not found");
    }
    return apiClient.delete(API_CONFIG.ENDPOINTS.ROOM_INVENTORY_DELETE, {
      room_id: roomId,
    });
  },

  // Pricing Management
  async getPricing(hotelId: string = "h1"): Promise<Record<string, unknown>> {
    if (API_CONFIG.USE_MOCK_DATA) {
      ensureMockLayerReady();
      await mockDelay();

      const pricing = localStorage.getItem(`hotelPricing_${hotelId}`);
      if (pricing) return JSON.parse(pricing) as Record<string, unknown>;

      // Default pricing
      const defaultPricing = {
        basePrice: 1500000,
        weekendPrice: 2000000,
        holidayPrice: 2500000,
        seasonalRates: [
          {
            season: "Cao điểm (Tết, Lễ)",
            multiplier: 1.8,
            start: "01/01",
            end: "07/01",
          },
          {
            season: "Mùa du lịch",
            multiplier: 1.3,
            start: "01/06",
            end: "31/08",
          },
          {
            season: "Bình thường",
            multiplier: 1.0,
            start: "01/09",
            end: "31/12",
          },
        ],
      };
      localStorage.setItem(
        `hotelPricing_${hotelId}`,
        JSON.stringify(defaultPricing)
      );
      return defaultPricing;
    }
    // Backend requires type_id, not hotel_id. This needs to be refactored.
    // Temporary: return mock data or fetch all room types first
    return apiClient.get<any>(API_CONFIG.ENDPOINTS.VIEW_ROOM_TYPES, {
      hotel_id: hotelId,
    });
  },

  async updatePricing(
    hotelId: string,
    pricing: Record<string, unknown>
  ): Promise<Record<string, unknown>> {
    if (API_CONFIG.USE_MOCK_DATA) {
      ensureMockLayerReady();
      await mockDelay();
      localStorage.setItem(`hotelPricing_${hotelId}`, JSON.stringify(pricing));
      return pricing;
    }
    return apiClient.put<any>(API_CONFIG.ENDPOINTS.UPDATE_PRICE, {
      priceData: pricing,
    });
  },

  // Reviews Management
  async replyToReview(reviewId: string, reply: string): Promise<Review> {
    if (API_CONFIG.USE_MOCK_DATA) {
      ensureMockLayerReady();
      await mockDelay();

      const reviews = getMockReviews();
      const review = reviews.find((r) => r.review_id === Number(reviewId));
      if (!review) throw new Error("Review not found");

      (
        review as unknown as {
          reply: { content: string; date: string; authorName: string };
          replied: boolean;
        }
      ).reply = {
        content: reply,
        date: new Date().toISOString().split("T")[0],
        authorName: "Hotel Manager",
      };
      (review as unknown as { replied: boolean }).replied = true;

      setMockReviews(reviews);
      return review;
    }
    return apiClient.post<any>(API_CONFIG.ENDPOINTS.REPLY_REVIEW, {
      review_id: reviewId,
      reply,
    });
  },

  // Hotel Info Management
  async getHotelInfo(
    hotelId: string = "h1"
  ): Promise<Hotel & { settings?: Record<string, unknown> }> {
    if (API_CONFIG.USE_MOCK_DATA) {
      ensureMockLayerReady();
      await mockDelay();

      const hotels = getMockHotels();
      const hotel = hotels.find((h) => h.hotel_id === Number(hotelId));
      if (!hotel) throw new Error("Hotel not found");

      // Get additional settings from localStorage
      const settings = localStorage.getItem(`hotelSettings_${hotelId}`);
      return {
        ...hotel,
        settings: settings
          ? (JSON.parse(settings) as Record<string, unknown>)
          : {
              checkInTime: "14:00",
              checkOutTime: "12:00",
              policies: {
                cancellation: "Miễn phí hủy trước 24 giờ",
                children: "Chấp nhận trẻ em dưới 12 tuổi miễn phí",
                pets: "Không chấp nhận thú cưng",
                smoking: "Không hút thuốc trong phòng",
                payment: "Chấp nhận thẻ tín dụng, chuyển khoản, tiền mặt",
              },
            },
      };
    }
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
    if (API_CONFIG.USE_MOCK_DATA) {
      ensureMockLayerReady();
      await mockDelay();

      // Update hotel basic info
      const hotels = getMockHotels();
      const hotelIndex = hotels.findIndex(
        (h) => h.hotel_id === Number(hotelId)
      );
      if (hotelIndex !== -1) {
        hotels[hotelIndex] = { ...hotels[hotelIndex], ...updates };
        localStorage.setItem("hotels", JSON.stringify(hotels));
      }

      // Update settings
      if (updates.settings) {
        localStorage.setItem(
          `hotelSettings_${hotelId}`,
          JSON.stringify(updates.settings)
        );
      }

      return { success: true };
    }
    return apiClient.put<any>(API_CONFIG.ENDPOINTS.UPDATE_HOTEL, {
      hotel_id: hotelId,
      hotelData: updates,
    });
  },

  // Booking Management for Hotel Manager
  async getHotelBookings(hotelId: string): Promise<Booking[]> {
    if (API_CONFIG.USE_MOCK_DATA) {
      ensureMockLayerReady();
      await mockDelay();
      // Return all bookings for mock (in real API, would filter by hotel)
      return getMockBookings();
    }
    return apiClient.get<Booking[]>(API_CONFIG.ENDPOINTS.BOOKING_HISTORY, {
      hotelId,
    });
  },

  async updateBookingStatus(
    bookingId: string,
    status: string
  ): Promise<Booking> {
    if (API_CONFIG.USE_MOCK_DATA) {
      ensureMockLayerReady();
      await mockDelay();
      updateMockBooking(Number(bookingId), {
        status: status as Booking["status"],
      });
      const bookings = getMockBookings();
      return (
        bookings.find((b) => b.booking_id === Number(bookingId)) ||
        ({} as Booking)
      );
    }
    return apiClient.patch<Booking>(
      API_CONFIG.ENDPOINTS.UPDATE_BOOKING_STATUS,
      { id: bookingId, status }
    );
  },

  async checkInBooking(bookingId: string): Promise<Booking> {
    if (API_CONFIG.USE_MOCK_DATA) {
      ensureMockLayerReady();
      await mockDelay();
      updateMockBooking(Number(bookingId), { status: "checked_in" });
      const bookings = getMockBookings();
      return (
        bookings.find((b) => b.booking_id === Number(bookingId)) ||
        ({} as Booking)
      );
    }
    return apiClient.post<Booking>(API_CONFIG.ENDPOINTS.BOOKING_CHECKIN, {
      id: bookingId,
    });
  },

  async checkOutBooking(bookingId: string): Promise<Booking> {
    if (API_CONFIG.USE_MOCK_DATA) {
      ensureMockLayerReady();
      await mockDelay();
      updateMockBooking(Number(bookingId), { status: "checked_out" });
      const bookings = getMockBookings();
      return (
        bookings.find((b) => b.booking_id === Number(bookingId)) ||
        ({} as Booking)
      );
    }
    return apiClient.post<Booking>(API_CONFIG.ENDPOINTS.BOOKING_CHECKOUT, {
      id: bookingId,
    });
  },

  // Room Types Management
  async getRoomTypes(hotelId: string = "h1"): Promise<RoomType[]> {
    if (API_CONFIG.USE_MOCK_DATA) {
      ensureMockLayerReady();
      await mockDelay();
      return getMockRoomTypesByHotel(hotelId);
    }
    return apiClient.get<RoomType[]>(API_CONFIG.ENDPOINTS.VIEW_ROOM_TYPES, {
      hotel_id: hotelId,
    });
  },

  async addRoomType(data: {
    type: string;
    description?: string;
    max_guests: number;
    base_price?: number;
    quantity?: number;
    hotel_id: number;
  }): Promise<RoomType> {
    if (API_CONFIG.USE_MOCK_DATA) {
      ensureMockLayerReady();
      await mockDelay();

      const typeId = Date.now();
      const hotelId = String(data.hotel_id);
      const newRoomType: RoomType = {
        type_id: typeId,
        hotel_id: data.hotel_id,
        type: data.type,
        description: data.description || "",
        max_guests: data.max_guests,
        basePrice: data.base_price || 0,
        quantity: data.quantity || 1,
        availability: true,
      };

      const allRoomTypes = getMockRoomTypes();
      const hotelRooms = allRoomTypes[hotelId] || [];
      hotelRooms.push(newRoomType);
      allRoomTypes[hotelId] = hotelRooms;
      setMockRoomTypes(allRoomTypes);

      return newRoomType;
    }
    return apiClient.post<RoomType>(API_CONFIG.ENDPOINTS.ADD_ROOM_TYPE, data);
  },

  async updateRoomPrice(typeId: string, newPrice: number): Promise<RoomType> {
    if (API_CONFIG.USE_MOCK_DATA) {
      ensureMockLayerReady();
      await mockDelay();

      const allRoomTypes = getMockRoomTypes();
      let updatedRoom: RoomType | null = null;

      for (const hotelId in allRoomTypes) {
        const rooms = allRoomTypes[hotelId];
        const index = rooms.findIndex(
          (r) => String(r.type_id) === String(typeId)
        );
        if (index !== -1) {
          rooms[index].basePrice = newPrice;
          updatedRoom = rooms[index];
          break;
        }
      }

      if (updatedRoom) {
        setMockRoomTypes(allRoomTypes);
        return updatedRoom;
      }
      throw new Error("Room type not found");
    }
    return apiClient.put<RoomType>(API_CONFIG.ENDPOINTS.UPDATE_PRICE, {
      type_id: typeId,
      base_price: newPrice,
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
    return apiClient
      .get<any[]>(API_CONFIG.ENDPOINTS.VIEW_HOTEL, { hotel_id: hotelId })
      .then((data) => (data as any).facilities || []);
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
    return apiClient.post<any>(API_CONFIG.ENDPOINTS.ADD_FACILITY, {
      hotel_id: hotelId,
      facilities,
    });
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
    return apiClient
      .get<any[]>(API_CONFIG.ENDPOINTS.VIEW_HOTEL, { hotel_id: hotelId })
      .then((data) => (data as any).images || []);
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
};

// ============= PAYMENT API =============
export const paymentApi = {
  async getConfig(): Promise<{
    supportedMethods: string[];
    bankCodes: { code: string; name: string }[];
  }> {
    if (API_CONFIG.USE_MOCK_DATA) {
      await mockDelay();
      return {
        supportedMethods: ["vnpay", "momo", "cash", "bank_transfer"],
        bankCodes: [
          { code: "NCB", name: "Ngân hàng NCB" },
          { code: "VIETCOMBANK", name: "Ngân hàng Vietcombank" },
          { code: "VIETINBANK", name: "Ngân hàng VietinBank" },
          { code: "TECHCOMBANK", name: "Ngân hàng Techcombank" },
          { code: "MBBANK", name: "Ngân hàng MBBank" },
          { code: "BIDV", name: "Ngân hàng BIDV" },
          { code: "AGRIBANK", name: "Ngân hàng Agribank" },
        ],
      };
    }
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
    if (API_CONFIG.USE_MOCK_DATA) {
      await mockDelay();
      const paymentId = Date.now();
      // Store in localStorage
      const payments = JSON.parse(localStorage.getItem("payments") || "[]");
      const newPayment = {
        payment_id: paymentId,
        booking_id: data.bookingId,
        amount: data.amount,
        payment_method: data.paymentMethod,
        status: data.paymentMethod === "cash" ? "pending" : "processing",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      payments.push(newPayment);
      localStorage.setItem("payments", JSON.stringify(payments));

      // Update booking payment status
      updateMockBooking(data.bookingId, {
        paymentStatus: "pending",
        paymentMethod: data.paymentMethod,
      });

      return {
        payment_id: paymentId,
        payment_url:
          data.paymentMethod === "vnpay"
            ? `https://sandbox.vnpayment.vn/mock?ref=${paymentId}`
            : undefined,
        status: newPayment.status,
      };
    }
    return apiClient.post<any>(API_CONFIG.ENDPOINTS.PAYMENT_CREATE, data);
  },

  async getAll(): Promise<Payment[]> {
    if (API_CONFIG.USE_MOCK_DATA) {
      await mockDelay();
      const payments = JSON.parse(localStorage.getItem("payments") || "[]");
      return payments;
    }
    return apiClient.get<Payment[]>(API_CONFIG.ENDPOINTS.PAYMENT_LIST);
  },

  async getById(paymentId: string): Promise<Payment | null> {
    if (API_CONFIG.USE_MOCK_DATA) {
      await mockDelay();
      const payments = JSON.parse(localStorage.getItem("payments") || "[]");
      return (
        payments.find((p: Payment) => p.payment_id === Number(paymentId)) ||
        null
      );
    }
    return apiClient.get<Payment>(API_CONFIG.ENDPOINTS.PAYMENT_DETAILS, {
      id: paymentId,
    });
  },

  async getByBooking(bookingId: string): Promise<Payment | null> {
    if (API_CONFIG.USE_MOCK_DATA) {
      await mockDelay();
      const payments = JSON.parse(localStorage.getItem("payments") || "[]");
      return (
        payments.find((p: Payment) => p.booking_id === Number(bookingId)) ||
        null
      );
    }
    return apiClient.get<Payment>(API_CONFIG.ENDPOINTS.PAYMENT_BY_BOOKING, {
      bookingId,
    });
  },

  async queryStatus(
    paymentId: string
  ): Promise<{ status: string; vnp_response_code?: string }> {
    if (API_CONFIG.USE_MOCK_DATA) {
      await mockDelay();
      const payments = JSON.parse(localStorage.getItem("payments") || "[]");
      const payment = payments.find(
        (p: Payment) => p.payment_id === Number(paymentId)
      );
      return { status: payment?.status || "unknown" };
    }
    return apiClient.get<any>(API_CONFIG.ENDPOINTS.PAYMENT_QUERY_STATUS, {
      id: paymentId,
    });
  },

  async refund(
    paymentId: string,
    amount?: number
  ): Promise<{ success: boolean; refund_id?: string }> {
    if (API_CONFIG.USE_MOCK_DATA) {
      await mockDelay();
      const payments = JSON.parse(localStorage.getItem("payments") || "[]");
      const index = payments.findIndex(
        (p: Payment) => p.payment_id === Number(paymentId)
      );
      if (index !== -1) {
        payments[index].status = "refunded";
        payments[index].updated_at = new Date().toISOString();
        localStorage.setItem("payments", JSON.stringify(payments));
        // Update booking payment status
        updateMockBooking(payments[index].booking_id, {
          paymentStatus: "refunded",
        });
      }
      return { success: true, refund_id: `refund_${Date.now()}` };
    }
    return apiClient.post<any>(API_CONFIG.ENDPOINTS.PAYMENT_REFUND, {
      id: paymentId,
      amount,
    });
  },

  // Mark payment as completed (for mock/testing)
  async completePayment(paymentId: string): Promise<Payment> {
    if (API_CONFIG.USE_MOCK_DATA) {
      await mockDelay();
      const payments = JSON.parse(localStorage.getItem("payments") || "[]");
      const index = payments.findIndex(
        (p: Payment) => p.payment_id === Number(paymentId)
      );
      if (index !== -1) {
        payments[index].status = "completed";
        payments[index].updated_at = new Date().toISOString();
        localStorage.setItem("payments", JSON.stringify(payments));
        // Update booking payment status
        updateMockBooking(payments[index].booking_id, {
          paymentStatus: "paid",
        });
        return payments[index];
      }
      throw new Error("Payment not found");
    }
    // Real API would handle this via VNPay callback
    throw new Error("Use VNPay callback for completing payments");
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
    if (API_CONFIG.USE_MOCK_DATA) {
      await mockDelay();
      // Mock: always available with random count
      return {
        available: true,
        availableCount: Math.floor(Math.random() * 5) + 1,
      };
    }
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
    if (API_CONFIG.USE_MOCK_DATA) {
      ensureMockLayerReady();
      await mockDelay();
      return getMockRoomTypesByHotel(hotelId);
    }
    const params: Record<string, string> = { hotelId };
    if (checkIn) params.checkIn = checkIn;
    if (checkOut) params.checkOut = checkOut;
    return apiClient.get<RoomType[]>(
      API_CONFIG.ENDPOINTS.ROOM_AVAILABLE,
      params
    );
  },

  async getRoomType(typeId: string): Promise<RoomType | null> {
    if (API_CONFIG.USE_MOCK_DATA) {
      ensureMockLayerReady();
      await mockDelay();
      const allRoomTypes = getMockRoomTypes();
      for (const hotelId in allRoomTypes) {
        const room = allRoomTypes[hotelId].find(
          (r) => String(r.type_id) === String(typeId)
        );
        if (room) return room;
      }
      return null;
    }
    return apiClient.get<RoomType>(API_CONFIG.ENDPOINTS.ROOM_TYPE_BY_ID, {
      id: typeId,
    });
  },

  async getRoomTypesByHotel(hotelId: string): Promise<RoomType[]> {
    if (API_CONFIG.USE_MOCK_DATA) {
      ensureMockLayerReady();
      await mockDelay();
      return getMockRoomTypesByHotel(hotelId);
    }
    return apiClient.get<RoomType[]>(API_CONFIG.ENDPOINTS.ROOM_TYPES_BY_HOTEL, {
      hotelId,
    });
  },

  async getRoom(roomId: string): Promise<Room | null> {
    if (API_CONFIG.USE_MOCK_DATA) {
      await mockDelay();
      // Mock: return a sample room
      return {
        room_id: Number(roomId),
        type_id: 1,
        name: `Room ${roomId}`,
        location: "Floor 1",
        status: 1,
        estimated_available_time: null,
        number_of_single_beds: 1,
        number_of_double_beds: 1,
        room_view: "City View",
        room_size: 30,
        notes: null,
      };
    }
    return apiClient.get<Room>(API_CONFIG.ENDPOINTS.ROOM_BY_ID, { id: roomId });
  },

  async getRoomsByType(typeId: string): Promise<Room[]> {
    if (API_CONFIG.USE_MOCK_DATA) {
      await mockDelay();
      // Mock: return sample rooms
      return [
        {
          room_id: 101,
          type_id: Number(typeId),
          name: "Room 101",
          location: "Floor 1",
          status: 1,
          estimated_available_time: null,
          number_of_single_beds: 1,
          number_of_double_beds: 1,
          room_view: "City View",
          room_size: 30,
          notes: null,
        },
        {
          room_id: 102,
          type_id: Number(typeId),
          name: "Room 102",
          location: "Floor 1",
          status: 1,
          estimated_available_time: null,
          number_of_single_beds: 2,
          number_of_double_beds: 0,
          room_view: "Garden View",
          room_size: 28,
          notes: null,
        },
      ];
    }
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
    if (API_CONFIG.USE_MOCK_DATA) {
      await mockDelay();
      const holdId = `hold_${Date.now()}`;
      const expiresAt = new Date(
        Date.now() + (data.holdDurationMinutes || 15) * 60000
      ).toISOString();
      // Store hold in localStorage
      const holds = JSON.parse(localStorage.getItem("roomHolds") || "[]");
      holds.push({ holdId, ...data, expiresAt });
      localStorage.setItem("roomHolds", JSON.stringify(holds));
      return { holdId, expiresAt };
    }
    return apiClient.post<any>(API_CONFIG.ENDPOINTS.ROOM_HOLD, data);
  },

  async releaseHold(holdId: string): Promise<{ success: boolean }> {
    if (API_CONFIG.USE_MOCK_DATA) {
      await mockDelay();
      const holds = JSON.parse(localStorage.getItem("roomHolds") || "[]");
      const filtered = holds.filter((h: any) => h.holdId !== holdId);
      localStorage.setItem("roomHolds", JSON.stringify(filtered));
      return { success: true };
    }
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
    if (API_CONFIG.USE_MOCK_DATA) {
      await mockDelay();
      // Generate mock calendar data
      const calendar = [];
      const start = new Date(startDate);
      const end = new Date(endDate);
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        calendar.push({
          date: d.toISOString().split("T")[0],
          available: Math.floor(Math.random() * 5) + 1,
          booked: Math.floor(Math.random() * 3),
          held: Math.floor(Math.random() * 2),
        });
      }
      return calendar;
    }
    return apiClient.get<any>(API_CONFIG.ENDPOINTS.ROOM_INVENTORY_CALENDAR, {
      typeId,
      startDate,
      endDate,
    });
  },
};

// ============= DESTINATIONS EXTENDED API =============
export const destinationsApi = {
  ...tourismApi,

  async search(query: string): Promise<Destination[]> {
    return apiClient.get<Destination[]>(
      API_CONFIG.ENDPOINTS.SEARCH_DESTINATIONS,
      { q: query }
    );
  },

  async getByType(type: string): Promise<Destination[]> {
    return apiClient.get<Destination[]>(
      API_CONFIG.ENDPOINTS.DESTINATIONS_BY_TYPE,
      { type }
    );
  },

  async create(data: Partial<Destination>): Promise<Destination> {
    return apiClient.post<Destination>(
      API_CONFIG.ENDPOINTS.CREATE_DESTINATION,
      data
    );
  },

  async update(id: string, data: Partial<Destination>): Promise<Destination> {
    return apiClient.put<Destination>(API_CONFIG.ENDPOINTS.UPDATE_DESTINATION, {
      id,
      ...data,
    });
  },

  async delete(id: string): Promise<boolean> {
    return apiClient.delete<boolean>(API_CONFIG.ENDPOINTS.DELETE_DESTINATION, {
      id,
    });
  },

  async addReview(
    destinationId: string,
    reviewData: Partial<Review>
  ): Promise<Review> {
    // if (API_CONFIG.USE_MOCK_DATA) {
    //   ensureMockLayerReady();
    //   await mockDelay();
    //   const newReview: Review = {
    //     review_id: Date.now(),
    //     user_id: reviewData.user_id || 0,
    //     destination_id: Number(destinationId),
    //     hotel_id: null,
    //     room_id: null,
    //     rating: reviewData.rating || 0,
    //     comment: reviewData.comment || '',
    //     date_created: new Date().toISOString(),
    //     userName: reviewData.userName,
    //     userAvatar: reviewData.userAvatar,
    //     title: reviewData.title,
    //     images: reviewData.images,
    //     helpful: 0,
    //     verified: true,
    //   };
    //   addMockReview(newReview);
    //   return newReview;
    // }
    return apiClient.post<Review>(API_CONFIG.ENDPOINTS.ADD_DESTINATION_REVIEW, {
      id: destinationId,
      ...reviewData,
    });
  },

  async getImages(destinationId: string): Promise<Image[]> {
    // if (API_CONFIG.USE_MOCK_DATA) {
    //   await mockDelay();
    //   const spots = getMockTourismSpots();
    //   const spot = spots.find(s => s.destination_id === Number(destinationId));
    //   if (spot?.images) {
    //     return spot.images.map((url, idx) => ({
    //       image_id: idx + 1,
    //       destination_id: Number(destinationId),
    //       hotel_id: null,
    //       room_id: null,
    //       image_url: url,
    //     }));
    //   }
    //   return [];
    // }
    return apiClient.get<Image[]>(API_CONFIG.ENDPOINTS.DESTINATION_IMAGES, {
      id: destinationId,
    });
  },
};

// ============= USER PROFILE EXTENDED API =============
export const userProfileApi = {
  ...userApi,

  async deleteAccount(): Promise<boolean> {
    // if (API_CONFIG.USE_MOCK_DATA) {
    //   await mockDelay();
    //   localStorage.removeItem("mockUser");
    //   localStorage.removeItem("authUser");
    //   return true;
    // }
    return apiClient.delete<boolean>(API_CONFIG.ENDPOINTS.DELETE_PROFILE);
  },

  async uploadProfileImage(file: File): Promise<{ imageUrl: string }> {
    // if (API_CONFIG.USE_MOCK_DATA) {
    //   await mockDelay();
    //   // Create a data URL from the file for mock
    //   return new Promise((resolve) => {
    //     const reader = new FileReader();
    //     reader.onloadend = () => {
    //       const imageUrl = reader.result as string;
    //       updateMockUser({ profile_image: imageUrl });
    //       resolve({ imageUrl });
    //     };
    //     reader.readAsDataURL(file);
    //   });
    // }

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

    return response.json();
  },

  async getProfileImage(): Promise<{ imageUrl: string | null }> {
    // if (API_CONFIG.USE_MOCK_DATA) {
    //   await mockDelay();
    //   const user = getMockUser();
    //   return { imageUrl: user?.profile_image || null };
    // }
    return apiClient.get<{ imageUrl: string | null }>(
      API_CONFIG.ENDPOINTS.GET_PROFILE_IMAGE
    );
  },

  async deleteProfileImage(): Promise<boolean> {
    // if (API_CONFIG.USE_MOCK_DATA) {
    //   await mockDelay();
    //   updateMockUser({ profile_image: null });
    //   return true;
    // }
    return apiClient.delete<boolean>(API_CONFIG.ENDPOINTS.DELETE_PROFILE_IMAGE);
  },

  async getAllUsers(): Promise<User[]> {
    // if (API_CONFIG.USE_MOCK_DATA) {
    //   await mockDelay();
    //   // Return mock users list for admin
    //   return [getMockUser() || defaultMockUser];
    // }
    return apiClient.get<User[]>(API_CONFIG.ENDPOINTS.GET_ALL_USERS);
  },
};

// ============= NOTIFICATION API =============
export const notificationApi = {
  async sendTestEmail(email: string): Promise<{ success: boolean }> {
    // if (API_CONFIG.USE_MOCK_DATA) {
    //   await mockDelay();
    //   console.log("Mock: Sending test email to", email);
    //   return { success: true };
    // }
    return apiClient.post<any>(API_CONFIG.ENDPOINTS.NOTIFICATION_TEST, {
      email,
    });
  },

  async sendBookingConfirmation(
    bookingId: number,
    email: string
  ): Promise<{ success: boolean }> {
    // if (API_CONFIG.USE_MOCK_DATA) {
    //   await mockDelay();
    //   console.log(
    //     "Mock: Sending booking confirmation for",
    //     bookingId,
    //     "to",
    //     email
    //   );
    //   return { success: true };
    // }
    return apiClient.post<any>(
      API_CONFIG.ENDPOINTS.NOTIFICATION_BOOKING_CONFIRM,
      { bookingId, email }
    );
  },

  async sendBookingCancellation(
    bookingId: number,
    email: string
  ): Promise<{ success: boolean }> {
    // if (API_CONFIG.USE_MOCK_DATA) {
    //   await mockDelay();
    //   console.log(
    //     "Mock: Sending booking cancellation for",
    //     bookingId,
    //     "to",
    //     email
    //   );
    //   return { success: true };
    // }
    return apiClient.post<any>(
      API_CONFIG.ENDPOINTS.NOTIFICATION_BOOKING_CANCEL,
      { bookingId, email }
    );
  },

  async sendPasswordReset(
    email: string,
    resetUrl: string
  ): Promise<{ success: boolean }> {
    // if (API_CONFIG.USE_MOCK_DATA) {
    //   await mockDelay();
    //   console.log(
    //     "Mock: Sending password reset to",
    //     email,
    //     "with URL",
    //     resetUrl
    //   );
    //   return { success: true };
    // }
    return apiClient.post<any>(
      API_CONFIG.ENDPOINTS.NOTIFICATION_PASSWORD_RESET,
      { email, resetUrl }
    );
  },

  async sendWelcomeEmail(
    email: string,
    name: string
  ): Promise<{ success: boolean }> {
    // if (API_CONFIG.USE_MOCK_DATA) {
    //   await mockDelay();
    //   console.log("Mock: Sending welcome email to", name, "at", email);
    //   return { success: true };
    // }
    return apiClient.post<any>(API_CONFIG.ENDPOINTS.NOTIFICATION_WELCOME, {
      email,
      name,
    });
  },

  async sendPaymentConfirmation(
    paymentId: number,
    email: string
  ): Promise<{ success: boolean }> {
    // if (API_CONFIG.USE_MOCK_DATA) {
    //   await mockDelay();
    //   console.log(
    //     "Mock: Sending payment confirmation for",
    //     paymentId,
    //     "to",
    //     email
    //   );
    //   return { success: true };
    // }
    return apiClient.post<any>(
      API_CONFIG.ENDPOINTS.NOTIFICATION_PAYMENT_CONFIRM,
      { paymentId, email }
    );
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
  role: "customer" | "hotel_manager" | "admin";
  status: "active" | "inactive" | "banned";
  created_at: string;
  last_login?: string;
  bookings_count?: number;
}

export interface AdminHotel {
  hotel_id: number;
  name: string;
  city: string;
  district: string;
  status: "pending" | "approved" | "rejected" | "locked";
  manager_name: string;
  manager_email: string;
  rooms_count: number;
  created_at: string;
}

export const adminApi = {
  // Dashboard
  async getDashboard(): Promise<AdminDashboard> {
    if (API_CONFIG.USE_MOCK_DATA) {
      await mockDelay();
      return {
        totalUsers: 1250,
        totalHotels: 48,
        totalBookings: 3420,
        totalRevenue: 2850000000,
        pendingHotels: 5,
        activeBookings: 127,
        recentActivity: [
          {
            id: 1,
            type: "booking",
            description: "Đặt phòng mới tại Vinpearl Resort",
            timestamp: new Date().toISOString(),
            userName: "Nguyễn Văn A",
          },
          {
            id: 2,
            type: "hotel",
            description: "Khách sạn mới đăng ký chờ duyệt",
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            userName: "Hotel Manager B",
          },
          {
            id: 3,
            type: "user",
            description: "Người dùng mới đăng ký",
            timestamp: new Date(Date.now() - 7200000).toISOString(),
            userName: "Trần Thị C",
          },
          {
            id: 4,
            type: "payment",
            description: "Thanh toán thành công 2,500,000₫",
            timestamp: new Date(Date.now() - 10800000).toISOString(),
            userName: "Lê Văn D",
          },
          {
            id: 5,
            type: "review",
            description: "Đánh giá mới 5 sao",
            timestamp: new Date(Date.now() - 14400000).toISOString(),
            userName: "Phạm Thị E",
          },
        ],
      };
    }
    return apiClient.get<AdminDashboard>(API_CONFIG.ENDPOINTS.ADMIN_DASHBOARD);
  },

  async getRevenueMetrics(): Promise<any> {
    if (API_CONFIG.USE_MOCK_DATA) {
      await mockDelay();
      return {
        daily: Array.from({ length: 30 }, (_, i) => ({
          date: new Date(Date.now() - (29 - i) * 86400000)
            .toISOString()
            .split("T")[0],
          revenue: Math.floor(Math.random() * 100000000) + 50000000,
        })),
        monthly: Array.from({ length: 12 }, (_, i) => ({
          month: i + 1,
          revenue: Math.floor(Math.random() * 500000000) + 200000000,
        })),
      };
    }
    return apiClient.get<any>(API_CONFIG.ENDPOINTS.ADMIN_REVENUE_METRICS);
  },

  async getBookingKPIs(): Promise<any> {
    if (API_CONFIG.USE_MOCK_DATA) {
      await mockDelay();
      return {
        totalBookings: 3420,
        completedBookings: 2890,
        cancelledBookings: 230,
        pendingBookings: 300,
        averageBookingValue: 2500000,
        occupancyRate: 78.5,
      };
    }
    return apiClient.get<any>(API_CONFIG.ENDPOINTS.ADMIN_BOOKING_KPIS);
  },

  async getRecentActivity(): Promise<AdminActivity[]> {
    if (API_CONFIG.USE_MOCK_DATA) {
      await mockDelay();
      return [
        {
          id: 1,
          type: "booking",
          description: "Đặt phòng mới",
          timestamp: new Date().toISOString(),
        },
        {
          id: 2,
          type: "hotel",
          description: "Khách sạn mới chờ duyệt",
          timestamp: new Date(Date.now() - 3600000).toISOString(),
        },
      ];
    }
    return apiClient.get<AdminActivity[]>(
      API_CONFIG.ENDPOINTS.ADMIN_RECENT_ACTIVITY
    );
  },

  // User Management
  async getAllUsers(): Promise<AdminUser[]> {
    if (API_CONFIG.USE_MOCK_DATA) {
      await mockDelay();
      return [
        {
          user_id: 1,
          name: "Nguyễn Văn Admin",
          email: "admin@hotel.com",
          role: "admin",
          status: "active",
          created_at: "2024-01-01",
          bookings_count: 0,
        },
        {
          user_id: 2,
          name: "Trần Thị Manager",
          email: "manager@hotel.com",
          phone: "0901234567",
          role: "hotel_manager",
          status: "active",
          created_at: "2024-02-15",
          bookings_count: 45,
        },
        {
          user_id: 3,
          name: "Lê Văn Customer",
          email: "customer@gmail.com",
          phone: "0912345678",
          role: "customer",
          status: "active",
          created_at: "2024-03-20",
          bookings_count: 12,
        },
        {
          user_id: 4,
          name: "Phạm Thị Inactive",
          email: "inactive@gmail.com",
          role: "customer",
          status: "inactive",
          created_at: "2024-04-10",
          bookings_count: 3,
        },
        {
          user_id: 5,
          name: "Hoàng Văn Banned",
          email: "banned@gmail.com",
          role: "customer",
          status: "banned",
          created_at: "2024-05-05",
          bookings_count: 1,
        },
      ];
    }
    return apiClient.get<AdminUser[]>(API_CONFIG.ENDPOINTS.ADMIN_USERS);
  },

  async getUserById(id: string): Promise<AdminUser> {
    if (API_CONFIG.USE_MOCK_DATA) {
      await mockDelay();
      return {
        user_id: parseInt(id),
        name: "Mock User",
        email: "mock@email.com",
        role: "customer",
        status: "active",
        created_at: "2024-01-01",
      };
    }
    return apiClient.get<AdminUser>(API_CONFIG.ENDPOINTS.ADMIN_USER_BY_ID, {
      id,
    });
  },

  async updateUserRole(
    id: string,
    role: AdminUser["role"]
  ): Promise<AdminUser> {
    if (API_CONFIG.USE_MOCK_DATA) {
      await mockDelay();
      return {
        user_id: parseInt(id),
        name: "Updated User",
        email: "mock@email.com",
        role,
        status: "active",
        created_at: "2024-01-01",
      };
    }
    return apiClient.patch<AdminUser>(
      API_CONFIG.ENDPOINTS.ADMIN_UPDATE_USER_ROLE,
      { role },
      { id }
    );
  },

  async updateUser(id: string, data: Partial<AdminUser>): Promise<AdminUser> {
    if (API_CONFIG.USE_MOCK_DATA) {
      await mockDelay();
      return {
        user_id: parseInt(id),
        name: data.name || "Updated",
        email: data.email || "mock@email.com",
        role: data.role || "customer",
        status: data.status || "active",
        created_at: "2024-01-01",
      };
    }
    return apiClient.put<AdminUser>(
      API_CONFIG.ENDPOINTS.ADMIN_UPDATE_USER,
      data,
      { id }
    );
  },

  async deleteUser(id: string): Promise<{ success: boolean }> {
    if (API_CONFIG.USE_MOCK_DATA) {
      await mockDelay();
      return { success: true };
    }
    return apiClient.delete<any>(API_CONFIG.ENDPOINTS.ADMIN_DELETE_USER, {
      id,
    });
  },

  // Hotel Manager Management
  async getHotelManagers(): Promise<AdminUser[]> {
    if (API_CONFIG.USE_MOCK_DATA) {
      await mockDelay();
      return [
        {
          user_id: 2,
          name: "Trần Thị Manager",
          email: "manager@hotel.com",
          phone: "0901234567",
          role: "hotel_manager",
          status: "active",
          created_at: "2024-02-15",
        },
        {
          user_id: 6,
          name: "Nguyễn Văn HM",
          email: "hm@hotel.com",
          role: "hotel_manager",
          status: "active",
          created_at: "2024-03-01",
        },
      ];
    }
    return apiClient.get<AdminUser[]>(
      API_CONFIG.ENDPOINTS.ADMIN_HOTEL_MANAGERS
    );
  },

  async getPendingHotels(): Promise<AdminHotel[]> {
    if (API_CONFIG.USE_MOCK_DATA) {
      await mockDelay();
      return [
        {
          hotel_id: 10,
          name: "Khách sạn ABC",
          city: "Hà Nội",
          district: "Hoàn Kiếm",
          status: "pending",
          manager_name: "Nguyễn Văn A",
          manager_email: "a@hotel.com",
          rooms_count: 25,
          created_at: "2024-12-20",
        },
        {
          hotel_id: 11,
          name: "Resort XYZ",
          city: "Đà Nẵng",
          district: "Sơn Trà",
          status: "pending",
          manager_name: "Trần Thị B",
          manager_email: "b@hotel.com",
          rooms_count: 50,
          created_at: "2024-12-22",
        },
      ];
    }
    return apiClient.get<AdminHotel[]>(
      API_CONFIG.ENDPOINTS.ADMIN_PENDING_HOTELS
    );
  },

  async approveHotel(id: string): Promise<AdminHotel> {
    if (API_CONFIG.USE_MOCK_DATA) {
      await mockDelay();
      return {
        hotel_id: parseInt(id),
        name: "Approved Hotel",
        city: "HN",
        district: "HK",
        status: "approved",
        manager_name: "M",
        manager_email: "m@h.com",
        rooms_count: 10,
        created_at: "2024-01-01",
      };
    }
    return apiClient.post<AdminHotel>(
      API_CONFIG.ENDPOINTS.ADMIN_APPROVE_HOTEL,
      {},
      { id }
    );
  },

  async lockHotel(id: string): Promise<AdminHotel> {
    if (API_CONFIG.USE_MOCK_DATA) {
      await mockDelay();
      return {
        hotel_id: parseInt(id),
        name: "Locked Hotel",
        city: "HN",
        district: "HK",
        status: "locked",
        manager_name: "M",
        manager_email: "m@h.com",
        rooms_count: 10,
        created_at: "2024-01-01",
      };
    }
    return apiClient.post<AdminHotel>(
      API_CONFIG.ENDPOINTS.ADMIN_LOCK_HOTEL,
      {},
      { id }
    );
  },

  async updateHotelStatus(
    id: string,
    status: AdminHotel["status"]
  ): Promise<AdminHotel> {
    if (API_CONFIG.USE_MOCK_DATA) {
      await mockDelay();
      return {
        hotel_id: parseInt(id),
        name: "Hotel",
        city: "HN",
        district: "HK",
        status,
        manager_name: "M",
        manager_email: "m@h.com",
        rooms_count: 10,
        created_at: "2024-01-01",
      };
    }
    return apiClient.patch<AdminHotel>(
      API_CONFIG.ENDPOINTS.ADMIN_UPDATE_HOTEL_STATUS,
      { status },
      { id }
    );
  },
};
