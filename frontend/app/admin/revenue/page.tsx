'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { adminApi } from '@/lib/api/services';
import { formatCurrency } from '@/lib/utils/format';

interface RevenueData {
  date: string;
  revenue: number;
}

interface BookingKPIs {
  totalBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  pendingBookings: number;
  averageBookingValue: number;
  occupancyRate: number;
}

export default function AdminRevenuePage() {
  const [revenueData, setRevenueData] = useState<{ daily: RevenueData[], monthly: { month: number, revenue: number }[] } | null>(null);
  const [bookingKPIs, setBookingKPIs] = useState<BookingKPIs | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'daily' | 'monthly'>('daily');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [revenue, kpis] = await Promise.all([
        adminApi.getRevenueMetrics(),
        adminApi.getBookingKPIs(),
      ]);
      setRevenueData(revenue);
      setBookingKPIs(kpis);
    } catch (error) {
      console.error('Error loading revenue data:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalRevenue = revenueData?.daily.reduce((sum, d) => sum + d.revenue, 0) || 0;
  const avgDailyRevenue = revenueData?.daily.length ? totalRevenue / revenueData.daily.length : 0;
  const maxRevenue = revenueData?.daily.reduce((max, d) => Math.max(max, d.revenue), 0) || 0;

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-black">Báo cáo doanh thu</h1>
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-black">💰 Báo cáo doanh thu</h1>
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'daily' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setViewMode('daily')}
          >
            Theo ngày
          </Button>
          <Button
            variant={viewMode === 'monthly' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setViewMode('monthly')}
          >
            Theo tháng
          </Button>
        </div>
      </div>

      {/* Revenue Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <div>
            <p className="text-green-100 text-sm">Tổng doanh thu (30 ngày)</p>
            <p className="text-2xl font-bold mt-1">{formatCurrency(totalRevenue)}</p>
          </div>
        </Card>
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <div>
            <p className="text-blue-100 text-sm">Trung bình / ngày</p>
            <p className="text-2xl font-bold mt-1">{formatCurrency(avgDailyRevenue)}</p>
          </div>
        </Card>
        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <div>
            <p className="text-purple-100 text-sm">Cao nhất</p>
            <p className="text-2xl font-bold mt-1">{formatCurrency(maxRevenue)}</p>
          </div>
        </Card>
        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <div>
            <p className="text-orange-100 text-sm">Giá trị TB / đơn</p>
            <p className="text-2xl font-bold mt-1">{formatCurrency(bookingKPIs?.averageBookingValue || 0)}</p>
          </div>
        </Card>
      </div>

      {/* Booking KPIs */}
      <Card>
        <h2 className="text-xl font-bold text-black mb-4">📊 Thống kê đặt phòng</h2>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-3xl font-bold text-black">{bookingKPIs?.totalBookings.toLocaleString()}</div>
            <div className="text-sm text-black font-medium">Tổng đơn</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-3xl font-bold text-green-600">{bookingKPIs?.completedBookings.toLocaleString()}</div>
            <div className="text-sm text-black font-medium">Hoàn thành</div>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <div className="text-3xl font-bold text-yellow-600">{bookingKPIs?.pendingBookings.toLocaleString()}</div>
            <div className="text-sm text-black font-medium">Đang xử lý</div>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <div className="text-3xl font-bold text-red-600">{bookingKPIs?.cancelledBookings.toLocaleString()}</div>
            <div className="text-sm text-black font-medium">Đã hủy</div>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-3xl font-bold text-blue-600">{bookingKPIs?.occupancyRate}%</div>
            <div className="text-sm text-black font-medium">Tỷ lệ lấp đầy</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-3xl font-bold text-purple-600">
              {bookingKPIs ? Math.round((bookingKPIs.completedBookings / bookingKPIs.totalBookings) * 100) : 0}%
            </div>
            <div className="text-sm text-black font-medium">Tỷ lệ thành công</div>
          </div>
        </div>
      </Card>

      {/* Revenue Chart (Simple Bar Chart) */}
      <Card>
        <h2 className="text-xl font-bold text-black mb-4">
          📈 Biểu đồ doanh thu {viewMode === 'daily' ? '(30 ngày gần nhất)' : '(12 tháng)'}
        </h2>
        
        {viewMode === 'daily' ? (
          <div className="space-y-2">
            {revenueData?.daily.slice(-15).map((day) => {
              const percentage = maxRevenue > 0 ? (day.revenue / maxRevenue) * 100 : 0;
              return (
                <div key={day.date} className="flex items-center gap-4">
                  <div className="w-20 text-sm text-black font-medium">
                    {new Date(day.date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
                  </div>
                  <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <div className="w-32 text-right text-sm font-medium text-black">
                    {formatCurrency(day.revenue).replace('₫', '')}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-2">
            {revenueData?.monthly.map((month) => {
              const maxMonthly = revenueData.monthly.reduce((max, m) => Math.max(max, m.revenue), 0);
              const percentage = maxMonthly > 0 ? (month.revenue / maxMonthly) * 100 : 0;
              const monthNames = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'];
              return (
                <div key={month.month} className="flex items-center gap-4">
                  <div className="w-20 text-sm text-black font-semibold">
                    {monthNames[month.month - 1]}
                  </div>
                  <div className="flex-1 bg-gray-100 rounded-full h-8 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <div className="w-36 text-right text-sm font-medium text-black">
                    {formatCurrency(month.revenue).replace('₫', '')}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Quick Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-lg font-bold text-black mb-4">🎯 Mục tiêu tháng này</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-black font-medium">Doanh thu</span>
                <span className="font-semibold text-black">75%</span>
              </div>
              <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full" style={{ width: '75%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-black font-medium">Số đơn đặt</span>
                <span className="font-semibold text-black">82%</span>
              </div>
              <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: '82%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-black font-medium">Tỷ lệ lấp đầy</span>
                <span className="font-medium">78%</span>
              </div>
              <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-purple-500 rounded-full" style={{ width: '78%' }}></div>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-bold text-black mb-4">📋 Tóm tắt nhanh</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-black font-medium">Doanh thu hôm nay</span>
              <span className="font-bold text-green-600">
                {formatCurrency(revenueData?.daily[revenueData.daily.length - 1]?.revenue || 0)}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-black font-medium">Doanh thu hôm qua</span>
              <span className="font-bold text-black">
                {formatCurrency(revenueData?.daily[revenueData.daily.length - 2]?.revenue || 0)}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-black font-medium">So với hôm qua</span>
              <span className="font-bold text-green-600">+12%</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
