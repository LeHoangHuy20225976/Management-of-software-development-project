/**
 * Hotel Manager Login Page
 * FE4: Hotel Manager Portal
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Card } from '@/components/common/Card';
import { ROUTES } from '@/lib/routes';

export default function HotelLoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // TODO: Call API to authenticate hotel manager
    setTimeout(() => {
      setIsLoading(false);
      router.push(ROUTES.HOTEL.DASHBOARD);
    }, 1000);
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto">
            <div className="text-center mb-8">
              <div className="inline-block p-4 bg-[#0071c2] rounded-full mb-4">
                <span className="text-4xl">🏨</span>
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-3">
                Hotel Manager Portal
              </h1>
              <p className="text-gray-600">Đăng nhập để quản lý khách sạn của bạn</p>
            </div>

            <Card className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Email khách sạn
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="hotel@example.com"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0071c2] focus:border-[#0071c2] transition-all text-gray-900 placeholder:text-gray-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Mật khẩu
                  </label>
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0071c2] focus:border-[#0071c2] transition-all text-gray-900 placeholder:text-gray-400"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-[#0071c2] rounded focus:ring-2 focus:ring-[#0071c2]"
                    />
                    <span className="ml-2 text-sm text-gray-700">Ghi nhớ đăng nhập</span>
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-sm font-medium text-[#0071c2] hover:text-[#005999] transition-colors"
                  >
                    Quên mật khẩu?
                  </Link>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full px-6 py-3 bg-[#0071c2] hover:bg-[#005999] text-white font-semibold rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                </button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-gray-600">
                  Chưa đăng ký khách sạn?{' '}
                  <Link
                    href={ROUTES.HOTEL.REGISTER}
                    className="font-semibold text-[#0071c2] hover:text-[#005999] transition-colors"
                  >
                    Đăng ký ngay
                  </Link>
                </p>
              </div>
            </Card>

            <div className="mt-6 p-4 bg-white rounded-lg shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-2">🎯 Lợi ích khi trở thành đối tác</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Tiếp cận hàng triệu khách hàng tiềm năng</li>
                <li>• Hệ thống quản lý đặt phòng dễ dàng</li>
                <li>• Báo cáo và thống kê chi tiết</li>
                <li>• Hỗ trợ 24/7 từ đội ngũ VietStay</li>
              </ul>
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Bạn là khách hàng?{' '}
                <Link
                  href="/login"
                  className="font-semibold text-[#0071c2] hover:text-[#005999] transition-colors"
                >
                  Đăng nhập tại đây
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
