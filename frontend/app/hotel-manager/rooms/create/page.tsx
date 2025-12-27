'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { hotelManagerApi } from '@/lib/api/services';
import { apiClient } from '@/lib/api/client';
import { API_CONFIG } from '@/lib/api/config';

export default function CreateRoomPage() {
  const router = useRouter();

  const [loadingHotels, setLoadingHotels] = useState(true);
  const [hotels, setHotels] = useState<Array<Record<string, unknown>>>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    hotel_id: '',
    type: '',
    max_guests: 1,
    availability: true,
    description: '',
    basic_price: 0,
    special_price: '',
    discount: 0,
    event: '',
  });

  useEffect(() => {
    const loadHotels = async () => {
      try {
        setLoadingHotels(true);
        const myHotels = await hotelManagerApi.getMyHotels();
        const normalized = (myHotels as unknown as Array<Record<string, unknown>>) ?? [];
        setHotels(normalized);
        const firstId = normalized.length
          ? String((normalized[0] as any).hotel_id ?? (normalized[0] as any).id)
          : '';
        setFormData((prev) => ({ ...prev, hotel_id: firstId }));
      } catch (error) {
        console.error('Error loading hotels:', error);
      } finally {
        setLoadingHotels(false);
      }
    };

    loadHotels();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.hotel_id) {
      alert('Vui lòng chọn khách sạn!');
      return;
    }

    if (!formData.type.trim()) {
      alert('Vui lòng nhập tên loại phòng!');
      return;
    }

    if (!Number.isFinite(formData.basic_price) || formData.basic_price <= 0) {
      alert('Vui lòng nhập giá cơ bản hợp lệ!');
      return;
    }

    if (!Number.isFinite(formData.discount) || formData.discount < 0) {
      alert('Giảm giá không hợp lệ!');
      return;
    }

    if (!Number.isFinite(formData.max_guests) || formData.max_guests < 1) {
      alert('Số khách tối đa không hợp lệ!');
      return;
    }

    setIsSubmitting(true);
    try {
      const specialPrice =
        formData.special_price.trim() === '' ? undefined : Number(formData.special_price);

      if (specialPrice !== undefined && Number.isNaN(specialPrice)) {
        alert('Giá đặc biệt không hợp lệ!');
        return;
      }

      // Backend validator uses `.optional().isFloat()` so do NOT send `null` for optional floats.
      const priceData: Record<string, unknown> = {
        basic_price: formData.basic_price,
        discount: formData.discount,
        event: formData.event,
      };
      if (specialPrice !== undefined) {
        priceData.special_price = specialPrice;
      }

      await apiClient.post(API_CONFIG.ENDPOINTS.ADD_ROOM_TYPE, {
        typeData: {
          hotel_id: Number(formData.hotel_id),
          type: formData.type.trim(),
          availability: formData.availability,
          max_guests: formData.max_guests,
          description: formData.description,
          priceData,
        },
      });

      alert('Tạo loại phòng thành công!');
      router.push('/hotel-manager/rooms/types');
    } catch (error) {
      console.error('Error creating room type:', error);
      alert(error instanceof Error ? error.message : 'Có lỗi xảy ra, vui lòng thử lại!');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Thêm loại phòng mới</h1>
          <p className="text-gray-800 mt-1">Tạo loại phòng mới cho khách sạn</p>
        </div>
        <Link href="/hotel-manager/rooms/types">
          <Button variant="outline">Quay lại</Button>
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Thông tin cơ bản</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Khách sạn *
              </label>
              <select
                required
                value={formData.hotel_id}
                onChange={(e) => setFormData({ ...formData, hotel_id: e.target.value })}
                disabled={isSubmitting || loadingHotels}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0071c2] focus:border-[#0071c2] text-gray-900 disabled:bg-gray-100"
              >
                {hotels.length === 0 ? (
                  <option value="">Chưa có khách sạn</option>
                ) : (
                  hotels.map((h) => (
                    <option
                      key={String((h as any).hotel_id ?? (h as any).id)}
                      value={String((h as any).hotel_id ?? (h as any).id)}
                    >
                      {String((h as any).name ?? 'Unnamed hotel')}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Tên loại phòng *
              </label>
              <Input
                required
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
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
                    setFormData({ ...formData, max_guests: Number(e.target.value) })
                  }
                  min={1}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Giá cơ bản *
                </label>
                <Input
                  type="number"
                  required
                  value={formData.basic_price}
                  onChange={(e) =>
                    setFormData({ ...formData, basic_price: Number(e.target.value) })
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
                      setFormData({ ...formData, availability: e.target.checked })
                    }
                    className="w-4 h-4 text-[#0071c2] rounded focus:ring-2 focus:ring-[#0071c2]"
                  />
                  Đang mở bán
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Giá đặc biệt (tuỳ chọn)
                </label>
                <Input
                  type="number"
                  value={formData.special_price}
                  onChange={(e) => setFormData({ ...formData, special_price: e.target.value })}
                  min={0}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Giảm giá (%)
                </label>
                <Input
                  type="number"
                  value={formData.discount}
                  onChange={(e) => setFormData({ ...formData, discount: Number(e.target.value) })}
                  min={0}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Sự kiện (tuỳ chọn)
                </label>
                <Input
                  value={formData.event}
                  onChange={(e) => setFormData({ ...formData, event: e.target.value })}
                  placeholder="VD: Summer sale"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Mô tả
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                placeholder="Mô tả chi tiết về loại phòng..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0071c2] focus:border-[#0071c2] text-gray-900"
              />
            </div>
          </div>
        </Card>

        <div className="flex justify-end space-x-3">
          <Link href="/hotel-manager/rooms/types">
            <Button variant="outline" type="button" disabled={isSubmitting}>
              Huỷ
            </Button>
          </Link>
          <Button type="submit" disabled={isSubmitting || loadingHotels || hotels.length === 0}>
            {isSubmitting ? 'Đang tạo...' : 'Tạo loại phòng'}
          </Button>
        </div>
      </form>
    </div>
  );
}
