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
import { hotelManagerApi } from '@/lib/api/services';

export default function CreateRoomPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    type: '',
    description: '',
    max_guests: 1,
    quantity: 1,
    availability: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.type) {
      alert('Vui lòng nhập tên loại phòng!');
      return;
    }

    try {
      const hotelId = '1';
      await hotelManagerApi.createRoom(hotelId, {
        type: formData.type,
        description: formData.description,
        max_guests: formData.max_guests,
        quantity: formData.quantity,
        availability: formData.availability,
      });
      alert('Đã thêm loại phòng mới thành công!');
      router.push(ROUTES.HOTEL.ROOMS);
    } catch (error) {
      console.error('Error creating room', error);
      alert('Không thể tạo loại phòng, vui lòng thử lại.');
    }
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
              <label className="block text-sm font-medium mb-2">
                Tên loại phòng *
              </label>
              <Input
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value })
                }
                placeholder="VD: Deluxe Room, Superior Room..."
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Mô tả</label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
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
              <label className="block text-sm font-medium mb-2">
                Số khách tối đa *
              </label>
              <Input
                type="number"
                value={formData.max_guests}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    max_guests: Number(e.target.value),
                  })
                }
                min={1}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Số lượng phòng *
              </label>
              <Input
                type="number"
                value={formData.quantity}
                onChange={(e) =>
                  setFormData({ ...formData, quantity: Number(e.target.value) })
                }
                min={0}
                required
              />
            </div>
          </div>
        </Card>

        <Card>
          <h2 className="text-xl font-bold mb-4">Trạng thái</h2>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.availability}
              onChange={(e) =>
                setFormData({ ...formData, availability: e.target.checked })
              }
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <span>Đang mở bán</span>
          </label>
        </Card>

        {/* Actions */}
        <div className="flex space-x-4">
          <Button type="submit">💾 Thêm loại phòng</Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Hủy
          </Button>
        </div>
      </form>
    </div>
  );
}
