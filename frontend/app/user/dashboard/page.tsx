/**
 * User Dashboard - Tổng quan tài khoản
 * FE3: User Dashboard
 */

'use client';

import Link from 'next/link';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { formatCurrency, formatDate } from '@/lib/utils/format';
import { ROUTES } from '@/lib/routes';
import { useEffect, useState } from 'react';
import { bookingsApi } from '@/lib/api/services';
import { useAuth } from '@/lib/context/AuthContext';
import type { Booking } from '@/types';

export default function UserDashboardPage() {
  const { user } = useAuth();
  const [upcomingBookings, setUpcomingBookings] = useState<Booking[]>([]);

  useEffect(() => {
    const loadBookings = async () => {
      try {
        const bookings = await bookingsApi.getAll();
        setUpcomingBookings(bookings.filter(b => b.status === 'accepted'));
      } catch (error) {
        console.error('Error loading bookings:', error);
      }
    };
    loadBookings();
  }, []);

  const displayName = user?.name || 'User';

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Xin chào, {displayName}!</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="text-center">
            <div className="text-4xl mb-2">📋</div>
            <div className="text-3xl font-bold text-[#0071c2]">{upcomingBookings.length}</div>
            <div className="text-sm font-medium text-gray-700">Tổng đơn đặt</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-4xl mb-2">⭐</div>
            <div className="text-3xl font-bold text-[#0071c2]">0</div>
            <div className="text-sm font-medium text-gray-700">Điểm tích lũy</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-4xl mb-2">🎁</div>
            <div className="text-3xl font-bold text-[#0071c2]">Silver</div>
            <div className="text-sm font-medium text-gray-700">Hạng thành viên</div>
          </div>
        </Card>
      </div>

      {/* Upcoming Bookings */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Đặt phòng sắp tới</h2>
          <Link href={ROUTES.USER.BOOKINGS}>
            <Button variant="outline" size="sm">Xem tất cả</Button>
          </Link>
        </div>

        {upcomingBookings.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">🏨</div>
            <p className="text-gray-700 mb-4 font-medium">Bạn chưa có đặt phòng nào sắp tới</p>
            <Link href={ROUTES.SEARCH}>
              <Button>Tìm khách sạn</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {upcomingBookings.slice(0, 3).map((booking) => (
              <div key={booking.booking_id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-[#0071c2] transition-colors">
                <div className="flex items-center space-x-4">
                  <div
                    className="w-24 h-24 rounded-lg bg-cover bg-center flex-shrink-0"
                    style={{ backgroundImage: `url('${booking.hotelImage}')` }}
                  />
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">{booking.hotelName}</h3>
                    <p className="text-gray-700 font-medium">{booking.roomType}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      {formatDate(booking.check_in_date)} - {formatDate(booking.check_out_date)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-[#0071c2] mb-2">
                    {formatCurrency(booking.total_price || 0)}
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
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Thao tác nhanh</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link href={ROUTES.SEARCH}>
            <div className="text-center p-4 border-2 border-gray-200 rounded-lg hover:border-[#0071c2] transition-colors cursor-pointer">
              <div className="text-4xl mb-2">🔍</div>
              <div className="font-semibold text-gray-900">Tìm khách sạn</div>
            </div>
          </Link>
          <Link href={ROUTES.USER.BOOKINGS}>
            <div className="text-center p-4 border-2 border-gray-200 rounded-lg hover:border-[#0071c2] transition-colors cursor-pointer">
              <div className="text-4xl mb-2">📋</div>
              <div className="font-semibold text-gray-900">Đơn của tôi</div>
            </div>
          </Link>
          <Link href={ROUTES.USER.REVIEWS}>
            <div className="text-center p-4 border-2 border-gray-200 rounded-lg hover:border-[#0071c2] transition-colors cursor-pointer">
              <div className="text-4xl mb-2">⭐</div>
              <div className="font-semibold text-gray-900">Viết đánh giá</div>
            </div>
          </Link>
          <Link href={ROUTES.HELP}>
            <div className="text-center p-4 border-2 border-gray-200 rounded-lg hover:border-[#0071c2] transition-colors cursor-pointer">
              <div className="text-4xl mb-2">❓</div>
              <div className="font-semibold text-gray-900">Trợ giúp</div>
            </div>
          </Link>
        </div>
      </Card>
    </div>
  );
}
