'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { bookingsApi, hotelManagerApi, reviewsApi } from '@/lib/api/services';
import { formatCurrency, formatDate } from '@/lib/utils/format';
import type { Booking, RoomType } from '@/types';

export default function HotelManagerDashboardPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [rooms, setRooms] = useState<RoomType[]>([]);
  const [averageRating, setAverageRating] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [hotelId, setHotelId] = useState<string | null>(null);

  useEffect(() => {
    // DISABLED: Authentication check for testing
    // const hotelAuthToken = localStorage.getItem('hotel_auth_token');
    // if (!hotelAuthToken) {
    //   router.push('/hotel-manager/login');
    //   return;
    // }

    const loadData = async () => {
      try {
        // Get hotel ID from hotel manager's hotels
        let currentHotelId: string | null = null;
        try {
          const myHotels = await hotelManagerApi.getMyHotels();
          if (myHotels && myHotels.length > 0) {
            // Use first hotel if multiple hotels exist
            currentHotelId = String((myHotels[0] as any).hotel_id || (myHotels[0] as any).id);
            setHotelId(currentHotelId);
          } else {
            console.warn('No hotels found for this hotel manager');
            setLoading(false);
            return;
          }
        } catch (err) {
          console.error('Error loading hotel info:', err);
          setLoading(false);
          return;
        }

        // Load bookings - this is the main data source
        try {
          // const bookingsArray = bookingData?.bookings || bookingData || [];
          const bookingData = await bookingsApi.getAll();
          const bookingsArray = bookingData?.bookings || bookingData || [];
          setBookings(Array.isArray(bookingsArray) ? bookingsArray : []);
          console.log('bookingsArray', bookingsArray);
          // setBookings(Array.isArray(bookingsArray) ? bookingsArray : []);
        } catch (err) {
          console.error('Error loading bookings:', err);
          setBookings([]);
        }

        // Load rooms - optional, for occupancy calculation
        if (currentHotelId) {
          try {
            const roomData = await hotelManagerApi.getRooms(currentHotelId);
            if (roomData && Array.isArray(roomData)) {
              setRooms(roomData);
            } else {
              // If API returns unexpected format, try room types endpoint
              const roomTypes = await hotelManagerApi.getRoomTypes(currentHotelId);
              setRooms(Array.isArray(roomTypes) ? roomTypes : []);
            }
          } catch (err) {
            console.error('Error loading rooms:', err);
            // Fallback: try to get room types instead
            try {
              const roomTypes = await hotelManagerApi.getRoomTypes(currentHotelId);
              setRooms(Array.isArray(roomTypes) ? roomTypes : []);
            } catch (err2) {
              console.error('Error loading room types:', err2);
              setRooms([]);
            }
          }

          // Load reviews and calculate average rating - optional
          try {
            const reviews = await reviewsApi.getAll(currentHotelId);
            if (reviews && Array.isArray(reviews) && reviews.length > 0) {
              const avg = reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length;
              setAverageRating(Number(avg.toFixed(1)));
            } else {
              setAverageRating(0);
            }
          } catch (err) {
            console.error('Error loading reviews:', err);
            setAverageRating(0);
          }
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error);
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

  if (!hotelId) {
    return (
      <div className="space-y-6">
        <Card>
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🏨</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Chưa có khách sạn</h2>
            <p className="text-gray-600 mb-4">
              Bạn chưa có khách sạn nào. Vui lòng tạo khách sạn mới để bắt đầu.
            </p>
            <Button onClick={() => router.push('/hotel-manager/onboarding')}>
              Tạo khách sạn mới
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const recentBookings = bookings.slice(0, 5);
  const confirmedBookings = bookings.filter((b) => b.status === 'accepted');
  const checkedInBookings = bookings.filter((b) => b.status === 'checked_in');
  const pendingBookings = bookings.filter((b) => b.status === 'pending');
  const completedBookings = bookings.filter((b) => b.status === 'maintained');
  const totalRevenue = bookings
    .reduce((sum, b) => sum + (Number(b.total_price) || 0), 0);

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const monthRevenue = bookings
    .filter((b) => {
      const bookingDate = new Date(b.created_at || b.check_in_date);
      const bookingMonth = bookingDate.getMonth();
      const bookingYear = bookingDate.getFullYear();

      console.log('📅 Booking date check:', {
        booking_id: b.booking_id,
        created_at: b.created_at,
        check_in_date: b.check_in_date,
        bookingDate,
        bookingMonth,
        bookingYear,
        currentMonth,
        currentYear,
        total_price: b.total_price,
        matches: bookingMonth === currentMonth && bookingYear === currentYear
      });

      return bookingMonth === currentMonth && bookingYear === currentYear;
    })
    .reduce((sum, b) => sum + (Number(b.total_price) || 0), 0);

  console.log('💰 Month revenue result:', { monthRevenue, totalBookings: bookings.length });

  // Calculate occupancy rate based on actual room data
  const totalRooms = rooms.length || 15; // Fallback to 15 if no rooms loaded
  const occupiedRooms = confirmedBookings.length + checkedInBookings.length;
  const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

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
              {pendingBookings.length}
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
            <div className="text-3xl font-bold text-yellow-600">
              {averageRating > 0 ? averageRating : '-'}
            </div>
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
                key={booking.booking_id}
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
                      {booking.roomType} • {booking.nights || 'N/A'} đêm •{' '}
                      {booking.people || 'N/A'} khách
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      {formatDate(booking.check_in_date)} -{' '}
                      {formatDate(booking.check_out_date)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-xl text-[#0071c2] mb-2">
                    {formatCurrency(booking.total_price || 0)}
                  </p>
                  <span
                    className={`inline-block text-sm px-3 py-1 rounded-full font-semibold ${
                      booking.status === 'accepted'
                        ? 'bg-green-100 text-green-800'
                        : booking.status === 'maintained'
                        ? 'bg-gray-100 text-gray-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {booking.status === 'accepted'
                      ? 'Đã xác nhận'
                      : booking.status === 'maintained'
                      ? 'Bảo trì'
                      : booking.status === 'pending'
                      ? 'Chờ xác nhận'
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
              <span className="text-gray-800 font-medium">Đang bảo trì</span>
              <span className="font-bold text-gray-600">
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
