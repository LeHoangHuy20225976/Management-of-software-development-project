/**
 * API Client
 * Handles all API requests with httpOnly cookie-based authentication
 * Supports automatic token refresh on 401 errors
 * 
 * Flow:
 * 1. Request fails with 401 (access token expired)
 * 2. Try to refresh using refresh token
 * 3. If refresh succeeds → retry original request
 * 4. If refresh fails → force logout and redirect to login
 */

import { API_CONFIG, getApiUrl } from './config';

// Track if we're currently refreshing tokens to prevent multiple refresh calls
let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

// Queue of requests waiting for token refresh
let failedRequestsQueue: Array<{
  resolve: (value: boolean) => void;
  reject: (error: Error) => void;
}> = [];

const processQueue = (success: boolean) => {
  failedRequestsQueue.forEach((prom) => {
    if (success) {
      prom.resolve(true);
    } else {
      prom.reject(new Error('Token refresh failed'));
    }
  });
  failedRequestsQueue = [];
};

class ApiClient {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    params?: Record<string, string>,
    isRetry: boolean = false
  ): Promise<T> {
    const url = getApiUrl(endpoint, params);

    // Debug log
    console.log('🌐 API Request:', { endpoint, url, method: options.method || 'GET' });

    // Don't set Content-Type for FormData (browser will auto-set with boundary)
    const isFormData = options.body instanceof FormData;
    const defaultHeaders: Record<string, string> = isFormData 
      ? { ...options.headers as Record<string, string> }
      : {
          'Content-Type': 'application/json',
          ...options.headers as Record<string, string>,
        };

    try {
      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

      const response = await fetch(url, {
        ...options,
        headers: defaultHeaders,
        credentials: 'include', // Include httpOnly cookies
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Handle 401 Unauthorized - try to refresh token
      if (response.status === 401) {
        // Don't try to refresh for login/register/refresh endpoints
        const isAuthEndpoint = 
          endpoint === API_CONFIG.ENDPOINTS.LOGIN || 
          endpoint === API_CONFIG.ENDPOINTS.REGISTER ||
          endpoint === API_CONFIG.ENDPOINTS.REFRESH_TOKEN;

        if (isAuthEndpoint || isRetry) {
          // If this is already a retry or an auth endpoint, don't try again
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || 'Authentication failed');
        }

        // Try to refresh the token
        const refreshed = await this.handleTokenRefresh();
        
        if (refreshed) {
          // Retry the original request (mark as retry to prevent infinite loop)
          return this.request<T>(endpoint, options, params, true);
        } else {
          // Refresh failed - session expired, force logout
          this.forceLogout();
          throw new Error('Session expired. Please login again.');
        }
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ API Error:', { url, status: response.status, statusText: response.statusText, errorData });
        throw new Error(errorData.message || `API Error: ${response.status} ${response.statusText}`);
      }

      const responseData = await response.json();
      
      // Backend returns { success, data, status, message }
      // Unwrap the 'data' field if it exists
      if (responseData && typeof responseData === 'object' && 'data' in responseData) {
        console.log('✅ API Response (unwrapped):', { endpoint, data: responseData.data });
        return responseData.data as T;
      }
      
      // If response is already in the expected format, return as-is
      console.log('✅ API Response (direct):', { endpoint, data: responseData });
      return responseData as T;
    } catch (error) {
      console.error('API Request Error:', error);
      throw error;
    }
  }

  private async handleTokenRefresh(): Promise<boolean> {
    // If already refreshing, wait for the existing refresh to complete
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedRequestsQueue.push({ resolve, reject });
      }).then(() => true).catch(() => false);
    }

    isRefreshing = true;

    try {
      const success = await this.refreshTokens();
      processQueue(success);
      return success;
    } catch (error) {
      processQueue(false);
      return false;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  }

  private async refreshTokens(): Promise<boolean> {
    try {
      console.log('Attempting to refresh tokens...');
      
      const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.REFRESH_TOKEN), {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        console.log('Token refresh successful');
        return true;
      }
      
      console.log('Token refresh failed with status:', response.status);
      return false;
    } catch (error) {
      console.error('Token refresh error:', error);
      return false;
    }
  }

  private forceLogout(): void {
    // Clear any local auth state
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authUser');
      
      // Dispatch event for auth context to update and redirect
      window.dispatchEvent(new CustomEvent('auth:session-expired', {
        detail: { message: 'Session expired. Please login again.' }
      }));
    }
  }

  async get<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' }, params);
  }

  async post<T>(endpoint: string, body: unknown, params?: Record<string, string>): Promise<T> {
    const isFormData = body instanceof FormData;
    return this.request<T>(
      endpoint,
      {
        method: 'POST',
        body: isFormData ? body : JSON.stringify(body),
      },
      params
    );
  }

  async put<T>(endpoint: string, body: unknown, params?: Record<string, string>): Promise<T> {
    const isFormData = body instanceof FormData;
    return this.request<T>(
      endpoint,
      {
        method: 'PUT',
        body: isFormData ? body : JSON.stringify(body),
      },
      params
    );
  }

  async patch<T>(endpoint: string, body: unknown, params?: Record<string, string>): Promise<T> {
    const isFormData = body instanceof FormData;
    return this.request<T>(
      endpoint,
      {
        method: 'PATCH',
        body: isFormData ? body : JSON.stringify(body),
      },
      params
    );
  }

  async delete<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' }, params);
  }

  async postFormData<T>(endpoint: string, params: Record<string, string>, formData: FormData): Promise<T> {
    const url = getApiUrl(endpoint, params);

    console.log('🌐 API FormData Request:', { endpoint, url });

    try {
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
        credentials: 'include',
        signal: AbortSignal.timeout(API_CONFIG.TIMEOUT),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `API Error: ${response.status} ${response.statusText}`);
      }

      const responseData = await response.json();
      
      if (responseData && typeof responseData === 'object' && 'data' in responseData) {
        return responseData.data as T;
      }
      
      return responseData as T;
    } catch (error) {
      console.error('API FormData Request Error:', error);
      throw error;
    }
  }
}

export const apiClient = new ApiClient();
