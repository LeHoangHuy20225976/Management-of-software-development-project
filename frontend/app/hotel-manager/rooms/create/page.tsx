'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { hotelManagerApi } from '@/lib/api/services';
import { apiClient } from '@/lib/api/client';
import { API_CONFIG } from '@/lib/api/config';

type RoomTypeLike = {
  type_id: number;
  type: string;
  max_guests?: number;
  availability?: boolean;
  description?: string | null;
  priceData?: Record<string, unknown> | null;
  RoomPrice?: Record<string, unknown> | null;
  roomPrice?: Record<string, unknown> | null;
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

const getBackendRoomPrice = (roomType: unknown): Record<string, unknown> => {
  const rt = roomType as any;
  if (rt?.priceData && typeof rt.priceData === 'object') return rt.priceData;
  if (rt?.RoomPrice && typeof rt.RoomPrice === 'object') return rt.RoomPrice;
  if (rt?.roomPrice && typeof rt.roomPrice === 'object') return rt.roomPrice;
  return {};
};

export default function CreateRoomPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loadingHotels, setLoadingHotels] = useState(true);
  const [hotels, setHotels] = useState<Array<Record<string, unknown>>>([]);
  const [loadingTypes, setLoadingTypes] = useState(false);
  const [roomTypes, setRoomTypes] = useState<RoomTypeLike[]>([]);
  const [typeMode, setTypeMode] = useState<'existing' | 'new'>('existing');
  const [selectedTypeId, setSelectedTypeId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    hotel_id: '',
    type: '',
    max_guests: 1,
    availability: true,
    typeDescription: '',
    basic_price: 0,
    special_price: '',
    discount: 0,
    event: '',
    roomName: '',
    roomLocation: '',
    number_of_single_beds: 0,
    number_of_double_beds: 0,
    room_view: '',
    room_size: '',
    notes: '',
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

  useEffect(() => {
    const loadRoomTypes = async () => {
      if (!formData.hotel_id) {
        setRoomTypes([]);
        setSelectedTypeId('');
        setTypeMode('new');
        return;
      }

      try {
        setLoadingTypes(true);
        const types = await apiClient.get<RoomTypeLike[]>(API_CONFIG.ENDPOINTS.VIEW_ROOM_TYPES, {
          hotel_id: formData.hotel_id,
        });

        const normalizedTypes = types ?? [];
        setRoomTypes(normalizedTypes);

        if (normalizedTypes.length === 0) {
          setSelectedTypeId('');
          setTypeMode('new');
          return;
        }

        const nextTypeId = selectedTypeId || String(normalizedTypes[0].type_id);
        setSelectedTypeId(nextTypeId);
        const picked =
          normalizedTypes.find((t) => String(t.type_id) === nextTypeId) ?? normalizedTypes[0];

        const price = getBackendRoomPrice(picked);
        setFormData((prev) => ({
          ...prev,
          type: picked.type,
          max_guests: typeof picked.max_guests === 'number' ? picked.max_guests : prev.max_guests,
          availability:
            typeof picked.availability === 'boolean' ? picked.availability : prev.availability,
          typeDescription:
            typeof picked.description === 'string' ? picked.description : prev.typeDescription,
          basic_price:
            toNumberOrNull(price.basic_price) ?? toNumberOrNull(price.price) ?? prev.basic_price,
          special_price:
            toNumberOrNull(price.special_price) === null
              ? ''
              : String(toNumberOrNull(price.special_price)),
          discount: toNumberOrNull(price.discount) ?? 0,
          event: typeof price.event === 'string' ? price.event : '',
        }));
      } catch (error) {
        console.error('Error loading room types:', error);
        setRoomTypes([]);
        setSelectedTypeId('');
        setTypeMode('new');
      } finally {
        setLoadingTypes(false);
      }
    };

    loadRoomTypes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.hotel_id]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    if (files.length > 10) {
      alert('Tối đa 10 ảnh!');
      return;
    }

    const invalidFiles = files.filter((file) => !file.type.startsWith('image/'));
    if (invalidFiles.length > 0) {
      alert('Vui lòng chỉ chọn file ảnh!');
      return;
    }

    const oversizedFiles = files.filter((file) => file.size > 5 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      alert('Kích thước mỗi ảnh tối đa là 5MB!');
      return;
    }

    setSelectedImages(files);
    const previews = files.map((file) => URL.createObjectURL(file));
    setImagePreviews(previews);
  };

  const handleRemoveImage = (index: number) => {
    const nextImages = selectedImages.filter((_, i) => i !== index);
    const nextPreviews = imagePreviews.filter((_, i) => i !== index);
    URL.revokeObjectURL(imagePreviews[index]);
    setSelectedImages(nextImages);
    setImagePreviews(nextPreviews);
  };

  const resolveOrCreateTypeId = async (): Promise<number> => {
    const hotelId = formData.hotel_id;
    const typeName = formData.type.trim();

    const types = await apiClient.get<RoomTypeLike[]>(API_CONFIG.ENDPOINTS.VIEW_ROOM_TYPES, {
      hotel_id: hotelId,
    });

    const existing = types.find((t) => normalizeType(t.type) === normalizeType(typeName));
    if (existing) return existing.type_id;

    if (!Number.isFinite(formData.basic_price) || formData.basic_price <= 0) {
      throw new Error('Vui lòng nhập giá cơ bản hợp lệ để tạo loại phòng');
    }

    const specialPrice =
      formData.special_price.trim() === '' ? undefined : Number(formData.special_price);
    if (specialPrice !== undefined && Number.isNaN(specialPrice)) {
      throw new Error('Giá đặc biệt không hợp lệ');
    }

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
        hotel_id: Number(hotelId),
        type: typeName,
        availability: formData.availability,
        max_guests: formData.max_guests,
        description: formData.typeDescription,
        priceData,
      },
    });

    const typesAfter = await apiClient.get<RoomTypeLike[]>(API_CONFIG.ENDPOINTS.VIEW_ROOM_TYPES, {
      hotel_id: hotelId,
    });

    const created = typesAfter.find((t) => normalizeType(t.type) === normalizeType(typeName));
    if (!created) {
      throw new Error('Tạo loại phòng thành công nhưng không tìm thấy type_id');
    }
    return created.type_id;
  };

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

    if (!formData.roomName.trim()) {
      alert('Vui lòng nhập tên phòng!');
      return;
    }

    if (!formData.roomLocation.trim()) {
      alert('Vui lòng nhập vị trí phòng!');
      return;
    }

    setIsSubmitting(true);
    try {
      const typeId = await resolveOrCreateTypeId();

      const roomData: Record<string, unknown> = {
        type_id: typeId,
        name: formData.roomName.trim(),
        location: formData.roomLocation.trim(),
        number_of_single_beds: formData.number_of_single_beds,
        number_of_double_beds: formData.number_of_double_beds,
      };

      if (formData.room_view.trim()) roomData.room_view = formData.room_view.trim();

      const roomSize =
        formData.room_size.trim() === '' ? undefined : Number(formData.room_size.trim());
      if (roomSize !== undefined) {
        if (Number.isNaN(roomSize)) {
          throw new Error('Diện tích phòng không hợp lệ');
        }
        roomData.room_size = roomSize;
      }

      if (formData.notes.trim()) roomData.notes = formData.notes.trim();

      const form = new FormData();
      form.append('roomData', JSON.stringify(roomData));
      selectedImages.forEach((image) => form.append('images', image));

      await apiClient.postFormData(API_CONFIG.ENDPOINTS.ADD_ROOM, {}, form);

      alert('Thêm phòng thành công!');
      router.push('/hotel-manager/rooms');
    } catch (error) {
      console.error('Error creating room:', error);
      alert(error instanceof Error ? error.message : 'Có lỗi xảy ra, vui lòng thử lại!');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Thêm phòng mới</h1>
          <p className="text-gray-800 mt-1">
            Chọn khách sạn → chọn/nhập loại phòng → thêm phòng
          </p>
        </div>
        <Link href="/hotel-manager/rooms">
          <Button variant="outline">Quay lại</Button>
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Khách sạn & loại phòng</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Khách sạn *
              </label>
              <select
                required
                value={formData.hotel_id}
                onChange={(e) => {
                  const nextHotelId = e.target.value;
                  setFormData((prev) => ({ ...prev, hotel_id: nextHotelId, type: '' }));
                  setSelectedTypeId('');
                  setTypeMode('existing');
                }}
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Loại phòng (type) *
                </label>
                <div className="space-y-2">
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                      <input
                        type="radio"
                        name="typeMode"
                        value="existing"
                        checked={typeMode === 'existing'}
                        disabled={isSubmitting || loadingTypes || roomTypes.length === 0}
                        onChange={() => {
                          setTypeMode('existing');
                          if (roomTypes.length > 0) {
                            const picked =
                              roomTypes.find((t) => String(t.type_id) === selectedTypeId) ??
                              roomTypes[0];
                            setSelectedTypeId(String(picked.type_id));
                            const price = getBackendRoomPrice(picked);
                            setFormData((prev) => ({
                              ...prev,
                              type: picked.type,
                              max_guests:
                                typeof picked.max_guests === 'number'
                                  ? picked.max_guests
                                  : prev.max_guests,
                              availability:
                                typeof picked.availability === 'boolean'
                                  ? picked.availability
                                  : prev.availability,
                              typeDescription:
                                typeof picked.description === 'string'
                                  ? picked.description
                                  : prev.typeDescription,
                              basic_price:
                                toNumberOrNull(price.basic_price) ??
                                toNumberOrNull(price.price) ??
                                prev.basic_price,
                              special_price:
                                toNumberOrNull(price.special_price) === null
                                  ? ''
                                  : String(toNumberOrNull(price.special_price)),
                              discount: toNumberOrNull(price.discount) ?? 0,
                              event: typeof price.event === 'string' ? price.event : '',
                            }));
                          }
                        }}
                        className="w-4 h-4 text-[#0071c2] rounded focus:ring-2 focus:ring-[#0071c2]"
                      />
                      Dùng loại có sẵn
                    </label>
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                      <input
                        type="radio"
                        name="typeMode"
                        value="new"
                        checked={typeMode === 'new'}
                        disabled={isSubmitting}
                        onChange={() => setTypeMode('new')}
                        className="w-4 h-4 text-[#0071c2] rounded focus:ring-2 focus:ring-[#0071c2]"
                      />
                      Tạo loại mới
                    </label>
                  </div>

                  {typeMode === 'existing' && roomTypes.length > 0 ? (
                    <select
                      required
                      value={selectedTypeId || ''}
                      disabled={isSubmitting || loadingTypes}
                      onChange={(e) => {
                        const nextId = e.target.value;
                        setSelectedTypeId(nextId);
                        const picked = roomTypes.find((t) => String(t.type_id) === nextId);
                        if (!picked) return;
                        const price = getBackendRoomPrice(picked);
                        setFormData((prev) => ({
                          ...prev,
                          type: picked.type,
                          max_guests:
                            typeof picked.max_guests === 'number'
                              ? picked.max_guests
                              : prev.max_guests,
                          availability:
                            typeof picked.availability === 'boolean'
                              ? picked.availability
                              : prev.availability,
                          typeDescription:
                            typeof picked.description === 'string'
                              ? picked.description
                              : prev.typeDescription,
                          basic_price:
                            toNumberOrNull(price.basic_price) ??
                            toNumberOrNull(price.price) ??
                            prev.basic_price,
                          special_price:
                            toNumberOrNull(price.special_price) === null
                              ? ''
                              : String(toNumberOrNull(price.special_price)),
                          discount: toNumberOrNull(price.discount) ?? 0,
                          event: typeof price.event === 'string' ? price.event : '',
                        }));
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0071c2] focus:border-[#0071c2] text-gray-900 disabled:bg-gray-100"
                    >
                      {roomTypes.map((t) => (
                        <option key={t.type_id} value={String(t.type_id)}>
                          {t.type}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <Input
                      required
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      placeholder="VD: Deluxe"
                    />
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Số khách tối đa (max_guests)
                </label>
                <Input
                  type="number"
                  value={formData.max_guests}
                  onChange={(e) =>
                    setFormData({ ...formData, max_guests: Number(e.target.value) })
                  }
                  min={1}
                  disabled={typeMode === 'existing' && roomTypes.length > 0}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Giá cơ bản (basic_price) *
                </label>
                <Input
                  type="number"
                  required={typeMode === 'new' || roomTypes.length === 0}
                  value={formData.basic_price}
                  onChange={(e) =>
                    setFormData({ ...formData, basic_price: Number(e.target.value) })
                  }
                  min={0}
                  step="any"
                  disabled={typeMode === 'existing' && roomTypes.length > 0}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Giá đặc biệt (special_price)
                </label>
                <Input
                  type="number"
                  value={formData.special_price}
                  onChange={(e) => setFormData({ ...formData, special_price: e.target.value })}
                  min={0}
                  step="any"
                  disabled={typeMode === 'existing' && roomTypes.length > 0}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Giảm giá (discount)
                </label>
                <Input
                  type="number"
                  value={formData.discount}
                  onChange={(e) => setFormData({ ...formData, discount: Number(e.target.value) })}
                  min={0}
                  max={1}
                  step="0.01"
                  disabled={typeMode === 'existing' && roomTypes.length > 0}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-end">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                  <input
                    type="checkbox"
                    checked={formData.availability}
                    onChange={(e) =>
                      setFormData({ ...formData, availability: e.target.checked })
                    }
                    className="w-4 h-4 text-[#0071c2] rounded focus:ring-2 focus:ring-[#0071c2]"
                    disabled={typeMode === 'existing' && roomTypes.length > 0}
                  />
                  Đang mở bán
                </label>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Sự kiện (event)
                </label>
                <Input
                  value={formData.event}
                  onChange={(e) => setFormData({ ...formData, event: e.target.value })}
                  placeholder="VD: Summer sale"
                  disabled={typeMode === 'existing' && roomTypes.length > 0}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Mô tả loại phòng (description)
              </label>
              <textarea
                value={formData.typeDescription}
                onChange={(e) => setFormData({ ...formData, typeDescription: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0071c2] focus:border-[#0071c2] text-gray-900"
                disabled={typeMode === 'existing' && roomTypes.length > 0}
              />
            </div>
          </div>
        </Card>

        <Card>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Thông tin phòng</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Tên phòng (name) *
                </label>
                <Input
                  required
                  value={formData.roomName}
                  onChange={(e) => setFormData({ ...formData, roomName: e.target.value })}
                  placeholder="VD: Deluxe 101"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Vị trí (location) *
                </label>
                <Input
                  required
                  value={formData.roomLocation}
                  onChange={(e) => setFormData({ ...formData, roomLocation: e.target.value })}
                  placeholder="VD: Tầng 1 - Hướng biển"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Giường đơn (number_of_single_beds)
                </label>
                <Input
                  type="number"
                  value={formData.number_of_single_beds}
                  onChange={(e) =>
                    setFormData({ ...formData, number_of_single_beds: Number(e.target.value) })
                  }
                  min={0}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Giường đôi (number_of_double_beds)
                </label>
                <Input
                  type="number"
                  value={formData.number_of_double_beds}
                  onChange={(e) =>
                    setFormData({ ...formData, number_of_double_beds: Number(e.target.value) })
                  }
                  min={0}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  View (room_view)
                </label>
                <Input
                  value={formData.room_view}
                  onChange={(e) => setFormData({ ...formData, room_view: e.target.value })}
                  placeholder="VD: Sea view"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Diện tích (room_size)
                </label>
                <Input
                  type="number"
                  value={formData.room_size}
                  onChange={(e) => setFormData({ ...formData, room_size: e.target.value })}
                  min={0}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Ghi chú (notes)
                </label>
                <Input
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Tuỳ chọn"
                />
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Ảnh phòng (tuỳ chọn)</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Chọn ảnh (tối đa 10 ảnh, mỗi ảnh tối đa 5MB)
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageSelect}
                className="hidden"
              />
              <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                Chọn ảnh
              </Button>
              <p className="text-sm text-gray-600 mt-2">Đã chọn: {selectedImages.length} ảnh</p>
            </div>

            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {imagePreviews.map((preview, index) => (
                  <div key={preview} className="relative group">
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg border-2 border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>

        <div className="flex justify-end space-x-3">
          <Link href="/hotel-manager/rooms">
            <Button variant="outline" type="button" disabled={isSubmitting}>
              Huỷ
            </Button>
          </Link>
          <Button type="submit" disabled={isSubmitting || loadingHotels || hotels.length === 0}>
            {isSubmitting ? 'Đang tạo...' : 'Thêm phòng'}
          </Button>
        </div>
      </form>
    </div>
  );
}
