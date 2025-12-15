/**
 * Room Management - Edit Room
 * FE4: Hotel Manager Portal
 */

'use client';

import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/lib/routes';

export default function EditRoomPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();

  // Mock data - in real app, fetch from API based on resolvedParams.id
  const [formData, setFormData] = useState({
    name: 'Deluxe Room',
    description: 'Phòng cao cấp với đầy đủ tiện nghi hiện đại',
    size: '35',
    maxGuests: '2',
    beds: '1 King Bed',
    basePrice: '2000000',
    available: '5',
  });

  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([
    'WiFi miễn phí',
    'TV LCD',
    'Điều hòa',
    'Minibar',
  ]);

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
    // TODO: Call API to update room
    alert('Đã cập nhật loại phòng thành công!');
    router.push(ROUTES.HOTEL.ROOMS);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Chỉnh sửa loại phòng</h1>
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
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Số khách tối đa *</label>
              <Input
                type="number"
                value={formData.maxGuests}
                onChange={(e) => setFormData({ ...formData, maxGuests: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Loại giường *</label>
              <Input
                value={formData.beds}
                onChange={(e) => setFormData({ ...formData, beds: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Số phòng có sẵn *</label>
              <Input
                type="number"
                value={formData.available}
                onChange={(e) => setFormData({ ...formData, available: e.target.value })}
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

        {/* Images */}
        <Card>
          <h2 className="text-xl font-bold mb-4">Hình ảnh</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="relative">
                <img
                  src={`https://images.unsplash.com/photo-161189244050${i}-42a792e24d32?w=400`}
                  alt={`Room ${i}`}
                  className="w-full h-32 object-cover rounded-lg"
                />
                <button
                  type="button"
                  className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
          <Button type="button" variant="outline">
            ➕ Thêm ảnh
          </Button>
        </Card>

        {/* Actions */}
        <div className="flex space-x-4">
          <Button type="submit">
            💾 Lưu thay đổi
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Hủy
          </Button>
        </div>
      </form>
    </div>
  );
}
