/**
 * Header Component - Premium navigation header with logo
 * FE1: Core Site & Discovery
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '../common/Button';
import { Logo } from './Logo';
import { getMockUser } from '@/lib/utils/mockData';
import type { User } from '@/types';

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    const currentUser = getMockUser();
    setUser(currentUser);

    // Close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (showUserMenu && !(event.target as Element).closest('.user-menu-container')) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showUserMenu]);

  const handleLogout = () => {
    // Clear user data
    localStorage.removeItem('currentUser');
    localStorage.removeItem('auth_token');
    setUser(null);
    setShowUserMenu(false);
    router.push('/');
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Premium Logo */}
          <Logo size="sm" showText={true} />

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            <Link
              href="/"
              className="relative text-gray-700 hover:text-[#003580] font-medium transition-colors px-4 py-2 group"
            >
              Trang chủ
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#0071c2] group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link
              href="/search"
              className="relative text-gray-700 hover:text-[#003580] font-medium transition-colors px-4 py-2 group"
            >
              Khách sạn
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#0071c2] group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link
              href="/tourism"
              className="relative text-gray-700 hover:text-[#003580] font-medium transition-colors px-4 py-2 group"
            >
              Du lịch
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#0071c2] group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link
              href="/about"
              className="relative text-gray-700 hover:text-[#003580] font-medium transition-colors px-4 py-2 group"
            >
              Về chúng tôi
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#0071c2] group-hover:w-full transition-all duration-300"></span>
            </Link>
          </nav>

          {/* User Actions */}
          <div className="hidden md:flex items-center space-x-3">
            {/* Hotel Manager Link */}
            <Link
              href="/hotel-manager/login"
              className="text-sm font-medium text-gray-700 hover:text-[#003580] transition-colors"
            >
              Dành cho khách sạn
            </Link>

            {/* User is logged in */}
            {user ? (
              <div className="relative user-menu-container">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0071c2] to-[#005999] flex items-center justify-center text-white text-sm font-bold">
                    {user.name.charAt(0)}
                  </div>
                  <span className="text-sm font-medium text-gray-900">{user.name}</span>
                  <svg className={`w-4 h-4 text-gray-600 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                    <Link
                      href="/user/dashboard"
                      className="flex items-center px-4 py-2 text-sm text-gray-900 hover:bg-gray-100 transition-colors"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <span className="mr-3">📊</span>
                      Tổng quan
                    </Link>
                    <Link
                      href="/user/dashboard/bookings"
                      className="flex items-center px-4 py-2 text-sm text-gray-900 hover:bg-gray-100 transition-colors"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <span className="mr-3">📋</span>
                      Đơn đặt phòng
                    </Link>
                    <Link
                      href="/user/dashboard/reviews"
                      className="flex items-center px-4 py-2 text-sm text-gray-900 hover:bg-gray-100 transition-colors"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <span className="mr-3">⭐</span>
                      Đánh giá của tôi
                    </Link>
                    <Link
                      href="/user/dashboard/profile"
                      className="flex items-center px-4 py-2 text-sm text-gray-900 hover:bg-gray-100 transition-colors"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <span className="mr-3">👤</span>
                      Thông tin cá nhân
                    </Link>
                    <hr className="my-2 border-gray-200" />
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <span className="mr-3">🚪</span>
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* Auth Buttons - Not logged in */
              <>
                <Link href="/login">
                  <button className="px-4 py-2 text-sm font-medium text-[#003580] hover:bg-blue-50 rounded transition-colors">
                    Đăng nhập
                  </button>
                </Link>
                <Link href="/register">
                  <button className="px-4 py-2 text-sm font-medium text-white bg-[#003580] hover:bg-[#00224f] rounded transition-colors">
                    Đăng ký
                  </button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-gray-700 hover:bg-gray-100 rounded transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 bg-white">
            <nav className="flex flex-col space-y-1">
              <Link
                href="/"
                className="text-gray-700 hover:bg-gray-100 font-medium px-4 py-3 rounded transition-colors"
              >
                Trang chủ
              </Link>
              <Link
                href="/search"
                className="text-gray-700 hover:bg-gray-100 font-medium px-4 py-3 rounded transition-colors"
              >
                Khách sạn
              </Link>
              <Link
                href="/tourism"
                className="text-gray-700 hover:bg-gray-100 font-medium px-4 py-3 rounded transition-colors"
              >
                Du lịch
              </Link>
              <Link
                href="/about"
                className="text-gray-700 hover:bg-gray-100 font-medium px-4 py-3 rounded transition-colors"
              >
                Về chúng tôi
              </Link>
              <hr className="border-gray-200 my-2" />
              <Link
                href="/hotel-manager/login"
                className="text-gray-600 hover:bg-gray-100 px-4 py-3 rounded transition-colors"
              >
                Dành cho khách sạn
              </Link>

              {user ? (
                /* Logged in - Mobile */
                <div className="pt-2 px-4 space-y-2">
                  <div className="flex items-center space-x-3 px-4 py-3 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0071c2] to-[#005999] flex items-center justify-center text-white font-bold">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-600">{user.email}</p>
                    </div>
                  </div>
                  <Link href="/user/dashboard" onClick={() => setIsMenuOpen(false)}>
                    <button className="w-full px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100 rounded transition-colors text-left">
                      📊 Tổng quan
                    </button>
                  </Link>
                  <Link href="/user/dashboard/bookings" onClick={() => setIsMenuOpen(false)}>
                    <button className="w-full px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100 rounded transition-colors text-left">
                      📋 Đơn đặt phòng
                    </button>
                  </Link>
                  <Link href="/user/dashboard/profile" onClick={() => setIsMenuOpen(false)}>
                    <button className="w-full px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100 rounded transition-colors text-left">
                      👤 Thông tin cá nhân
                    </button>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded transition-colors text-left"
                  >
                    🚪 Đăng xuất
                  </button>
                </div>
              ) : (
                /* Not logged in - Mobile */
                <div className="flex flex-col space-y-2 pt-2 px-4">
                  <Link href="/login">
                    <button className="w-full px-4 py-2 text-sm font-medium text-[#003580] hover:bg-blue-50 rounded transition-colors border border-[#003580]">
                      Đăng nhập
                    </button>
                  </Link>
                  <Link href="/register">
                    <button className="w-full px-4 py-2 text-sm font-medium text-white bg-[#003580] hover:bg-[#00224f] rounded transition-colors">
                      Đăng ký
                    </button>
                  </Link>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};
