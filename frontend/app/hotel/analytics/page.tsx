/**
 * Hotel Analytics & Statistics
 * FE4: Hotel Manager Portal
 */

'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { bookingsApi } from '@/lib/api/services';
import { formatCurrency } from '@/lib/utils/format';
import type { Booking } from '@/types';

export default function HotelAnalyticsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>(
    'month'
  );

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await bookingsApi.getAll();
        setBookings(data);
      } catch (error) {
        console.error('Error loading analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>Đang tải...</Card>
      </div>
    );
  }

  // Calculate metrics
  const totalRevenue = bookings
    .filter((b) => b.paymentStatus === 'paid')
    .reduce((sum, b) => sum + (b.total_price || 0), 0);

  const confirmedBookings = bookings.filter((b) => b.status === 'accepted');
  const completedBookings = bookings.filter((b) => b.status === 'maintained');
  const cancelledBookings = bookings.filter((b) => b.status === 'cancelled');

  const totalNights = bookings.reduce((sum, b) => sum + (b.nights || 0), 0);
  const averageBookingValue =
    bookings.length > 0 ? totalRevenue / bookings.length : 0;
  const averageStayLength =
    bookings.length > 0 ? totalNights / bookings.length : 0;

  // Room type distribution
  const roomTypeCounts = bookings.reduce((acc: Record<string, number>, b) => {
    const key = b.roomType ?? 'Unknown';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  // Monthly revenue (mock data for chart)
  const monthlyData = [
    { month: 'T1', revenue: 85000000, bookings: 12 },
    { month: 'T2', revenue: 92000000, bookings: 15 },
    { month: 'T3', revenue: 78000000, bookings: 11 },
    { month: 'T4', revenue: 105000000, bookings: 18 },
    { month: 'T5', revenue: 98000000, bookings: 16 },
    { month: 'T6', revenue: 112000000, bookings: 20 },
    { month: 'T7', revenue: 125000000, bookings: 22 },
    { month: 'T8', revenue: 118000000, bookings: 21 },
    { month: 'T9', revenue: 95000000, bookings: 17 },
    { month: 'T10', revenue: 102000000, bookings: 18 },
    { month: 'T11', revenue: 88000000, bookings: 14 },
    { month: 'T12', revenue: totalRevenue, bookings: bookings.length },
  ];

  const maxRevenue = Math.max(...monthlyData.map((d) => d.revenue));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">
          Thống kê & Phân tích
        </h1>
        <div className="flex space-x-2">
          <Button
            variant={timeRange === 'week' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setTimeRange('week')}
          >
            Tuần
          </Button>
          <Button
            variant={timeRange === 'month' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setTimeRange('month')}
          >
            Tháng
          </Button>
          <Button
            variant={timeRange === 'year' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setTimeRange('year')}
          >
            Năm
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <div className="text-center">
            <div className="text-4xl mb-2">💰</div>
            <div className="text-3xl font-bold text-[#0071c2]">
              {formatCurrency(totalRevenue).replace(' ₫', '')}
            </div>
            <div className="text-gray-600">Tổng doanh thu</div>
            <div className="text-sm text-green-600 mt-1">
              +12.5% so với tháng trước
            </div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-4xl mb-2">📋</div>
            <div className="text-3xl font-bold text-[#0071c2]">
              {bookings.length}
            </div>
            <div className="text-gray-600">Tổng đơn đặt</div>
            <div className="text-sm text-green-600 mt-1">
              +8.3% so với tháng trước
            </div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-4xl mb-2">💵</div>
            <div className="text-3xl font-bold text-[#0071c2]">
              {formatCurrency(averageBookingValue).replace(' ₫', '')}
            </div>
            <div className="text-gray-600">Giá trị TB/đơn</div>
            <div className="text-sm text-green-600 mt-1">
              +5.2% so với tháng trước
            </div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-4xl mb-2">🌙</div>
            <div className="text-3xl font-bold text-[#0071c2]">
              {averageStayLength.toFixed(1)}
            </div>
            <div className="text-gray-600">Số đêm TB</div>
            <div className="text-sm text-gray-500 mt-1">Không đổi</div>
          </div>
        </Card>
      </div>

      {/* Revenue Chart */}
      <Card>
        <h3 className="text-xl font-bold text-gray-900 mb-6">
          Doanh thu theo tháng
        </h3>
        <div className="space-y-3">
          {monthlyData.map((data) => (
            <div key={data.month}>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-semibold text-gray-700">
                  {data.month}
                </span>
                <span className="text-sm text-gray-600">
                  {formatCurrency(data.revenue)} • {data.bookings} đơn
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-500 to-[#0071c2] h-full rounded-full transition-all"
                  style={{ width: `${(data.revenue / maxRevenue) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Booking Status */}
        <Card>
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            Trạng thái đặt phòng
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">✅</span>
                <span className="font-semibold text-gray-900">Đã xác nhận</span>
              </div>
              <span className="text-2xl font-bold text-green-600">
                {confirmedBookings.length}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">🎉</span>
                <span className="font-semibold text-gray-900">Hoàn thành</span>
              </div>
              <span className="text-2xl font-bold text-blue-600">
                {completedBookings.length}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">❌</span>
                <span className="font-semibold text-gray-900">Đã hủy</span>
              </div>
              <span className="text-2xl font-bold text-red-600">
                {cancelledBookings.length}
              </span>
            </div>
            <div className="pt-3 border-t">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-900">
                  Tỷ lệ hoàn thành
                </span>
                <span className="text-xl font-bold text-[#0071c2]">
                  {bookings.length > 0
                    ? Math.round(
                        ((completedBookings.length + confirmedBookings.length) /
                          bookings.length) *
                          100
                      )
                    : 0}
                  %
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Room Type Performance */}
        <Card>
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            Hiệu suất theo loại phòng
          </h3>
          <div className="space-y-3">
            {Object.entries(roomTypeCounts)
              .sort(([, a], [, b]) => b - a)
              .map(([roomType, count]) => {
                const percentage = (count / bookings.length) * 100;
                return (
                  <div key={roomType}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-semibold text-gray-700">
                        {roomType}
                      </span>
                      <span className="text-sm text-gray-600">
                        {count} đơn ({percentage.toFixed(0)}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-[#0071c2] h-full rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </Card>
      </div>

      {/* Performance Insights */}
      <Card>
        <h3 className="text-xl font-bold text-gray-900 mb-4">
          Thông tin chi tiết
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <span className="text-3xl">📈</span>
              <div>
                <p className="font-semibold text-gray-900 mb-1">
                  Xu hướng tăng trưởng
                </p>
                <p className="text-sm text-gray-600">
                  Doanh thu và lượng booking tăng đều qua các tháng
                </p>
              </div>
            </div>
          </div>
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <span className="text-3xl">⭐</span>
              <div>
                <p className="font-semibold text-gray-900 mb-1">
                  Đánh giá tích cực
                </p>
                <p className="text-sm text-gray-600">
                  Điểm đánh giá trung bình 4.8/5 sao
                </p>
              </div>
            </div>
          </div>
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <span className="text-3xl">💡</span>
              <div>
                <p className="font-semibold text-gray-900 mb-1">
                  Cơ hội cải thiện
                </p>
                <p className="text-sm text-gray-600">
                  Tăng marketing cho phòng Standard
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
