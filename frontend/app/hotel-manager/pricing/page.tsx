'use client';

import { useEffect, useMemo, useState } from 'react';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { formatCurrency } from '@/lib/utils/format';
import { hotelManagerApi } from '@/lib/api/services';
import { apiClient } from '@/lib/api/client';
import { API_CONFIG } from '@/lib/api/config';
import type { RoomType } from '@/types';

type PricingFormData = {
  basic_price: string;
  special_price: string;
  discount: string;
  event: string;
  start_date: string;
  end_date: string;
};

const getBackendRoomPrice = (roomType: unknown): {
  basic_price?: number | string | null;
  special_price?: number | string | null;
  discount?: number | string | null;
  start_date?: string | null;
  end_date?: string | null;
  event?: string | null;
  price?: number | string | null;
} => {
  const rt = roomType as any;

  if (rt?.priceData && typeof rt.priceData === 'object') return rt.priceData;
  if (rt?.RoomPrice && typeof rt.RoomPrice === 'object') return rt.RoomPrice;
  if (rt?.roomPrice && typeof rt.roomPrice === 'object') return rt.roomPrice;

  return {
    basic_price: rt?.basic_price ?? null,
    special_price: rt?.special_price ?? null,
    discount: rt?.discount ?? null,
    start_date: rt?.start_date ?? null,
    end_date: rt?.end_date ?? null,
    event: rt?.event ?? null,
    price: rt?.price ?? null,
  };
};

const toNumberOrNull = (value: unknown): number | null => {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value === 'string' && value.trim() !== '') {
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  }
  return null;
};

const getDisplayPrice = (roomType: unknown): number => {
  const price = getBackendRoomPrice(roomType);
  const special = toNumberOrNull(price.special_price);
  const basic = toNumberOrNull(price.basic_price);
  const fallback = toNumberOrNull(price.price);
  if (special !== null) return special;
  if (basic !== null) return basic;
  if (fallback !== null) return fallback;
  return 0;
};

export default function HotelPricingPage() {
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  const [hotels, setHotels] = useState<Array<Record<string, unknown>>>([]);
  const [selectedHotelId, setSelectedHotelId] = useState('');
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);

  const [editingTypeId, setEditingTypeId] = useState<number | null>(null);
  const [savingTypeId, setSavingTypeId] = useState<number | null>(null);
  const [formData, setFormData] = useState<Record<number, PricingFormData>>({});

  const selectedHotelName = useMemo(() => {
    const hotel = hotels.find(
      (h) => String((h as any).hotel_id ?? (h as any).id) === selectedHotelId
    );
    return hotel ? String((hotel as any).name ?? '') : '';
  }, [hotels, selectedHotelId]);

  const loadHotels = async () => {
    const myHotels = await hotelManagerApi.getMyHotels();
    const normalized = (myHotels as unknown as Array<Record<string, unknown>>) ?? [];
    setHotels(normalized);
    const firstId = normalized.length
      ? String((normalized[0] as any).hotel_id ?? (normalized[0] as any).id)
      : '';
    setSelectedHotelId(firstId);
  };

  const loadRoomTypes = async (hotelId: string) => {
    const types = await apiClient.get<RoomType[]>(API_CONFIG.ENDPOINTS.VIEW_ROOM_TYPES, {
      hotel_id: hotelId,
    });
    setRoomTypes(types);

    const initial: Record<number, PricingFormData> = {};
    (types ?? []).forEach((t) => {
      const price = getBackendRoomPrice(t);
      const basic = toNumberOrNull(price.basic_price) ?? toNumberOrNull(price.price) ?? null;
      const special = toNumberOrNull(price.special_price);
      const discount = toNumberOrNull(price.discount);
      initial[t.type_id] = {
        basic_price: basic === null ? '' : String(basic),
        special_price: special === null ? '' : String(special),
        discount: discount === null ? '' : String(discount),
        event: typeof price.event === 'string' ? price.event : '',
        start_date: price.start_date ? String(price.start_date).split('T')[0] : '',
        end_date: price.end_date ? String(price.end_date).split('T')[0] : '',
      };
    });
    setFormData(initial);
  };

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        setError('');
        await loadHotels();
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Không thể tải danh sách khách sạn');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (!selectedHotelId) return;
    const run = async () => {
      try {
        setLoading(true);
        setError('');
        await loadRoomTypes(selectedHotelId);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Không thể tải danh sách loại phòng');
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [selectedHotelId]);

  const updateFormField = (
    typeId: number,
    field: keyof PricingFormData,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [typeId]: {
        ...prev[typeId],
        [field]: value,
      },
    }));
  };

  const handleSave = async (typeId: number) => {
    setSavingTypeId(typeId);
    try {
      const data = formData[typeId];
      if (!data?.basic_price || Number.isNaN(Number(data.basic_price))) {
        alert('Vui lòng nhập giá cơ bản hợp lệ');
        return;
      }

      const priceData: Record<string, unknown> = {
        type_id: typeId,
        basic_price: Number(data.basic_price),
      };

      if (data.special_price.trim() !== '') {
        const special = Number(data.special_price);
        if (Number.isNaN(special)) {
          alert('Giá đặc biệt không hợp lệ');
          return;
        }
        priceData.special_price = special;
      }

      if (data.discount.trim() !== '') {
        const discount = Number(data.discount);
        if (Number.isNaN(discount)) {
          alert('Giảm giá không hợp lệ');
          return;
        }
        priceData.discount = discount;
      }

      if (data.event.trim() !== '') priceData.event = data.event.trim();
      if (data.start_date) priceData.start_date = data.start_date;
      if (data.end_date) priceData.end_date = data.end_date;

      await apiClient.put(API_CONFIG.ENDPOINTS.UPDATE_PRICE, { priceData });

      alert('Cập nhật giá thành công!');
      setEditingTypeId(null);
      if (selectedHotelId) await loadRoomTypes(selectedHotelId);
    } catch (e) {
      console.error('Error updating pricing:', e);
      alert(e instanceof Error ? e.message : 'Có lỗi khi cập nhật giá');
    } finally {
      setSavingTypeId(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <div className="text-center py-8">
            <p className="text-gray-900 font-medium">Đang tải dữ liệu...</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý giá</h1>
          <p className="text-gray-600 mt-1">Theo backend `/hotel-profile`</p>
        </div>
      </div>

      {error && (
        <Card>
          <p className="text-red-600 text-sm font-medium">{error}</p>
        </Card>
      )}

      <Card>
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          <div className="text-sm font-semibold text-gray-900">Khách sạn</div>
          <select
            value={selectedHotelId}
            onChange={(e) => setSelectedHotelId(e.target.value)}
            className="w-full md:w-[420px] px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0071c2] focus:border-[#0071c2] text-gray-900 disabled:bg-gray-100"
            disabled={hotels.length === 0 || processing}
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
          {selectedHotelName && (
            <div className="text-sm text-gray-600 truncate">Đang xem: {selectedHotelName}</div>
          )}
        </div>
      </Card>

      <div className="space-y-6">
        {roomTypes.map((roomType) => {
          const isEditing = editingTypeId === roomType.type_id;
          const isSaving = savingTypeId === roomType.type_id;
          const data = formData[roomType.type_id];

          const backendPrice = getBackendRoomPrice(roomType);
          const effectivePrice = getDisplayPrice(roomType);
          const discountLabel =
            toNumberOrNull(backendPrice.discount) !== null
              ? `${(toNumberOrNull(backendPrice.discount) as number) * 100}%`
              : '—';
          const startDateLabel = backendPrice.start_date
            ? String(backendPrice.start_date).split('T')[0]
            : '—';
          const endDateLabel = backendPrice.end_date
            ? String(backendPrice.end_date).split('T')[0]
            : '—';

          return (
            <Card key={roomType.type_id}>
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{roomType.type}</h2>
                  <p className="text-sm text-gray-700 mt-1">
                    {roomType.description} • Tối đa {roomType.max_guests} khách • {roomType.quantity ?? 0} phòng
                  </p>
                </div>
                {!isEditing ? (
                  <Button
                    onClick={() => setEditingTypeId(roomType.type_id)}
                    size="sm"
                    disabled={processing}
                  >
                    Chỉnh sửa
                  </Button>
                ) : (
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingTypeId(null)}
                      disabled={isSaving}
                    >
                      Huỷ
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleSave(roomType.type_id)}
                      disabled={isSaving}
                    >
                      {isSaving ? 'Đang lưu...' : 'Lưu'}
                    </Button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Giá hiển thị (ưu tiên special)
                  </label>
                  <div className="text-2xl font-bold text-[#0071c2]">{formatCurrency(effectivePrice)}</div>
                  <p className="text-xs text-gray-700 mt-1">
                    Special: {toNumberOrNull(backendPrice.special_price) !== null ? formatCurrency(toNumberOrNull(backendPrice.special_price) as number) : '—'} • Basic:{' '}
                    {toNumberOrNull(backendPrice.basic_price) !== null ? formatCurrency(toNumberOrNull(backendPrice.basic_price) as number) : '—'}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Giảm giá</label>
                  {isEditing ? (
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={data?.discount ?? ''}
                      onChange={(e) => updateFormField(roomType.type_id, 'discount', e.target.value)}
                      placeholder="VD: 0.15"
                    />
                  ) : (
                    <div className="text-2xl font-bold text-gray-900">{discountLabel}</div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Thời gian</label>
                  {isEditing ? (
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        type="date"
                        value={data?.start_date ?? ''}
                        onChange={(e) => updateFormField(roomType.type_id, 'start_date', e.target.value)}
                      />
                      <Input
                        type="date"
                        value={data?.end_date ?? ''}
                        onChange={(e) => updateFormField(roomType.type_id, 'end_date', e.target.value)}
                      />
                    </div>
                  ) : (
                    <div className="text-sm text-gray-800">
                      {startDateLabel} → {endDateLabel}
                    </div>
                  )}
                </div>
              </div>

              {isEditing && (
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Basic price *</label>
                    <Input
                      type="number"
                      value={data?.basic_price ?? ''}
                      onChange={(e) => updateFormField(roomType.type_id, 'basic_price', e.target.value)}
                      placeholder="Bắt buộc"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Special price</label>
                    <Input
                      type="number"
                      value={data?.special_price ?? ''}
                      onChange={(e) => updateFormField(roomType.type_id, 'special_price', e.target.value)}
                      placeholder="(tuỳ chọn)"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Event</label>
                    <Input
                      value={data?.event ?? ''}
                      onChange={(e) => updateFormField(roomType.type_id, 'event', e.target.value)}
                      placeholder="(tuỳ chọn)"
                    />
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
