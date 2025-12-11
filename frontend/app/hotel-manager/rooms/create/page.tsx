'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { hotelManagerApi } from '@/lib/api/services';

export default function CreateRoomPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    type: '',
    max_guests: 1,
    description: '',
    quantity: 1,
    availability: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.type) {
      alert('Vui lòng nhập tên loại phòng!');
      return;
    }

    setIsSubmitting(true);
    try {
      const roomData = {
        type: formData.type,
        max_guests: formData.max_guests,
        description: formData.description,
        quantity: formData.quantity,
        availability: formData.availability,
      };

      const hotelId = 'h1';
      await hotelManagerApi.createRoom(hotelId, roomData);

      alert('✅ Tạo loại phòng thành công!');
      router.push('/hotel-manager/rooms');
    } catch (error) {
      console.error('Error creating room:', error);
      alert('❌ Có lỗi xảy ra. Vui lòng thử lại!');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Thêm loại phòng mới
          </h1>
          <p className="text-gray-800 mt-1">Tạo loại phòng mới cho khách sạn</p>
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
                Tên loại phòng *
              </label>
              <Input
                required
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value })
                }
                placeholder="VD: Deluxe Room"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Số khách tối đa *
                </label>
                <Input
                  type="number"
                  required
                  value={formData.max_guests}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      max_guests: Number(e.target.value),
                    })
                  }
                  min={1}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Số lượng phòng *
                </label>
                <Input
                  type="number"
                  required
                  value={formData.quantity}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      quantity: Number(e.target.value),
                    })
                  }
                  min={0}
                />
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                  <input
                    type="checkbox"
                    checked={formData.availability}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        availability: e.target.checked,
                      })
                    }
                    className="w-4 h-4 text-[#0071c2] rounded focus:ring-2 focus:ring-[#0071c2]"
                  />
                  Đang mở bán
                </label>
              </div>
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

        {/* Actions */}
        <div className="flex justify-end space-x-3">
          <Link href="/hotel-manager/rooms">
            <Button variant="outline" type="button" disabled={isSubmitting}>
              Hủy
            </Button>
          </Link>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? '⏳ Đang tạo...' : '✅ Tạo loại phòng'}
          </Button>
        </div>
      </form>
    </div>
  );
}
