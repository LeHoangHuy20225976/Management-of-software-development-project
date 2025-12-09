/**
 * User Bookings Page - Lịch sử đặt phòng
 * FE3: User Dashboard
 */

'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { formatCurrency, formatDate } from '@/lib/utils/format';
import type { Booking } from '@/types';

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filter, setFilter] = useState<'all' | 'confirmed' | 'completed' | 'cancelled'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = () => {
    try {
      // Import mockData functions dynamically to avoid SSR issues
      import('@/lib/utils/mockData').then(({ getMockBookings }) => {
        const data = getMockBookings();
        setBookings(data);
        setLoading(false);
      });
    } catch (error) {
      console.error('Error loading bookings:', error);
      setLoading(false);
    }
  };

  const filteredBookings = filter === 'all'
    ? bookings
    : bookings.filter(b => b.status === filter);

  const getStatusBadge = (status: string) => {
    const styles = {
      confirmed: 'bg-green-100 text-green-800',
      completed: 'bg-blue-100 text-blue-800',
      cancelled: 'bg-red-100 text-red-800',
      pending: 'bg-yellow-100 text-yellow-800',
    };
    const labels = {
      confirmed: 'Đã xác nhận',
      completed: 'Hoàn thành',
      cancelled: 'Đã hủy',
      pending: 'Chờ xác nhận',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${styles[status]}`}>
        {labels[status]}
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
            variant={filter === 'confirmed' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setFilter('confirmed')}
          >
            Sắp tới ({bookings.filter(b => b.status === 'confirmed').length})
          </Button>
          <Button
            variant={filter === 'completed' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setFilter('completed')}
          >
            Đã hoàn thành ({bookings.filter(b => b.status === 'completed').length})
          </Button>
          <Button
            variant={filter === 'cancelled' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setFilter('cancelled')}
          >
            Đã hủy ({bookings.filter(b => b.status === 'cancelled').length})
          </Button>
        </div>
      </Card>

      {/* Bookings List */}
      {loading ? (
        <Card><p className="text-gray-900 font-medium">Đang tải...</p></Card>
      ) : filteredBookings.length === 0 ? (
        <Card className="text-center py-12">
          <div className="text-6xl mb-4">📋</div>
          <p className="text-gray-700 font-medium">Không có đơn đặt phòng nào</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking) => (
            <Card key={booking.id} hover>
              <div className="flex flex-col md:flex-row gap-4">
                <div
                  className="w-full md:w-48 h-48 rounded-lg bg-cover bg-center flex-shrink-0"
                  style={{ backgroundImage: `url('${booking.hotelImage}')` }}
                />
                <div className="flex-grow">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-1">{booking.hotelName}</h3>
                      <p className="text-gray-700 font-medium">{booking.roomType}</p>
                    </div>
                    {getStatusBadge(booking.status)}
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600 font-medium">Nhận phòng</p>
                      <p className="font-semibold text-gray-900">{formatDate(booking.checkIn, 'long')}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 font-medium">Trả phòng</p>
                      <p className="font-semibold text-gray-900">{formatDate(booking.checkOut, 'long')}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 font-medium">Số đêm</p>
                      <p className="font-semibold text-gray-900">{booking.nights} đêm</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 font-medium">Số khách</p>
                      <p className="font-semibold text-gray-900">{booking.guests} người</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 font-medium">Mã đơn: {booking.id}</p>
                      <p className="text-2xl font-bold text-[#0071c2]">
                        {formatCurrency(booking.totalPrice)}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        Chi tiết
                      </Button>
                      {booking.status === 'completed' && (
                        <Button variant="primary" size="sm">
                          Viết đánh giá
                        </Button>
                      )}
                      {booking.status === 'confirmed' && (
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
