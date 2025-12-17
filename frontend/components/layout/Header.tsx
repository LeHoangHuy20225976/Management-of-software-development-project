'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Logo } from './Logo';
import { useAuth } from '@/lib/context/AuthContext';

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const router = useRouter();
  const { user, isAuthenticated, logout, isLoading } = useAuth();

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (
        showUserMenu &&
        !(event.target as Element).closest('.user-menu-container')
      ) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showUserMenu]);

  const handleLogout = async () => {
    try {
      await logout();
      setShowUserMenu(false);
      setIsMenuOpen(false);
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
      // Still redirect even if logout API fails
      router.push('/');
    }
  };

  // Get display name (first character for avatar)
  const displayName = user?.name || '';
  const displayEmail = user?.email || '';
  const avatarChar = displayName.charAt(0).toUpperCase() || '?';

  // Get role-specific dashboard URL and label
  const getDashboardInfo = () => {
    switch (user?.role) {
      case 'hotel_manager':
        return {
          dashboardUrl: '/hotel-manager/dashboard',
          roleLabel: 'Quản lý khách sạn',
          roleColor: 'bg-purple-100 text-purple-700',
        };
      case 'admin':
        return {
          dashboardUrl: '/admin/dashboard',
          roleLabel: 'Quản trị viên',
          roleColor: 'bg-red-100 text-red-700',
        };
      case 'customer':
      default:
        return {
          dashboardUrl: '/user/dashboard',
          roleLabel: 'Khách hàng',
          roleColor: 'bg-blue-100 text-blue-700',
        };
    }
  };

  const { dashboardUrl, roleLabel, roleColor } = getDashboardInfo();

  // Render role-specific menu items
  const renderRoleMenuItems = () => {
    if (user?.role === 'hotel_manager') {
      return (
        <>
          <Link
            href="/hotel-manager/dashboard"
            className="flex items-center px-4 py-2 text-sm text-gray-900 hover:bg-gray-100 transition-colors"
            onClick={() => setShowUserMenu(false)}
          >
            <span className="mr-3">📊</span>
            Bảng điều khiển
          </Link>
          <Link
            href="/hotel-manager/bookings"
            className="flex items-center px-4 py-2 text-sm text-gray-900 hover:bg-gray-100 transition-colors"
            onClick={() => setShowUserMenu(false)}
          >
            <span className="mr-3">📋</span>
            Quản lý đặt phòng
          </Link>
          <Link
            href="/hotel-manager/rooms"
            className="flex items-center px-4 py-2 text-sm text-gray-900 hover:bg-gray-100 transition-colors"
            onClick={() => setShowUserMenu(false)}
          >
            <span className="mr-3">🛏️</span>
            Quản lý phòng
          </Link>
          <Link
            href="/hotel-manager/settings"
            className="flex items-center px-4 py-2 text-sm text-gray-900 hover:bg-gray-100 transition-colors"
            onClick={() => setShowUserMenu(false)}
          >
            <span className="mr-3">⚙️</span>
            Cài đặt khách sạn
          </Link>
        </>
      );
    }

    if (user?.role === 'admin') {
      return (
        <>
          <Link
            href="/admin/dashboard"
            className="flex items-center px-4 py-2 text-sm text-gray-900 hover:bg-gray-100 transition-colors"
            onClick={() => setShowUserMenu(false)}
          >
            <span className="mr-3">📊</span>
            Bảng điều khiển
          </Link>
          <Link
            href="/admin/users"
            className="flex items-center px-4 py-2 text-sm text-gray-900 hover:bg-gray-100 transition-colors"
            onClick={() => setShowUserMenu(false)}
          >
            <span className="mr-3">👥</span>
            Quản lý người dùng
          </Link>
          <Link
            href="/admin/hotels"
            className="flex items-center px-4 py-2 text-sm text-gray-900 hover:bg-gray-100 transition-colors"
            onClick={() => setShowUserMenu(false)}
          >
            <span className="mr-3">🏨</span>
            Quản lý khách sạn
          </Link>
          <Link
            href="/admin/settings"
            className="flex items-center px-4 py-2 text-sm text-gray-900 hover:bg-gray-100 transition-colors"
            onClick={() => setShowUserMenu(false)}
          >
            <span className="mr-3">⚙️</span>
            Cấu hình hệ thống
          </Link>
        </>
      );
    }

    // Default: customer menu
    return (
      <>
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
          href="/user/reviews"
          className="flex items-center px-4 py-2 text-sm text-gray-900 hover:bg-gray-100 transition-colors"
          onClick={() => setShowUserMenu(false)}
        >
          <span className="mr-3">⭐</span>
          Đánh giá của tôi
        </Link>
        <Link
          href="/user/my-vouchers"
          className="flex items-center px-4 py-2 text-sm text-gray-900 hover:bg-gray-100 transition-colors"
          onClick={() => setShowUserMenu(false)}
        >
          <span className="mr-3">🎟️</span>
          Mã giảm giá của tôi
        </Link>
        <Link
          href="/user/chat-history"
          className="flex items-center px-4 py-2 text-sm text-gray-900 hover:bg-gray-100 transition-colors"
          onClick={() => setShowUserMenu(false)}
        >
          <span className="mr-3">💬</span>
          Lịch sử chat
        </Link>
        <Link
          href="/user/dashboard/profile"
          className="flex items-center px-4 py-2 text-sm text-gray-900 hover:bg-gray-100 transition-colors"
          onClick={() => setShowUserMenu(false)}
        >
          <span className="mr-3">👤</span>
          Thông tin cá nhân
        </Link>
      </>
    );
  };

  // Render role-specific mobile menu items
  const renderMobileRoleMenuItems = () => {
    if (user?.role === 'hotel_manager') {
      return (
        <>
          <Link href="/hotel-manager/dashboard" onClick={() => setIsMenuOpen(false)}>
            <button className="w-full px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100 rounded transition-colors text-left">
              📊 Bảng điều khiển
            </button>
          </Link>
          <Link href="/hotel-manager/bookings" onClick={() => setIsMenuOpen(false)}>
            <button className="w-full px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100 rounded transition-colors text-left">
              📋 Quản lý đặt phòng
            </button>
          </Link>
          <Link href="/hotel-manager/rooms" onClick={() => setIsMenuOpen(false)}>
            <button className="w-full px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100 rounded transition-colors text-left">
              🛏️ Quản lý phòng
            </button>
          </Link>
          <Link href="/hotel-manager/settings" onClick={() => setIsMenuOpen(false)}>
            <button className="w-full px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100 rounded transition-colors text-left">
              ⚙️ Cài đặt khách sạn
            </button>
          </Link>
        </>
      );
    }

    if (user?.role === 'admin') {
      return (
        <>
          <Link href="/admin/dashboard" onClick={() => setIsMenuOpen(false)}>
            <button className="w-full px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100 rounded transition-colors text-left">
              📊 Bảng điều khiển
            </button>
          </Link>
          <Link href="/admin/users" onClick={() => setIsMenuOpen(false)}>
            <button className="w-full px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100 rounded transition-colors text-left">
              👥 Quản lý người dùng
            </button>
          </Link>
          <Link href="/admin/hotels" onClick={() => setIsMenuOpen(false)}>
            <button className="w-full px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100 rounded transition-colors text-left">
              🏨 Quản lý khách sạn
            </button>
          </Link>
          <Link href="/admin/settings" onClick={() => setIsMenuOpen(false)}>
            <button className="w-full px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100 rounded transition-colors text-left">
              ⚙️ Cấu hình hệ thống
            </button>
          </Link>
        </>
      );
    }

    // Default: customer menu
    return (
      <>
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
        <Link href="/user/reviews" onClick={() => setIsMenuOpen(false)}>
          <button className="w-full px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100 rounded transition-colors text-left">
            ⭐ Đánh giá của tôi
          </button>
        </Link>
        <Link href="/user/my-vouchers" onClick={() => setIsMenuOpen(false)}>
          <button className="w-full px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100 rounded transition-colors text-left">
            🎟️ Mã giảm giá của tôi
          </button>
        </Link>
        <Link href="/user/dashboard/profile" onClick={() => setIsMenuOpen(false)}>
          <button className="w-full px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100 rounded transition-colors text-left">
            👤 Thông tin cá nhân
          </button>
        </Link>
      </>
    );
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
              Home
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#0071c2] group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link
              href="/search"
              className="relative text-gray-700 hover:text-[#003580] font-medium transition-colors px-4 py-2 group"
            >
              Hotel
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#0071c2] group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link
              href="/tourism"
              className="relative text-gray-700 hover:text-[#003580] font-medium transition-colors px-4 py-2 group"
            >
              Tourism
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#0071c2] group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link
              href="/about"
              className="relative text-gray-700 hover:text-[#003580] font-medium transition-colors px-4 py-2 group"
            >
              About us
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#0071c2] group-hover:w-full transition-all duration-300"></span>
            </Link>
          </nav>

          {/* User Actions */}
          <div className="hidden md:flex items-center space-x-3">
            {/* Hotel Manager Link - only show if not logged in or is customer */}
            {(!isAuthenticated || user?.role === 'customer') && (
              <Link
                href="/hotel-manager/login"
                className="text-sm font-medium text-gray-700 hover:text-[#003580] transition-colors"
              >
                Dành cho khách sạn
              </Link>
            )}

            {/* Loading state */}
            {isLoading ? (
              <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse"></div>
            ) : isAuthenticated && user ? (
              /* User is logged in */
              <div className="relative user-menu-container">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  {user.profile_image ? (
                    <img
                      src={user.profile_image}
                      alt={displayName}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0071c2] to-[#005999] flex items-center justify-center text-white text-sm font-bold">
                      {avatarChar}
                    </div>
                  )}
                  <span className="text-sm font-medium text-gray-900">{displayName}</span>
                  <svg className={`w-4 h-4 text-gray-600 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">{displayName}</p>
                      <p className="text-xs text-gray-500">{displayEmail}</p>
                      <span className={`inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-full ${roleColor}`}>
                        {roleLabel}
                      </span>
                    </div>
                    {renderRoleMenuItems()}
                    <hr className="my-2 border-gray-200" />
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <span className="mr-3">🚪</span>
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* Auth Buttons - Not logged in */
              <>
                <Link href="/login">
                  <button className="px-4 py-2 text-sm font-medium text-[#003580] hover:bg-blue-50 rounded transition-colors">
                    Login
                  </button>
                </Link>
                <Link href="/register">
                  <button className="px-4 py-2 text-sm font-medium text-white bg-[#003580] hover:bg-[#00224f] rounded transition-colors">
                    Register
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
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
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
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                href="/search"
                className="text-gray-700 hover:bg-gray-100 font-medium px-4 py-3 rounded transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Hotels
              </Link>
              <Link
                href="/tourism"
                className="text-gray-700 hover:bg-gray-100 font-medium px-4 py-3 rounded transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Tourism
              </Link>
              <Link
                href="/about"
                className="text-gray-700 hover:bg-gray-100 font-medium px-4 py-3 rounded transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                About us
              </Link>
              <hr className="border-gray-200 my-2" />
              {(!isAuthenticated || user?.role === 'customer') && (
                <Link
                  href="/hotel-manager/login"
                  className="text-gray-600 hover:bg-gray-100 px-4 py-3 rounded transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dành cho khách sạn
                </Link>
              )}

              {isAuthenticated && user ? (
                /* Logged in - Mobile */
                <div className="pt-2 px-4 space-y-2">
                  <div className="flex items-center space-x-3 px-4 py-3 bg-gray-50 rounded-lg">
                    {user.profile_image ? (
                      <img
                        src={user.profile_image}
                        alt={displayName}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0071c2] to-[#005999] flex items-center justify-center text-white font-bold">
                        {avatarChar}
                      </div>
                    )}
                    <div>
                      <p className="font-bold text-gray-900">{displayName}</p>
                      <p className="text-xs text-gray-600">{displayEmail}</p>
                      <span className={`inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-full ${roleColor}`}>
                        {roleLabel}
                      </span>
                    </div>
                  </div>
                  {renderMobileRoleMenuItems()}
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded transition-colors text-left"
                  >
                    🚪 Log out
                  </button>
                </div>
              ) : (
                /* Not logged in - Mobile */
                <div className="flex flex-col space-y-2 pt-2 px-4">
                  <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                    <button className="w-full px-4 py-2 text-sm font-medium text-[#003580] hover:bg-blue-50 rounded transition-colors border border-[#003580]">
                      Login
                    </button>
                  </Link>
                  <Link href="/register" onClick={() => setIsMenuOpen(false)}>
                    <button className="w-full px-4 py-2 text-sm font-medium text-white bg-[#003580] hover:bg-[#00224f] rounded transition-colors">
                      Register
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
