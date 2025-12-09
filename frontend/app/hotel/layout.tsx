/**
 * Hotel Manager Layout
 * FE4: Hotel Manager Portal
 */

'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Card } from '@/components/common/Card';
import { HotelLogo } from '@/components/hotel/HotelLogo';
import { ROUTES } from '@/lib/routes';
import { cn } from '@/lib/utils/cn';

const menuItems = [
  { name: 'Dashboard', href: ROUTES.HOTEL.DASHBOARD, icon: '📊' },
  { name: 'Thông tin khách sạn', href: ROUTES.HOTEL.PROFILE, icon: '🏢' },
  { name: 'Quản lý phòng', href: ROUTES.HOTEL.ROOMS, icon: '🛏️' },
  { name: 'Quản lý giá', href: ROUTES.HOTEL.PRICING, icon: '💰' },
  { name: 'Đặt phòng', href: ROUTES.HOTEL.BOOKINGS, icon: '📋' },
  { name: 'Đánh giá', href: ROUTES.HOTEL.REVIEWS, icon: '⭐' },
  { name: 'Thống kê', href: ROUTES.HOTEL.ANALYTICS, icon: '📈' },
];

export default function HotelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    if (confirm('Bạn có chắc muốn đăng xuất?')) {
      localStorage.removeItem('hotel_auth_token');
      localStorage.removeItem('hotelManager');
      router.push(ROUTES.HOTEL.LOGIN);
    }
  };

  // Skip layout for login/register pages and hotel detail pages ([slug])
  if (
    pathname?.includes('/login') ||
    pathname?.includes('/register') ||
    pathname?.match(/^\/hotel\/[^/]+$/) // matches /hotel/[slug] but not /hotel/dashboard
  ) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Bar */}
      <div className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link
              href={ROUTES.HOTEL.DASHBOARD}
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
