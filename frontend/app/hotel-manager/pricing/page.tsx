'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { formatCurrency } from '@/lib/utils/format';
import { hotelManagerApi } from '@/lib/api/services';

export default function HotelPricingPage() {
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [pricing, setPricing] = useState({
    basePrice: 1500000,
    weekendPrice: 2000000,
    holidayPrice: 2500000,
    seasonalRates: [] as Array<{ season: string; multiplier: number; start: string; end: string }>,
  });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    loadPricing();
  }, []);

  const loadPricing = async () => {
    try {
      const hotelId = 'h1';
      const data = await hotelManagerApi.getPricing(hotelId);
      setPricing(data as typeof pricing);
    } catch (error) {
      console.error('Error loading pricing:', error);
      alert('Có lỗi khi tải thông tin giá!');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const hotelId = 'h1';
      await hotelManagerApi.updatePricing(hotelId, pricing);
      alert('✅ Cập nhật giá thành công!');
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving pricing:', error);
      alert('❌ Có lỗi khi lưu thông tin giá!');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    loadPricing(); // Reload to reset changes
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <div className="text-center py-8">
            <p className="text-gray-900 font-medium">⏳ Đang tải thông tin giá...</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Quản lý giá</h1>
        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)}>✏️ Chỉnh sửa</Button>
        ) : (
          <div className="flex space-x-2">
            <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
              Hủy
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? '⏳ Đang lưu...' : '💾 Lưu thay đổi'}
            </Button>
          </div>
        )}
      </div>

      {/* Base Pricing */}
      <Card>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Giá cơ bản</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Ngày thường (T2-T5)
            </label>
            {isEditing ? (
              <Input
                type="number"
                value={pricing.basePrice}
                onChange={(e) =>
                  setPricing({ ...pricing, basePrice: Number(e.target.value) })
                }
                className="w-full"
              />
            ) : (
              <div className="text-2xl font-bold text-[#0071c2]">
                {formatCurrency(pricing.basePrice)}
              </div>
            )}
            <p className="text-sm text-gray-700 mt-1">Giá tiêu chuẩn cho ngày thường</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Cuối tuần (T6-CN)
            </label>
            {isEditing ? (
              <Input
                type="number"
                value={pricing.weekendPrice}
                onChange={(e) =>
                  setPricing({ ...pricing, weekendPrice: Number(e.target.value) })
                }
                className="w-full"
              />
            ) : (
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(pricing.weekendPrice)}
              </div>
            )}
            <p className="text-sm text-gray-700 mt-1">
              Tăng {Math.round((pricing.weekendPrice / pricing.basePrice - 1) * 100)}% so với
              ngày thường
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Ngày lễ
            </label>
            {isEditing ? (
              <Input
                type="number"
                value={pricing.holidayPrice}
                onChange={(e) =>
                  setPricing({ ...pricing, holidayPrice: Number(e.target.value) })
                }
                className="w-full"
              />
            ) : (
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(pricing.holidayPrice)}
              </div>
            )}
            <p className="text-sm text-gray-700 mt-1">
              Tăng {Math.round((pricing.holidayPrice / pricing.basePrice - 1) * 100)}% so với
              ngày thường
            </p>
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
              className="flex flex-col md:flex-row md:items-center justify-between p-4 border border-gray-200 rounded-lg"
            >
              <div className="flex-1 mb-3 md:mb-0">
                <h3 className="font-semibold text-gray-900">{rate.season}</h3>
                <p className="text-sm text-gray-700">
                  {rate.start} - {rate.end}
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-sm text-gray-700">Hệ số nhân</p>
                  {isEditing ? (
                    <Input
                      type="number"
                      step="0.1"
                      value={rate.multiplier}
                      onChange={(e) => {
                        const updated = [...pricing.seasonalRates];
                        updated[index].multiplier = Number(e.target.value);
                        setPricing({ ...pricing, seasonalRates: updated });
                      }}
                      className="w-20"
                    />
                  ) : (
                    <p className="text-xl font-bold text-[#0071c2]">
                      x{rate.multiplier}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-700">Giá ước tính</p>
                  <p className="text-lg font-bold text-gray-900">
                    {formatCurrency(pricing.basePrice * rate.multiplier)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Price Calculator */}
      <Card>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Tính giá nhanh</h2>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Loại ngày
              </label>
              <select className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900">
                <option>Ngày thường</option>
                <option>Cuối tuần</option>
                <option>Ngày lễ</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Số đêm
              </label>
              <Input type="number" defaultValue={1} min={1} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Hệ số mùa
              </label>
              <select className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900">
                <option value="1.0">Bình thường (x1.0)</option>
                <option value="1.3">Mùa du lịch (x1.3)</option>
                <option value="1.8">Cao điểm (x1.8)</option>
              </select>
            </div>
          </div>
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-gray-800 font-medium mb-1">Tổng giá dự kiến:</p>
            <p className="text-3xl font-bold text-[#0071c2]">
              {formatCurrency(pricing.basePrice)}
            </p>
          </div>
        </div>
      </Card>

      {/* Tips */}
      <Card className="bg-gradient-to-br from-yellow-50 to-white border border-yellow-200">
        <h3 className="text-lg font-bold text-gray-900 mb-3">💡 Mẹo định giá</h3>
        <ul className="text-sm text-gray-800 space-y-2">
          <li className="flex items-start gap-2">
            <span className="text-yellow-600 mt-0.5">★</span>
            <span>
              Cập nhật giá thường xuyên dựa trên tỷ lệ lấp đầy và cạnh tranh thị trường
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-yellow-600 mt-0.5">★</span>
            <span>
              Tăng giá vào mùa cao điểm (Tết, Hè) để tối ưu doanh thu
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-yellow-600 mt-0.5">★</span>
            <span>
              Giảm giá nhẹ vào mùa thấp điểm để duy trì tỷ lệ lấp đầy
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-yellow-600 mt-0.5">★</span>
            <span>
              Theo dõi phản hồi khách hàng về giá cả để điều chỉnh hợp lý
            </span>
          </li>
        </ul>
      </Card>
    </div>
  );
}
