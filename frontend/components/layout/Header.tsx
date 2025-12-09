/**
 * Header Component - Premium navigation header with logo
 * FE1: Core Site & Discovery
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '../common/Button';
import { Logo } from './Logo';

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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

            {/* Auth Buttons */}
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
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};
