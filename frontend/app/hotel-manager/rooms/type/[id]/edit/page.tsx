'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { apiClient } from '@/lib/api/client';
import { API_CONFIG } from '@/lib/api/config';

type RoomTypeDetailResponse = {
  typeData?: Record<string, unknown>;
  priceData?: Record<string, unknown> | null;
};

export default function EditRoomTypePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    type: '',
    max_guests: 2,
    availability: true,
    description: '',
  });

  useEffect(() => {
    const loadType = async () => {
      try {
        const detail = await apiClient.get<RoomTypeDetailResponse>(
          API_CONFIG.ENDPOINTS.VIEW_ROOM_TYPE,
          { type_id: resolvedParams.id },
        );
        const typeData = detail?.typeData ?? {};

        setFormData({
          type: typeof typeData.type === 'string' ? typeData.type : '',
          max_guests: Number(typeData.max_guests ?? 2) || 2,
          availability: Boolean(typeData.availability ?? true),
          description: typeof typeData.description === 'string' ? typeData.description : '',
        });
      } catch (error) {
        console.error('Error loading room type:', error);
        alert('Có lỗi khi tải thông tin loại phòng!');
        router.push('/hotel-manager/rooms/types');
      } finally {
        setLoading(false);
      }
    };

    loadType();
  }, [resolvedParams.id, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.type.trim()) {
      alert('Vui lòng nhập tên loại phòng!');
      return;
    }

    setIsSubmitting(true);
    try {
      await apiClient.put(
        API_CONFIG.ENDPOINTS.UPDATE_ROOM_TYPE,
        {
          typeData: {
            type: formData.type.trim(),
            max_guests: formData.max_guests,
            availability: formData.availability,
            description: formData.description,
          },
        },
        { type_id: resolvedParams.id },
      );

      alert('Cập nhật loại phòng thành công!');
      router.push('/hotel-manager/rooms/types');
    } catch (error) {
      console.error('Error updating room type:', error);
      alert('Đã có lỗi xảy ra. Vui lòng thử lại!');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <div className="text-center py-8">
            <p className="text-gray-900 font-medium">Đang tải thông tin loại phòng...</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Chỉnh sửa loại phòng</h1>
          <p className="text-gray-800 mt-1">Cập nhật loại phòng #{resolvedParams.id}</p>
        </div>
        <Link href="/hotel-manager/rooms/types">
          <Button variant="outline">Quay lại</Button>
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Thông tin loại phòng</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Tên loại phòng *
              </label>
              <Input
                required
                value={formData.type}
                onChange={(e) => setFormData((prev) => ({ ...prev, type: e.target.value }))}
                placeholder="VD: Deluxe"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Số khách tối đa
                </label>
                <Input
                  type="number"
                  value={formData.max_guests}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, max_guests: Number(e.target.value) }))
                  }
                  min={1}
                />
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                  <input
                    type="checkbox"
                    checked={formData.availability}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, availability: e.target.checked }))
                    }
                    className="w-4 h-4 text-[#0071c2] rounded focus:ring-2 focus:ring-[#0071c2]"
                  />
                  Đang mở bán
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Mô tả</label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, description: e.target.value }))
                }
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0071c2] focus:border-[#0071c2] text-gray-900"
              />
            </div>
          </div>
        </Card>

        <div className="flex justify-end space-x-3">
          <Link href="/hotel-manager/rooms/types">
            <Button variant="outline" type="button" disabled={isSubmitting}>
              Hủy
            </Button>
          </Link>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}
          </Button>
        </div>
      </form>
    </div>
  );
}

