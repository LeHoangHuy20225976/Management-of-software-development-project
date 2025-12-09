/**
 * User Dashboard - Tổng quan tài khoản
 * FE3: User Dashboard
 */

import Link from 'next/link';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { bookingsApi, userApi } from '@/lib/api/services';
import { formatCurrency, formatDate } from '@/lib/utils/format';
import { ROUTES } from '@/lib/routes';

export default async function UserDashboardPage() {
  const user = await userApi.getProfile();
  const bookings = await bookingsApi.getAll();
  const upcomingBookings = bookings.filter(b => b.status === 'confirmed');

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Xin chào, {user.name}!</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="text-center">
            <div className="text-4xl mb-2">📋</div>
            <div className="text-3xl font-bold text-[#0071c2]">{user.totalBookings}</div>
            <div className="text-gray-600">Tổng đơn đặt</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-4xl mb-2">⭐</div>
            <div className="text-3xl font-bold text-[#0071c2]">{user.points}</div>
            <div className="text-gray-600">Điểm tích lũy</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-4xl mb-2">🎁</div>
            <div className="text-3xl font-bold text-[#0071c2]">Silver</div>
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
              <div key={booking.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-[#0071c2] transition-colors">
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
                  <div className="text-xl font-bold text-[#0071c2] mb-2">
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
            <div className="text-center p-4 border-2 border-gray-200 rounded-lg hover:border-[#0071c2] transition-colors cursor-pointer">
              <div className="text-4xl mb-2">🔍</div>
              <div className="font-semibold">Tìm khách sạn</div>
            </div>
          </Link>
          <Link href={ROUTES.USER.BOOKINGS}>
            <div className="text-center p-4 border-2 border-gray-200 rounded-lg hover:border-[#0071c2] transition-colors cursor-pointer">
              <div className="text-4xl mb-2">📋</div>
              <div className="font-semibold">Đơn của tôi</div>
            </div>
          </Link>
          <Link href={ROUTES.USER.REVIEWS}>
            <div className="text-center p-4 border-2 border-gray-200 rounded-lg hover:border-[#0071c2] transition-colors cursor-pointer">
              <div className="text-4xl mb-2">⭐</div>
              <div className="font-semibold">Viết đánh giá</div>
            </div>
          </Link>
          <Link href={ROUTES.HELP}>
            <div className="text-center p-4 border-2 border-gray-200 rounded-lg hover:border-[#0071c2] transition-colors cursor-pointer">
              <div className="text-4xl mb-2">❓</div>
              <div className="font-semibold">Trợ giúp</div>
            </div>
          </Link>
        </div>
      </Card>
    </div>
  );
}
