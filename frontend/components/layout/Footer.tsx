/**
 * Footer Component - Site footer with links and info
 * FE1: Core Site & Discovery
 */

'use client';

import Link from 'next/link';
import { Logo } from './Logo';
import { Button } from '../common/Button';
import { useState } from 'react';

export const Footer = () => {
  const [email, setEmail] = useState('');

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Handle newsletter subscription
    console.log('Newsletter signup:', email);
    setEmail('');
  };

  return (
    <footer className="bg-gradient-to-br from-[#003580] to-[#00224f] text-white">
      <div className="container mx-auto px-4 py-12">

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Company Info */}
          <div>
            <h3 className="text-xl font-bold mb-4 flex items-center">
              <span className="text-2xl mr-2">🏨</span>
              VietStay
            </h3>
            <p className="text-sm text-white/90 mb-4 leading-relaxed">
              Nền tảng đặt phòng khách sạn trực tuyến hàng đầu Việt Nam
            </p>
            <div className="flex space-x-3 mt-4">
              <a href="#" className="w-9 h-9 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110">
                <span>📘</span>
              </a>
              <a href="#" className="w-9 h-9 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110">
                <span>📷</span>
              </a>
              <a href="#" className="w-9 h-9 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110">
                <span>🐦</span>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold mb-4">Liên kết</h4>
            <ul className="space-y-2">
              <li><Link href="/search" className="text-sm text-white/80 hover:text-white hover:translate-x-1 transition-all inline-block">→ Khách sạn</Link></li>
              <li><Link href="/tourism" className="text-sm text-white/80 hover:text-white hover:translate-x-1 transition-all inline-block">→ Du lịch</Link></li>
              <li><Link href="/about" className="text-sm text-white/80 hover:text-white hover:translate-x-1 transition-all inline-block">→ Về chúng tôi</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-white font-bold mb-4">Hỗ trợ</h4>
            <ul className="space-y-2">
              <li><Link href="/help" className="text-sm text-white/80 hover:text-white hover:translate-x-1 transition-all inline-block">→ Trợ giúp</Link></li>
              <li><Link href="/contact" className="text-sm text-white/80 hover:text-white hover:translate-x-1 transition-all inline-block">→ Liên hệ</Link></li>
              <li><Link href="/faq" className="text-sm text-white/80 hover:text-white hover:translate-x-1 transition-all inline-block">→ FAQ</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-white font-bold mb-4">Điều khoản</h4>
            <ul className="space-y-2">
              <li><Link href="/terms" className="text-sm text-white/80 hover:text-white hover:translate-x-1 transition-all inline-block">→ Điều khoản</Link></li>
              <li><Link href="/privacy" className="text-sm text-white/80 hover:text-white hover:translate-x-1 transition-all inline-block">→ Bảo mật</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t border-white/20">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm text-white/80">
              <p>© 2025 VietStay. Tất cả quyền được bảo lưu.</p>
            </div>
            <div className="flex items-center space-x-4 text-sm text-white/80">
              <span className="flex items-center">
                <span className="mr-1">🌍</span>
                Tiếng Việt
              </span>
              <span className="flex items-center">
                <span className="mr-1">💱</span>
                VND
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
