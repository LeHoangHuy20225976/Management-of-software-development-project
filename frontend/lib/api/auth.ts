/**
 * Auth API Service
 * Handles authentication operations with the backend
 * Uses httpOnly cookies for JWT access/refresh tokens
 */

import { API_CONFIG, getApiUrl } from './config';
import type {
  LoginRequest,
  LoginResponseData,
  RegisterRequest,
  RegisterResponseData,
  LogoutResponseData,
  RefreshTokenResponseData,
  BackendApiResponse,
  AuthUser,
  UserRole,
} from '@/types/auth';

class AuthApi {
  /**
   * Login user
   * Sets httpOnly cookies for accessToken and refreshToken
   */
  async login(
    email: string,
    password: string,
    role: UserRole = 'customer'
  ): Promise<BackendApiResponse<LoginResponseData>> {
    const payload: LoginRequest = {
      userData: {
        email,
        password,
        role,
      },
    };

    const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.LOGIN), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Receive and store httpOnly cookies
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }

    // Store user info in localStorage (non-sensitive data only)
    if (data.success && data.data) {
      const authUser: AuthUser = {
        ...data.data,
        email, // Include email for reference
      };
      localStorage.setItem('authUser', JSON.stringify(authUser));
    }

    return data;
  }

  /**
   * Register new user
   */
  async register(userData: {
    name: string;
    email: string;
    phone_number: string;
    gender: string;
    date_of_birth: string;
    password: string;
    role?: UserRole;
    profile_image?: string | null;
  }): Promise<BackendApiResponse<RegisterResponseData>> {
    const payload: RegisterRequest = {
      userData: {
        name: userData.name,
        email: userData.email,
        phone_number: userData.phone_number,
        gender: userData.gender,
        date_of_birth: userData.date_of_birth,
        role: userData.role || 'customer',
        password: userData.password,
        profile_image: userData.profile_image || null,
      },
    };

    const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.REGISTER), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Registration failed');
    }

    return data;
  }

  /**
   * Logout user
   * Clears httpOnly cookies on the server
   */
  async logout(): Promise<BackendApiResponse<LogoutResponseData>> {
    const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.LOGOUT), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    // Clear local storage regardless of response
    localStorage.removeItem('authUser');

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Logout failed');
    }

    return data;
  }

  /**
   * Refresh access token using refresh token cookie
   */
  async refreshTokens(): Promise<BackendApiResponse<RefreshTokenResponseData>> {
    const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.REFRESH_TOKEN), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok) {
      // Clear auth state on refresh failure
      localStorage.removeItem('authUser');
      throw new Error(data.message || 'Token refresh failed');
    }

    return data;
  }

  /**
   * Change password for authenticated user
   * Requires valid access token (httpOnly cookie)
   */
  async changePassword(
    currentPassword: string,
    newPassword: string,
    confirmNewPassword: string
  ): Promise<BackendApiResponse<{ message: string }>> {
    const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.CHANGE_PASSWORD), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Send httpOnly cookies for auth
      body: JSON.stringify({
        currentPassword,
        newPassword,
        confirmNewPassword,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Đổi mật khẩu thất bại');
    }

    return data;
  }

  /**
   * Request password reset link
   * Sends email with reset link to user
   */
  async forgotPassword(email: string): Promise<BackendApiResponse<{ message: string }>> {
    const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.FORGOT_PASSWORD), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Gửi email thất bại');
    }

    return data;
  }

  /**
   * Reset password using token from email
   * Called from the reset password page with token from URL
   */
  async resetForgotPassword(
    email: string,
    newPassword: string,
    newPasswordConfirm: string,
    token: string
  ): Promise<BackendApiResponse<{ message: string }>> {
    const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.RESET_FORGOT_PASSWORD), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        newPassword,
        newPasswordConfirm,
        token,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Đặt lại mật khẩu thất bại');
    }

    return data;
  }

  /**
   * Get current auth user from localStorage
   * Note: This is non-sensitive data only
   */
  getStoredUser(): AuthUser | null {
    if (typeof window === 'undefined') return null;

    const stored = localStorage.getItem('authUser');
    if (!stored) return null;

    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  }

  /**
   * Check if user is authenticated by checking stored user
   * Note: Actual auth is verified by the backend via httpOnly cookies
   */
  isAuthenticated(): boolean {
    return this.getStoredUser() !== null;
  }

  /**
   * Clear local auth state
   */
  clearAuthState(): void {
    localStorage.removeItem('authUser');
  }
}

export const authApi = new AuthApi();

