/**
 * Footer Component - Modern site footer with links and info
 * FE1: Core Site & Discovery
 */

'use client';

import Link from 'next/link';
import { Logo } from './Logo';
import { Button } from '../common/Button';
import { useState } from 'react';

export const Footer = () => {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Handle newsletter subscription
    console.log('Newsletter signup:', email);
    setIsSubscribed(true);
    setTimeout(() => {
      setEmail('');
      setIsSubscribed(false);
    }, 3000);
  };

  return (
    <footer className="relative bg-gradient-to-br from-[#001a40] via-[#002855] to-[#003580] text-white overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 -left-20 w-60 h-60 bg-blue-400/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 right-1/4 w-72 h-72 bg-cyan-400/5 rounded-full blur-3xl"></div>
      </div>

      {/* Newsletter Section */}
      <div className="relative border-b border-white/10">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-sm rounded-3xl p-8 md:p-12 border border-white/10">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="text-center md:text-left">
                <h3 className="text-2xl md:text-3xl font-bold mb-2">
                  Nhận ưu đãi độc quyền ✨
                </h3>
                <p className="text-white/70">
                  Đăng ký để nhận thông tin khuyến mãi mới nhất
                </p>
              </div>
              <form onSubmit={handleNewsletterSubmit} className="flex w-full md:w-auto gap-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Nhập email của bạn"
                  className="flex-1 md:w-72 px-5 py-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:border-white/40 focus:bg-white/15 transition-all duration-300"
                  required
                />
                <button
                  type="submit"
                  className={`px-6 py-4 rounded-xl font-semibold transition-all duration-300 whitespace-nowrap ${
                    isSubscribed 
                      ? 'bg-green-500 text-white' 
                      : 'bg-white text-[#003580] hover:bg-gray-100 hover:shadow-lg'
                  }`}
                >
                  {isSubscribed ? '✓ Đã đăng ký!' : 'Đăng ký'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-16 relative">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-white/20 to-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <span className="text-2xl">🏨</span>
              </div>
              <div>
                <h3 className="text-2xl font-bold">VietStay</h3>
                <p className="text-white/60 text-sm">Nền tảng đặt phòng #1</p>
              </div>
            </div>
            <p className="text-white/70 leading-relaxed mb-6 max-w-sm">
              Nền tảng đặt phòng khách sạn trực tuyến hàng đầu Việt Nam. Hơn 10,000 khách sạn, resort và homestay đang chờ đón bạn.
            </p>
            
            {/* Social Links */}
            <div className="flex gap-3">
              {[
                { icon: '📘', label: 'Facebook', href: '#' },
                { icon: '📷', label: 'Instagram', href: '#' },
                { icon: '🐦', label: 'Twitter', href: '#' },
                { icon: '📺', label: 'Youtube', href: '#' },
              ].map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="w-11 h-11 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110 hover:-translate-y-1 group"
                  aria-label={social.label}
                >
                  <span className="text-lg group-hover:scale-110 transition-transform">{social.icon}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold text-lg mb-6 flex items-center gap-2">
              <span className="w-2 h-2 bg-[#febb02] rounded-full"></span>
              Khám phá
            </h4>
            <ul className="space-y-3">
              {[
                { label: 'Khách sạn', href: '/search' },
                { label: 'Điểm du lịch', href: '/tourism' },
                { label: 'Ưu đãi hôm nay', href: '/deals' },
                { label: 'Blog du lịch', href: '/blog' },
              ].map((link) => (
                <li key={link.label}>
                  <Link 
                    href={link.href} 
                    className="text-white/70 hover:text-white transition-all duration-300 flex items-center gap-2 group"
                  >
                    <span className="opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0 transition-all duration-300">→</span>
                    <span className="group-hover:translate-x-1 transition-transform duration-300">{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-white font-bold text-lg mb-6 flex items-center gap-2">
              <span className="w-2 h-2 bg-[#febb02] rounded-full"></span>
              Hỗ trợ
            </h4>
            <ul className="space-y-3">
              {[
                { label: 'Trung tâm trợ giúp', href: '/help' },
                { label: 'Liên hệ', href: '/contact' },
                { label: 'Câu hỏi thường gặp', href: '/faq' },
                { label: 'Hướng dẫn đặt phòng', href: '/guide' },
              ].map((link) => (
                <li key={link.label}>
                  <Link 
                    href={link.href} 
                    className="text-white/70 hover:text-white transition-all duration-300 flex items-center gap-2 group"
                  >
                    <span className="opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0 transition-all duration-300">→</span>
                    <span className="group-hover:translate-x-1 transition-transform duration-300">{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal & Contact */}
          <div>
            <h4 className="text-white font-bold text-lg mb-6 flex items-center gap-2">
              <span className="w-2 h-2 bg-[#febb02] rounded-full"></span>
              Thông tin
            </h4>
            <ul className="space-y-3">
              {[
                { label: 'Về chúng tôi', href: '/about' },
                { label: 'Điều khoản sử dụng', href: '/terms' },
                { label: 'Chính sách bảo mật', href: '/privacy' },
                { label: 'Đối tác khách sạn', href: '/partner' },
              ].map((link) => (
                <li key={link.label}>
                  <Link 
                    href={link.href} 
                    className="text-white/70 hover:text-white transition-all duration-300 flex items-center gap-2 group"
                  >
                    <span className="opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0 transition-all duration-300">→</span>
                    <span className="group-hover:translate-x-1 transition-transform duration-300">{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Contact Info Bar */}
        <div className="flex flex-wrap justify-center gap-6 py-8 border-t border-b border-white/10 mb-8">
          <div className="flex items-center gap-3 text-white/80">
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
              <span>📞</span>
            </div>
            <div>
              <p className="text-xs text-white/50">Hotline</p>
              <p className="font-semibold">1900 1234</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-white/80">
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
              <span>✉️</span>
            </div>
            <div>
              <p className="text-xs text-white/50">Email</p>
              <p className="font-semibold">support@vietstay.vn</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-white/80">
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
              <span>🕐</span>
            </div>
            <div>
              <p className="text-xs text-white/50">Hỗ trợ</p>
              <p className="font-semibold">24/7</p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-white/60">
            <p>© 2025 VietStay. Tất cả quyền được bảo lưu.</p>
          </div>
          <div className="flex flex-wrap items-center gap-6 text-sm text-white/60">
            <span className="flex items-center gap-2 hover:text-white transition-colors cursor-pointer">
              <span>🌍</span>
              Tiếng Việt
            </span>
            <span className="flex items-center gap-2 hover:text-white transition-colors cursor-pointer">
              <span>💱</span>
              VND
            </span>
            <span className="flex items-center gap-2">
              <span>🔒</span>
              SSL Secured
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
