'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { hotelManagerApi } from '@/lib/api/services';
import type { RoomType } from '@/types';

export default function EditRoomPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    price: 0,
    size: 25,
    beds: '',
    maxGuests: 2,
    description: '',
    amenities: [] as string[],
  });

  useEffect(() => {
    const loadRoom = async () => {
      try {
        const hotelId = 'h1';
        const rooms = await hotelManagerApi.getRooms(hotelId);
        const room = rooms.find((r) => r.id === resolvedParams.id);

        if (room) {
          setFormData({
            name: room.name,
            price: room.basePrice,
            size: room.size,
            beds: room.beds,
            maxGuests: room.maxGuests,
            description: room.description || '',
            amenities: room.amenities,
          });
        } else {
          alert('Không tìm thấy phòng!');
          router.push('/hotel-manager/rooms');
        }
      } catch (error) {
        console.error('Error loading room:', error);
        alert('Có lỗi khi tải thông tin phòng!');
      } finally {
        setLoading(false);
      }
    };

    loadRoom();
  }, [resolvedParams.id, router]);

  const availableAmenities = [
    'WiFi miễn phí',
    'TV màn hình phẳng',
    'Minibar',
    'Điều hòa',
    'Ban công',
    'Bồn tắm',
    'Máy sấy tóc',
    'Két an toàn',
    'Phòng khách riêng',
    'Bàn làm việc',
    'Máy pha cà phê',
    'Tủ lạnh',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || formData.price <= 0) {
      alert('Vui lòng điền đầy đủ thông tin bắt buộc!');
      return;
    }

    setIsSubmitting(true);
    try {
      const updates = {
        name: formData.name,
        basePrice: formData.price,
        size: formData.size,
        beds: formData.beds,
        maxGuests: formData.maxGuests,
        description: formData.description,
        amenities: formData.amenities,
      };

      await hotelManagerApi.updateRoom(resolvedParams.id, updates);

      alert('✅ Cập nhật loại phòng thành công!');
      router.push('/hotel-manager/rooms');
    } catch (error) {
      console.error('Error updating room:', error);
      alert('❌ Có lỗi xảy ra. Vui lòng thử lại!');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleAmenity = (amenity: string) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <div className="text-center py-8">
            <p className="text-gray-900 font-medium">
              ⏳ Đang tải thông tin phòng...
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Chỉnh sửa loại phòng
          </h1>
          <p className="text-gray-800 mt-1">
            Cập nhật thông tin loại phòng #{resolvedParams.id}
          </p>
        </div>
        <Link href="/hotel-manager/rooms">
          <Button variant="outline">← Quay lại</Button>
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <Card>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Thông tin cơ bản
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Tên phòng *
              </label>
              <Input
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="VD: Phòng Deluxe"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Giá mỗi đêm (VNĐ) *
                </label>
                <Input
                  type="number"
                  required
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: Number(e.target.value) })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Diện tích (m²) *
                </label>
                <Input
                  type="number"
                  required
                  value={formData.size}
                  onChange={(e) =>
                    setFormData({ ...formData, size: Number(e.target.value) })
                  }
                  placeholder="35"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Số khách tối đa *
                </label>
                <select
                  value={formData.maxGuests}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      maxGuests: Number(e.target.value),
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0071c2] focus:border-[#0071c2] text-gray-900"
                >
                  {[1, 2, 3, 4, 5, 6].map((n) => (
                    <option key={n} value={n}>
                      {n} người
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Loại giường *
              </label>
              <Input
                required
                value={formData.beds}
                onChange={(e) =>
                  setFormData({ ...formData, beds: e.target.value })
                }
                placeholder="VD: 1 giường king"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Mô tả
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={4}
                placeholder="Mô tả chi tiết về phòng..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0071c2] focus:border-[#0071c2] text-gray-900"
              />
            </div>
          </div>
        </Card>

        {/* Amenities */}
        <Card>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Tiện nghi phòng ({formData.amenities.length} đã chọn)
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {availableAmenities.map((amenity) => (
              <label
                key={amenity}
                className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                  formData.amenities.includes(amenity)
                    ? 'border-[#0071c2] bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="checkbox"
                  checked={formData.amenities.includes(amenity)}
                  onChange={() => toggleAmenity(amenity)}
                  className="w-4 h-4 text-[#0071c2] rounded focus:ring-2 focus:ring-[#0071c2]"
                />
                <span className="ml-2 text-sm font-medium text-gray-900">
                  {amenity}
                </span>
              </label>
            ))}
          </div>
        </Card>

        {/* Preview */}
        <Card className="bg-gradient-to-br from-blue-50 to-white">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Preview</h2>
          <div className="p-4 bg-white rounded-lg border border-gray-200">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  {formData.name || 'Tên phòng'}
                </h3>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-[#0071c2]">
                  {formData.price.toLocaleString('vi-VN')} ₫
                </p>
                <p className="text-sm text-gray-700">/ đêm</p>
              </div>
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-800 mb-3">
              <span>📏 {formData.size || '---'}</span>
              <span>🛏️ {formData.beds || '---'}</span>
              <span>👥 {formData.maxGuests} khách</span>
            </div>
            {formData.amenities.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.amenities.map((amenity) => (
                  <span
                    key={amenity}
                    className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium"
                  >
                    {amenity}
                  </span>
                ))}
              </div>
            )}
          </div>
        </Card>

        {/* Actions */}
        <div className="flex justify-end space-x-3">
          <Link href="/hotel-manager/rooms">
            <Button variant="outline" type="button" disabled={isSubmitting}>
              Hủy
            </Button>
          </Link>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? '⏳ Đang lưu...' : '💾 Lưu thay đổi'}
          </Button>
        </div>
      </form>
    </div>
  );
}
