
'use client';

import { useState } from 'react';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Coupon } from '@/types';
import { formatDate } from '@/lib/utils/format';

const mockCoupons: Coupon[] = [
  {
    coupon_id: 1,
    id: '1',
    hotelId: '1',
    hotelName: 'Vinpearl Resort & Spa Nha Trang Bay',
    discountType: 'percentage',
    discountValue: 15,
    discount: 15,
    minOrder: 500000,
    expiryDate: '2025-12-31',
    code: 'VINPEARL15',
    description: 'Giảm 15% cho đặt phòng tại Vinpearl',
  },
  {
    coupon_id: 2,
    id: '2',
    hotelId: '2',
    hotelName: 'InterContinental Danang Sun Peninsula Resort',
    discountType: 'percentage',
    discountValue: 20,
    discount: 20,
    minOrder: 1000000,
    expiryDate: '2026-01-15',
    code: 'ICDANANG20',
    description: 'Giảm 20% cho đặt phòng tại InterContinental',
  },
  {
    coupon_id: 3,
    id: '3',
    hotelId: '3',
    hotelName: 'JW Marriott Phu Quoc Emerald Bay Resort & Spa',
    discountType: 'percentage',
    discountValue: 10,
    discount: 10,
    minOrder: 800000,
    expiryDate: '2025-11-30',
    code: 'JWPHUQUOC10',
    description: 'Giảm 10% cho đặt phòng tại JW Marriott',
  },
];

export function MyDiscountCodes() {
  const [coupons, setCoupons] = useState<Coupon[]>(mockCoupons);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    alert(`Đã sao chép mã: ${code}`);
  };

  return (
    <Card>
      <h2 className="text-2xl font-bold mb-6">Mã giảm giá của tôi</h2>
      {coupons.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-6xl mb-4">🎟️</div>
          <p className="text-gray-600">Bạn chưa có mã giảm giá nào.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {coupons.map((coupon) => (
            <div
              key={coupon.id}
              className="p-4 border border-gray-200 rounded-lg flex items-center justify-between"
            >
              <div>
                <h3 className="font-bold text-lg text-blue-600">
                  Giảm {coupon.discount}%
                </h3>
                <p className="text-gray-800 font-semibold">{coupon.hotelName}</p>
                <p className="text-sm text-gray-500 mt-1">
                  Hết hạn: {formatDate(coupon.expiryDate)}
                </p>
              </div>
              <div className="text-right">
                <Button
                  size="sm"
                  onClick={() => handleCopyCode(coupon.code)}
                  title="Sao chép mã"
                >
                  {coupon.code}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
