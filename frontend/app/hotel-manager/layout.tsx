'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Card } from '@/components/common/Card';
import { HotelLogo } from '@/components/hotel/HotelLogo';
import { ROUTES } from '@/lib/routes';
import { cn } from '@/lib/utils/cn';
import { useAuth } from '@/lib/context/AuthContext';

const menuItems = [
  { name: 'Dashboard', href: '/hotel-manager/dashboard', icon: '📊' },
  { name: 'Thông tin khách sạn', href: '/hotel-manager/profile', icon: '🏢' },
  { name: 'Quản lý phòng', href: '/hotel-manager/rooms', icon: '🛏️' },
  { name: 'Tiện nghi', href: '/hotel-manager/facilities', icon: '🛎️' },
  { name: 'Hình ảnh', href: '/hotel-manager/images', icon: '📷' },
  { name: 'Quản lý giá', href: '/hotel-manager/pricing', icon: '💰' },
  { name: 'Đặt phòng', href: '/hotel-manager/bookings', icon: '📋' },
  { name: 'Chấm công', href: '/hotel-manager/attendance', icon: '👤' },
  { name: 'Tin nhắn', href: '/hotel-manager/messages', icon: '💬' },
  { name: 'Đánh giá', href: '/hotel-manager/reviews', icon: '⭐' },
  { name: 'Thống kê', href: '/hotel-manager/analytics', icon: '📈' },
];

export default function HotelManagerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { logout } = useAuth();

  const handleLogout = async () => {
    if (confirm('Bạn có chắc muốn đăng xuất?')) {
      await logout();
    }
  };

  // Skip layout for login/register pages
  if (pathname?.includes('/login') || pathname?.includes('/register')) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Bar */}
      <div className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link
              href="/hotel-manager/dashboard"
              className="flex items-center space-x-3"
            >
              <HotelLogo size="md" />
              <div>
                <h1 className="text-lg font-bold text-gray-900">
                  Hotel Manager
                </h1>
                <p className="text-xs text-gray-500">VietStay Partner</p>
              </div>
            </Link>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 font-medium rounded-lg transition-colors"
            >
              Đăng xuất
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card padding="none">
              <nav className="p-4">
                {menuItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center space-x-3 px-4 py-3 rounded-lg mb-2 transition-colors',
                      pathname === item.href
                        ? 'bg-blue-50 text-[#0071c2] font-semibold'
                        : 'text-gray-700 hover:bg-gray-100'
                    )}
                  >
                    <span className="text-xl">{item.icon}</span>
                    <span>{item.name}</span>
                  </Link>
                ))}
              </nav>
            </Card>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">{children}</div>
        </div>
      </div>
    </div>
  );
}
