'use client';

/**
 * User Dashboard - Tổng quan tài khoản
 * FE3: User Dashboard
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { bookingsApi, userApi } from '@/lib/api/services';
import { formatCurrency, formatDate } from '@/lib/utils/format';
import { ROUTES } from '@/lib/routes';
import type { Booking, User } from '@/types';

export default function UserDashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [profile, bookingData] = await Promise.all([
          userApi.getProfile(),
          bookingsApi.getAll(),
        ]);
        setUser(profile);
        setBookings(bookingData);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const upcomingBookings = bookings.filter(b => b.status === 'confirmed');

  if (loading || !user) {
    return (
      <div className="space-y-6">
        <Card>Đang tải...</Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Xin chào, {user.name}!</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="text-center">
            <div className="text-4xl mb-2">📋</div>
            <div className="text-3xl font-bold text-blue-600">{user.totalBookings}</div>
            <div className="text-gray-600">Tổng đơn đặt</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-4xl mb-2">⭐</div>
            <div className="text-3xl font-bold text-blue-600">{user.points}</div>
            <div className="text-gray-600">Điểm tích lũy</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-4xl mb-2">🎁</div>
            <div className="text-3xl font-bold text-blue-600">Silver</div>
            <div className="text-gray-600">Hạng thành viên</div>
          </div>
        </Card>
      </div>

      {/* Upcoming Bookings */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Đặt phòng sắp tới</h2>
          <Link href={ROUTES.USER.BOOKINGS}>
            <Button variant="outline" size="sm">Xem tất cả</Button>
          </Link>
        </div>

        {upcomingBookings.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">🏨</div>
            <p className="text-gray-600 mb-4">Bạn chưa có đặt phòng nào sắp tới</p>
            <Link href={ROUTES.SEARCH}>
              <Button>Tìm khách sạn</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {upcomingBookings.slice(0, 3).map((booking) => (
              <div key={booking.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-500 transition-colors">
                <div className="flex items-center space-x-4">
                  <div
                    className="w-24 h-24 rounded-lg bg-cover bg-center flex-shrink-0"
                    style={{ backgroundImage: `url('${booking.hotelImage}')` }}
                  />
                  <div>
                    <h3 className="font-bold text-lg">{booking.hotelName}</h3>
                    <p className="text-gray-600">{booking.roomType}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {formatDate(booking.checkIn)} - {formatDate(booking.checkOut)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-blue-600 mb-2">
                    {formatCurrency(booking.totalPrice)}
                  </div>
                  <span className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                    Đã xác nhận
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Quick Actions */}
      <Card>
        <h2 className="text-2xl font-bold mb-4">Thao tác nhanh</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link href={ROUTES.SEARCH}>
            <div className="text-center p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 transition-colors cursor-pointer">
              <div className="text-4xl mb-2">🔍</div>
              <div className="font-semibold">Tìm khách sạn</div>
            </div>
          </Link>
          <Link href={ROUTES.USER.BOOKINGS}>
            <div className="text-center p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 transition-colors cursor-pointer">
              <div className="text-4xl mb-2">📋</div>
              <div className="font-semibold">Đơn của tôi</div>
            </div>
          </Link>
          <Link href={ROUTES.USER.REVIEWS}>
            <div className="text-center p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 transition-colors cursor-pointer">
              <div className="text-4xl mb-2">⭐</div>
              <div className="font-semibold">Viết đánh giá</div>
            </div>
          </Link>
          <Link href={ROUTES.HELP}>
            <div className="text-center p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 transition-colors cursor-pointer">
              <div className="text-4xl mb-2">❓</div>
              <div className="font-semibold">Trợ giúp</div>
            </div>
          </Link>
        </div>
      </Card>
    </div>
  );
}
