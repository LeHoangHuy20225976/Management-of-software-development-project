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

    // Hotel Profile (matches backend /hotel-profile/*)
    ADD_HOTEL: '/hotel-profile/add-hotel',
    VIEW_HOTEL: '/hotel-profile/view-hotel/:hotel_id',
    UPDATE_HOTEL: '/hotel-profile/update-hotel/:hotel_id',
    DELETE_HOTEL: '/hotel-profile/delete-hotel/:hotel_id',
    ADD_FACILITY: '/hotel-profile/add-facility/:hotel_id',
    
    // Room Type Management
    ADD_ROOM_TYPE: '/hotel-profile/add-room-type',
    VIEW_ROOM_TYPES: '/hotel-profile/view-room-types/:hotel_id',
    
    // Room Management
    ADD_ROOM: '/hotel-profile/add-room',
    VIEW_ALL_ROOMS: '/hotel-profile/view-all-rooms/:hotel_id',
    ALL_ROOMS: '/hotel-profile/all-rooms',
    
    // Pricing
    UPDATE_PRICE: '/hotel-profile/update-price',

    // Reviews (under hotel-profile)
    ADD_REVIEW: '/hotel-profile/add-review',
    UPDATE_REVIEW: '/hotel-profile/update-review/:review_id',
    DELETE_REVIEW: '/hotel-profile/delete-review/:review_id',
    ALL_REVIEWS: '/hotel-profile/all-reviews/:hotel_id',
    REPLY_REVIEW: '/hotel-profile/reply-review/:review_id',

    // Bookings (matches backend /booking-engine/*)
    BOOKING_HISTORY: '/booking-engine/booking-history',
    BOOKING_DETAILS: '/booking-engine/booking-details/:id',
    ADD_BOOKING: '/booking-engine/add-booking',
    DELETE_BOOKING: '/booking-engine/delete-booking/:id',

    // User Profile (matches backend /user-profile/*)
    VIEW_PROFILE: '/user-profile/view-profile',
    UPDATE_PROFILE: '/user-profile/update-profile',

    // Tourism CMS (matches backend /tourism-cms/*)
    ALL_DESTINATIONS: '/tourism-cms/all-destinations',
    VIEW_DESTINATION: '/tourism-cms/view-destination/:destination_id',

    // Payment Gateway
    PAYMENT_CREATE: '/payment/create',
    PAYMENT_CALLBACK: '/payment/callback',

    // Room Inventory
    ROOM_INVENTORY_UPDATE: '/room-inventory/update-room/:room_id',
    ROOM_INVENTORY_DELETE: '/room-inventory/delete-room/:room_id',

    // Pricing Engine
    GET_PRICE: '/pricing-engine/get-price/:type_id',

    // Admin (placeholders - not yet documented in format_message.md)
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
