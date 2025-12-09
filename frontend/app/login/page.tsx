'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Card } from '@/components/common/Card';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      router.push('/user/dashboard');
    }, 1000);
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-3">Đăng nhập</h1>
              <p className="text-gray-600">Chào mừng bạn quay trở lại VietStay</p>
            </div>

            <Card className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="example@email.com"
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
                  <Link href="/forgot-password" className="text-sm font-medium text-[#0071c2] hover:text-[#005999] transition-colors">
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
                  <span className="px-4 bg-white text-gray-500">Hoặc đăng nhập với</span>
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
                  Chưa có tài khoản?{' '}
                  <Link href="/register" className="font-semibold text-[#0071c2] hover:text-[#005999] transition-colors">
                    Đăng ký ngay
                  </Link>
                </p>
              </div>
            </Card>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Bạn là chủ khách sạn?{' '}
                <Link href="/hotel-manager/login" className="font-semibold text-[#0071c2] hover:text-[#005999] transition-colors">
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
