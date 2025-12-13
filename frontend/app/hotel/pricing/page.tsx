/**
 * Pricing Management
 * FE4: Hotel Manager Portal
 */

'use client';

import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { useState } from 'react';

interface PricingRule {
  id: string;
  roomType: string;
  startDate: string;
  endDate: string;
  price: number;
  discount?: number;
  type: 'base' | 'seasonal' | 'weekend' | 'holiday';
}

export default function PricingPage() {
  const [showAddModal, setShowAddModal] = useState(false);

  const roomTypes = [
    { id: '1', name: 'Deluxe Room', basePrice: 2000000 },
    { id: '2', name: 'Superior Room', basePrice: 1500000 },
    { id: '3', name: 'Family Suite', basePrice: 3500000 },
    { id: '4', name: 'Standard Room', basePrice: 1200000 },
  ];

  const [pricingRules, setPricingRules] = useState<PricingRule[]>([
    {
      id: '1',
      roomType: 'Deluxe Room',
      startDate: '2025-12-20',
      endDate: '2025-12-31',
      price: 3000000,
      type: 'holiday',
    },
    {
      id: '2',
      roomType: 'Superior Room',
      startDate: '2025-12-20',
      endDate: '2025-12-31',
      price: 2200000,
      type: 'holiday',
    },
    {
      id: '3',
      roomType: 'Deluxe Room',
      startDate: '2025-06-01',
      endDate: '2025-08-31',
      price: 2500000,
      type: 'seasonal',
    },
  ]);

  const [newRule, setNewRule] = useState({
    roomType: '',
    startDate: '',
    endDate: '',
    price: '',
    type: 'seasonal' as const,
  });

  const handleAddRule = (e: React.FormEvent) => {
    e.preventDefault();
    const rule: PricingRule = {
      id: Date.now().toString(),
      roomType: newRule.roomType,
      startDate: newRule.startDate,
      endDate: newRule.endDate,
      price: Number(newRule.price),
      type: newRule.type,
    };
    setPricingRules([...pricingRules, rule]);
    setShowAddModal(false);
    setNewRule({ roomType: '', startDate: '', endDate: '', price: '', type: 'seasonal' });
    alert('Đã thêm quy tắc giá mới!');
  };

  const handleDeleteRule = (id: string) => {
    if (confirm('Bạn có chắc muốn xóa quy tắc giá này?')) {
      setPricingRules(pricingRules.filter((rule) => rule.id !== id));
      alert('Đã xóa quy tắc giá!');
    }
  };

  const getTypeLabel = (type: string) => {
    const labels = {
      base: 'Giá cơ bản',
      seasonal: 'Mùa cao điểm',
      weekend: 'Cuối tuần',
      holiday: 'Lễ/Tết',
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getTypeColor = (type: string) => {
    const colors = {
      base: 'bg-gray-100 text-gray-800',
      seasonal: 'bg-yellow-100 text-yellow-800',
      weekend: 'bg-blue-100 text-blue-800',
      holiday: 'bg-red-100 text-red-800',
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Quản lý giá</h1>
        <Button onClick={() => setShowAddModal(true)}>
          ➕ Thêm quy tắc giá
        </Button>
      </div>

      {/* Base Prices */}
      <Card>
        <h2 className="text-xl font-bold mb-4">Giá cơ bản theo loại phòng</h2>
        <div className="space-y-3">
          {roomTypes.map((room) => (
            <div key={room.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <p className="font-semibold">{room.name}</p>
                <p className="text-sm text-gray-600">Giá cơ bản</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-[#0071c2]">
                  {room.basePrice.toLocaleString('vi-VN')} ₫
                </p>
                <p className="text-sm text-gray-600">/ đêm</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Special Pricing Rules */}
      <Card>
        <h2 className="text-xl font-bold mb-4">Quy tắc giá đặc biệt</h2>
        {pricingRules.length > 0 ? (
          <div className="space-y-3">
            {pricingRules.map((rule) => (
              <div key={rule.id} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="font-semibold">{rule.roomType}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full ${getTypeColor(rule.type)}`}>
                        {getTypeLabel(rule.type)}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>📅 {new Date(rule.startDate).toLocaleDateString('vi-VN')} - {new Date(rule.endDate).toLocaleDateString('vi-VN')}</p>
                      <p className="text-xl font-bold text-[#0071c2] mt-2">
                        {rule.price.toLocaleString('vi-VN')} ₫ / đêm
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="danger"
                    onClick={() => handleDeleteRule(rule.id)}
                  >
                    🗑️ Xóa
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            Chưa có quy tắc giá đặc biệt nào
          </div>
        )}
      </Card>

      {/* Pricing Tips */}
      <Card>
        <h2 className="text-xl font-bold mb-4">💡 Mẹo định giá</h2>
        <div className="space-y-2 text-sm text-gray-700">
          <p>• Tăng giá 20-30% vào cuối tuần và ngày lễ</p>
          <p>• Đặt giá cao hơn trong mùa du lịch (tháng 4-8, tháng 12)</p>
          <p>• Giảm giá 10-15% cho các ngày trong tuần để tăng lượng đặt phòng</p>
          <p>• Cập nhật giá thường xuyên dựa trên tình hình thị trường</p>
          <p>• Xem xét giá của đối thủ cạnh tranh trong khu vực</p>
        </div>
      </Card>

      {/* Add Rule Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">Thêm quy tắc giá mới</h2>
            <form onSubmit={handleAddRule} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Loại phòng *</label>
                <select
                  value={newRule.roomType}
                  onChange={(e) => setNewRule({ ...newRule, roomType: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Chọn loại phòng</option>
                  {roomTypes.map((room) => (
                    <option key={room.id} value={room.name}>
                      {room.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Loại giá *</label>
                <select
                  value={newRule.type}
                  onChange={(e) => setNewRule({ ...newRule, type: e.target.value as any })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="seasonal">Mùa cao điểm</option>
                  <option value="weekend">Cuối tuần</option>
                  <option value="holiday">Lễ/Tết</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Từ ngày *</label>
                  <Input
                    type="date"
                    value={newRule.startDate}
                    onChange={(e) => setNewRule({ ...newRule, startDate: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Đến ngày *</label>
                  <Input
                    type="date"
                    value={newRule.endDate}
                    onChange={(e) => setNewRule({ ...newRule, endDate: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Giá (VNĐ/đêm) *</label>
                <Input
                  type="number"
                  value={newRule.price}
                  onChange={(e) => setNewRule({ ...newRule, price: e.target.value })}
                  placeholder="2500000"
                  required
                />
                {newRule.price && (
                  <p className="text-sm text-gray-600 mt-2">
                    = {Number(newRule.price).toLocaleString('vi-VN')} ₫ / đêm
                  </p>
                )}
              </div>

              <div className="flex space-x-4 pt-4">
                <Button type="submit">
                  ➕ Thêm quy tắc
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddModal(false)}
                >
                  Hủy
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
