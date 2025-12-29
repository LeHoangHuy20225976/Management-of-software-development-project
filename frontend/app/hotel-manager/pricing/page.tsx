'use client';

import { useEffect, useMemo, useState } from 'react';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { formatCurrency } from '@/lib/utils/format';
import { hotelManagerApi, pricingEngineApi } from '@/lib/api/services';
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

const EMPTY_PRICING_FORM: PricingFormData = {
  basic_price: '',
  special_price: '',
  discount: '',
  event: '',
  start_date: '',
  end_date: '',
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

const roundPrice = (value: number): number => Math.round(value);

const computeSpecialPriceFromDiscount = (
  basicPrice: string | undefined,
  discount: string | undefined
): string | null => {
  const basic = toNumberOrNull(basicPrice);
  const rate = toNumberOrNull(discount);
  if (basic === null || rate === null) return null;
  const computed = basic * (1 - rate);
  if (!Number.isFinite(computed)) return null;
  return String(roundPrice(computed));
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
    setFormData((prev) => {
      const previous = prev[typeId] ?? EMPTY_PRICING_FORM;
      const next: PricingFormData = { ...previous, [field]: value };

      if (field === 'discount' || field === 'basic_price') {
        const computed = computeSpecialPriceFromDiscount(next.basic_price, next.discount);
        if (computed !== null) next.special_price = computed;
      }

      return { ...prev, [typeId]: next };
    });
  };

  const handleSave = async (typeId: number) => {
    setSavingTypeId(typeId);
    try {
      const data = formData[typeId];
      if (!data?.basic_price || Number.isNaN(Number(data.basic_price))) {
        alert('Vui lòng nhập giá cơ bản hợp lệ');
        setSavingTypeId(null);
        return;
      }

      const basicPriceNumber = Number(data.basic_price);

      let specialPrice = data.special_price.trim() === '' ? null : Number(data.special_price);
      if (specialPrice !== null && Number.isNaN(specialPrice)) {
        alert('Giá đặc biệt không hợp lệ');
        setSavingTypeId(null);
        return;
      }

      const discount = data.discount.trim() === '' ? null : Number(data.discount);
      if (discount !== null && Number.isNaN(discount)) {
        alert('Giảm giá không hợp lệ');
        setSavingTypeId(null);
        return;
      }

      if (discount !== null) {
        const computedSpecial = roundPrice(basicPriceNumber * (1 - discount));
        if (Number.isFinite(computedSpecial)) {
          specialPrice = computedSpecial;
          setFormData((prev) => ({
            ...prev,
            [typeId]: {
              ...prev[typeId],
              special_price: String(computedSpecial),
            },
          }));
        }
      }

      const priceData: Record<string, unknown> = {
        basic_price: basicPriceNumber,
        ...(specialPrice === null ? {} : { special_price: specialPrice }),
        ...(discount === null ? {} : { discount }),
        ...(data.event.trim() === '' ? {} : { event: data.event.trim() }),
        ...(data.start_date ? { start_date: data.start_date } : {}),
        ...(data.end_date ? { end_date: data.end_date } : {}),
      };

      await pricingEngineApi.updatePricing(typeId, priceData);

      alert('Cập nhật giá thành công!');
      setEditingTypeId(null);
      if (selectedHotelId) await loadRoomTypes(selectedHotelId);
    } catch (e) {
      console.error('Error updating pricing:', e);
      const message =
        e instanceof Error && (e as any).response?.data?.message
          ? (e as any).response.data.message
          : e instanceof Error
          ? e.message
          : 'Có lỗi khi cập nhật giá';
      alert(message);
    } finally {
      setSavingTypeId(null);
    }
  };

  const handlePreviewPrice = async (typeId: number) => {
    try {
      const checkInDate = new Date().toISOString().split('T')[0];
      const checkOutDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // 3 days later

      const result = await pricingEngineApi.calculatePrice({
        type_id: typeId,
        check_in_date: checkInDate,
        check_out_date: checkOutDate,
        guests: 2
      });

    } catch (error) {
      console.error('Error previewing price:', error);
      alert('Lỗi khi tính giá: ' + (error as Error).message);
    } finally {
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
                <div className="flex space-x-2">
                  {/*
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePreviewPrice(roomType.type_id)}
                    disabled={processing}
                  >
                    🧮 Preview
                  </Button>
                  */}
                  {!isEditing ? (
                    <Button
                      onClick={() => setEditingTypeId(roomType.type_id)}
                      size="sm"
                      disabled={processing}
                    >
                      Chỉnh sửa
                    </Button>
                  ) : (
                    <>
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
                    </>
                  )}
                </div>
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
                      max="1"
                      value={data?.discount ?? ''}
                      onChange={(e) => updateFormField(roomType.type_id, 'discount', e.target.value)}
                      placeholder="VD: 0.15 (từ 0-1)"
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

      {/* Price Preview Modal */}
      {/*
      {showPreviewModal && previewData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">🧮 Tính giá phòng</h2>
                <button
                  onClick={() => setShowPreviewModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-sm text-blue-600 font-medium">Số đêm</div>
                    <div className="text-2xl font-bold text-blue-800">{previewData.breakdown.nights}</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-sm text-green-600 font-medium">Số khách</div>
                    <div className="text-2xl font-bold text-green-800">{previewData.breakdown.guests}</div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-lg font-bold text-gray-900 mb-2">
                    Tổng tiền: {formatCurrency(previewData.totalPrice)}
                  </div>
                  <div className="text-sm text-gray-600">
                    Cơ bản: {formatCurrency(previewData.breakdown.subtotal)} |
                    Giảm giá: {formatCurrency(previewData.breakdown.totalDiscount)}
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Chi tiết theo ngày:</h3>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {previewData.breakdown.dailyBreakdown.map((day: any, index: number) => (
                      <div key={index} className="flex justify-between items-center text-sm bg-white p-2 rounded border">
                        <span>{day.date}</span>
                        <div className="text-right">
                          <div>{formatCurrency(day.final_price)}</div>
                          {day.event && <div className="text-xs text-orange-600">🎉 {day.event}</div>}
                          {day.discount_rate > 0 && (
                            <div className="text-xs text-green-600">
                              Giảm {day.discount_rate * 100}%
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => setShowPreviewModal(false)}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                  >
                    Đóng
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      */}
    </div>
  );
}
