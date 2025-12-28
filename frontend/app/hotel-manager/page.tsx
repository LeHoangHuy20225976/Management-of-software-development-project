'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HotelManagerPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to dashboard
    router.replace('/hotel-manager/dashboard');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0071c2] mx-auto mb-4"></div>
        <p className="text-gray-600">Đang chuyển hướng...</p>
      </div>
    </div>
  );
}
