/**
 * User Vouchers Page
 * FE: User Dashboard - My Vouchers
 */

'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import Link from 'next/link';
import { getMockCoupons } from '@/lib/utils/mockData';
import type { Coupon } from '@/types';
import { cn } from '@/lib/utils/cn';

export default function UserVouchersPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [filter, setFilter] = useState<'all' | 'active' | 'expired'>('all');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    // In a real app, you'd fetch this from an API
    const mockCoupons = getMockCoupons();
    setCoupons(mockCoupons);
  }, []);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000); // Hide message after 2s
  };

  const today = new Date();
  const filteredCoupons = coupons.filter((coupon) => {
    const expiryDate = new Date(coupon.expiryDate);
    if (filter === 'active') return expiryDate >= today;
    if (filter === 'expired') return expiryDate < today;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">
          Mã giảm giá của tôi
        </h1>
        <Link href="/search">
          <Button>🎟️ Tìm thêm mã</Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-6">
        <Card>
          <div className="text-center">
            <div className="text-4xl mb-2">🎟️</div>
            <div className="text-3xl font-bold text-[#0071c2]">
              {coupons.length}
            </div>
            <div className="text-sm font-medium text-gray-700">Tổng mã</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-4xl mb-2">✅</div>
            <div className="text-3xl font-bold text-green-600">
              {coupons.filter((c) => new Date(c.expiryDate) >= today).length}
            </div>
            <div className="text-sm font-medium text-gray-700">Còn hạn</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-4xl mb-2">❌</div>
            <div className="text-3xl font-bold text-red-600">
              {coupons.filter((c) => new Date(c.expiryDate) < today).length}
            </div>
            <div className="text-sm font-medium text-gray-700">Hết hạn</div>
          </div>
        </Card>
      </div>

      {/* Filter */}
      <Card>
        <div className="flex flex-wrap gap-3">
          <Button
            variant={filter === 'all' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            Tất cả ({coupons.length})
          </Button>
          <Button
            variant={filter === 'active' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setFilter('active')}
          >
            Còn hạn (
            {coupons.filter((c) => new Date(c.expiryDate) >= today).length})
          </Button>
          <Button
            variant={filter === 'expired' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setFilter('expired')}
          >
            Hết hạn (
            {coupons.filter((c) => new Date(c.expiryDate) < today).length})
          </Button>
        </div>
      </Card>

      {/* Vouchers List */}
      {filteredCoupons.length === 0 ? (
        <Card className="text-center py-12">
          <div className="text-6xl mb-4">🎟️</div>
          <p className="text-gray-700 font-medium mb-4">
            Bạn chưa có mã giảm giá nào.
          </p>
          <Button>
            <Link href="/search">Tìm khách sạn và nhận mã ngay!</Link>
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredCoupons.map((coupon) => {
            const isExpired = new Date(coupon.expiryDate) < today;
            return (
              <Card
                key={coupon.id}
                className={cn(
                  'flex flex-col justify-between',
                  isExpired && 'opacity-60 bg-gray-50'
                )}
              >
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div className="bg-blue-100 text-blue-800 text-lg font-bold rounded-full px-4 py-1">
                      Giảm {coupon.discount}%
                    </div>
                    <Link href={`/hotel/${coupon.hotelId}`}>
                      <span className="text-sm font-semibold text-[#0071c2] hover:underline">
                        {coupon.hotelName}
                      </span>
                    </Link>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    Áp dụng tại:{' '}
                    <span className="font-semibold text-gray-800">
                      {coupon.hotelName}
                    </span>
                  </p>
                  <div className="mb-4">
                    <p className="text-sm text-gray-500 mb-1">Mã của bạn:</p>
                    <div className="relative flex items-center justify-between p-3 border-2 border-dashed rounded-lg bg-gray-50">
                      <span className="font-mono text-lg font-bold text-gray-800 tracking-wider">
                        {coupon.code}
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCopyCode(coupon.code)}
                      >
                        {copiedCode === coupon.code
                          ? 'Đã sao chép!'
                          : 'Sao chép'}
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="text-sm text-center font-medium text-gray-600 border-t pt-3 mt-4">
                  <span>Hạn sử dụng: </span>
                  <span
                    className={cn(
                      isExpired ? 'text-red-600' : 'text-green-600',
                      'font-bold'
                    )}
                  >
                    {new Date(coupon.expiryDate).toLocaleDateString('vi-VN')}
                  </span>
                  {isExpired && <span className="ml-2">(Đã hết hạn)</span>}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
