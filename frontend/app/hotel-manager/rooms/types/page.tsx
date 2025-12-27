'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { hotelManagerApi } from '@/lib/api/services';
import { apiClient } from '@/lib/api/client';
import { API_CONFIG } from '@/lib/api/config';
import { formatCurrency } from '@/lib/utils/format';
import type { RoomType } from '@/types';

type FormState = {
  type: string;
  description: string;
  max_guests: number;
  basic_price: number;
  special_price: string;
  discount: number;
  event: string;
  availability: boolean;
};

const normalizeType = (value: string) => value.trim().toLowerCase();
const toNumberOrNull = (value: unknown): number | null => {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value === 'string' && value.trim() !== '') {
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  }
  return null;
};
const getDisplayPrice = (roomType: unknown): number => {
  const rt = roomType as any;
  const priceData = rt?.priceData ?? rt?.RoomPrice ?? rt?.roomPrice ?? null;
  if (!priceData) return 0;
  const special = toNumberOrNull(priceData.special_price);
  const basic = toNumberOrNull(priceData.basic_price);
  const fallback = toNumberOrNull(priceData.price);
  if (special !== null) return special;
  if (basic !== null) return basic;
  if (fallback !== null) return fallback;
  return 0;
};

export default function RoomTypesPage() {
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  const [hotels, setHotels] = useState<Array<Record<string, unknown>>>([]);
  const [selectedHotelId, setSelectedHotelId] = useState('');

  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedType, setSelectedType] = useState<RoomType | null>(null);

  const [formData, setFormData] = useState<FormState>({
    type: '',
    description: '',
    max_guests: 2,
    basic_price: 0,
    special_price: '',
    discount: 0,
    event: '',
    availability: true,
  });

  const selectedHotelName = useMemo(() => {
    const hotel = hotels.find((h) => String((h as any).hotel_id ?? (h as any).id) === selectedHotelId);
    return hotel ? String((hotel as any).name ?? '') : '';
  }, [hotels, selectedHotelId]);

  const resetForm = () => {
    setFormData({
      type: '',
      description: '',
      max_guests: 2,
      basic_price: 0,
      special_price: '',
      discount: 0,
      event: '',
      availability: true,
    });
  };

  const loadHotels = async () => {
    const myHotels = await hotelManagerApi.getMyHotels();
    const normalized = (myHotels as unknown as Array<Record<string, unknown>>) ?? [];
    setHotels(normalized);
    const firstId = normalized.length ? String((normalized[0] as any).hotel_id ?? (normalized[0] as any).id) : '';
    setSelectedHotelId(firstId);
  };

  const loadRoomTypes = async (hotelId: string) => {
    // Backend now returns RoomType with additional `priceData` embedded (see hotelProfileService.getAllTypeForHotel()).
    const data = await apiClient.get<RoomType[]>(API_CONFIG.ENDPOINTS.VIEW_ROOM_TYPES, { hotel_id: hotelId });
    setRoomTypes(data);
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
        setError(e instanceof Error ? e.message : 'Không thể tải loại phòng');
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [selectedHotelId]);

  const handleAddRoomType = async () => {
    if (!selectedHotelId) {
      alert('Vui lòng chọn khách sạn');
      return;
    }

    if (!formData.type.trim()) {
      alert('Vui lòng nhập tên loại phòng');
      return;
    }

    if (!Number.isFinite(formData.basic_price) || formData.basic_price <= 0) {
      alert('Vui lòng nhập giá cơ bản hợp lệ');
      return;
    }

    const existing = roomTypes.find((t) => normalizeType(t.type) === normalizeType(formData.type));
    if (existing) {
      alert('Loại phòng này đã tồn tại trong khách sạn đã chọn');
      return;
    }

    setProcessing(true);
    try {
      const specialPrice =
        formData.special_price.trim() === '' ? undefined : Number(formData.special_price);
      if (specialPrice !== undefined && Number.isNaN(specialPrice)) {
        alert('Giá đặc biệt không hợp lệ');
        return;
      }

      const priceData: Record<string, unknown> = {
        basic_price: formData.basic_price,
        discount: formData.discount,
        event: formData.event,
      };
      if (specialPrice !== undefined) priceData.special_price = specialPrice;

      await apiClient.post(API_CONFIG.ENDPOINTS.ADD_ROOM_TYPE, {
        typeData: {
          hotel_id: Number(selectedHotelId),
          type: formData.type.trim(),
          availability: formData.availability,
          max_guests: formData.max_guests,
          description: formData.description,
          priceData,
        },
      });

      setShowAddModal(false);
      resetForm();
      await loadRoomTypes(selectedHotelId);
      alert('Thêm loại phòng thành công!');
    } catch (e) {
      console.error('Error adding room type:', e);
      alert(e instanceof Error ? e.message : 'Lỗi khi thêm loại phòng');
    } finally {
      setProcessing(false);
    }
  };

  const openEditModal = (roomType: RoomType) => {
    setSelectedType(roomType);
    const currentPrice =
      typeof (roomType as any)?.priceData?.price === 'number'
        ? (roomType as any).priceData.price
        : 0;
    setFormData({
      type: roomType.type,
      description: roomType.description || '',
      max_guests: roomType.max_guests,
      basic_price: currentPrice,
      special_price: '',
      discount: 0,
      event: '',
      availability: Boolean(roomType.availability),
    });
    setShowEditModal(true);
  };

  const handleUpdatePrice = async () => {
    if (!selectedType) return;

    if (!Number.isFinite(formData.basic_price) || formData.basic_price <= 0) {
      alert('Vui lòng nhập giá cơ bản hợp lệ');
      return;
    }

    setProcessing(true);
    try {
      const specialPrice =
        formData.special_price.trim() === '' ? undefined : Number(formData.special_price);
      if (specialPrice !== undefined && Number.isNaN(specialPrice)) {
        alert('Giá đặc biệt không hợp lệ');
        return;
      }

      const priceData: Record<string, unknown> = {
        type_id: selectedType.type_id,
        basic_price: formData.basic_price,
        discount: formData.discount,
        event: formData.event,
      };
      if (specialPrice !== undefined) priceData.special_price = specialPrice;

      await apiClient.put(API_CONFIG.ENDPOINTS.UPDATE_PRICE, { priceData });

      setShowEditModal(false);
      setSelectedType(null);
      resetForm();
      if (selectedHotelId) await loadRoomTypes(selectedHotelId);
      alert('Cập nhật giá thành công!');
    } catch (e) {
      console.error('Error updating price:', e);
      alert(e instanceof Error ? e.message : 'Lỗi khi cập nhật giá');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Quản lý loại phòng</h1>
        <Card>
          <div className="text-center py-8">
            <p className="text-gray-700">Đang tải...</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý loại phòng</h1>
          <p className="text-gray-600 mt-1">Theo backend `/hotel-profile`</p>
        </div>
        <div className="flex gap-3">
          <Link href="/hotel-manager/rooms">
            <Button variant="outline">Quản lý phòng</Button>
          </Link>
          <Link href="/hotel-manager/rooms/create">
            <Button variant="outline">+ Thêm phòng</Button>
          </Link>
          <Button
            onClick={() => {
              resetForm();
              setShowAddModal(true);
            }}
            disabled={!selectedHotelId}
          >
            + Thêm loại phòng
          </Button>
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
            disabled={hotels.length === 0}
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

      {roomTypes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {roomTypes.map((roomType) => (
            <Card key={roomType.type_id} hover>
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{roomType.type}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {roomType.description || 'Không có mô tả'}
                    </p>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-medium ${
                      roomType.availability ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {roomType.availability ? 'Đang mở' : 'Tạm ngưng'}
                  </span>
                </div>

                <div className="space-y-1 text-sm text-gray-800">
                  <p>Sức chứa: {roomType.max_guests} khách</p>
                  <p>Số phòng (quantity): {roomType.quantity ?? 0}</p>
                  <p className="font-semibold text-[#0071c2] text-lg">
                    {formatCurrency(getDisplayPrice(roomType))}/đêm
                  </p>
                </div>

                <div className="flex gap-2">
                  <Link href={`/hotel-manager/rooms/${roomType.type_id}/edit`}>
                    <Button variant="outline" size="sm">
                      Chỉnh sửa
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditModal(roomType)}
                    disabled={processing}
                  >
                    Cập nhật giá
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="text-center py-12">
          <div className="text-6xl mb-4">🛏️</div>
          <p className="text-gray-600 mb-4">Chưa có loại phòng nào</p>
          <Button
            onClick={() => {
              resetForm();
              setShowAddModal(true);
            }}
            disabled={!selectedHotelId}
          >
            + Thêm loại phòng đầu tiên
          </Button>
        </Card>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Thêm loại phòng mới</h2>
                <button onClick={() => setShowAddModal(false)} className="text-gray-500 hover:text-gray-700 text-2xl">
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tên loại phòng *</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sức chứa</label>
                    <input
                      type="number"
                      min="1"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      value={formData.max_guests}
                      onChange={(e) => setFormData({ ...formData, max_guests: Number(e.target.value) || 1 })}
                    />
                  </div>
                  <div className="flex items-end">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                      <input
                        type="checkbox"
                        checked={formData.availability}
                        onChange={(e) => setFormData({ ...formData, availability: e.target.checked })}
                        className="w-4 h-4 text-[#0071c2] rounded focus:ring-2 focus:ring-[#0071c2]"
                      />
                      Đang mở bán
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                  <textarea
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Giá cơ bản *</label>
                    <input
                      type="number"
                      min="0"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      value={formData.basic_price}
                      onChange={(e) => setFormData({ ...formData, basic_price: Number(e.target.value) || 0 })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Giá đặc biệt</label>
                    <input
                      type="number"
                      min="0"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      value={formData.special_price}
                      onChange={(e) => setFormData({ ...formData, special_price: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Giảm giá</label>
                    <input
                      type="number"
                      min="0"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      value={formData.discount}
                      onChange={(e) => setFormData({ ...formData, discount: Number(e.target.value) || 0 })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sự kiện</label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      value={formData.event}
                      onChange={(e) => setFormData({ ...formData, event: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6 pt-4 border-t">
                <Button variant="outline" className="flex-1" onClick={() => setShowAddModal(false)}>
                  Huỷ
                </Button>
                <Button className="flex-1" onClick={handleAddRoomType} disabled={processing}>
                  {processing ? 'Đang thêm...' : 'Thêm'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showEditModal && selectedType && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Cập nhật giá</h2>
                <button onClick={() => setShowEditModal(false)} className="text-gray-500 hover:text-gray-700 text-2xl">
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div className="text-sm text-gray-700">
                  Loại phòng: <span className="font-semibold">{selectedType.type}</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Giá cơ bản *</label>
                    <input
                      type="number"
                      min="0"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      value={formData.basic_price}
                      onChange={(e) => setFormData({ ...formData, basic_price: Number(e.target.value) || 0 })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Giá đặc biệt</label>
                    <input
                      type="number"
                      min="0"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      value={formData.special_price}
                      onChange={(e) => setFormData({ ...formData, special_price: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Giảm giá</label>
                    <input
                      type="number"
                      min="0"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      value={formData.discount}
                      onChange={(e) => setFormData({ ...formData, discount: Number(e.target.value) || 0 })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sự kiện</label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      value={formData.event}
                      onChange={(e) => setFormData({ ...formData, event: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6 pt-4 border-t">
                <Button variant="outline" className="flex-1" onClick={() => setShowEditModal(false)}>
                  Huỷ
                </Button>
                <Button className="flex-1" onClick={handleUpdatePrice} disabled={processing}>
                  {processing ? 'Đang lưu...' : 'Lưu'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
