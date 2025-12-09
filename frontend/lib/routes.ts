/**
 * Centralized Route Management
 * Quản lý tất cả routes trong ứng dụng
 */

export const ROUTES = {
  // Public Routes (Guest)
  HOME: '/',
  SEARCH: '/search',
  HOTEL_DETAILS: (slug: string) => `/hotel/${slug}`,
  TOURISM: '/tourism',
  TOURISM_DETAILS: (slug: string) => `/tourism/${slug}`,
  CHECKOUT: '/checkout',

  // Static Pages
  ABOUT: '/about',
  CONTACT: '/contact',
  FAQ: '/faq',
  TERMS: '/terms',
  PRIVACY: '/privacy',
  HELP: '/help',

  // Auth
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',

  // User Routes
  USER: {
    DASHBOARD: '/user/dashboard',
    BOOKINGS: '/user/dashboard/bookings',
    BOOKING_DETAILS: (id: string) => `/user/dashboard/bookings/${id}`,
    PROFILE: '/user/dashboard/profile',
    REVIEWS: '/user/reviews',
    REVIEW_CREATE: (hotelId: string) => `/user/reviews/create?hotelId=${hotelId}`,
    REVIEW_EDIT: (id: string) => `/user/reviews/${id}/edit`,
  },

  // Hotel Manager Routes
  HOTEL: {
    LOGIN: '/hotel/login',
    REGISTER: '/hotel/register',
    DASHBOARD: '/hotel/dashboard',
    PROFILE: '/hotel/dashboard/profile',
    ROOMS: '/hotel/rooms',
    ROOM_CREATE: '/hotel/rooms/create',
    ROOM_EDIT: (id: string) => `/hotel/rooms/${id}/edit`,
    PRICING: '/hotel/pricing',
    BOOKINGS: '/hotel/bookings',
    REVIEWS: '/hotel/reviews',
    ANALYTICS: '/hotel/analytics',
  },

  // Admin Routes
  ADMIN: {
    LOGIN: '/admin/login',
    DASHBOARD: '/admin/dashboard',
    USERS: '/admin/users',
    HOTELS: '/admin/hotels',
    HOTEL_APPROVE: (id: string) => `/admin/hotels/${id}/approve`,
    BOOKINGS: '/admin/bookings',
    CONTENT: '/admin/content',
    ANALYTICS: '/admin/analytics',
    SETTINGS: '/admin/settings',
  },
} as const;

// Route Groups for easier checking
export const PUBLIC_ROUTES = [
  ROUTES.HOME,
  ROUTES.SEARCH,
  ROUTES.TOURISM,
  ROUTES.ABOUT,
  ROUTES.CONTACT,
  ROUTES.FAQ,
  ROUTES.TERMS,
  ROUTES.PRIVACY,
  ROUTES.HELP,
  ROUTES.LOGIN,
  ROUTES.REGISTER,
];

export const USER_ROUTES = Object.values(ROUTES.USER);
export const HOTEL_ROUTES = Object.values(ROUTES.HOTEL);
export const ADMIN_ROUTES = Object.values(ROUTES.ADMIN);

// Helper functions
export const isPublicRoute = (path: string): boolean => {
  return PUBLIC_ROUTES.some(route => path.startsWith(route));
};

export const isUserRoute = (path: string): boolean => {
  return path.startsWith('/user');
};

export const isHotelRoute = (path: string): boolean => {
  return path.startsWith('/hotel');
};

export const isAdminRoute = (path: string): boolean => {
  return path.startsWith('/admin');
};
