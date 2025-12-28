/**
 * User Bookings Page - Lịch sử đặt phòng
 * FE3: User Dashboard
 */

'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { formatCurrency, formatDate } from '@/lib/utils/format';
import { bookingsApi } from '@/lib/api/services';
import type { Booking } from '@/types';
import { API_CONFIG } from '@/lib/api/config';

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filter, setFilter] = useState<
    'all' | 'pending' | 'accepted' | 'cancelled'
  >('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      setLoading(true);
      // Fetch from backend API
      const response = await bookingsApi.getAll();
      console.log('📋 Bookings API response:', response);

      // Backend may return { bookings: [...] } or direct array
      const bookingsArray = Array.isArray(response)
        ? response
        : (response as any).bookings || [];

      console.log('📋 Bookings array:', bookingsArray);
      setBookings(bookingsArray);
    } catch (error) {
      console.error('Error loading bookings:', error);
      alert('❌ Lỗi khi tải danh sách bookings!');
    } finally {
      setLoading(false);
    }
  };

  const filteredBookings =
    filter === 'all' ? bookings : bookings.filter((b) => b.status === filter);

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      accepted: 'bg-green-100 text-green-800',
      maintained: 'bg-blue-100 text-blue-800',
      cancelled: 'bg-red-100 text-red-800',
      pending: 'bg-yellow-100 text-yellow-800',
      rejected: 'bg-red-100 text-red-800',
      'cancel requested': 'bg-orange-100 text-orange-800',
    };
    const labels: Record<string, string> = {
      accepted: 'Đã xác nhận',
      maintained: 'Hoàn thành',
      cancelled: 'Đã hủy',
      pending: 'Chờ xác nhận',
      rejected: 'Bị từ chối',
      'cancel requested': 'Yêu cầu hủy',
    };
    return (
      <span
        className={`px-3 py-1 rounded-full text-sm font-semibold ${
          styles[status] || 'bg-gray-100 text-gray-800'
        }`}
      >
        {labels[status] || status}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Đơn đặt phòng</h1>
      </div>

      {/* Filter */}
      <Card>
        <div className="flex flex-wrap gap-3">
          <Button
            variant={filter === 'all' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            Tất cả ({bookings.length})
          </Button>
          <Button
            variant={filter === 'pending' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setFilter('pending')}
          >
            Sắp tới ({bookings.filter((b) => b.status === 'pending').length})
          </Button>
          <Button
            variant={filter === 'accepted' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setFilter('accepted')}
          >
            Đã hoàn thành (
            {bookings.filter((b) => b.status === 'accepted').length})
          </Button>
          <Button
            variant={filter === 'cancelled' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setFilter('cancelled')}
          >
            Đã hủy ({bookings.filter((b) => b.status === 'cancelled').length})
          </Button>
        </div>
      </Card>

      {/* Bookings List */}
      {loading ? (
        <Card>
          <p className="text-gray-900 font-medium">Đang tải...</p>
        </Card>
      ) : filteredBookings.length === 0 ? (
        <Card className="text-center py-12">
          <div className="text-6xl mb-4">📋</div>
          <p className="text-gray-700 font-medium">
            Không có đơn đặt phòng nào
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking) => (
            <Card key={booking.booking_id} hover>
              <div className="flex flex-col md:flex-row gap-4">
                <div
                  className="w-full md:w-48 h-48 rounded-lg bg-cover bg-center flex-shrink-0"
                  style={{
                    backgroundImage: `url('${booking.hotelImage || ''}')`,
                  }}
                />
                <div className="flex-grow">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-1">
                        {booking.hotelName || 'N/A'}
                      </h3>
                      <p className="text-gray-700 font-medium">
                        {booking.roomType || 'N/A'}
                      </p>
                    </div>
                    {getStatusBadge(booking.status)}
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600 font-medium">
                        Nhận phòng
                      </p>
                      <p className="font-semibold text-gray-900">
                        {formatDate(booking.check_in_date, 'long')}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 font-medium">
                        Trả phòng
                      </p>
                      <p className="font-semibold text-gray-900">
                        {formatDate(booking.check_out_date, 'long')}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 font-medium">
                        Số đêm
                      </p>
                      <p className="font-semibold text-gray-900">
                        {booking.nights || 'N/A'} đêm
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 font-medium">
                        Số khách
                      </p>
                      <p className="font-semibold text-gray-900">
                        {booking.people || 'N/A'} người
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 font-medium">
                        Mã đơn: {booking.booking_id}
                      </p>
                      <p className="text-2xl font-bold text-[#0071c2]">
                        {formatCurrency(booking.total_price || 0)}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        Chi tiết
                      </Button>
                      {booking.status === 'maintained' && (
                        <Button variant="primary" size="sm">
                          Viết đánh giá
                        </Button>
                      )}
                      {booking.status === 'accepted' && (
                        <Button variant="danger" size="sm">
                          Hủy đặt phòng
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
