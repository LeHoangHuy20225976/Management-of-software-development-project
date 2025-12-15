/**
 * API Configuration
 * Toggle USE_MOCK_DATA to switch between mock and real API
 */

export const API_CONFIG = {
  // Set to false when backend is ready
  // Can be controlled via NEXT_PUBLIC_USE_MOCK_DATA in .env.local
  USE_MOCK_DATA: process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true' ? true : process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'false' ? false : true,

  // Backend API URL
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000',
  API_VERSION: process.env.NEXT_PUBLIC_API_VERSION || 'v1',

  // API Endpoints
  ENDPOINTS: {
    // Auth (matches backend format_message.md)
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH_TOKEN: '/auth/refresh-tokens',
    CHANGE_PASSWORD: '/auth/reset-password',
    FORGOT_PASSWORD: '/auth/verify-forget-password',
    RESET_FORGOT_PASSWORD: '/auth/reset-forget-password',

    // Hotels
    HOTELS: '/hotels',
    HOTEL_DETAILS: '/hotels/:id',
    HOTEL_ROOMS: '/hotels/:id/rooms',
    HOTEL_REVIEWS: '/hotels/:id/reviews',

    // Search
    SEARCH_HOTELS: '/search/hotels',
    SEARCH_SUGGESTIONS: '/search/suggestions',

    // Bookings
    BOOKINGS: '/bookings',
    CREATE_BOOKING: '/bookings/create',
    BOOKING_DETAILS: '/bookings/:id',
    CANCEL_BOOKING: '/bookings/:id/cancel',

    // User
    USER_PROFILE: '/user/profile',
    USER_BOOKINGS: '/user/bookings',
    USER_REVIEWS: '/user/reviews',

    // Tourism
    TOURISM_SPOTS: '/tourism',
    TOURISM_DETAILS: '/tourism/:id',

    // Payment
    PAYMENT_CREATE: '/payment/create',
    PAYMENT_CALLBACK: '/payment/callback',

    // Hotel Manager
    MANAGER_HOTELS: '/manager/hotels',
    MANAGER_ROOMS: '/manager/rooms',
    MANAGER_BOOKINGS: '/manager/bookings',

    // Admin
    ADMIN_DASHBOARD: '/admin/dashboard',
    ADMIN_USERS: '/admin/users',
    ADMIN_HOTELS: '/admin/hotels',
  },

  // Request timeout
  TIMEOUT: 30000,

  // Retry configuration
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000,
};

export const getApiUrl = (endpoint: string, params?: Record<string, string>): string => {
  // Direct URL without /api/v1 prefix (backend uses /auth/login, /auth/register, etc.)
  let url = `${API_CONFIG.BASE_URL}${endpoint}`;

  if (params) {
    Object.keys(params).forEach(key => {
      url = url.replace(`:${key}`, params[key]);
    });
  }

  return url;
};
