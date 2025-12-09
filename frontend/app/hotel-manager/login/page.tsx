'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Card } from '@/components/common/Card';
import { HotelLogo } from '@/components/hotel/HotelLogo';
import { ROUTES } from '@/lib/routes';

export default function HotelLoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Check if already logged in as hotel manager
  useEffect(() => {
    const hotelAuthToken = localStorage.getItem('hotel_auth_token');
    if (hotelAuthToken) {
      router.push('/hotel-manager/dashboard');
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Demo validation for hotel manager
      if (
        (formData.email === 'hotel@vietstay.com' &&
          formData.password === 'hotel123') ||
        (formData.email && formData.password.length >= 6)
      ) {
        // Generate auth token
        const token = `hotel_token_${Date.now()}`;
        localStorage.setItem('hotel_auth_token', token);

        // Store demo hotel manager info
        const hotelManager = {
          id: 'hotel-001',
          email: formData.email,
          name: 'Grand Hotel Saigon',
          managerName: 'Nguyễn Văn Manager',
          phone: '028 3823 5678',
        };
        localStorage.setItem('hotelManager', JSON.stringify(hotelManager));

        setTimeout(() => {
          router.push('/hotel-manager/dashboard');
          window.location.reload();
        }, 500);
      } else {
        setError('Email hoặc mật khẩu không đúng!');
        setIsLoading(false);
      }
    } catch (err) {
      setError('Có lỗi xảy ra. Vui lòng thử lại!');
      setIsLoading(false);
    }
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto">
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <HotelLogo size="lg" />
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-3">
                Đăng nhập
              </h1>
              <p className="text-gray-600">
                Quản lý khách sạn của bạn với VietStay
              </p>
            </div>

            <Card className="p-8">
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-sm font-medium">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
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
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
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
                    <span className="ml-2 text-sm text-gray-700">
                      Ghi nhớ đăng nhập
                    </span>
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

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">
                    Hoặc đăng nhập với
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <span className="text-xl">📘</span>
                  <span className="font-medium text-gray-700">Facebook</span>
                </button>
                <button className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <span className="text-xl">🔍</span>
                  <span className="font-medium text-gray-700">Google</span>
                </button>
              </div>

              <div className="mt-6 text-center">
                <p className="text-gray-600">
                  Chưa đăng ký khách sạn?{' '}
                  <Link
                    href="/hotel-manager/register"
                    className="font-semibold text-[#0071c2] hover:text-[#005999] transition-colors"
                  >
                    Đăng ký ngay
                  </Link>
                </p>
              </div>

              {/* Demo Info */}
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm font-semibold text-gray-900 mb-2">
                  🔐 Demo Login cho Khách sạn:
                </p>
                <p className="text-sm text-gray-700">
                  Email: <strong>hotel@vietstay.com</strong>
                </p>
                <p className="text-sm text-gray-700">
                  Password: <strong>hotel123</strong>
                </p>
                <p className="text-xs text-gray-600 mt-2">
                  Hoặc nhập bất kỳ email + password (tối thiểu 6 ký tự)
                </p>
              </div>
            </Card>

            {/* Benefits */}
            <Card className="mt-6">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <span className="text-xl">🎯</span>
                Lợi ích khi trở thành đối tác
              </h3>
              <ul className="text-sm text-gray-600 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span>Tiếp cận hàng triệu khách hàng tiềm năng</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span>Hệ thống quản lý đặt phòng dễ dàng</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span>Báo cáo và thống kê chi tiết theo thời gian thực</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span>Hỗ trợ 24/7 từ đội ngũ VietStay</span>
                </li>
              </ul>
            </Card>

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
