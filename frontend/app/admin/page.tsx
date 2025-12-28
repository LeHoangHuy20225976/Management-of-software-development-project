'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/common/Card';
import { adminApi, AdminDashboard, AdminActivity, synchronizationApi } from '@/lib/api/services';
import { formatCurrency } from '@/lib/utils/format';
import Link from 'next/link';

export default function AdminDashboardPage() {
  const [dashboard, setDashboard] = useState<AdminDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncResults, setSyncResults] = useState<any[]>([]);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const data = await adminApi.getDashboard();
      setDashboard(data);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const syncAllHotels = async () => {
    setSyncing(true);
    setSyncResults([]);

    try {
      // Get all pending hotels
      const pendingHotels = await adminApi.getPendingHotels();

      if (pendingHotels.length === 0) {
        alert('Không có khách sạn nào cần đồng bộ');
        return;
      }

      const hotelIds = pendingHotels.map(h => h.hotel_id);

      // Sync all hotels
      const results = await synchronizationApi.syncMultipleHotels({
        hotel_ids: hotelIds,
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 30 days from now
      });

      setSyncResults(results);
      alert(`Đã đồng bộ ${results.filter(r => r.success).length}/${results.length} khách sạn thành công`);

      // Reload dashboard
      await loadDashboard();
    } catch (error) {
      console.error('Error syncing hotels:', error);
      alert('Lỗi khi đồng bộ: ' + (error as Error).message);
    } finally {
      setSyncing(false);
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
        <h1 className="text-3xl font-bold text-black">Dashboard</h1>
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
        <h1 className="text-3xl font-bold text-black">📊 Dashboard</h1>
        <p className="text-black font-medium">
          {new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Tổng người dùng</p>
              <p className="text-3xl font-bold mt-1">{dashboard?.totalUsers.toLocaleString()}</p>
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
              <p className="text-3xl font-bold mt-1">{dashboard?.totalBookings.toLocaleString()}</p>
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
                <p className="font-bold text-black">Khách sạn chờ duyệt</p>
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
                <p className="font-bold text-black">Quản lý người dùng</p>
                <p className="text-sm text-black">Xem, sửa, xóa tài khoản</p>
              </div>
            </div>
          </Card>
        </Link>

        <Link href="/admin/revenue">
          <Card hover className="border-l-4 border-green-500">
            <div className="flex items-center space-x-4">
              <div className="text-4xl">📈</div>
              <div>
                <p className="font-bold text-black">Báo cáo doanh thu</p>
                <p className="text-sm text-black">Thống kê chi tiết</p>
              </div>
            </div>
          </Card>
        </Link>
      </div>

      {/* Data Synchronization */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-black">🔄 Đồng bộ dữ liệu</h2>
          <button
            onClick={syncAllHotels}
            disabled={syncing}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
          >
            {syncing ? 'Đang đồng bộ...' : 'Đồng bộ tất cả'}
          </button>
        </div>

        {syncResults.length > 0 && (
          <div className="mb-4">
            <h3 className="font-medium text-black mb-2">Kết quả đồng bộ:</h3>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {syncResults.map((result, index) => (
                <div key={index} className={`text-sm p-2 rounded ${result.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                  Khách sạn {result.hotel_id}: {result.success ? '✅ Thành công' : `❌ Lỗi: ${result.error}`}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">🔄</div>
            <div className="text-sm text-black mt-2">Sync Availability</div>
            <div className="text-xs text-black">Đồng bộ tình trạng phòng</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">💰</div>
            <div className="text-sm text-black mt-2">Sync Pricing</div>
            <div className="text-xs text-black">Đồng bộ giá phòng</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">📊</div>
            <div className="text-sm text-black mt-2">Sync Status</div>
            <div className="text-xs text-black">Kiểm tra trạng thái</div>
          </div>
        </div>
      </Card>

      {/* Recent Activity */}
      <Card>
        <h2 className="text-xl font-bold text-black mb-4">🕐 Hoạt động gần đây</h2>
        <div className="space-y-4">
          {dashboard?.recentActivity.map((activity: AdminActivity) => (
            <div
              key={activity.id}
              className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg"
            >
              <div className="text-2xl">{getActivityIcon(activity.type)}</div>
              <div className="flex-1">
                <p className="font-medium text-black">{activity.description}</p>
                {activity.userName && (
                  <p className="text-sm text-black">bởi {activity.userName}</p>
                )}
              </div>
              <span className="text-sm text-black font-medium">
                {formatTimeAgo(activity.timestamp)}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
