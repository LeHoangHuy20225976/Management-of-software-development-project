/**
 * API Services
 * Automatically switches between mock and real API based on API_CONFIG.USE_MOCK_DATA
 * Mock data is stored in localStorage for persistence
 */

import { API_CONFIG } from './config';
import { apiClient } from './client';
import { mockTourismSpots, mockReviews as defaultMockReviews, mockBookings as defaultMockBookings, mockUser as defaultMockUser } from '../mock/data';
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
} from '../utils/mockData';
import type { Hotel, TourismSpot, Review, Booking, User, SearchFilters, RoomType } from '@/types';

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
    if (API_CONFIG.USE_MOCK_DATA) {
      ensureMockLayerReady();
      await mockDelay();
      // Get hotels from localStorage
      let hotels = getMockHotels();

      // Apply filters
      if (filters?.location) {
        hotels = hotels.filter(h =>
          (typeof h.city === 'string' && h.city.toLowerCase().includes(filters.location!.toLowerCase())) ||
          (typeof h.district === 'string' && h.district.toLowerCase().includes(filters.location!.toLowerCase()))
        );
      }

      if (filters?.minPrice) {
        hotels = hotels.filter(h => typeof h.basePrice === 'number' && h.basePrice >= filters.minPrice!);
      }

      if (filters?.maxPrice) {
        hotels = hotels.filter(h => typeof h.basePrice === 'number' && h.basePrice <= filters.maxPrice!);
      }

      if (filters?.stars && filters.stars.length > 0) {
        hotels = hotels.filter((h: Hotel) => h.stars !== undefined && filters.stars!.includes(h.stars));
      }

      // Sort
      if (filters?.sortBy === 'price') {
        hotels = hotels.slice().sort((a: Hotel, b: Hotel) => (a.basePrice ?? 0) - (b.basePrice ?? 0));
      } else if (filters?.sortBy === 'rating') {
        hotels = hotels.slice().sort((a: Hotel, b: Hotel) => (b.rating ?? 0) - (a.rating ?? 0));
      }

      return hotels;
    }

    // Real API call - Backend doesn't have /hotels endpoint yet
    // Using mock data until backend implements this
    return apiClient.get<Hotel[]>(API_CONFIG.ENDPOINTS.ALL_ROOMS);
  },

  async getById(id: string): Promise<Hotel | null> {
    if (API_CONFIG.USE_MOCK_DATA) {
      ensureMockLayerReady();
      await mockDelay();
      const hotels = getMockHotels();
      return (
        hotels.find(
          h =>
            String((h as any).hotel_id ?? (h as any).id) === String(id)
        ) || null
      );
    }

    return apiClient.get<Hotel>(API_CONFIG.ENDPOINTS.VIEW_HOTEL, { hotel_id: id });
  },

  async getBySlug(slug: string): Promise<Hotel | null> {
    if (API_CONFIG.USE_MOCK_DATA) {
      ensureMockLayerReady();
      await mockDelay();
      const hotels = getMockHotels();
      return hotels.find(h => h.slug === slug) || null;
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

    return apiClient.get<RoomType[]>(API_CONFIG.ENDPOINTS.VIEW_ALL_ROOMS, { hotel_id: hotelId });
  },

  async getReviews(hotelId: string): Promise<Review[]> {
    if (API_CONFIG.USE_MOCK_DATA) {
      ensureMockLayerReady();
      await mockDelay();
      const reviews = getMockReviews();
      return reviews.filter(
        r => String(r.hotel_id ?? (r as any).hotelId) === String(hotelId)
      );
    }

    return apiClient.get<Review[]>(API_CONFIG.ENDPOINTS.ALL_REVIEWS, { hotel_id: hotelId });
  },
};

// ============= TOURISM API =============
export const tourismApi = {
  async getAll(): Promise<TourismSpot[]> {
    if (API_CONFIG.USE_MOCK_DATA) {
      ensureMockLayerReady();
      await mockDelay();
      return getMockTourismSpots();
    }

    return apiClient.get<TourismSpot[]>(API_CONFIG.ENDPOINTS.ALL_DESTINATIONS);
  },

  async getById(id: string): Promise<TourismSpot | null> {
    if (API_CONFIG.USE_MOCK_DATA) {
      ensureMockLayerReady();
      await mockDelay();
      const spots = getMockTourismSpots();
      return (
        spots.find(
          t =>
            String((t as any).destination_id ?? (t as any).id) === String(id)
        ) || null
      );
    }

    return apiClient.get<TourismSpot>(API_CONFIG.ENDPOINTS.VIEW_DESTINATION, { destination_id: id });
  },

  async getBySlug(slug: string): Promise<TourismSpot | null> {
    if (API_CONFIG.USE_MOCK_DATA) {
      ensureMockLayerReady();
      await mockDelay();
      const spots = getMockTourismSpots();
      return spots.find(t => t.slug === slug) || null;
    }

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
          b =>
            String((b as any).booking_id ?? (b as any).id) === String(id)
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
        status: bookingData.status ?? 'pending',
        total_price: bookingData.total_price ?? null,
        check_in_date: bookingData.check_in_date ?? '',
        check_out_date: bookingData.check_out_date ?? '',
        created_at: bookingData.created_at ?? new Date().toISOString(),
        people: bookingData.people ?? null,
        hotelName: bookingData.hotelName,
        hotelImage: bookingData.hotelImage,
        roomType: bookingData.roomType,
        nights: bookingData.nights,
        paymentStatus: bookingData.paymentStatus ?? 'pending',
        paymentMethod: bookingData.paymentMethod,
      };
      // Save to localStorage
      addMockBooking(newBooking);
      return newBooking;
    }

    return apiClient.post<Booking>(API_CONFIG.ENDPOINTS.ADD_BOOKING, bookingData);
  },

  async cancel(id: string): Promise<boolean> {
    if (API_CONFIG.USE_MOCK_DATA) {
      ensureMockLayerReady();
      await mockDelay();
      // Update booking status in localStorage
      updateMockBooking(Number(id), { status: 'cancelled', paymentStatus: 'refunded' });
      return true;
    }

    return apiClient.delete<boolean>(API_CONFIG.ENDPOINTS.DELETE_BOOKING, { id });
  },
};

// ============= USER API =============
export const userApi = {
  async getProfile(): Promise<User> {
    if (API_CONFIG.USE_MOCK_DATA) {
      ensureMockLayerReady();
      await mockDelay();
      // Get user from localStorage
      const user = getMockUser();
      return user || defaultMockUser;
    }

    return apiClient.get<User>(API_CONFIG.ENDPOINTS.VIEW_PROFILE);
  },

  async updateProfile(data: Partial<User>): Promise<User> {
    if (API_CONFIG.USE_MOCK_DATA) {
      ensureMockLayerReady();
      await mockDelay();
      // Update user in localStorage
      updateMockUser(data);
      const user = getMockUser();
      return user || defaultMockUser;
    }

    return apiClient.put<User>(API_CONFIG.ENDPOINTS.UPDATE_PROFILE, data);
  },
};

// ============= REVIEWS API =============
export const reviewsApi = {
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
        comment: reviewData.comment ?? '',
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
        r => String(r.review_id ?? (r as any).id) === String(id)
      );
      const updatedReview = { ...review!, ...reviewData };
      // Update in localStorage
      const allReviews = reviews.map(r =>
        String(r.review_id ?? (r as any).id) === String(id) ? updatedReview : r
      );
      setMockReviews(allReviews);
      return updatedReview;
    }

    return apiClient.put<Review>(API_CONFIG.ENDPOINTS.UPDATE_REVIEW, { review_id: id, ...reviewData });
  },

  async delete(id: string): Promise<boolean> {
    if (API_CONFIG.USE_MOCK_DATA) {
      ensureMockLayerReady();
      await mockDelay();
      // Delete from localStorage
      const reviews = getMockReviews();
      const filtered = reviews.filter(
        r => String(r.review_id ?? (r as any).id) !== String(id)
      );
      setMockReviews(filtered);
      return true;
    }

    return apiClient.delete<boolean>(API_CONFIG.ENDPOINTS.DELETE_REVIEW, { review_id: id });
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
        .filter(h => h.name.toLowerCase().includes(query.toLowerCase()))
        .map(h => h.name)
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
  async getRooms(hotelId: string = 'h1'): Promise<RoomType[]> {
    if (API_CONFIG.USE_MOCK_DATA) {
      ensureMockLayerReady();
      await mockDelay();
      return getMockRoomTypesByHotel(hotelId);
    }
    return apiClient.get<RoomType[]>(API_CONFIG.ENDPOINTS.VIEW_ALL_ROOMS, { hotel_id: hotelId });
  },

  async createRoom(hotelId: string, roomData: Partial<RoomType>): Promise<RoomType> {
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
        type: roomData.type ?? providedName ?? 'New Room',
        availability: roomData.availability ?? true,
        max_guests: providedMaxGuests,
        description: roomData.description ?? '',
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
    return apiClient.post<RoomType>(API_CONFIG.ENDPOINTS.ADD_ROOM, { roomData });
  },

  async updateRoom(roomId: string, updates: Partial<RoomType>): Promise<RoomType> {
    if (API_CONFIG.USE_MOCK_DATA) {
      ensureMockLayerReady();
      await mockDelay();
      
      const allRoomTypes = getMockRoomTypes();
      let updatedRoom: RoomType | null = null;

      for (const hotelId in allRoomTypes) {
        const rooms = allRoomTypes[hotelId];
        const index = rooms.findIndex(
          r => String((r as any).id ?? r.type_id) === String(roomId)
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
      throw new Error('Room not found');
    }
    return apiClient.put<RoomType>(API_CONFIG.ENDPOINTS.ROOM_INVENTORY_UPDATE, { room_id: roomId, ...updates });
  },

  async deleteRoom(roomId: string): Promise<void> {
    if (API_CONFIG.USE_MOCK_DATA) {
      ensureMockLayerReady();
      await mockDelay();
      
      const allRoomTypes = getMockRoomTypes();
      for (const hotelId in allRoomTypes) {
        const rooms = allRoomTypes[hotelId];
        const index = rooms.findIndex(
          r => String((r as any).id ?? r.type_id) === String(roomId)
        );
        if (index !== -1) {
          rooms.splice(index, 1);
          setMockRoomTypes(allRoomTypes);
          return;
        }
      }
      throw new Error('Room not found');
    }
    return apiClient.delete(API_CONFIG.ENDPOINTS.ROOM_INVENTORY_DELETE, { room_id: roomId });
  },

  // Pricing Management
  async getPricing(hotelId: string = 'h1'): Promise<Record<string, unknown>> {
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
          { season: 'Cao điểm (Tết, Lễ)', multiplier: 1.8, start: '01/01', end: '07/01' },
          { season: 'Mùa du lịch', multiplier: 1.3, start: '01/06', end: '31/08' },
          { season: 'Bình thường', multiplier: 1.0, start: '01/09', end: '31/12' },
        ],
      };
      localStorage.setItem(`hotelPricing_${hotelId}`, JSON.stringify(defaultPricing));
      return defaultPricing;
    }
    // Backend requires type_id, not hotel_id. This needs to be refactored.
    // Temporary: return mock data or fetch all room types first
    return apiClient.get<any>(API_CONFIG.ENDPOINTS.VIEW_ROOM_TYPES, { hotel_id: hotelId });
  },

  async updatePricing(hotelId: string, pricing: Record<string, unknown>): Promise<Record<string, unknown>> {
    if (API_CONFIG.USE_MOCK_DATA) {
      ensureMockLayerReady();
      await mockDelay();
      localStorage.setItem(`hotelPricing_${hotelId}`, JSON.stringify(pricing));
      return pricing;
    }
    return apiClient.put<any>(API_CONFIG.ENDPOINTS.UPDATE_PRICE, { priceData: pricing });
  },

  // Reviews Management
  async replyToReview(reviewId: string, reply: string): Promise<Review> {
    if (API_CONFIG.USE_MOCK_DATA) {
      ensureMockLayerReady();
      await mockDelay();

      const reviews = getMockReviews();
      const review = reviews.find(r => r.review_id === Number(reviewId));
      if (!review) throw new Error('Review not found');

      (review as unknown as { reply: { content: string; date: string; authorName: string }; replied: boolean }).reply = {
        content: reply,
        date: new Date().toISOString().split('T')[0],
        authorName: 'Hotel Manager',
      };
      (review as unknown as { replied: boolean }).replied = true;

      setMockReviews(reviews);
      return review;
    }
    return apiClient.post<any>(API_CONFIG.ENDPOINTS.REPLY_REVIEW, { review_id: reviewId, reply });
  },

  // Hotel Info Management
  async getHotelInfo(hotelId: string = 'h1'): Promise<Hotel & { settings?: Record<string, unknown> }> {
    if (API_CONFIG.USE_MOCK_DATA) {
      ensureMockLayerReady();
      await mockDelay();

      const hotels = getMockHotels();
      const hotel = hotels.find(h => h.hotel_id === Number(hotelId));
      if (!hotel) throw new Error('Hotel not found');

      // Get additional settings from localStorage
      const settings = localStorage.getItem(`hotelSettings_${hotelId}`);
      return {
        ...hotel,
        settings: settings ? (JSON.parse(settings) as Record<string, unknown>) : {
          checkInTime: '14:00',
          checkOutTime: '12:00',
          policies: {
            cancellation: 'Miễn phí hủy trước 24 giờ',
            children: 'Chấp nhận trẻ em dưới 12 tuổi miễn phí',
            pets: 'Không chấp nhận thú cưng',
            smoking: 'Không hút thuốc trong phòng',
            payment: 'Chấp nhận thẻ tín dụng, chuyển khoản, tiền mặt',
          },
        },
      };
    }
    return apiClient.get<any>(API_CONFIG.ENDPOINTS.VIEW_HOTEL, { hotel_id: hotelId });
  },

  async updateHotelInfo(hotelId: string, updates: Partial<Hotel> & { phone?: string; email?: string; settings?: Record<string, unknown> }): Promise<{ success: boolean }> {
    if (API_CONFIG.USE_MOCK_DATA) {
      ensureMockLayerReady();
      await mockDelay();

      // Update hotel basic info
      const hotels = getMockHotels();
      const hotelIndex = hotels.findIndex(h => h.hotel_id === Number(hotelId));
      if (hotelIndex !== -1) {
        hotels[hotelIndex] = { ...hotels[hotelIndex], ...updates };
        localStorage.setItem('hotels', JSON.stringify(hotels));
      }

      // Update settings
      if (updates.settings) {
        localStorage.setItem(`hotelSettings_${hotelId}`, JSON.stringify(updates.settings));
      }

      return { success: true };
    }
    return apiClient.put<any>(API_CONFIG.ENDPOINTS.UPDATE_HOTEL, { hotel_id: hotelId, hotelData: updates });
  },
};
