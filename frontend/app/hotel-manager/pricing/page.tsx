/**
 * Hotel Pricing Management
 * FE4: Hotel Manager Portal
 */

'use client';

import { useState } from 'react';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';

// Mock pricing data
const mockPricing = {
  basePrice: 1500000,
  weekendPrice: 2000000,
  holidayPrice: 2500000,
  seasonalRates: [
    { season: 'Cao điểm (Tết, Lễ)', multiplier: 1.8, start: '01/01', end: '07/01' },
    { season: 'Mùa du lịch', multiplier: 1.3, start: '01/06', end: '31/08' },
    { season: 'Bình thường', multiplier: 1.0, start: '01/09', end: '31/12' },
  ],
};

export default function HotelPricingPage() {
  const [pricing, setPricing] = useState(mockPricing);
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Quản lý giá</h1>
        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)}>✏️ Chỉnh sửa</Button>
        ) : (
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Hủy
            </Button>
            <Button onClick={() => setIsEditing(false)}>💾 Lưu thay đổi</Button>
          </div>
        )}
      </div>

      {/* Base Pricing */}
      <Card>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Giá cơ bản</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Giá ngày thường
            </label>
            <Input
              type="number"
              value={pricing.basePrice}
              onChange={(e) =>
                setPricing({ ...pricing, basePrice: Number(e.target.value) })
              }
              disabled={!isEditing}
              suffix="₫"
            />
            <p className="text-xs text-gray-700 mt-1">Thứ 2 - Thứ 5</p>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Giá cuối tuần
            </label>
            <Input
              type="number"
              value={pricing.weekendPrice}
              onChange={(e) =>
                setPricing({ ...pricing, weekendPrice: Number(e.target.value) })
              }
              disabled={!isEditing}
              suffix="₫"
            />
            <p className="text-xs text-gray-700 mt-1">Thứ 6 - Chủ nhật</p>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Giá ngày lễ
            </label>
            <Input
              type="number"
              value={pricing.holidayPrice}
              onChange={(e) =>
                setPricing({ ...pricing, holidayPrice: Number(e.target.value) })
              }
              disabled={!isEditing}
              suffix="₫"
            />
            <p className="text-xs text-gray-700 mt-1">Ngày lễ, Tết</p>
          </div>
        </div>
      </Card>

      {/* Seasonal Rates */}
      <Card>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Giá theo mùa</h2>
        <div className="space-y-4">
          {pricing.seasonalRates.map((rate, index) => (
            <div
              key={index}
              className="p-4 border border-gray-200 rounded-lg hover:border-[#0071c2] transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-gray-900">{rate.season}</h3>
                  <p className="text-sm text-gray-800 font-medium">
                    Thời gian: {rate.start} - {rate.end}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-[#0071c2]">
                    x{rate.multiplier}
                  </div>
                  <p className="text-sm text-gray-800 font-medium">Hệ số giá</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Price Calculator */}
      <Card>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Tính giá dự kiến</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm font-semibold text-gray-900 mb-2">Phòng Standard</p>
            <p className="text-3xl font-bold text-[#0071c2]">
              {pricing.basePrice.toLocaleString('vi-VN')} ₫
            </p>
            <p className="text-xs text-gray-700 mt-1">Ngày thường</p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <p className="text-sm font-semibold text-gray-900 mb-2">Phòng Deluxe</p>
            <p className="text-3xl font-bold text-green-600">
              {(pricing.basePrice * 1.3).toLocaleString('vi-VN')} ₫
            </p>
            <p className="text-xs text-gray-700 mt-1">+30% so với Standard</p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg">
            <p className="text-sm font-semibold text-gray-900 mb-2">Phòng Suite</p>
            <p className="text-3xl font-bold text-purple-600">
              {(pricing.basePrice * 1.8).toLocaleString('vi-VN')} ₫
            </p>
            <p className="text-xs text-gray-700 mt-1">+80% so với Standard</p>
          </div>
        </div>
      </Card>

      {/* Info */}
      <Card className="bg-yellow-50 border border-yellow-200">
        <div className="flex items-start space-x-3">
          <span className="text-2xl">💡</span>
          <div>
            <h3 className="font-bold text-gray-900 mb-2">Lưu ý về giá</h3>
            <ul className="text-sm text-gray-800 space-y-1">
              <li>• Giá cuối tuần tự động áp dụng cho Thứ 6, Thứ 7, Chủ nhật</li>
              <li>• Giá ngày lễ được ưu tiên cao nhất</li>
              <li>• Hệ số mùa được nhân với giá cơ bản</li>
              <li>• Bạn có thể thiết lập khuyến mãi riêng cho từng phòng</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}

