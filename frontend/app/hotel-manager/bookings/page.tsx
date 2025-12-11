'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { bookingsApi } from '@/lib/api/services';
import { formatCurrency, formatDate } from '@/lib/utils/format';
import type { Booking } from '@/types';

export default function HotelBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<
    'all' | 'accepted' | 'pending' | 'cancelled'
  >('all');

  useEffect(() => {
    const loadBookings = async () => {
      try {
        const data = await bookingsApi.getAll();
        setBookings(data);
      } catch (error) {
        console.error('Error loading bookings:', error);
      } finally {
        setLoading(false);
      }
    };

    loadBookings();
  }, []);

  const filteredBookings =
    filter === 'all'
      ? bookings
      : bookings.filter((b) => {
          const statusFilter = filter as Exclude<typeof filter, 'all'>;
          return b.status === statusFilter;
        });

  const getStatusBadge = (status: Booking['status']) => {
    const styles: Record<Booking['status'], string> = {
      accepted: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      rejected: 'bg-red-100 text-red-800',
      'cancel requested': 'bg-orange-100 text-orange-800',
      cancelled: 'bg-red-100 text-red-800',
      maintained: 'bg-gray-100 text-gray-800',
    };
    const labels: Record<Booking['status'], string> = {
      accepted: 'Đã xác nhận',
      pending: 'Chờ xác nhận',
      rejected: 'Bị từ chối',
      'cancel requested': 'Yêu cầu hủy',
      cancelled: 'Đã hủy',
      maintained: 'Bảo trì',
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

  const getPaymentBadge = (status: NonNullable<Booking['paymentStatus']>) => {
    return status === 'paid' ? (
      <span className="text-green-600 text-sm">✓ Đã thanh toán</span>
    ) : status === 'refunded' ? (
      <span className="text-gray-600 text-sm">↩ Đã hoàn tiền</span>
    ) : (
      <span className="text-yellow-600 text-sm">⏳ Chờ thanh toán</span>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>Đang tải...</Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Quản lý đặt phòng</h1>
        <div className="text-right">
          <p className="text-sm text-gray-600">Tổng đơn</p>
          <p className="text-2xl font-bold text-[#0071c2]">{bookings.length}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <div className="text-center">
            <div className="text-4xl mb-2">⏳</div>
            <div className="text-3xl font-bold text-yellow-600">
              {bookings.filter((b) => b.status === 'pending').length}
            </div>
            <div className="text-gray-900 font-medium">Chờ xác nhận</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-4xl mb-2">✅</div>
            <div className="text-3xl font-bold text-green-600">
              {bookings.filter((b) => b.status === 'accepted').length}
            </div>
            <div className="text-gray-900 font-medium">Đã xác nhận</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-4xl mb-2">🔧</div>
            <div className="text-3xl font-bold text-gray-600">
              {bookings.filter((b) => b.status === 'maintained').length}
            </div>
            <div className="text-gray-900 font-medium">Bảo trì</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-4xl mb-2">❌</div>
            <div className="text-3xl font-bold text-red-600">
              {bookings.filter((b) => b.status === 'cancelled').length}
            </div>
            <div className="text-gray-900 font-medium">Đã hủy</div>
          </div>
        </Card>
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
            variant={filter === 'accepted' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setFilter('accepted')}
          >
            Đã xác nhận (
            {bookings.filter((b) => b.status === 'accepted').length})
          </Button>
          <Button
            variant={filter === 'pending' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setFilter('pending')}
          >
            Chờ xác nhận (
            {bookings.filter((b) => b.status === 'pending').length})
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
      {filteredBookings.length === 0 ? (
        <Card className="text-center py-12">
          <div className="text-6xl mb-4">📋</div>
          <p className="text-gray-900 font-medium">
            Không có đơn đặt phòng nào
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking) => (
            <Card key={booking.booking_id} hover>
              <div className="flex flex-col md:flex-row gap-4">
                {/* Hotel Image */}
                <div
                  className="w-full md:w-48 h-48 rounded-lg bg-cover bg-center flex-shrink-0"
                  style={{
                    backgroundImage: `url('${booking.hotelImage || ''}')`,
                  }}
                />

                {/* Booking Info */}
                <div className="flex-grow">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center space-x-3 mb-1">
                        <h3 className="text-xl font-bold text-gray-900">
                          {booking.hotelName || 'N/A'}
                        </h3>
                        {getStatusBadge(booking.status)}
                      </div>
                      <p className="text-gray-600">
                        {booking.roomType || 'N/A'}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        Mã đơn: {booking.booking_id}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-800 font-medium">
                        Nhận phòng
                      </p>
                      <p className="font-semibold text-gray-900">
                        {formatDate(booking.check_in_date, 'long')}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-800 font-medium">
                        Trả phòng
                      </p>
                      <p className="font-semibold text-gray-900">
                        {formatDate(booking.check_out_date, 'long')}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-800 font-medium">
                        Số đêm
                      </p>
                      <p className="font-semibold text-gray-900">
                        {booking.nights !== null && booking.nights !== undefined
                          ? `${booking.nights} đêm`
                          : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-800 font-medium">
                        Số khách
                      </p>
                      <p className="font-semibold text-gray-900">
                        {booking.people !== null && booking.people !== undefined
                          ? `${booking.people} người`
                          : 'N/A'}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between pt-4 border-t border-gray-200">
                    <div>
                      <p className="text-sm text-gray-800 font-medium mb-1">
                        Thanh toán
                      </p>
                      <div className="flex items-center space-x-3">
                        <p className="text-2xl font-bold text-[#0071c2]">
                          {formatCurrency(booking.total_price ?? 0)}
                        </p>
                        {booking.paymentStatus
                          ? getPaymentBadge(booking.paymentStatus)
                          : null}
                      </div>
                    </div>
                    <div className="flex space-x-2 mt-3 md:mt-0">
                      <Button variant="outline" size="sm">
                        📄 Chi tiết
                      </Button>
                      {booking.status === 'pending' && (
                        <>
                          <Button variant="primary" size="sm">
                            ✓ Xác nhận
                          </Button>
                          <Button variant="danger" size="sm">
                            ✕ Từ chối
                          </Button>
                        </>
                      )}
                      {booking.status === 'accepted' && (
                        <Button variant="outline" size="sm">
                          💬 Nhắn tin
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
