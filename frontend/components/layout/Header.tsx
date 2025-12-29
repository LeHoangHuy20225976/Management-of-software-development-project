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

    // Default: customer menu
    return (
      <>
        {/* <Link
          href="/user/dashboard"
          className="flex items-center px-4 py-2 text-sm text-gray-900 hover:bg-gray-100 transition-colors"
          onClick={() => setShowUserMenu(false)}
        >
          <span className="mr-3">📊</span>
          Tổng quan
        </Link> */}
        <Link
          href="/user/dashboard/bookings"
          className="flex items-center px-4 py-2 text-sm text-gray-900 hover:bg-gray-100 transition-colors"
          onClick={() => setShowUserMenu(false)}
        >
          <span className="mr-3">📋</span>
          Đơn đặt phòng
        </Link>

        <Link
          href="/user/favorites"
          className="flex items-center px-4 py-2 text-sm text-gray-900 hover:bg-gray-100 transition-colors"
          onClick={() => setShowUserMenu(false)}
        >
          <span className="mr-3">❤️</span>
          Yêu thích
        </Link>
        {/* <Link
          href="/user/reviews"
          className="flex items-center px-4 py-2 text-sm text-gray-900 hover:bg-gray-100 transition-colors"
          onClick={() => setShowUserMenu(false)}
        >
          <span className="mr-3">⭐</span>
          Đánh giá của tôi
        </Link> */}
        {/* <Link
          href="/user/my-vouchers"
          className="flex items-center px-4 py-2 text-sm text-gray-900 hover:bg-gray-100 transition-colors"
          onClick={() => setShowUserMenu(false)}
        >
          <span className="mr-3">🎟️</span>
          Mã giảm giá của tôi
        </Link> */}
        {/* <Link
          href="/user/chat-history"
          className="flex items-center px-4 py-2 text-sm text-gray-900 hover:bg-gray-100 transition-colors"
          onClick={() => setShowUserMenu(false)}
        >
          <span className="mr-3">💬</span>
          Lịch sử chat
        </Link> */}
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

    // Default: customer menu
    return (
      <>
        {/* <Link href="/user/dashboard" onClick={() => setIsMenuOpen(false)}>
          <button className="w-full px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100 rounded transition-colors text-left">
            📊 Tổng quan
          </button>
        </Link> */}
        <Link href="/user/dashboard/bookings" onClick={() => setIsMenuOpen(false)}>
          <button className="w-full px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100 rounded transition-colors text-left">
            📋 Đơn đặt phòng
          </button>
        </Link>
        {/* <Link href="/user/reviews" onClick={() => setIsMenuOpen(false)}>
          <button className="w-full px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100 rounded transition-colors text-left">
            ⭐ Đánh giá của tôi
          </button>
        </Link>
        <Link href="/user/my-vouchers" onClick={() => setIsMenuOpen(false)}>
          <button className="w-full px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100 rounded transition-colors text-left">
            🎟️ Mã giảm giá của tôi
          </button>
        </Link> */}
        <Link href="/user/dashboard/profile" onClick={() => setIsMenuOpen(false)}>
          <button className="w-full px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100 rounded transition-colors text-left">
            👤 Thông tin cá nhân
          </button>
        </Link>
      </>
    );
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-18">
          {/* Premium Logo */}
          <Logo size="sm" showText={true} />

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-2">
            <Link
              href="/"
              className="relative text-gray-600 hover:text-[#0071c2] font-medium transition-all duration-300 px-4 py-2 rounded-lg hover:bg-blue-50/50 group"
            >
              <span className="relative z-10">Home</span>
              <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-[#0071c2] to-[#00a2ff] group-hover:w-3/4 transition-all duration-300 rounded-full"></span>
            </Link>
            <Link
              href="/search"
              className="relative text-gray-600 hover:text-[#0071c2] font-medium transition-all duration-300 px-4 py-2 rounded-lg hover:bg-blue-50/50 group"
            >
              <span className="relative z-10">Hotel</span>
              <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-[#0071c2] to-[#00a2ff] group-hover:w-3/4 transition-all duration-300 rounded-full"></span>
            </Link>
            <Link
              href="/tourism"
              className="relative text-gray-600 hover:text-[#0071c2] font-medium transition-all duration-300 px-4 py-2 rounded-lg hover:bg-blue-50/50 group"
            >
              <span className="relative z-10">Tourism</span>
              <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-[#0071c2] to-[#00a2ff] group-hover:w-3/4 transition-all duration-300 rounded-full"></span>
            </Link>
            <Link
              href="/about"
              className="relative text-gray-600 hover:text-[#0071c2] font-medium transition-all duration-300 px-4 py-2 rounded-lg hover:bg-blue-50/50 group"
            >
              <span className="relative z-10">About us</span>
              <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-[#0071c2] to-[#00a2ff] group-hover:w-3/4 transition-all duration-300 rounded-full"></span>
            </Link>
          </nav>

          {/* User Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Hotel Manager Link - only show if not logged in or is customer */}
            {(!isAuthenticated || user?.role === 'customer') && (
              <Link
                href="/hotel-manager/login"
                className="text-sm font-medium text-gray-500 hover:text-[#0071c2] transition-all duration-300 flex items-center gap-1.5"
              >
                <span className="text-base">🏨</span>
                <span>Dành cho khách sạn</span>
              </Link>
            )}

            {/* Loading state */}
            {isLoading ? (
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-gray-200 to-gray-100 animate-pulse"></div>
            ) : isAuthenticated && user ? (
              /* User is logged in */
              <div className="relative user-menu-container">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-3 px-4 py-2 hover:bg-gray-50 rounded-xl transition-all duration-300 border border-transparent hover:border-gray-200"
                >
                  {user.profile_image ? (
                    <img
                      src={user.profile_image}
                      alt={displayName}
                      className="w-9 h-9 rounded-full object-cover ring-2 ring-white shadow-md"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#0071c2] to-[#003580] flex items-center justify-center text-white text-sm font-bold shadow-md ring-2 ring-white">
                      {avatarChar}
                    </div>
                  )}
                  <span className="text-sm font-semibold text-gray-700">{displayName}</span>
                  <svg className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${showUserMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-fade-in-up" style={{animation: 'fadeInUp 0.2s ease-out'}}>
                    <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white rounded-t-2xl">
                      <p className="text-sm font-semibold text-gray-900">{displayName}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{displayEmail}</p>
                      <span className={`inline-block mt-2 px-2.5 py-1 text-xs font-semibold rounded-full ${roleColor}`}>
                        {roleLabel}
                      </span>
                    </div>
                    <div className="py-2">
                      {renderRoleMenuItems()}
                    </div>
                    <hr className="my-1 border-gray-100" />
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-all duration-200 group"
                    >
                      <span className="mr-3 group-hover:scale-110 transition-transform">🚪</span>
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* Auth Buttons - Not logged in */
              <div className="flex items-center space-x-3">
                <Link href="/login">
                  <button className="px-5 py-2.5 text-sm font-semibold text-[#0071c2] hover:bg-blue-50 rounded-xl transition-all duration-300 border-2 border-transparent hover:border-blue-100">
                    Login
                  </button>
                </Link>
                <Link href="/register">
                  <button className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-[#0071c2] to-[#005999] hover:from-[#005999] hover:to-[#003580] rounded-xl transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-0.5">
                    Register
                  </button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2.5 text-gray-600 hover:bg-gray-100 rounded-xl transition-all duration-300"
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
          <div className="md:hidden py-6 border-t border-gray-100 bg-white/95 backdrop-blur-md animate-fade-in">
            <nav className="flex flex-col space-y-1">
              <Link
                href="/"
                className="text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-transparent font-medium px-4 py-3.5 rounded-xl transition-all duration-300 flex items-center gap-3"
                onClick={() => setIsMenuOpen(false)}
              >
                <span className="text-lg">🏠</span>
                Home
              </Link>
              <Link
                href="/search"
                className="text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-transparent font-medium px-4 py-3.5 rounded-xl transition-all duration-300 flex items-center gap-3"
                onClick={() => setIsMenuOpen(false)}
              >
                <span className="text-lg">🏨</span>
                Hotels
              </Link>
              <Link
                href="/tourism"
                className="text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-transparent font-medium px-4 py-3.5 rounded-xl transition-all duration-300 flex items-center gap-3"
                onClick={() => setIsMenuOpen(false)}
              >
                <span className="text-lg">✈️</span>
                Tourism
              </Link>
              <Link
                href="/about"
                className="text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-transparent font-medium px-4 py-3.5 rounded-xl transition-all duration-300 flex items-center gap-3"
                onClick={() => setIsMenuOpen(false)}
              >
                <span className="text-lg">ℹ️</span>
                About us
              </Link>
              <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent my-3" />
              {(!isAuthenticated || user?.role === 'customer') && (
                <Link
                  href="/hotel-manager/login"
                  className="text-gray-500 hover:bg-gradient-to-r hover:from-blue-50 hover:to-transparent px-4 py-3.5 rounded-xl transition-all duration-300 flex items-center gap-3"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span className="text-lg">🔑</span>
                  Dành cho khách sạn
                </Link>
              )}

              {isAuthenticated && user ? (
                /* Logged in - Mobile */
                <div className="pt-3 px-2 space-y-3">
                  <div className="flex items-center space-x-4 px-4 py-4 bg-gradient-to-r from-gray-50 to-white rounded-2xl border border-gray-100">
                    {user.profile_image ? (
                      <img
                        src={user.profile_image}
                        alt={displayName}
                        className="w-12 h-12 rounded-full object-cover ring-2 ring-white shadow-lg"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#0071c2] to-[#003580] flex items-center justify-center text-white font-bold text-lg shadow-lg ring-2 ring-white">
                        {avatarChar}
                      </div>
                    )}
                    <div>
                      <p className="font-bold text-gray-900">{displayName}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{displayEmail}</p>
                      <span className={`inline-block mt-2 px-2.5 py-1 text-xs font-semibold rounded-full ${roleColor}`}>
                        {roleLabel}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    {renderMobileRoleMenuItems()}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-xl transition-all duration-300 text-left flex items-center gap-3 mt-2"
                  >
                    <span className="text-lg">🚪</span>
                    Log out
                  </button>
                </div>
              ) : (
                /* Not logged in - Mobile */
                <div className="flex flex-col space-y-3 pt-3 px-4">
                  <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                    <button className="w-full px-5 py-3 text-sm font-semibold text-[#0071c2] hover:bg-blue-50 rounded-xl transition-all duration-300 border-2 border-[#0071c2]">
                      Login
                    </button>
                  </Link>
                  <Link href="/register" onClick={() => setIsMenuOpen(false)}>
                    <button className="w-full px-5 py-3 text-sm font-semibold text-white bg-gradient-to-r from-[#0071c2] to-[#003580] hover:from-[#005999] hover:to-[#002855] rounded-xl transition-all duration-300 shadow-lg">
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
