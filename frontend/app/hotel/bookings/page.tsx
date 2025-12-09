/**
 * Bookings Management for Hotel Owners
 * FE4: Hotel Manager Portal
 */

'use client';

import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { useState } from 'react';
import type { Booking } from '@/types';

export default function HotelBookingsPage() {
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled'>('all');

  // Mock data
  const bookings: Booking[] = [
    {
      id: '1',
      userId: 'u1',
      hotelId: 'h1',
      hotelName: 'Grand Hotel Saigon',
      hotelImage: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400',
      roomType: 'Deluxe Room',
      checkIn: '2025-12-15',
      checkOut: '2025-12-18',
      nights: 3,
      guests: 2,
      totalPrice: 6000000,
      status: 'confirmed',
      bookingDate: '2025-12-01',
      paymentStatus: 'paid',
      paymentMethod: 'Thẻ tín dụng',
    },
    {
      id: '2',
      userId: 'u2',
      hotelId: 'h1',
      hotelName: 'Grand Hotel Saigon',
      hotelImage: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400',
      roomType: 'Superior Room',
      checkIn: '2025-12-20',
      checkOut: '2025-12-23',
      nights: 3,
      guests: 2,
      totalPrice: 4500000,
      status: 'pending',
      bookingDate: '2025-12-05',
      paymentStatus: 'pending',
      paymentMethod: 'Chuyển khoản',
    },
    {
      id: '3',
      userId: 'u3',
      hotelId: 'h1',
      hotelName: 'Grand Hotel Saigon',
      hotelImage: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400',
      roomType: 'Family Suite',
      checkIn: '2025-11-20',
      checkOut: '2025-11-23',
      nights: 3,
      guests: 4,
      totalPrice: 10500000,
      status: 'completed',
      bookingDate: '2025-11-01',
      paymentStatus: 'paid',
      paymentMethod: 'Thẻ tín dụng',
    },
    {
      id: '4',
      userId: 'u4',
      hotelId: 'h1',
      hotelName: 'Grand Hotel Saigon',
      hotelImage: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400',
      roomType: 'Deluxe Room',
      checkIn: '2025-12-10',
      checkOut: '2025-12-12',
      nights: 2,
      guests: 2,
      totalPrice: 4000000,
      status: 'cancelled',
      bookingDate: '2025-11-25',
      paymentStatus: 'refunded',
      paymentMethod: 'Thẻ tín dụng',
    },
  ];

  const filteredBookings = filter === 'all'
    ? bookings
    : bookings.filter(b => b.status === filter);

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-green-100 text-green-800',
    completed: 'bg-blue-100 text-blue-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  const statusLabels = {
    pending: 'Chờ xác nhận',
    confirmed: 'Đã xác nhận',
    completed: 'Hoàn thành',
    cancelled: 'Đã hủy',
  };

  const handleConfirm = (bookingId: string) => {
    if (confirm('Xác nhận đặt phòng này?')) {
      // TODO: Call API to confirm booking
      alert('Đã xác nhận đặt phòng!');
    }
  };

  const handleCancel = (bookingId: string) => {
    if (confirm('Hủy đặt phòng này? Khách hàng sẽ được hoàn tiền theo chính sách.')) {
      // TODO: Call API to cancel booking
      alert('Đã hủy đặt phòng!');
    }
  };

  const stats = {
    total: bookings.length,
    pending: bookings.filter(b => b.status === 'pending').length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    completed: bookings.filter(b => b.status === 'completed').length,
    revenue: bookings
      .filter(b => b.status === 'completed' || b.status === 'confirmed')
      .reduce((sum, b) => sum + b.totalPrice, 0),
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Quản lý đặt phòng</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card padding="sm">
          <div className="text-center">
            <div className="text-2xl font-bold text-[#0071c2]">{stats.total}</div>
            <div className="text-sm text-gray-600">Tổng đặt phòng</div>
          </div>
        </Card>
        <Card padding="sm">
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <div className="text-sm text-gray-600">Chờ xác nhận</div>
          </div>
        </Card>
        <Card padding="sm">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{stats.confirmed}</div>
            <div className="text-sm text-gray-600">Đã xác nhận</div>
          </div>
        </Card>
        <Card padding="sm">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.completed}</div>
            <div className="text-sm text-gray-600">Hoàn thành</div>
          </div>
        </Card>
        <Card padding="sm">
          <div className="text-center">
            <div className="text-2xl font-bold text-[#0071c2]">
              {(stats.revenue / 1000000).toFixed(0)}M
            </div>
            <div className="text-sm text-gray-600">Doanh thu</div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-wrap gap-2">
          {(['all', 'pending', 'confirmed', 'completed', 'cancelled'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === status
                  ? 'bg-[#0071c2] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status === 'all' ? 'Tất cả' : statusLabels[status]}
            </button>
          ))}
        </div>
      </Card>

      {/* Bookings List */}
      <div className="space-y-4">
        {filteredBookings.length > 0 ? (
          filteredBookings.map((booking) => (
            <Card key={booking.id} padding="none">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-lg font-bold">Mã: #{booking.id}</h3>
                      <span className={`text-sm px-3 py-1 rounded-full ${statusColors[booking.status]}`}>
                        {statusLabels[booking.status]}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Đặt ngày: {new Date(booking.bookingDate).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-[#0071c2]">
                      {booking.totalPrice.toLocaleString('vi-VN')} ₫
                    </p>
                    <p className="text-sm text-gray-600">
                      {booking.paymentStatus === 'paid' && '✓ Đã thanh toán'}
                      {booking.paymentStatus === 'pending' && '⏳ Chờ thanh toán'}
                      {booking.paymentStatus === 'refunded' && '↩ Đã hoàn tiền'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600">Loại phòng</p>
                    <p className="font-semibold">{booking.roomType}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Nhận phòng - Trả phòng</p>
                    <p className="font-semibold">
                      {new Date(booking.checkIn).toLocaleDateString('vi-VN')} - {new Date(booking.checkOut).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Số đêm / Số khách</p>
                    <p className="font-semibold">
                      {booking.nights} đêm / {booking.guests} khách
                    </p>
                  </div>
                </div>

                {booking.status === 'pending' && (
                  <div className="flex space-x-2 pt-4 border-t">
                    <Button onClick={() => handleConfirm(booking.id)}>
                      ✓ Xác nhận
                    </Button>
                    <Button variant="danger" onClick={() => handleCancel(booking.id)}>
                      ✕ Từ chối
                    </Button>
                  </div>
                )}

                {booking.status === 'confirmed' && (
                  <div className="flex space-x-2 pt-4 border-t">
                    <Button variant="outline">
                      📧 Gửi email nhắc nhở
                    </Button>
                    <Button variant="danger" onClick={() => handleCancel(booking.id)}>
                      ✕ Hủy đặt phòng
                    </Button>
                  </div>
                )}

                {booking.status === 'completed' && (
                  <div className="pt-4 border-t">
                    <Button variant="outline">
                      💬 Mời đánh giá
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          ))
        ) : (
          <Card>
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📋</div>
              <p className="text-gray-600">Không có đặt phòng nào</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
