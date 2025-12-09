/**
 * Hotel Manager Login Page
 * FE4: Hotel Auth
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { ROUTES } from '@/lib/routes';

export default function HotelLoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Handle login
    alert('Đăng nhập thành công!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-block w-20 h-20 bg-white rounded-2xl flex items-center justify-center shadow-xl mb-4">
            <span className="text-5xl">🏨</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Hotel Manager Portal</h1>
          <p className="text-blue-100">Đăng nhập để quản lý khách sạn của bạn</p>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="hotel@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mật khẩu
              </label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="••••••••"
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" />
                <span className="text-gray-600">Ghi nhớ đăng nhập</span>
              </label>
              <Link href="/hotel/forgot-password" className="text-blue-600 hover:text-blue-700">
                Quên mật khẩu?
              </Link>
            </div>

            <Button type="submit" size="lg" className="w-full">
              Đăng nhập
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Chưa có tài khoản?{' '}
              <Link href={ROUTES.HOTEL.REGISTER} className="text-blue-600 hover:text-blue-700 font-semibold">
                Đăng ký ngay
              </Link>
            </p>
          </div>
        </Card>

        <div className="text-center mt-6">
          <Link href={ROUTES.HOME} className="text-blue-100 hover:text-white">
            ← Về trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
}
