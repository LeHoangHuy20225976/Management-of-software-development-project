'use client';

/**
 * Hotel Manager - Pricing Management (Per Room Type)
 *
 * REFACTORED: Now manages pricing PER ROOM TYPE (matches backend design)
 * Backend API: PUT /hotel-profile/update-price (requires type_id)
 *
 * Each room type has its own pricing:
 * - basic_price: Base price for the room type
 * - special_price: Special/promotional price (optional)
 * - discount: Discount percentage (optional)
 * - event: Event name for promotion (optional)
 * - start_date/end_date: Pricing validity period (optional)
 */

import { useState, useEffect } from 'react';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { formatCurrency } from '@/lib/utils/format';
import { hotelManagerApi } from '@/lib/api/services';

interface RoomType {
  type_id: number;
  hotel_id: number;
  type: string;
  max_guests: number;
  description: string;
  quantity: number;
  availability: boolean;
  basic_price?: number;
  special_price?: number;
  discount?: number;
  event?: string;
  start_date?: string;
  end_date?: string;
}

interface PricingFormData {
  basic_price: string;
  special_price: string;
  discount: string;
  event: string;
  start_date: string;
  end_date: string;
}

export default function HotelPricingPage() {
  const [loading, setLoading] = useState(true);
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [editingTypeId, setEditingTypeId] = useState<number | null>(null);
  const [savingTypeId, setSavingTypeId] = useState<number | null>(null);
  const [formData, setFormData] = useState<Record<number, PricingFormData>>({});

  // TODO: Get actual hotel_id from auth context or props
  const hotelId = 'h1';

  useEffect(() => {
    loadRoomTypes();
  }, []);

  const loadRoomTypes = async () => {
    try {
      setLoading(true);
      const types = await hotelManagerApi.getRoomTypes(hotelId);
      setRoomTypes(types);

      // Initialize form data for each room type
      const initialFormData: Record<number, PricingFormData> = {};
      types.forEach((type: RoomType) => {
        initialFormData[type.type_id] = {
          basic_price: type.basic_price?.toString() || '',
          special_price: type.special_price?.toString() || '',
          discount: type.discount?.toString() || '',
          event: type.event || '',
          start_date: type.start_date ? type.start_date.split('T')[0] : '',
          end_date: type.end_date ? type.end_date.split('T')[0] : '',
        };
      });
      setFormData(initialFormData);
    } catch (error) {
      console.error('Error loading room types:', error);
      alert('❌ Có lỗi khi tải danh sách loại phòng!');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (typeId: number) => {
    setEditingTypeId(typeId);
  };

  const handleCancel = (typeId: number) => {
    // Reset form data to original values
    const roomType = roomTypes.find(rt => rt.type_id === typeId);
    if (roomType) {
      setFormData(prev => ({
        ...prev,
        [typeId]: {
          basic_price: roomType.basic_price?.toString() || '',
          special_price: roomType.special_price?.toString() || '',
          discount: roomType.discount?.toString() || '',
          event: roomType.event || '',
          start_date: roomType.start_date ? roomType.start_date.split('T')[0] : '',
          end_date: roomType.end_date ? roomType.end_date.split('T')[0] : '',
        },
      }));
    }
    setEditingTypeId(null);
  };

  const handleSave = async (typeId: number) => {
    setSavingTypeId(typeId);
    try {
      const data = formData[typeId];

      // Build price data object (only include fields that have values)
      const priceData: any = {};

      if (data.basic_price) priceData.basic_price = parseFloat(data.basic_price);
      if (data.special_price) priceData.special_price = parseFloat(data.special_price);
      if (data.discount) priceData.discount = parseFloat(data.discount);
      if (data.event) priceData.event = data.event;
      if (data.start_date) priceData.start_date = new Date(data.start_date).toISOString();
      if (data.end_date) priceData.end_date = new Date(data.end_date).toISOString();

      await hotelManagerApi.updateRoomTypePrice(typeId, priceData);

      alert('✅ Cập nhật giá thành công!');
      setEditingTypeId(null);

      // Reload to get updated data
      await loadRoomTypes();
    } catch (error) {
      console.error('Error updating pricing:', error);
      alert('❌ Có lỗi khi cập nhật giá!');
    } finally {
      setSavingTypeId(null);
    }
  };

  const updateFormField = (typeId: number, field: keyof PricingFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [typeId]: {
        ...prev[typeId],
        [field]: value,
      },
    }));
  };

  const calculateEffectivePrice = (roomType: RoomType): number => {
    const basePrice = roomType.basic_price || 0;
    const specialPrice = roomType.special_price;
    const discount = roomType.discount || 0;

    // If special price is set, use it
    if (specialPrice && specialPrice > 0) {
      return specialPrice;
    }

    // Otherwise apply discount to base price
    if (discount > 0) {
      return basePrice * (1 - discount);
    }

    return basePrice;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <div className="text-center py-8">
            <p className="text-gray-900 font-medium">⏳ Đang tải thông tin giá...</p>
          </div>
        </Card>
      </div>
    );
  }

  if (roomTypes.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Quản lý giá theo loại phòng</h1>
        <Card>
          <div className="text-center py-8">
            <p className="text-gray-900 font-medium">
              Chưa có loại phòng nào. Vui lòng tạo loại phòng trước khi quản lý giá.
            </p>
            <Button
              onClick={() => window.location.href = '/hotel-manager/rooms/types'}
              className="mt-4"
            >
              Tạo loại phòng
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý giá theo loại phòng</h1>
          <p className="text-gray-700 mt-1">
            Mỗi loại phòng có bảng giá riêng. Cập nhật giá cho từng loại phòng bên dưới.
          </p>
        </div>
      </div>

      {/* Room Type Pricing Cards */}
      <div className="space-y-6">
        {roomTypes.map((roomType) => {
          const isEditing = editingTypeId === roomType.type_id;
          const isSaving = savingTypeId === roomType.type_id;
          const data = formData[roomType.type_id] || {};
          const effectivePrice = calculateEffectivePrice(roomType);

          return (
            <Card key={roomType.type_id}>
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{roomType.type}</h2>
                  <p className="text-sm text-gray-700 mt-1">
                    {roomType.description} • Tối đa {roomType.max_guests} khách • {roomType.quantity} phòng
                  </p>
                  {roomType.event && (
                    <div className="mt-2 inline-flex items-center px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                      🎉 {roomType.event}
                    </div>
                  )}
                </div>
                {!isEditing ? (
                  <Button onClick={() => handleEdit(roomType.type_id)} size="sm">
                    ✏️ Chỉnh sửa
                  </Button>
                ) : (
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCancel(roomType.type_id)}
                      disabled={isSaving}
                    >
                      Hủy
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleSave(roomType.type_id)}
                      disabled={isSaving}
                    >
                      {isSaving ? '⏳ Đang lưu...' : '💾 Lưu'}
                    </Button>
                  </div>
                )}
              </div>

              {/* Pricing Information */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Basic Price */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Giá cơ bản (VNĐ) <span className="text-red-500">*</span>
                  </label>
                  {isEditing ? (
                    <Input
                      type="number"
                      value={data.basic_price}
                      onChange={(e) => updateFormField(roomType.type_id, 'basic_price', e.target.value)}
                      placeholder="Nhập giá cơ bản"
                      className="w-full"
                    />
                  ) : (
                    <div className="text-2xl font-bold text-[#0071c2]">
                      {roomType.basic_price ? formatCurrency(roomType.basic_price) : 'Chưa set'}
                    </div>
                  )}
                  <p className="text-xs text-gray-700 mt-1">Giá gốc cho loại phòng này</p>
                </div>

                {/* Special Price */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Giá khuyến mãi (VNĐ)
                  </label>
                  {isEditing ? (
                    <Input
                      type="number"
                      value={data.special_price}
                      onChange={(e) => updateFormField(roomType.type_id, 'special_price', e.target.value)}
                      placeholder="Để trống nếu không có"
                      className="w-full"
                    />
                  ) : (
                    <div className="text-2xl font-bold text-green-600">
                      {roomType.special_price ? formatCurrency(roomType.special_price) : '—'}
                    </div>
                  )}
                  <p className="text-xs text-gray-700 mt-1">Giá đặc biệt (nếu có)</p>
                </div>

                {/* Discount */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Giảm giá (%)
                  </label>
                  {isEditing ? (
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      max="1"
                      value={data.discount}
                      onChange={(e) => updateFormField(roomType.type_id, 'discount', e.target.value)}
                      placeholder="0.15 = 15%"
                      className="w-full"
                    />
                  ) : (
                    <div className="text-2xl font-bold text-red-600">
                      {roomType.discount ? `${(roomType.discount * 100).toFixed(0)}%` : '—'}
                    </div>
                  )}
                  <p className="text-xs text-gray-700 mt-1">Nhập 0.15 cho 15% giảm</p>
                </div>
              </div>

              {/* Event & Dates */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                {/* Event Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Tên chương trình
                  </label>
                  {isEditing ? (
                    <Input
                      type="text"
                      value={data.event}
                      onChange={(e) => updateFormField(roomType.type_id, 'event', e.target.value)}
                      placeholder="VD: Khuyến mãi Tết"
                      className="w-full"
                    />
                  ) : (
                    <div className="text-gray-900">
                      {roomType.event || '—'}
                    </div>
                  )}
                </div>

                {/* Start Date */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Ngày bắt đầu
                  </label>
                  {isEditing ? (
                    <Input
                      type="date"
                      value={data.start_date}
                      onChange={(e) => updateFormField(roomType.type_id, 'start_date', e.target.value)}
                      className="w-full"
                    />
                  ) : (
                    <div className="text-gray-900">
                      {roomType.start_date ? new Date(roomType.start_date).toLocaleDateString('vi-VN') : '—'}
                    </div>
                  )}
                </div>

                {/* End Date */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Ngày kết thúc
                  </label>
                  {isEditing ? (
                    <Input
                      type="date"
                      value={data.end_date}
                      onChange={(e) => updateFormField(roomType.type_id, 'end_date', e.target.value)}
                      className="w-full"
                    />
                  ) : (
                    <div className="text-gray-900">
                      {roomType.end_date ? new Date(roomType.end_date).toLocaleDateString('vi-VN') : '—'}
                    </div>
                  )}
                </div>
              </div>

              {/* Effective Price Display */}
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-gray-800 font-medium mb-1">Giá hiệu lực hiện tại:</p>
                <p className="text-3xl font-bold text-[#0071c2]">
                  {effectivePrice > 0 ? formatCurrency(effectivePrice) : 'Chưa set giá'}
                </p>
                {roomType.discount && roomType.discount > 0 && !roomType.special_price && (
                  <p className="text-sm text-gray-700 mt-1">
                    Giảm {(roomType.discount * 100).toFixed(0)}% từ giá gốc {formatCurrency(roomType.basic_price || 0)}
                  </p>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Tips */}
      <Card className="bg-gradient-to-br from-yellow-50 to-white border border-yellow-200">
        <h3 className="text-lg font-bold text-gray-900 mb-3">💡 Hướng dẫn định giá</h3>
        <ul className="text-sm text-gray-800 space-y-2">
          <li className="flex items-start gap-2">
            <span className="text-yellow-600 mt-0.5">★</span>
            <span>
              <strong>Giá cơ bản:</strong> Là giá gốc cho loại phòng (bắt buộc)
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-yellow-600 mt-0.5">★</span>
            <span>
              <strong>Giá khuyến mãi:</strong> Nếu set, giá này sẽ được ưu tiên hiển thị thay vì giá cơ bản
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-yellow-600 mt-0.5">★</span>
            <span>
              <strong>Giảm giá:</strong> Áp dụng % giảm từ giá cơ bản (nhập 0.15 cho 15% giảm)
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-yellow-600 mt-0.5">★</span>
            <span>
              <strong>Tên chương trình & Ngày:</strong> Thông tin để theo dõi các chương trình khuyến mãi
            </span>
          </li>
        </ul>
      </Card>
    </div>
  );
}
