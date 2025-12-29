'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/common/Card';
import { adminApi, AdminDashboard, AdminActivity } from '@/lib/api/services';
import { formatCurrency } from '@/lib/utils/format';
import Link from 'next/link';

export default function AdminDashboardPage() {
  const [dashboard, setDashboard] = useState<AdminDashboard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const [dashboardData, activityData] = await Promise.all([
        adminApi.getDashboard(),
        adminApi.getRecentActivity(),
      ]);
      setDashboard({
        ...dashboardData,
        recentActivity: activityData,
      });
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'booking': return '📋';
      case 'hotel': return '🏨';
      case 'user': return '👤';
      case 'payment': return '💳';
      case 'review': return '⭐';
      default: return '📝';
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const diff = Date.now() - new Date(timestamp).getTime();
    const hours = Math.floor(diff / 3600000);
    if (hours < 1) return 'Vừa xong';
    if (hours < 24) return `${hours} giờ trước`;
    return `${Math.floor(hours / 24)} ngày trước`;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
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
        <h1 className="text-3xl font-bold text-gray-900">📊 Dashboard</h1>
        <p className="text-gray-600">
          {new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Tổng người dùng</p>
              <p className="text-3xl font-bold mt-1">{(dashboard?.totalUsers || 0).toLocaleString()}</p>
            </div>
            <div className="text-5xl opacity-50">👥</div>
          </div>
          <Link href="/admin/users" className="text-blue-100 text-sm hover:underline mt-4 inline-block">
            Xem chi tiết →
          </Link>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Tổng khách sạn</p>
              <p className="text-3xl font-bold mt-1">{dashboard?.totalHotels}</p>
            </div>
            <div className="text-5xl opacity-50">🏨</div>
          </div>
          <div className="flex items-center gap-2 mt-4">
            <span className="bg-yellow-400 text-yellow-900 px-2 py-0.5 rounded text-xs font-medium">
              {dashboard?.pendingHotels} chờ duyệt
            </span>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Tổng đặt phòng</p>
              <p className="text-3xl font-bold mt-1">{(dashboard?.totalBookings || 0).toLocaleString()}</p>
            </div>
            <div className="text-5xl opacity-50">📋</div>
          </div>
          <div className="flex items-center gap-2 mt-4">
            <span className="bg-green-400 text-green-900 px-2 py-0.5 rounded text-xs font-medium">
              {dashboard?.activeBookings} đang hoạt động
            </span>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">Tổng doanh thu</p>
              <p className="text-3xl font-bold mt-1">
                {formatCurrency(dashboard?.totalRevenue || 0).replace('₫', '')}
              </p>
              <p className="text-sm text-orange-100">VNĐ</p>
            </div>
            <div className="text-5xl opacity-50">💰</div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/admin/hotels?status=pending">
          <Card hover className="border-l-4 border-yellow-500">
            <div className="flex items-center space-x-4">
              <div className="text-4xl">⏳</div>
              <div>
                <p className="font-bold text-gray-900">Khách sạn chờ duyệt</p>
                <p className="text-2xl font-bold text-yellow-600">{dashboard?.pendingHotels}</p>
              </div>
            </div>
          </Card>
        </Link>

        <Link href="/admin/users">
          <Card hover className="border-l-4 border-blue-500">
            <div className="flex items-center space-x-4">
              <div className="text-4xl">👥</div>
              <div>
                <p className="font-bold text-gray-900">Quản lý người dùng</p>
                <p className="text-sm text-gray-600">Xem, sửa, xóa tài khoản</p>
              </div>
            </div>
          </Card>
        </Link>

        <Link href="/admin/revenue">
          <Card hover className="border-l-4 border-green-500">
            <div className="flex items-center space-x-4">
              <div className="text-4xl">📈</div>
              <div>
                <p className="font-bold text-gray-900">Báo cáo doanh thu</p>
                <p className="text-sm text-gray-600">Thống kê chi tiết</p>
              </div>
            </div>
          </Card>
        </Link>
      </div>

      {/* Recent Activity */}
      <Card>
        <h2 className="text-xl font-bold text-gray-900 mb-4">🕐 Hoạt động gần đây</h2>
        <div className="space-y-4">
          {(dashboard?.recentActivity || []).map((activity: AdminActivity) => (
            <div
              key={activity.id}
              className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg"
            >
              <div className="text-2xl">{getActivityIcon(activity.type)}</div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">{activity.description}</p>
                {activity.userName && (
                  <p className="text-sm text-gray-600">bởi {activity.userName}</p>
                )}
              </div>
              <span className="text-sm text-gray-500">
                {formatTimeAgo(activity.timestamp)}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
