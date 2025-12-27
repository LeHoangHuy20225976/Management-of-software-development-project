/**
 * User Layout - For authenticated user pages
 * FE3: User Dashboard
 */

'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Card } from '@/components/common/Card';
import { ROUTES } from '@/lib/routes';
import { cn } from '@/lib/utils/cn';
import { useAuth } from '@/lib/context/AuthContext';

const menuItems = [
  { name: 'Tổng quan', href: ROUTES.USER.DASHBOARD, icon: '📊' },
  { name: 'Đơn đặt phòng', href: ROUTES.USER.BOOKINGS, icon: '📋' },
  { name: 'Thông báo', href: '/user/notifications', icon: '🔔' },
  { name: 'Đánh giá của tôi', href: ROUTES.USER.REVIEWS, icon: '⭐' },
  { name: 'Mã giảm giá của tôi', href: ROUTES.USER.MY_VOUCHERS, icon: '🎟️' },
  { name: 'Thông tin cá nhân', href: ROUTES.USER.PROFILE, icon: '👤' },
];

export default function UserLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <div className="flex-grow bg-gray-50 py-8 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0071c2]"></div>
        </div>
        <Footer />
      </div>
    );
  }

  // Don't render if not authenticated
  if (!isAuthenticated || !user) {
    return null;
  }

  const displayName = user.name || 'User';
  const displayEmail = user.email || '';
  const avatarChar = displayName.charAt(0).toUpperCase();

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex-grow bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <Card padding="none">
                <div className="p-6 border-b">
                  <div className="flex items-center space-x-3">
                    {user.profile_image ? (
                      <img
                        src={user.profile_image}
                        alt={displayName}
                        className="w-16 h-16 rounded-full object-cover shadow-md"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#0071c2] to-[#005999] flex items-center justify-center text-white text-2xl font-bold shadow-md">
                        {avatarChar}
                      </div>
                    )}
                    <div>
                      <h3 className="font-bold text-gray-900">{displayName}</h3>
                      <p className="text-sm text-gray-600 font-medium">{displayEmail}</p>
                    </div>
                  </div>
                </div>
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
            <div className="lg:col-span-3">
              {children}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
