/**
 * Room Management - Create New Room
 * FE4: Hotel Manager Portal
 */

'use client';

import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/lib/routes';

export default function CreateRoomPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    size: '',
    maxGuests: '',
    beds: '',
    basePrice: '',
    available: '',
  });

  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);

  const amenitiesList = [
    'WiFi miễn phí',
    'TV LCD',
    'Điều hòa',
    'Minibar',
    'Két sắt',
    'Bàn làm việc',
    'Phòng tắm riêng',
    'Máy sấy tóc',
    'Dép đi trong phòng',
    'Đồ vệ sinh cá nhân',
    'Tủ lạnh',
    'Ấm đun nước',
    'Ban công',
    'Tầm nhìn biển',
    'Phòng không hút thuốc',
  ];

  const handleAmenityToggle = (amenity: string) => {
    if (selectedAmenities.includes(amenity)) {
      setSelectedAmenities(selectedAmenities.filter((a) => a !== amenity));
    } else {
      setSelectedAmenities([...selectedAmenities, amenity]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Call API to create room
    alert('Đã thêm loại phòng mới thành công!');
    router.push(ROUTES.HOTEL.ROOMS);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Thêm loại phòng mới</h1>
        <Button variant="outline" onClick={() => router.back()}>
          ← Quay lại
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <h2 className="text-xl font-bold mb-4">Thông tin cơ bản</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Tên loại phòng *</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="VD: Deluxe Room, Superior Room..."
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Mô tả</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Mô tả chi tiết về loại phòng này..."
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </Card>

        {/* Room Details */}
        <Card>
          <h2 className="text-xl font-bold mb-4">Chi tiết phòng</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Diện tích (m²) *</label>
              <Input
                type="number"
                value={formData.size}
                onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                placeholder="35"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Số khách tối đa *</label>
              <Input
                type="number"
                value={formData.maxGuests}
                onChange={(e) => setFormData({ ...formData, maxGuests: e.target.value })}
                placeholder="2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Loại giường *</label>
              <Input
                value={formData.beds}
                onChange={(e) => setFormData({ ...formData, beds: e.target.value })}
                placeholder="VD: 1 King Bed, 2 Single Beds..."
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Số phòng có sẵn *</label>
              <Input
                type="number"
                value={formData.available}
                onChange={(e) => setFormData({ ...formData, available: e.target.value })}
                placeholder="10"
                required
              />
            </div>
          </div>
        </Card>

        {/* Pricing */}
        <Card>
          <h2 className="text-xl font-bold mb-4">Giá cả</h2>
          <div>
            <label className="block text-sm font-medium mb-2">Giá cơ bản (VNĐ/đêm) *</label>
            <Input
              type="number"
              value={formData.basePrice}
              onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
              placeholder="2000000"
              required
            />
            {formData.basePrice && (
              <p className="text-sm text-gray-600 mt-2">
                = {Number(formData.basePrice).toLocaleString('vi-VN')} ₫ / đêm
              </p>
            )}
          </div>
        </Card>

        {/* Amenities */}
        <Card>
          <h2 className="text-xl font-bold mb-4">Tiện nghi</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {amenitiesList.map((amenity) => (
              <label key={amenity} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedAmenities.includes(amenity)}
                  onChange={() => handleAmenityToggle(amenity)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span>{amenity}</span>
              </label>
            ))}
          </div>
          <p className="text-sm text-gray-600 mt-4">
            Đã chọn: {selectedAmenities.length} tiện nghi
          </p>
        </Card>

        {/* Images Upload */}
        <Card>
          <h2 className="text-xl font-bold mb-4">Hình ảnh</h2>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <div className="text-4xl mb-2">📷</div>
            <p className="text-gray-600 mb-2">Kéo và thả hình ảnh vào đây</p>
            <p className="text-sm text-gray-500 mb-4">hoặc</p>
            <Button type="button" variant="outline">
              Chọn file
            </Button>
            <p className="text-xs text-gray-500 mt-4">
              Chấp nhận: JPG, PNG. Tối đa 5MB mỗi ảnh.
            </p>
          </div>
        </Card>

        {/* Actions */}
        <div className="flex space-x-4">
          <Button type="submit">
            💾 Thêm loại phòng
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Hủy
          </Button>
        </div>
      </form>
    </div>
  );
}
