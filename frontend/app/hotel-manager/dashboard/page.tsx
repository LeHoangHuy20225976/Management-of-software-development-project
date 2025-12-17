'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { bookingsApi } from '@/lib/api/services';
import { formatCurrency, formatDate } from '@/lib/utils/format';
import type { Booking } from '@/types';

export default function HotelManagerDashboardPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check authentication
    // const hotelAuthToken = localStorage.getItem('hotel_auth_token');
    // if (!hotelAuthToken) {
    //   router.push('/hotel-manager/login');
    //   return;
    // }

    const loadData = async () => {
      try {
        const data = await bookingsApi.getAll();
        setBookings(data);
      } catch (error) {
        console.error('Error loading bookings:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [router]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <p className="text-gray-900 font-medium">Đang tải...</p>
        </Card>
      </div>
    );
  }

  const recentBookings = bookings.slice(0, 5);
  const confirmedBookings = bookings.filter((b) => b.status === 'confirmed');
  const completedBookings = bookings.filter((b) => b.status === 'completed');
  const totalRevenue = bookings
    .filter((b) => b.paymentStatus === 'paid')
    .reduce((sum, b) => sum + b.totalPrice, 0);

  const monthRevenue = bookings
    .filter((b) => {
      const bookingMonth = new Date(b.bookingDate).getMonth();
      const currentMonth = new Date().getMonth();
      return bookingMonth === currentMonth && b.paymentStatus === 'paid';
    })
    .reduce((sum, b) => sum + b.totalPrice, 0);

  const occupancyRate = Math.round(
    (confirmedBookings.length / (confirmedBookings.length + 5)) * 100
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-800 font-medium">Chào mừng trở lại! 👋</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <div className="text-center">
            <div className="text-4xl mb-2">📋</div>
            <div className="text-3xl font-bold text-[#0071c2]">
              {confirmedBookings.length}
            </div>
            <div className="text-gray-900 font-medium mt-1">Đặt phòng mới</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-4xl mb-2">💰</div>
            <div className="text-3xl font-bold text-green-600">
              {occupancyRate}%
            </div>
            <div className="text-gray-900 font-medium mt-1">Tỷ lệ lấp đầy</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-4xl mb-2">⭐</div>
            <div className="text-3xl font-bold text-yellow-600">4.8</div>
            <div className="text-gray-900 font-medium mt-1">Đánh giá TB</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-4xl mb-2">💵</div>
            <div className="text-3xl font-bold text-[#0071c2]">
              {formatCurrency(monthRevenue).replace(' ₫', '')}
            </div>
            <div className="text-gray-900 font-medium mt-1">
              Doanh thu tháng
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Link href="/hotel-manager/rooms">
          <Card hover className="text-center cursor-pointer">
            <div className="text-4xl mb-2">🛏️</div>
            <div className="font-semibold text-gray-900">Quản lý phòng</div>
          </Card>
        </Link>
        <Link href="/hotel-manager/bookings">
          <Card hover className="text-center cursor-pointer">
            <div className="text-4xl mb-2">📅</div>
            <div className="font-semibold text-gray-900">Xem đặt phòng</div>
          </Card>
        </Link>
        <Link href="/hotel-manager/reviews">
          <Card hover className="text-center cursor-pointer">
            <div className="text-4xl mb-2">⭐</div>
            <div className="font-semibold text-gray-900">Đánh giá</div>
          </Card>
        </Link>
        <Link href="/hotel-manager/analytics">
          <Card hover className="text-center cursor-pointer">
            <div className="text-4xl mb-2">📈</div>
            <div className="font-semibold text-gray-900">Thống kê</div>
          </Card>
        </Link>
      </div>

      {/* Recent Bookings */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Đặt phòng gần đây
          </h2>
          <Link href="/hotel-manager/bookings">
            <Button variant="outline" size="sm">
              Xem tất cả
            </Button>
          </Link>
        </div>

        {recentBookings.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">📋</div>
            <p className="text-gray-900 font-medium">Chưa có đặt phòng nào</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentBookings.map((booking) => (
              <div
                key={booking.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-[#0071c2] transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div
                    className="w-16 h-16 rounded-lg bg-cover bg-center flex-shrink-0"
                    style={{ backgroundImage: `url('${booking.hotelImage}')` }}
                  />
                  <div>
                    <p className="font-semibold text-gray-900">
                      {booking.hotelName}
                    </p>
                    <p className="text-sm text-gray-800 font-medium">
                      {booking.roomType} • {booking.nights} đêm •{' '}
                      {booking.guests} khách
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      {formatDate(booking.checkIn)} -{' '}
                      {formatDate(booking.checkOut)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-xl text-[#0071c2] mb-2">
                    {formatCurrency(booking.totalPrice)}
                  </p>
                  <span
                    className={`inline-block text-sm px-3 py-1 rounded-full font-semibold ${
                      booking.status === 'confirmed'
                        ? 'bg-green-100 text-green-800'
                        : booking.status === 'completed'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {booking.status === 'confirmed'
                      ? 'Đã xác nhận'
                      : booking.status === 'completed'
                      ? 'Hoàn thành'
                      : 'Đã hủy'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            Thống kê tháng này
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-800 font-medium">Tổng đơn đặt</span>
              <span className="font-bold text-gray-900">{bookings.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-800 font-medium">Đơn đã xác nhận</span>
              <span className="font-bold text-green-600">
                {confirmedBookings.length}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-800 font-medium">Đơn hoàn thành</span>
              <span className="font-bold text-blue-600">
                {completedBookings.length}
              </span>
            </div>
            <div className="flex justify-between items-center pt-3 border-t">
              <span className="text-gray-900 font-bold">Tổng doanh thu</span>
              <span className="font-bold text-2xl text-[#0071c2]">
                {formatCurrency(totalRevenue)}
              </span>
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="text-xl font-bold text-gray-900 mb-4">Cần chú ý</h3>
          <div className="space-y-3">
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start space-x-2">
                <span className="text-xl">⚠️</span>
                <div>
                  <p className="font-semibold text-gray-900">Đánh giá mới</p>
                  <p className="text-sm text-gray-800">
                    3 đánh giá mới chưa phản hồi
                  </p>
                </div>
              </div>
            </div>
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start space-x-2">
                <span className="text-xl">📋</span>
                <div>
                  <p className="font-semibold text-gray-900">
                    Check-in hôm nay
                  </p>
                  <p className="text-sm text-gray-800">5 khách sẽ nhận phòng</p>
                </div>
              </div>
            </div>
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start space-x-2">
                <span className="text-xl">✅</span>
                <div>
                  <p className="font-semibold text-gray-900">Phòng sẵn sàng</p>
                  <p className="text-sm text-gray-800">8 phòng đã dọn sạch</p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
