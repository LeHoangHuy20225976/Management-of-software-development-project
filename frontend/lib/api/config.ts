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
    HOTEL_MANAGER_HOTELS: '/hotel-profile/hotel-manager/hotels',
    VIEW_HOTEL: '/hotel-profile/view-hotel/:hotel_id',
    UPDATE_HOTEL: '/hotel-profile/update-hotel/:hotel_id',
    DELETE_HOTEL: '/hotel-profile/delete-hotel/:hotel_id',
    ADD_FACILITY: '/hotel-profile/add-facility/:hotel_id',
    VIEW_FACILITIES: '/hotel-profile/view-facilities/:hotel_id',
    
    // Room Type Management
    ADD_ROOM_TYPE: '/hotel-profile/add-room-type',
    VIEW_ROOM_TYPES: '/hotel-profile/view-room-types/:hotel_id',
    VIEW_ROOM_TYPE: '/hotel-profile/view-room-type/:type_id',
    UPDATE_ROOM_TYPE: '/hotel-profile/update-room-type/:type_id',
    
    // Room Management
    ADD_ROOM: '/hotel-profile/add-room',
    VIEW_ALL_ROOMS: '/hotel-profile/view-all-rooms/:hotel_id',
    VIEW_ROOM: '/hotel-profile/view-room/:room_id',
    UPDATE_ROOM: '/hotel-profile/update-room/:room_id',
    ALL_ROOMS: '/hotel-profile/all-rooms',
    ALL_HOTELS: '/hotel-profile/all-hotels',
    
    // Pricing
    UPDATE_PRICE: '/hotel-profile/update-price',

    // Reviews (under hotel-profile)
    ADD_REVIEW: '/hotel-profile/add-review',
    UPDATE_REVIEW: '/hotel-profile/update-review/:review_id',
    DELETE_REVIEW: '/hotel-profile/delete-review/:review_id',
    ALL_REVIEWS: '/hotel-profile/all-reviews/:hotel_id',
    REPLY_REVIEW: '/hotel-profile/reply-review/:review_id',

    // Bookings (matches backend /bookings/*)
    BOOKING_HISTORY: '/bookings',
    BOOKING_DETAILS: '/bookings/:id',
    ADD_BOOKING: '/bookings',
    CANCEL_BOOKING: '/bookings/:id/cancel',
    UPDATE_BOOKING: '/bookings/:id',
    UPDATE_BOOKING_STATUS: '/bookings/:id/status',
    CHECK_AVAILABILITY: '/bookings/check-availability',
    CALCULATE_PRICE: '/bookings/calculate-price',
    AVAILABLE_ROOMS: '/bookings/available-rooms/:hotelId',

    // User Profile (matches backend /users/*)
    VIEW_PROFILE: '/users/profile',
    UPDATE_PROFILE: '/users/profile',
    USER_BOOKINGS: '/users/bookings',
    UPLOAD_PROFILE_IMAGE: '/users/profile/image',

    // Tourism/Destinations (matches backend /destinations/*)
    ALL_DESTINATIONS: '/destinations',
    VIEW_DESTINATION: '/destinations/:destination_id',
    SEARCH_DESTINATIONS: '/destinations/search',
    DESTINATIONS_BY_TYPE: '/destinations/type/:type',

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

    // Room Inventory (matches backend /rooms/*)
    ROOM_CHECK_AVAILABILITY: '/rooms/check-availability',
    ROOM_AVAILABLE: '/rooms/available/:hotelId',
    ROOM_TYPE_BY_ID: '/rooms/types/:id',
    ROOM_TYPES_BY_HOTEL: '/rooms/types/hotel/:hotelId',
    ROOM_BY_ID: '/rooms/:id',
    ROOMS_BY_TYPE: '/rooms/type/:typeId',
    ROOM_HOLD: '/rooms/hold',
    ROOM_HOLD_RELEASE: '/rooms/hold/:holdId/release',
    ROOM_INVENTORY_CALENDAR: '/rooms/inventory-calendar/:typeId',
    ROOM_INVENTORY_UPDATE: '/room-inventory/update-room/:room_id',
    ROOM_INVENTORY_DELETE: '/room-inventory/delete-room/:room_id',

    // Pricing Engine
    GET_PRICE: '/pricing-engine/get-price/:type_id',
    PRICING_PRICE_FOR_DATE: '/pricing/date/:typeId',

    // User Profile Extended
    DELETE_PROFILE: '/users/profile',
    GET_PROFILE_IMAGE: '/users/profile/image',
    DELETE_PROFILE_IMAGE: '/users/profile/image',
    GET_ALL_USERS: '/users',
    CREATE_USER: '/users',

    // Destinations Extended
    CREATE_DESTINATION: '/destinations',
    UPDATE_DESTINATION: '/destinations/:id',
    DELETE_DESTINATION: '/destinations/:id',
    GET_DESTINATION_REVIEWS: '/destinations/:id/reviews',
    ADD_DESTINATION_REVIEW: '/destinations/:id/reviews',
    DESTINATION_THUMBNAIL: '/destinations/:id/thumbnail',
    DESTINATION_IMAGES: '/destinations/:id/images',
    DELETE_DESTINATION_IMAGE: '/destinations/:id/images/:imageId',

    // Booking Extended (Hotel Manager)
    BOOKING_CHECKIN: '/bookings/:id/checkin',
    BOOKING_CHECKOUT: '/bookings/:id/checkout',

    // Notifications
    NOTIFICATION_TEST: '/notifications/test',
    NOTIFICATION_BOOKING_CONFIRM: '/notifications/booking-confirmation',
    NOTIFICATION_BOOKING_CANCEL: '/notifications/booking-cancellation',
    NOTIFICATION_PASSWORD_RESET: '/notifications/password-reset',
    NOTIFICATION_WELCOME: '/notifications/welcome',
    NOTIFICATION_PAYMENT_CONFIRM: '/notifications/payment-confirmation',

    // Image Uploads (Hotel Profile)
    UPLOAD_HOTEL_IMAGES: '/hotel-profile/upload-images-for-hotel/:hotel_id',
    UPLOAD_ROOM_IMAGES: '/hotel-profile/upload-images-for-room/:room_id',
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
