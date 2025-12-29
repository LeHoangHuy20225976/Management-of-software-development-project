'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/common/Card';
import { adminApi } from '@/lib/api/services';
import { formatCurrency } from '@/lib/utils/format';
import type { RevenueMetrics, AdminDashboard } from '@/types';

export default function AdminRevenuePage() {
  const [revenueData, setRevenueData] = useState<RevenueMetrics | null>(null);
  const [bookingKPIs, setBookingKPIs] = useState<AdminDashboard['bookingKPIs'] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Call through adminApi service
      const [revenue, kpis] = await Promise.all([
        adminApi.getRevenueMetrics(),
        adminApi.getBookingKPIs(),
      ]);
      
      console.log('📊 Revenue Data:', revenue);
      console.log('📈 Booking KPIs:', kpis);
      
      setRevenueData(revenue);
      setBookingKPIs(kpis);
    } catch (error) {
      console.error('Error loading revenue data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">💰 Báo cáo doanh thu</h1>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <div className="animate-pulse h-24 bg-gray-200 rounded"></div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Parse conversion rate (already a number from service)
  const conversionRate = bookingKPIs?.conversionRate || 0;
  const cancellationRate = bookingKPIs?.cancelledBookings && bookingKPIs?.totalBookings 
    ? (bookingKPIs.cancelledBookings / bookingKPIs.totalBookings) * 100
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">💰 Báo cáo doanh thu</h1>
      </div>

      {/* Revenue Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <div>
            <p className="text-green-100 text-sm">Tổng doanh thu</p>
            <p className="text-2xl font-bold mt-1">{formatCurrency(revenueData?.totalRevenue || 0)}</p>
            <p className="text-green-100 text-xs mt-2">
              {bookingKPIs?.totalBookings || 0} đơn đặt phòng
            </p>
          </div>
        </Card>
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <div>
            <p className="text-blue-100 text-sm">Giá trị TB / đơn</p>
            <p className="text-2xl font-bold mt-1">{formatCurrency(bookingKPIs?.averageBookingValue || 0)}</p>
            <p className="text-blue-100 text-xs mt-2">
              Từ {bookingKPIs?.totalBookings || 0} đơn
            </p>
          </div>
        </Card>
        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <div>
            <p className="text-purple-100 text-sm">Tỷ lệ chuyển đổi</p>
            <p className="text-2xl font-bold mt-1">{conversionRate.toFixed(1)}%</p>
            <p className="text-purple-100 text-xs mt-2">
              {bookingKPIs?.confirmedBookings || 0} / {bookingKPIs?.totalBookings || 0} đơn
            </p>
          </div>
        </Card>
        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <div>
            <p className="text-orange-100 text-sm">Tỷ lệ hủy</p>
            <p className="text-2xl font-bold mt-1">{cancellationRate.toFixed(1)}%</p>
            <p className="text-orange-100 text-xs mt-2">
              {bookingKPIs?.cancelledBookings || 0} đơn bị hủy
            </p>
          </div>
        </Card>
      </div>

      {/* Booking KPIs */}
      <Card>
        <h2 className="text-xl font-bold text-gray-900 mb-4">📊 Thống kê đặt phòng</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-3xl font-bold text-gray-900">{(bookingKPIs?.totalBookings || 0).toLocaleString()}</div>
            <div className="text-sm text-gray-600 mt-2">Tổng đơn</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-3xl font-bold text-green-600">{(bookingKPIs?.confirmedBookings || 0).toLocaleString()}</div>
            <div className="text-sm text-gray-600 mt-2">Đã xác nhận</div>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <div className="text-3xl font-bold text-yellow-600">{(bookingKPIs?.pendingBookings || 0).toLocaleString()}</div>
            <div className="text-sm text-gray-600 mt-2">Đang chờ</div>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <div className="text-3xl font-bold text-red-600">{(bookingKPIs?.cancelledBookings || 0).toLocaleString()}</div>
            <div className="text-sm text-gray-600 mt-2">Đã hủy</div>
          </div>
        </div>
      </Card>

      {/* Top Hotels by Revenue */}
      <Card>
        <h2 className="text-xl font-bold text-gray-900 mb-4">🏆 Top khách sạn theo doanh thu</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-600">Thứ hạng</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Tên khách sạn</th>
                <th className="text-right py-3 px-4 font-medium text-gray-600">Số đơn</th>
                <th className="text-right py-3 px-4 font-medium text-gray-600">Doanh thu</th>
                <th className="text-right py-3 px-4 font-medium text-gray-600">TB/đơn</th>
              </tr>
            </thead>
            <tbody>
              {(revenueData?.topHotels || []).map((hotel, index) => (
                <tr key={hotel.hotel_id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      {index === 0 && <span className="text-2xl">🥇</span>}
                      {index === 1 && <span className="text-2xl">🥈</span>}
                      {index === 2 && <span className="text-2xl">🥉</span>}
                      {index > 2 && <span className="text-gray-600 font-medium">#{index + 1}</span>}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-medium text-gray-900">{hotel.hotel_name}</div>
                  </td>
                  <td className="py-3 px-4 text-right text-gray-900">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                      {hotel.bookings.toLocaleString()}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="font-bold text-green-600">
                      {formatCurrency(hotel.revenue)}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right text-gray-900">
                    {formatCurrency(hotel.bookings > 0 ? hotel.revenue / hotel.bookings : 0)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {(!revenueData?.topHotels || revenueData.topHotels.length === 0) && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🏨</div>
              <p className="text-gray-600">Chưa có dữ liệu khách sạn</p>
            </div>
          )}
        </div>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <h3 className="text-lg font-bold text-gray-900 mb-4">💵 Phân tích doanh thu</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <span className="text-gray-600">Tổng doanh thu</span>
              <span className="font-bold text-green-600">
                {formatCurrency(revenueData?.totalRevenue || 0)}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <span className="text-gray-600">Số đơn đặt</span>
              <span className="font-bold text-blue-600">
                {(bookingKPIs?.totalBookings || 0).toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
              <span className="text-gray-600">Giá trị TB/đơn</span>
              <span className="font-bold text-purple-600">
                {formatCurrency(bookingKPIs?.averageBookingValue || 0)}
              </span>
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-bold text-gray-900 mb-4">📈 Tỷ lệ chuyển đổi</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Tỷ lệ xác nhận</span>
                <span className="font-bold text-green-600">{conversionRate.toFixed(1)}%</span>
              </div>
              <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-green-500 rounded-full transition-all duration-500" 
                  style={{ width: `${Math.min(conversionRate, 100)}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Tỷ lệ hủy</span>
                <span className="font-bold text-red-600">{cancellationRate.toFixed(1)}%</span>
              </div>
              <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-red-500 rounded-full transition-all duration-500" 
                  style={{ width: `${Math.min(cancellationRate, 100)}%` }}
                ></div>
              </div>
            </div>
            <div className="pt-2 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Đơn chờ xử lý</span>
                <span className="font-bold text-yellow-600">
                  {(bookingKPIs?.pendingBookings || 0).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-bold text-gray-900 mb-4">🏨 Thống kê lưu trú</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <span className="text-gray-600">Tổng đơn đặt</span>
              <span className="font-bold text-blue-600">
                {(bookingKPIs?.totalBookings || 0).toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
              <span className="text-gray-600">Đơn hoàn thành</span>
              <span className="font-bold text-purple-600">
                {(bookingKPIs?.completedBookings || 0).toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
              <span className="text-gray-600">Số KS hoạt động</span>
              <span className="font-bold text-orange-600">
                {(revenueData?.topHotels?.length || 0).toLocaleString()}
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
