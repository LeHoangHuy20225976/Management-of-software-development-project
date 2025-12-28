/**
 * API Configuration
 * Toggle USE_MOCK_DATA to switch between mock and real API
 */

export const API_CONFIG = {
  // Set to false to use real backend API
  // Can be controlled via NEXT_PUBLIC_USE_MOCK_DATA in .env.local
  // Changed default to FALSE - now using real API
  USE_MOCK_DATA: process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true' ? true : process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'false' ? false : false,

  // Backend API URL
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000',
  API_VERSION: process.env.NEXT_PUBLIC_API_VERSION || 'v1',

  // API Endpoints
  ENDPOINTS: {
    // Auth (matches backend /api/v1/auth/*)
    LOGIN: '/api/v1/auth/login',
    REGISTER: '/api/v1/auth/register',
    LOGOUT: '/api/v1/auth/logout',
    REFRESH_TOKEN: '/api/v1/auth/refresh-tokens',
    CHANGE_PASSWORD: '/api/v1/auth/reset-password',
    FORGOT_PASSWORD: '/api/v1/auth/verify-forget-password',
    RESET_FORGOT_PASSWORD: '/api/v1/auth/reset-forget-password',

    // Hotel Profile (matches backend /api/v1/hotel-profile/*)
    ADD_HOTEL: '/api/v1/hotel-profile/add-hotel',
    HOTEL_MANAGER_HOTELS: '/api/v1/hotel-profile/hotel-manager/hotels',
    VIEW_HOTEL: '/api/v1/hotel-profile/view-hotel/:hotel_id',
    UPDATE_HOTEL: '/api/v1/hotel-profile/update-hotel/:hotel_id',
    DELETE_HOTEL: '/api/v1/hotel-profile/delete-hotel/:hotel_id',
    ADD_FACILITY: '/api/v1/hotel-profile/add-facility/:hotel_id',
    VIEW_FACILITIES: '/api/v1/hotel-profile/view-facilities/:hotel_id',
    
    // Room Type Management
    ADD_ROOM_TYPE: '/api/v1/hotel-profile/add-room-type',
    VIEW_ROOM_TYPES: '/api/v1/hotel-profile/view-room-types/:hotel_id',
    VIEW_ROOM_TYPE: '/api/v1/hotel-profile/view-room-type/:type_id',
    UPDATE_ROOM_TYPE: '/api/v1/hotel-profile/update-room-type/:type_id',

    // Room Management
    ADD_ROOM: '/api/v1/hotel-profile/add-room',
    VIEW_ALL_ROOMS: '/api/v1/hotel-profile/view-all-rooms/:hotel_id',
    VIEW_ROOM: '/api/v1/hotel-profile/view-room/:room_id',
    UPDATE_ROOM: '/api/v1/hotel-profile/update-room/:room_id',
    ALL_ROOMS: '/api/v1/hotel-profile/all-rooms',
    ALL_HOTELS: '/api/v1/hotel-profile/all-hotels',
    
    // Pricing
    UPDATE_PRICE: '/api/v1/hotel-profile/update-price',

    // Reviews (under hotel-profile)
    ADD_REVIEW: '/api/v1/hotel-profile/add-review',
    UPDATE_REVIEW: '/api/v1/hotel-profile/update-review/:review_id',
    DELETE_REVIEW: '/api/v1/hotel-profile/delete-review/:review_id',
    ALL_REVIEWS: '/api/v1/hotel-profile/all-reviews/:hotel_id',
    REPLY_REVIEW: '/api/v1/hotel-profile/reply-review/:review_id',

    // Bookings (matches backend /bookings/*)
    BOOKING_HISTORY: '/api/v1/bookings',
    BOOKING_DETAILS: '/api/v1/bookings/:id',
    ADD_BOOKING: '/api/v1/bookings',
    CANCEL_BOOKING: '/api/v1/bookings/:id/cancel',
    UPDATE_BOOKING: '/api/v1/bookings/:id',
    UPDATE_BOOKING_STATUS: '/api/v1/bookings/:id/status',
    CHECK_AVAILABILITY: '/api/v1/bookings/check-availability',
    CALCULATE_PRICE: '/api/v1/bookings/calculate-price',
    AVAILABLE_ROOMS: '/api/v1/bookings/available-rooms/:hotelId',

    // User Profile (matches backend /api/v1/users/*)
    VIEW_PROFILE: '/api/v1/users/profile',
    UPDATE_PROFILE: '/api/v1/users/profile',
    USER_BOOKINGS: '/api/v1/users/bookings',
    UPLOAD_PROFILE_IMAGE: '/api/v1/users/profile/image',

    // Tourism/Destinations (matches backend /api/v1/destinations/*)
    ALL_DESTINATIONS: '/api/v1/destinations',
    VIEW_DESTINATION: '/api/v1/destinations/:destination_id',
    SEARCH_DESTINATIONS: '/api/v1/destinations/search',
    DESTINATIONS_BY_TYPE: '/api/v1/destinations/type/:type',

    // Payment Gateway (matches backend /payments/*)
    PAYMENT_CREATE: '/payments/create',
    PAYMENT_CREATE_MOCK: '/payments/create-mock',
    PAYMENT_CONFIG: '/payments/config',
    PAYMENT_LIST: '/payments',
    PAYMENT_DETAILS: '/payments/:id',
    PAYMENT_BY_BOOKING: '/payments/booking/:bookingId',
    PAYMENT_QUERY_STATUS: '/payments/:id/query',
    PAYMENT_REFUND: '/payments/:id/refund',
    PAYMENT_CANCEL: '/payments/:id/cancel',
    VNPAY_RETURN: '/payments/vnpay-return',
    VNPAY_IPN: '/payments/vnpay-ipn',

    // Room Inventory (matches backend /api/v1/rooms/*)
    ROOM_CHECK_AVAILABILITY: '/api/v1/rooms/check-availability',
    ROOM_AVAILABLE: '/api/v1/rooms/available/:hotelId',
    ROOM_TYPE_BY_ID: '/api/v1/rooms/types/:id',
    ROOM_TYPES_BY_HOTEL: '/api/v1/rooms/types/hotel/:hotelId',
    ROOM_BY_ID: '/api/v1/rooms/:id',
    ROOMS_BY_TYPE: '/api/v1/rooms/type/:typeId',
    ROOM_HOLD: '/api/v1/rooms/hold',
    ROOM_HOLD_RELEASE: '/api/v1/rooms/hold/:holdId/release',
    ROOM_INVENTORY_CALENDAR: '/api/v1/rooms/inventory-calendar/:typeId',
    ROOM_INVENTORY_UPDATE: '/api/v1/room-inventory/update-room/:room_id',
    ROOM_INVENTORY_DELETE: '/api/v1/room-inventory/delete-room/:room_id',

    // Pricing Engine
    PRICING_CALCULATE: '/api/v1/pricing/calculate',
    PRICING_GET_PRICE: '/api/v1/pricing/date/:typeId',
    PRICING_GET_RANGE: '/api/v1/pricing/range/:typeId',
    PRICING_UPDATE: '/api/v1/pricing/update/:typeId',

    // Synchronization
    SYNC_HOTEL_AVAILABILITY: '/api/v1/sync/availability/:hotelId',
    SYNC_HOTEL_PRICING: '/api/v1/sync/pricing/:hotelId',
    SYNC_HOTEL_DATA: '/api/v1/sync/hotel/:hotelId',
    SYNC_MULTIPLE_HOTELS: '/api/v1/sync/hotels',
    SYNC_STATUS: '/api/v1/sync/status/:hotelId',
    SYNC_INCOMING: '/api/v1/sync/incoming',

    // User Profile Extended
    DELETE_PROFILE: '/api/v1/users/profile',
    GET_PROFILE_IMAGE: '/api/v1/users/profile/image',
    DELETE_PROFILE_IMAGE: '/api/v1/users/profile/image',
    GET_ALL_USERS: '/api/v1/users',
    CREATE_USER: '/api/v1/users',

    // Destinations Extended
    CREATE_DESTINATION: '/api/v1/destinations',
    UPDATE_DESTINATION: '/api/v1/destinations/:id',
    DELETE_DESTINATION: '/api/v1/destinations/:id',
    ADD_DESTINATION_REVIEW: '/api/v1/destinations/:id/reviews',
    DESTINATION_THUMBNAIL: '/api/v1/destinations/:id/thumbnail',
    DESTINATION_IMAGES: '/api/v1/destinations/:id/images',
    DELETE_DESTINATION_IMAGE: '/api/v1/destinations/:id/images/:imageId',

    // Booking Extended (Hotel Manager)
    BOOKING_CHECKIN: '/api/v1/bookings/:id/checkin',
    BOOKING_CHECKOUT: '/api/v1/bookings/:id/checkout',

    // Notifications
    NOTIFICATION_TEST: '/api/v1/notifications/test',
    NOTIFICATION_BOOKING_CONFIRM: '/api/v1/notifications/booking-confirmation',
    NOTIFICATION_BOOKING_CANCEL: '/api/v1/notifications/booking-cancellation',
    NOTIFICATION_PASSWORD_RESET: '/api/v1/notifications/password-reset',
    NOTIFICATION_WELCOME: '/api/v1/notifications/welcome',
    NOTIFICATION_PAYMENT_CONFIRM: '/api/v1/notifications/payment-confirmation',

    // Admin (matches backend /admin/*)
    ADMIN_DASHBOARD: '/admin/dashboard',
    ADMIN_REVENUE_METRICS: '/admin/metrics/revenue',
    ADMIN_BOOKING_KPIS: '/admin/metrics/bookings',
    ADMIN_RECENT_ACTIVITY: '/admin/activity',
    ADMIN_USERS: '/admin/users',
    ADMIN_USER_BY_ID: '/admin/users/:id',
    ADMIN_UPDATE_USER_ROLE: '/admin/users/:id/role',
    ADMIN_UPDATE_USER: '/admin/users/:id',
    ADMIN_DELETE_USER: '/admin/users/:id',
    ADMIN_HOTEL_MANAGERS: '/admin/hotel-managers',
    ADMIN_PENDING_HOTELS: '/admin/hotels/pending',
    ADMIN_APPROVE_HOTEL: '/admin/hotels/:id/approve',
    ADMIN_LOCK_HOTEL: '/admin/hotels/:id/lock',
    ADMIN_UPDATE_HOTEL_STATUS: '/admin/hotels/:id/status',

    // Image Uploads (Hotel Profile)
    UPLOAD_HOTEL_IMAGES: '/hotel-profile/upload-images-for-hotel/:hotel_id',
    UPLOAD_ROOM_IMAGES: '/hotel-profile/upload-images-for-room/:room_id',
    HOTEL_ALL_IMAGES: '/hotel-profile/all-images/:hotel_id',
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

  const pathParams: Record<string, string> = {};
  const queryParams: Record<string, string> = {};

  // Separate path params (used in URL like :id) from query params
  if (params) {
    Object.keys(params).forEach(key => {
      if (url.includes(`:${key}`)) {
        pathParams[key] = params[key];
      } else {
        queryParams[key] = params[key];
      }
    });

    // Replace path parameters
    Object.keys(pathParams).forEach(key => {
      url = url.replace(`:${key}`, pathParams[key]);
    });

    // Append query parameters
    const queryKeys = Object.keys(queryParams);
    if (queryKeys.length > 0) {
      const queryString = queryKeys
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(queryParams[key])}`)
        .join('&');
      url += `?${queryString}`;
    }
  }

  return url;
};
