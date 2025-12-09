/**
 * Analytics & Statistics for Hotel Owners
 * FE4: Hotel Manager Portal
 */

'use client';

import { Card } from '@/components/common/Card';
import { useState } from 'react';

export default function HotelAnalyticsPage() {
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month');

  // Mock data
  const stats = {
    revenue: {
      current: 450000000,
      previous: 420000000,
      change: 7.1,
    },
    bookings: {
      current: 156,
      previous: 142,
      change: 9.9,
    },
    occupancy: {
      current: 82,
      previous: 78,
      change: 5.1,
    },
    avgRating: {
      current: 4.7,
      previous: 4.5,
      change: 4.4,
    },
  };

  const revenueByMonth = [
    { month: 'T6', revenue: 380 },
    { month: 'T7', revenue: 420 },
    { month: 'T8', revenue: 450 },
    { month: 'T9', revenue: 390 },
    { month: 'T10', revenue: 410 },
    { month: 'T11', revenue: 450 },
  ];

  const topRooms = [
    { name: 'Deluxe Room', bookings: 45, revenue: 90000000 },
    { name: 'Family Suite', bookings: 28, revenue: 98000000 },
    { name: 'Superior Room', bookings: 52, revenue: 78000000 },
    { name: 'Standard Room', bookings: 31, revenue: 37200000 },
  ];

  const bookingsBySource = [
    { source: 'Website trực tiếp', count: 62, percentage: 40 },
    { source: 'Booking.com', count: 47, percentage: 30 },
    { source: 'Agoda', count: 31, percentage: 20 },
    { source: 'Khác', count: 16, percentage: 10 },
  ];

  const occupancyTrend = [
    { day: 'T2', rate: 75 },
    { day: 'T3', rate: 78 },
    { day: 'T4', rate: 82 },
    { day: 'T5', rate: 85 },
    { day: 'T6', rate: 90 },
    { day: 'T7', rate: 95 },
    { day: 'CN', rate: 92 },
  ];

  const maxRevenue = Math.max(...revenueByMonth.map(m => m.revenue));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Thống kê & Phân tích</h1>

        {/* Period Selector */}
        <div className="flex space-x-2">
          {(['week', 'month', 'year'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                period === p
                  ? 'bg-[#0071c2] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {p === 'week' && 'Tuần'}
              {p === 'month' && 'Tháng'}
              {p === 'year' && 'Năm'}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <div className="flex items-start justify-between mb-2">
            <div className="text-4xl">💰</div>
            <div className={`text-sm px-2 py-1 rounded-full ${
              stats.revenue.change > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {stats.revenue.change > 0 ? '↑' : '↓'} {Math.abs(stats.revenue.change)}%
            </div>
          </div>
          <div className="text-2xl font-bold text-[#0071c2] mb-1">
            {(stats.revenue.current / 1000000).toFixed(0)}M ₫
          </div>
          <div className="text-sm text-gray-600">Doanh thu</div>
        </Card>

        <Card>
          <div className="flex items-start justify-between mb-2">
            <div className="text-4xl">📋</div>
            <div className={`text-sm px-2 py-1 rounded-full ${
              stats.bookings.change > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {stats.bookings.change > 0 ? '↑' : '↓'} {Math.abs(stats.bookings.change)}%
            </div>
          </div>
          <div className="text-2xl font-bold text-[#0071c2] mb-1">
            {stats.bookings.current}
          </div>
          <div className="text-sm text-gray-600">Đặt phòng</div>
        </Card>

        <Card>
          <div className="flex items-start justify-between mb-2">
            <div className="text-4xl">🏨</div>
            <div className={`text-sm px-2 py-1 rounded-full ${
              stats.occupancy.change > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {stats.occupancy.change > 0 ? '↑' : '↓'} {Math.abs(stats.occupancy.change)}%
            </div>
          </div>
          <div className="text-2xl font-bold text-[#0071c2] mb-1">
            {stats.occupancy.current}%
          </div>
          <div className="text-sm text-gray-600">Tỷ lệ lấp đầy</div>
        </Card>

        <Card>
          <div className="flex items-start justify-between mb-2">
            <div className="text-4xl">⭐</div>
            <div className={`text-sm px-2 py-1 rounded-full ${
              stats.avgRating.change > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {stats.avgRating.change > 0 ? '↑' : '↓'} {Math.abs(stats.avgRating.change)}%
            </div>
          </div>
          <div className="text-2xl font-bold text-[#0071c2] mb-1">
            {stats.avgRating.current}
          </div>
          <div className="text-sm text-gray-600">Đánh giá TB</div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <Card>
          <h2 className="text-xl font-bold mb-4">Doanh thu 6 tháng gần đây</h2>
          <div className="space-y-3">
            {revenueByMonth.map((item) => (
              <div key={item.month} className="flex items-center space-x-3">
                <div className="w-12 text-sm font-medium">{item.month}</div>
                <div className="flex-1">
                  <div className="bg-gray-200 rounded-full h-8 relative overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-full flex items-center justify-end pr-3 rounded-full transition-all"
                      style={{ width: `${(item.revenue / maxRevenue) * 100}%` }}
                    >
                      <span className="text-white text-xs font-medium">
                        {item.revenue}M
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Occupancy Trend */}
        <Card>
          <h2 className="text-xl font-bold mb-4">Tỷ lệ lấp đầy theo ngày</h2>
          <div className="space-y-3">
            {occupancyTrend.map((item) => (
              <div key={item.day} className="flex items-center space-x-3">
                <div className="w-12 text-sm font-medium">{item.day}</div>
                <div className="flex-1">
                  <div className="bg-gray-200 rounded-full h-8 relative overflow-hidden">
                    <div
                      className={`h-full flex items-center justify-end pr-3 rounded-full transition-all ${
                        item.rate >= 90
                          ? 'bg-gradient-to-r from-green-500 to-green-600'
                          : item.rate >= 75
                          ? 'bg-gradient-to-r from-blue-500 to-blue-600'
                          : 'bg-gradient-to-r from-yellow-500 to-yellow-600'
                      }`}
                      style={{ width: `${item.rate}%` }}
                    >
                      <span className="text-white text-xs font-medium">
                        {item.rate}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performing Rooms */}
        <Card>
          <h2 className="text-xl font-bold mb-4">Top phòng theo doanh thu</h2>
          <div className="space-y-3">
            {topRooms.map((room, index) => (
              <div key={room.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                    index === 0 ? 'bg-yellow-100 text-yellow-800' :
                    index === 1 ? 'bg-gray-100 text-gray-800' :
                    index === 2 ? 'bg-orange-100 text-orange-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    #{index + 1}
                  </div>
                  <div>
                    <p className="font-semibold">{room.name}</p>
                    <p className="text-sm text-gray-600">{room.bookings} đặt phòng</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-[#0071c2]">
                    {(room.revenue / 1000000).toFixed(0)}M ₫
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Bookings by Source */}
        <Card>
          <h2 className="text-xl font-bold mb-4">Nguồn đặt phòng</h2>
          <div className="space-y-4">
            {bookingsBySource.map((source) => (
              <div key={source.source}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">{source.source}</span>
                  <span className="text-sm text-gray-600">
                    {source.count} ({source.percentage}%)
                  </span>
                </div>
                <div className="bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-[#0071c2] h-2 rounded-full transition-all"
                    style={{ width: `${source.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-900">
              💡 <strong>Mẹo:</strong> Website trực tiếp chiếm tỷ trọng cao nhất.
              Hãy tối ưu SEO và marketing để tăng đặt phòng trực tiếp, giảm phí hoa hồng cho OTA.
            </p>
          </div>
        </Card>
      </div>

      {/* Additional Insights */}
      <Card>
        <h2 className="text-xl font-bold mb-4">📊 Thông tin chi tiết</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="border-l-4 border-green-500 pl-4">
            <p className="text-sm text-gray-600 mb-1">Thời gian đặt trước TB</p>
            <p className="text-2xl font-bold text-green-600">18 ngày</p>
            <p className="text-xs text-gray-500 mt-1">↑ 2 ngày so với tháng trước</p>
          </div>
          <div className="border-l-4 border-blue-500 pl-4">
            <p className="text-sm text-gray-600 mb-1">Thời gian lưu trú TB</p>
            <p className="text-2xl font-bold text-blue-600">2.8 đêm</p>
            <p className="text-xs text-gray-500 mt-1">↑ 0.3 đêm so với tháng trước</p>
          </div>
          <div className="border-l-4 border-purple-500 pl-4">
            <p className="text-sm text-gray-600 mb-1">Tỷ lệ khách quay lại</p>
            <p className="text-2xl font-bold text-purple-600">23%</p>
            <p className="text-xs text-gray-500 mt-1">↑ 3% so với tháng trước</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
