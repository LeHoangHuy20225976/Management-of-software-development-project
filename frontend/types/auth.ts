/**
 * Authentication Types
 * Based on backend API format from format_message.md
 */

// User roles (must match backend rolePermissions.js)
export type UserRole = 'customer' | 'hotel_manager' | 'admin';

// Login request payload
export interface LoginRequest {
  userData: {
    email: string;
    password: string;
    role: UserRole;
  };
}

// Login response data
export interface LoginResponseData {
  user_id: number;
  name: string;
  gender: string;
  role: UserRole;
  profile_image: string | null;
}

// Register request payload
export interface RegisterRequest {
  userData: {
    name: string;
    email: string;
    phone_number: string;
    gender: string;
    date_of_birth: string;
    role: UserRole;
    password: string;
    profile_image: string | null;
  };
}

// Register response data
export interface RegisterResponseData {
  email: string;
}

// Logout response data
export interface LogoutResponseData {
  message: string;
}

// Refresh token response data
export interface RefreshTokenResponseData {
  message: string;
}

// Standard API response wrapper from backend
export interface BackendApiResponse<T> {
  success: boolean;
  data: T;
  status: number;
  message: string;
}

// Auth user stored in context
export interface AuthUser {
  user_id: number;
  name: string;
  gender: string;
  role: UserRole;
  profile_image: string | null;
  email?: string;
}

// Auth state
export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

