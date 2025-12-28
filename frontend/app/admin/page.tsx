'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';

export default function AdminPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (user && user.role === 'admin') {
        // Nếu đã đăng nhập với role admin, chuyển đến dashboard
        router.replace('/admin/dashboard');
      } else {
        // Nếu chưa đăng nhập hoặc không phải admin, chuyển đến trang đăng nhập admin
        router.replace('/admin/login');
      }
    }
  }, [user, isLoading, router]);

  // Hiển thị loading trong khi kiểm tra
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-700">
      <div className="text-white text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white mx-auto mb-4"></div>
        <p className="text-xl">Đang tải...</p>
      </div>
    </div>
  );
}
