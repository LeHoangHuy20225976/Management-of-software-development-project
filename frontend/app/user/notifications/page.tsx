'use client';

import { useState, useEffect } from 'react';

interface Notification {
  id: number;
  type: 'booking' | 'payment' | 'promotion' | 'system' | 'review' | 'reminder';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  link?: string;
  data?: Record<string, unknown>;
}

const notificationIcons: Record<string, string> = {
  booking: '📋',
  payment: '💳',
  promotion: '🎁',
  system: '⚙️',
  review: '⭐',
  reminder: '⏰',
};

const notificationColors: Record<string, string> = {
  booking: 'bg-blue-100 text-blue-800',
  payment: 'bg-green-100 text-green-800',
  promotion: 'bg-purple-100 text-purple-800',
  system: 'bg-gray-100 text-gray-800',
  review: 'bg-yellow-100 text-yellow-800',
  reminder: 'bg-orange-100 text-orange-800',
};

const defaultNotifications: Notification[] = [
  {
    id: 1,
    type: 'booking',
    title: 'Đặt phòng thành công',
    message: 'Đặt phòng tại Vinpearl Resort Nha Trang đã được xác nhận. Check-in: 28/12/2024.',
    isRead: false,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    link: '/user/dashboard/bookings',
  },
  {
    id: 2,
    type: 'payment',
    title: 'Thanh toán thành công',
    message: 'Thanh toán 2,500,000₫ cho đơn đặt phòng #BK2024122601 đã hoàn tất.',
    isRead: false,
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 3,
    type: 'promotion',
    title: 'Ưu đãi đặc biệt cuối năm',
    message: 'Giảm 30% cho tất cả đặt phòng từ 25/12 - 31/12. Sử dụng mã NEWYEAR30.',
    isRead: true,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    link: '/search',
  },
  {
    id: 4,
    type: 'reminder',
    title: 'Nhắc nhở check-in',
    message: 'Bạn có lịch check-in tại Mường Thanh Luxury vào ngày mai (27/12/2024). Đừng quên mang theo CMND/CCCD.',
    isRead: true,
    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 5,
    type: 'review',
    title: 'Hãy đánh giá trải nghiệm của bạn',
    message: 'Bạn vừa hoàn thành kỳ nghỉ tại JW Marriott Phú Quốc. Chia sẻ đánh giá để nhận 50 điểm thưởng!',
    isRead: true,
    createdAt: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
    link: '/user/reviews',
  },
  {
    id: 6,
    type: 'system',
    title: 'Cập nhật chính sách bảo mật',
    message: 'Chúng tôi đã cập nhật chính sách bảo mật. Vui lòng xem lại các thay đổi mới.',
    isRead: true,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 7,
    type: 'booking',
    title: 'Đặt phòng sắp hết hạn',
    message: 'Đặt phòng #BK2024121501 chưa được thanh toán và sẽ tự động hủy sau 2 giờ nữa.',
    isRead: true,
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export default function UserNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('userNotifications');
    if (saved) {
      setNotifications(JSON.parse(saved));
    } else {
      setNotifications(defaultNotifications);
      localStorage.setItem('userNotifications', JSON.stringify(defaultNotifications));
    }
  }, []);

  const saveNotifications = (newNotifications: Notification[]) => {
    setNotifications(newNotifications);
    localStorage.setItem('userNotifications', JSON.stringify(newNotifications));
  };

  const markAsRead = (id: number) => {
    const updated = notifications.map(n => 
      n.id === id ? { ...n, isRead: true } : n
    );
    saveNotifications(updated);
  };

  const markAllAsRead = () => {
    const updated = notifications.map(n => ({ ...n, isRead: true }));
    saveNotifications(updated);
  };

  const deleteNotification = (id: number) => {
    const updated = notifications.filter(n => n.id !== id);
    saveNotifications(updated);
  };

  const clearAllRead = () => {
    if (confirm('Xóa tất cả thông báo đã đọc?')) {
      const updated = notifications.filter(n => !n.isRead);
      saveNotifications(updated);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;
    return date.toLocaleDateString('vi-VN');
  };

  const getTypeName = (type: string) => {
    const names: Record<string, string> = {
      booking: 'Đặt phòng',
      payment: 'Thanh toán',
      promotion: 'Khuyến mãi',
      system: 'Hệ thống',
      review: 'Đánh giá',
      reminder: 'Nhắc nhở',
    };
    return names[type] || type;
  };

  const filteredNotifications = notifications
    .filter(n => selectedType === 'all' || n.type === selectedType)
    .filter(n => !showUnreadOnly || !n.isRead)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const typeStats = Object.keys(notificationIcons).map(type => ({
    type,
    count: notifications.filter(n => n.type === type).length,
    unread: notifications.filter(n => n.type === type && !n.isRead).length,
  }));

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Thông báo</h1>
          <p className="text-gray-600 mt-1">
            {unreadCount > 0 ? `Bạn có ${unreadCount} thông báo chưa đọc` : 'Tất cả thông báo đã được đọc'}
          </p>
        </div>
        <div className="flex gap-2">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="px-3 py-2 text-sm border rounded-lg hover:bg-gray-50 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Đánh dấu đã đọc tất cả
            </button>
          )}
          <button
            onClick={clearAllRead}
            className="px-3 py-2 text-sm border border-red-200 text-red-600 rounded-lg hover:bg-red-50 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Xóa đã đọc
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedType('all')}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                selectedType === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Tất cả ({notifications.length})
            </button>
            {typeStats.filter(t => t.count > 0).map(({ type, count, unread }) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  selectedType === type
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span>{notificationIcons[type]}</span>
                <span>{getTypeName(type)}</span>
                <span>({count})</span>
                {unread > 0 && selectedType !== type && (
                  <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                )}
              </button>
            ))}
          </div>
          
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showUnreadOnly}
              onChange={(e) => setShowUnreadOnly(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-600">Chỉ hiện chưa đọc</span>
          </label>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
            <div className="text-6xl mb-4">🔔</div>
            <h3 className="text-lg font-medium text-gray-900">Không có thông báo nào</h3>
            <p className="text-gray-500 mt-1">
              {showUnreadOnly 
                ? 'Bạn đã đọc tất cả thông báo' 
                : 'Thông báo mới sẽ xuất hiện tại đây'}
            </p>
          </div>
        ) : (
          filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`bg-white rounded-lg shadow-sm border overflow-hidden transition-all hover:shadow-md ${
                !notification.isRead ? 'border-l-4 border-l-blue-500' : ''
              }`}
            >
              <div className="p-4">
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${notificationColors[notification.type]}`}>
                    {notificationIcons[notification.type]}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className={`font-medium ${!notification.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                          {notification.title}
                          {!notification.isRead && (
                            <span className="ml-2 inline-block w-2 h-2 bg-blue-500 rounded-full"></span>
                          )}
                        </h3>
                        <p className="text-gray-600 text-sm mt-1">{notification.message}</p>
                        
                        <div className="flex items-center gap-3 mt-2">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${notificationColors[notification.type]}`}>
                            {getTypeName(notification.type)}
                          </span>
                          <span className="text-xs text-gray-400">{formatTimeAgo(notification.createdAt)}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1">
                        {notification.link && (
                          <a
                            href={notification.link}
                            onClick={() => markAsRead(notification.id)}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                            title="Xem chi tiết"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                        )}
                        {!notification.isRead && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg"
                            title="Đánh dấu đã đọc"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </button>
                        )}
                        <button
                          onClick={() => deleteNotification(notification.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                          title="Xóa thông báo"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Notification Settings Hint */}
      <div className="mt-8 bg-gray-50 rounded-lg p-4 text-center">
        <p className="text-sm text-gray-600">
          💡 Bạn có thể quản lý cài đặt thông báo trong{' '}
          <a href="/user/dashboard/profile" className="text-blue-600 hover:underline">
            Cài đặt tài khoản
          </a>
        </p>
      </div>
    </div>
  );
}
