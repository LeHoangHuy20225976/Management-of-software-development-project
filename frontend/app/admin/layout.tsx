'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const adminNav = [
  { href: '/admin', label: 'Dashboard', icon: '📊' },
  { href: '/admin/users', label: 'Quản lý người dùng', icon: '👥' },
  { href: '/admin/hotels', label: 'Quản lý khách sạn', icon: '🏨' },
  { href: '/admin/destinations', label: 'Điểm đến du lịch', icon: '🗺️' },
  { href: '/admin/bookings', label: 'Đặt phòng', icon: '📋' },
  { href: '/admin/revenue', label: 'Doanh thu', icon: '💰' },
  { href: '/admin/settings', label: 'Cài đặt', icon: '⚙️' },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-gray-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/admin" className="text-xl font-bold">
                🔐 Admin Panel
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-300">Super Admin</span>
              <Link
                href="/"
                className="text-sm text-gray-300 hover:text-white"
              >
                ← Về trang chủ
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-gray-800 min-h-[calc(100vh-64px)]">
          <nav className="p-4 space-y-2">
            {adminNav.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== '/admin' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}
