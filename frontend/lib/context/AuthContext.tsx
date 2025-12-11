'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api/auth';
import type { AuthUser, UserRole } from '@/types/auth';

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, role?: UserRole) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<boolean>;
}

interface RegisterData {
  name: string;
  email: string;
  phone_number: string;
  gender: string;
  date_of_birth: string;
  password: string;
  role?: UserRole;
  profile_image?: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    const storedUser = authApi.getStoredUser();
    if (storedUser) {
      setUser(storedUser);
    }
    setIsLoading(false);
  }, []);

  // Listen for session expired events from API client
  // This handles the case when refresh token also fails
  useEffect(() => {
    const handleSessionExpired = (event: CustomEvent) => {
      console.log('Session expired:', event.detail?.message);
      
      // Clear user state
      setUser(null);
      authApi.clearAuthState();
      
      // Redirect to login page
      router.push('/login?expired=true');
    };

    window.addEventListener('auth:session-expired', handleSessionExpired as EventListener);
    
    return () => {
      window.removeEventListener('auth:session-expired', handleSessionExpired as EventListener);
    };
  }, [router]);

  const login = useCallback(async (email: string, password: string, role: UserRole = 'customer') => {
    setIsLoading(true);
    try {
      const response = await authApi.login(email, password, role);
      if (response.success && response.data) {
        const authUser: AuthUser = {
          ...response.data,
          email,
        };
        setUser(authUser);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (userData: RegisterData) => {
    setIsLoading(true);
    try {
      const response = await authApi.register(userData);
      if (!response.success) {
        throw new Error(response.message || 'Registration failed');
      }
      // Registration successful, user needs to login
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await authApi.logout();
      setUser(null);
      router.push('/');
    } catch (error) {
      // Clear local state even if API fails
      authApi.clearAuthState();
      setUser(null);
      router.push('/');
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const refreshAuth = useCallback(async (): Promise<boolean> => {
    try {
      await authApi.refreshTokens();
      return true;
    } catch {
      setUser(null);
      return false;
    }
  }, []);

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    refreshAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
