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
  updateMockUser,
  addMockBooking,
  addMockReview,
  updateMockBooking,
  setMockReviews,
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
          h.city.toLowerCase().includes(filters.location!.toLowerCase()) ||
          h.district.toLowerCase().includes(filters.location!.toLowerCase())
        );
      }

      if (filters?.minPrice) {
        hotels = hotels.filter(h => h.basePrice >= filters.minPrice!);
      }

      if (filters?.maxPrice) {
        hotels = hotels.filter(h => h.basePrice <= filters.maxPrice!);
      }

      if (filters?.stars && filters.stars.length > 0) {
        hotels = hotels.filter(h => filters.stars!.includes(h.stars));
      }

      // Sort
      if (filters?.sortBy === 'price') {
        hotels.sort((a, b) => a.basePrice - b.basePrice);
      } else if (filters?.sortBy === 'rating') {
        hotels.sort((a, b) => b.rating - a.rating);
      }

      return hotels;
    }

    // Real API call
    return apiClient.get<Hotel[]>(API_CONFIG.ENDPOINTS.HOTELS);
  },

  async getById(id: string): Promise<Hotel | null> {
    if (API_CONFIG.USE_MOCK_DATA) {
      ensureMockLayerReady();
      await mockDelay();
      const hotels = getMockHotels();
      return hotels.find(h => h.id === id) || null;
    }

    return apiClient.get<Hotel>(API_CONFIG.ENDPOINTS.HOTEL_DETAILS, { id });
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

    return apiClient.get<RoomType[]>(API_CONFIG.ENDPOINTS.HOTEL_ROOMS, { id: hotelId });
  },

  async getReviews(hotelId: string): Promise<Review[]> {
    if (API_CONFIG.USE_MOCK_DATA) {
      ensureMockLayerReady();
      await mockDelay();
      const reviews = getMockReviews();
      return reviews.filter(r => r.hotelId === hotelId);
    }

    return apiClient.get<Review[]>(API_CONFIG.ENDPOINTS.HOTEL_REVIEWS, { id: hotelId });
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

    return apiClient.get<TourismSpot[]>(API_CONFIG.ENDPOINTS.TOURISM_SPOTS);
  },

  async getById(id: string): Promise<TourismSpot | null> {
    if (API_CONFIG.USE_MOCK_DATA) {
      ensureMockLayerReady();
      await mockDelay();
      const spots = getMockTourismSpots();
      return spots.find(t => t.id === id) || null;
    }

    return apiClient.get<TourismSpot>(API_CONFIG.ENDPOINTS.TOURISM_DETAILS, { id });
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

    return apiClient.get<Booking[]>(API_CONFIG.ENDPOINTS.USER_BOOKINGS);
  },

  async getById(id: string): Promise<Booking | null> {
    if (API_CONFIG.USE_MOCK_DATA) {
      ensureMockLayerReady();
      await mockDelay();
      const bookings = getMockBookings();
      return bookings.find(b => b.id === id) || null;
    }

    return apiClient.get<Booking>(API_CONFIG.ENDPOINTS.BOOKING_DETAILS, { id });
  },

  async create(bookingData: Partial<Booking>): Promise<Booking> {
    if (API_CONFIG.USE_MOCK_DATA) {
      ensureMockLayerReady();
      await mockDelay();
      const newBooking: Booking = {
        id: `BK${Date.now()}`,
        ...bookingData as Booking,
        bookingDate: new Date().toISOString(),
        status: 'pending',
        paymentStatus: 'pending',
      };
      // Save to localStorage
      addMockBooking(newBooking);
      return newBooking;
    }

    return apiClient.post<Booking>(API_CONFIG.ENDPOINTS.CREATE_BOOKING, bookingData);
  },

  async cancel(id: string): Promise<boolean> {
    if (API_CONFIG.USE_MOCK_DATA) {
      ensureMockLayerReady();
      await mockDelay();
      // Update booking status in localStorage
      updateMockBooking(id, { status: 'cancelled', paymentStatus: 'refunded' });
      return true;
    }

    return apiClient.delete<boolean>(API_CONFIG.ENDPOINTS.CANCEL_BOOKING, { id });
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

    return apiClient.get<User>(API_CONFIG.ENDPOINTS.USER_PROFILE);
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

    return apiClient.put<User>(API_CONFIG.ENDPOINTS.USER_PROFILE, data);
  },
};

// ============= REVIEWS API =============
export const reviewsApi = {
  async create(reviewData: Partial<Review>): Promise<Review> {
    if (API_CONFIG.USE_MOCK_DATA) {
      ensureMockLayerReady();
      await mockDelay();
      const newReview: Review = {
        id: `rv${Date.now()}`,
        ...reviewData as Review,
        date: new Date().toISOString(),
        helpful: 0,
        verified: true,
      };
      // Save to localStorage
      addMockReview(newReview);
      return newReview;
    }

    return apiClient.post<Review>(API_CONFIG.ENDPOINTS.USER_REVIEWS, reviewData);
  },

  async update(id: string, reviewData: Partial<Review>): Promise<Review> {
    if (API_CONFIG.USE_MOCK_DATA) {
      ensureMockLayerReady();
      await mockDelay();
      const reviews = getMockReviews();
      const review = reviews.find(r => r.id === id);
      const updatedReview = { ...review!, ...reviewData };
      // Update in localStorage
      const allReviews = reviews.map(r => r.id === id ? updatedReview : r);
      setMockReviews(allReviews);
      return updatedReview;
    }

    return apiClient.put<Review>(`${API_CONFIG.ENDPOINTS.USER_REVIEWS}/${id}`, reviewData);
  },

  async delete(id: string): Promise<boolean> {
    if (API_CONFIG.USE_MOCK_DATA) {
      ensureMockLayerReady();
      await mockDelay();
      // Delete from localStorage
      const reviews = getMockReviews();
      const filtered = reviews.filter(r => r.id !== id);
      setMockReviews(filtered);
      return true;
    }

    return apiClient.delete<boolean>(`${API_CONFIG.ENDPOINTS.USER_REVIEWS}/${id}`);
  },
};

// ============= SEARCH API =============
export const searchApi = {
  async hotels(query: string, filters?: SearchFilters): Promise<Hotel[]> {
    if (API_CONFIG.USE_MOCK_DATA) {
      ensureMockLayerReady();
      await mockDelay();
      const allHotels = getMockHotels();
      let hotels = allHotels.filter(h =>
        h.name.toLowerCase().includes(query.toLowerCase()) ||
        h.city.toLowerCase().includes(query.toLowerCase()) ||
        h.description.toLowerCase().includes(query.toLowerCase())
      );

      // Apply additional filters
      return hotelsApi.getAll(filters);
    }

    return apiClient.post<Hotel[]>(API_CONFIG.ENDPOINTS.SEARCH_HOTELS, { query, ...filters });
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

    return apiClient.get<string[]>(`${API_CONFIG.ENDPOINTS.SEARCH_SUGGESTIONS}?q=${query}`);
  },
};
