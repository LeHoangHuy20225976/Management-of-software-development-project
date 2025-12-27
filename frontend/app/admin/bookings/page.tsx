'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { bookingsApi } from '@/lib/api/services';
import { formatCurrency, formatDate } from '@/lib/utils/format';
import type { Booking } from '@/types';

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'accepted' | 'cancelled'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadBookings();
  }, []);

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

  const filteredBookings = bookings.filter(b => {
    const matchesFilter = filter === 'all' || b.status === filter;
    const matchesSearch = !searchQuery || 
      String(b.booking_id).includes(searchQuery) ||
      (b.hotelName && b.hotelName.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const getStatusBadge = (status: Booking['status']) => {
    const styles: Record<string, string> = {
      accepted: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      rejected: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-black',
      maintained: 'bg-blue-100 text-blue-800',
    };
    const labels: Record<string, string> = {
      accepted: 'Đã xác nhận',
      pending: 'Chờ xử lý',
      rejected: 'Từ chối',
      cancelled: 'Đã hủy',
      maintained: 'Bảo trì',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100'}`}>
        {labels[status] || status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-black">Quản lý đặt phòng</h1>
        <Card>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-black">📋 Quản lý đặt phòng</h1>
        <div className="text-black font-medium">
          Tổng: <strong>{bookings.length}</strong> đơn
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-black">{bookings.length}</div>
            <div className="text-sm text-black font-medium">Tổng cộng</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-600">
              {bookings.filter(b => b.status === 'pending').length}
            </div>
            <div className="text-sm text-black font-medium">Chờ xử lý</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">
              {bookings.filter(b => b.status === 'accepted').length}
            </div>
            <div className="text-sm text-black font-medium">Đã xác nhận</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-red-600">
              {bookings.filter(b => b.status === 'cancelled').length}
            </div>
            <div className="text-sm text-black font-medium">Đã hủy</div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="🔍 Tìm theo mã đơn hoặc tên khách sạn..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={filter === 'all' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
            >
              Tất cả
            </Button>
            <Button
              variant={filter === 'pending' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setFilter('pending')}
            >
              Chờ xử lý
            </Button>
            <Button
              variant={filter === 'accepted' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setFilter('accepted')}
            >
              Đã xác nhận
            </Button>
            <Button
              variant={filter === 'cancelled' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setFilter('cancelled')}
            >
              Đã hủy
            </Button>
          </div>
        </div>
      </Card>

      {/* Bookings Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-black bg-gray-50">Mã đơn</th>
                <th className="text-left py-3 px-4 font-semibold text-black bg-gray-50">Khách sạn</th>
                <th className="text-left py-3 px-4 font-semibold text-black bg-gray-50">Nhận phòng</th>
                <th className="text-left py-3 px-4 font-semibold text-black bg-gray-50">Trả phòng</th>
                <th className="text-left py-3 px-4 font-semibold text-black bg-gray-50">Tổng tiền</th>
                <th className="text-left py-3 px-4 font-semibold text-black bg-gray-50">Trạng thái</th>
                <th className="text-left py-3 px-4 font-semibold text-black bg-gray-50">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map((booking) => (
                <tr key={booking.booking_id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <span className="font-medium text-blue-600">#{booking.booking_id}</span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-medium text-black">{booking.hotelName || 'N/A'}</div>
                    <div className="text-sm text-black">{booking.roomType || ''}</div>
                  </td>
                  <td className="py-3 px-4 text-sm text-black">
                    {formatDate(booking.check_in_date, 'short')}
                  </td>
                  <td className="py-3 px-4 text-sm text-black">
                    {formatDate(booking.check_out_date, 'short')}
                  </td>
                  <td className="py-3 px-4 font-medium text-black">
                    {formatCurrency(booking.total_price ?? 0)}
                  </td>
                  <td className="py-3 px-4">{getStatusBadge(booking.status)}</td>
                  <td className="py-3 px-4">
                    <Button variant="outline" size="sm">
                      Chi tiết
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredBookings.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📋</div>
            <p className="text-black">Không tìm thấy đơn đặt phòng nào</p>
          </div>
        )}
      </Card>
    </div>
  );
}
