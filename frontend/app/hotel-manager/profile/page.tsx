'use client';

import { useMemo, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { hotelManagerApi } from '@/lib/api/services';
import { useAuth } from '@/lib/context/AuthContext';
import { API_CONFIG, getApiUrl } from '@/lib/api/config';

export default function HotelProfilePage() {
  const router = useRouter();
  const { logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deletingHotel, setDeletingHotel] = useState(false);
  const [hotelId, setHotelId] = useState<string>('');
  const [hotels, setHotels] = useState<Array<Record<string, unknown>>>([]);
  const [selectedHotelId, setSelectedHotelId] = useState<string>('');
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);

  const selectedHotel = useMemo(() => {
    if (!selectedHotelId) return null;
    return hotels.find((h) => String((h as any).hotel_id ?? (h as any).id) === selectedHotelId) ?? null;
  }, [hotels, selectedHotelId]);

  const [hotelInfo, setHotelInfo] = useState({
    name: '',
    description: '',
    address: '',
    contact_phone: '',
    rating: 0,
    status: 1,
    longitude: '',
    latitude: '',
    thumbnail: '',
  });

  useEffect(() => {
    const loadHotelInfo = async () => {
      try {
        setError('');
        const myHotels = await hotelManagerApi.getMyHotels();
        const normalized = (myHotels as unknown as Array<Record<string, unknown>>) ?? [];
        setHotels(normalized);
        const firstId = normalized.length
          ? String((normalized[0] as any).hotel_id ?? (normalized[0] as any).id)
          : '';
        setSelectedHotelId(firstId);
      } catch (error) {
        console.error('Error loading hotel info:', error);
        setError(error instanceof Error ? error.message : 'Không thể tải danh sách khách sạn');
      } finally {
        setLoading(false);
      }
    };
    loadHotelInfo();
  }, []);

  useEffect(() => {
    if (!selectedHotel) return;

    setHotelId(String((selectedHotel as any).hotel_id ?? (selectedHotel as any).id));
    setThumbnailFile(null);
    setIsEditing(false);

    setHotelInfo({
      name: String((selectedHotel as any).name ?? ''),
      description: String((selectedHotel as any).description ?? ''),
      address: String((selectedHotel as any).address ?? ''),
      contact_phone: String((selectedHotel as any).contact_phone ?? ''),
      rating: Number((selectedHotel as any).rating ?? 0),
      status: Number((selectedHotel as any).status ?? 1),
      longitude:
        (selectedHotel as any).longitude === null || (selectedHotel as any).longitude === undefined
          ? ''
          : String((selectedHotel as any).longitude),
      latitude:
        (selectedHotel as any).latitude === null || (selectedHotel as any).latitude === undefined
          ? ''
          : String((selectedHotel as any).latitude),
      thumbnail: String((selectedHotel as any).thumbnail ?? ''),
    });
  }, [selectedHotel]);

  const handleSave = async () => {
    try {
      if (!hotelId) {
        setError('Chưa chọn khách sạn để cập nhật');
        return;
      }

      setSaving(true);
      setError('');

      const longitudeNumber = hotelInfo.longitude.trim() === '' ? undefined : Number(hotelInfo.longitude);
      const latitudeNumber = hotelInfo.latitude.trim() === '' ? undefined : Number(hotelInfo.latitude);

      const hotelData: Record<string, unknown> = {
        hotelName: hotelInfo.name,
        address: hotelInfo.address,
        status: hotelInfo.status,
        description: hotelInfo.description,
        contact_phone: hotelInfo.contact_phone,
      };

      if (longitudeNumber !== undefined && !Number.isNaN(longitudeNumber)) {
        hotelData.longitude = longitudeNumber;
      }
      if (latitudeNumber !== undefined && !Number.isNaN(latitudeNumber)) {
        hotelData.latitude = latitudeNumber;
      }

      if (!thumbnailFile && hotelInfo.thumbnail.trim() !== '') {
        hotelData.thumbnail = hotelInfo.thumbnail.trim();
      }

      const formData = new FormData();
      formData.append('hotelData', JSON.stringify(hotelData));
      if (thumbnailFile) {
        formData.append('thumbnail', thumbnailFile);
      }

      const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.UPDATE_HOTEL, { hotel_id: hotelId }), {
        method: 'PUT',
        credentials: 'include',
        body: formData,
        signal: AbortSignal.timeout(API_CONFIG.TIMEOUT),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload?.message || `API Error: ${response.status} ${response.statusText}`);
      }

      const myHotels = await hotelManagerApi.getMyHotels();
      setHotels((myHotels as unknown as Array<Record<string, unknown>>) ?? []);
      alert('✅ Cập nhật thông tin thành công!');
      setIsEditing(false);
      setSaving(false);
    } catch (error) {
      console.error('Error saving hotel info:', error);
      setError(error instanceof Error ? error.message : 'Có lỗi khi lưu thông tin');
      setSaving(false);
      alert('❌ Có lỗi khi lưu thông tin!');
    }
  };

  const handleDeleteHotel = async () => {
    if (deleteConfirmText !== 'XÓA KHÁCH SẠN') {
      alert('Vui lòng nhập đúng "XÓA KHÁCH SẠN" để xác nhận!');
      return;
    }

    setDeletingHotel(true);
    try {
      await hotelManagerApi.deleteHotel(hotelId);
      alert('Khách sạn đã được xóa thành công!');
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Error deleting hotel:', error);
      alert('Không thể xóa khách sạn, vui lòng thử lại.');
    } finally {
      setDeletingHotel(false);
      setShowDeleteModal(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">
          Thông tin khách sạn
        </h1>
        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)}>✏️ Chỉnh sửa</Button>
        ) : (
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Hủy
            </Button>
            <Button onClick={handleSave}>💾 Lưu thay đổi</Button>
          </div>
        )}
      </div>

      <Card>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Thông tin cơ bản (theo DB)
        </h2>
        {loading ? (
          <p className="text-gray-700">Đang tải thông tin...</p>
        ) : (
          <div className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm font-medium">{error}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Chọn khách sạn
              </label>
              <select
                value={selectedHotelId}
                onChange={(e) => setSelectedHotelId(e.target.value)}
                disabled={isEditing || saving}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0071c2] focus:border-[#0071c2] text-gray-900 disabled:bg-gray-100"
              >
                {hotels.map((h) => (
                  <option
                    key={String((h as any).hotel_id ?? (h as any).id)}
                    value={String((h as any).hotel_id ?? (h as any).id)}
                  >
                    {String((h as any).name ?? 'Unnamed hotel')}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Tên khách sạn
              </label>
              <Input
                value={hotelInfo.name}
                onChange={(e) =>
                  setHotelInfo({ ...hotelInfo, name: e.target.value })
                }
                disabled={!isEditing}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Mô tả
              </label>
              <textarea
                value={hotelInfo.description}
                onChange={(e) =>
                  setHotelInfo({ ...hotelInfo, description: e.target.value })
                }
                disabled={!isEditing}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0071c2] focus:border-[#0071c2] text-gray-900 disabled:bg-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Hoặc upload thumbnail (ưu tiên file)
              </label>
              <input
                type="file"
                accept="image/*"
                disabled={!isEditing}
                onChange={(e) => setThumbnailFile(e.target.files?.[0] ?? null)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Địa chỉ
                </label>
                <Input
                  value={hotelInfo.address}
                  onChange={(e) =>
                    setHotelInfo({ ...hotelInfo, address: e.target.value })
                  }
                  disabled={!isEditing}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Số điện thoại liên hệ
                </label>
                <Input
                  value={hotelInfo.contact_phone}
                  onChange={(e) =>
                    setHotelInfo({
                      ...hotelInfo,
                      contact_phone: e.target.value,
                    })
                  }
                  disabled={!isEditing}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Đánh giá (rating)
                </label>
                <Input
                  type="number"
                  step="0.1"
                  value={hotelInfo.rating}
                  onChange={(e) =>
                    setHotelInfo({
                      ...hotelInfo,
                      rating: Number(e.target.value),
                    })
                  }
                  disabled={!isEditing}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Trạng thái
                </label>
                <select
                  value={hotelInfo.status}
                  onChange={(e) =>
                    setHotelInfo({
                      ...hotelInfo,
                      status: Number(e.target.value),
                    })
                  }
                  disabled={!isEditing}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0071c2] focus:border-[#0071c2] text-gray-900 disabled:bg-gray-100"
                >
                  <option value={1}>Hoạt động</option>
                  <option value={0}>Tạm ngưng</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Thumbnail URL
                </label>
                <Input
                  value={hotelInfo.thumbnail}
                  onChange={(e) =>
                    setHotelInfo({ ...hotelInfo, thumbnail: e.target.value })
                  }
                  disabled={!isEditing}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Kinh độ (longitude)
                </label>
                <Input
                  type="number"
                  step="0.000001"
                  value={hotelInfo.longitude}
                  onChange={(e) =>
                    setHotelInfo({
                      ...hotelInfo,
                      longitude: e.target.value,
                    })
                  }
                  disabled={!isEditing}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Vĩ độ (latitude)
                </label>
                <Input
                  type="number"
                  step="0.000001"
                  value={hotelInfo.latitude}
                  onChange={(e) =>
                    setHotelInfo({
                      ...hotelInfo,
                      latitude: e.target.value,
                    })
                  }
                  disabled={!isEditing}
                />
              </div>
            </div>
          </div>
        )}
      </Card>

      <Card className="bg-blue-50 border-blue-100">
        <p className="text-sm text-gray-800">
          ℹ️ Chỉ hiển thị và cập nhật các trường có trong bảng <code>Hotel</code>.
          Các tiện ích (amenities) cần lấy từ bảng <code>FacilitiesPossessing</code>,
          chính sách (policies) và giờ check-in/out nên lưu trong bảng <code>Settings</code> riêng.
        </p>
      </Card>

      {/* Danger Zone - Delete Hotel */}
      <Card className="border-red-200 bg-red-50">
        <h3 className="text-xl font-bold text-red-800 mb-4">⚠️ Vùng nguy hiểm</h3>
        <div className="p-4 bg-white rounded-lg border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-gray-900">Xóa khách sạn</p>
              <p className="text-sm text-gray-600">
                Xóa vĩnh viễn khách sạn và tất cả dữ liệu liên quan. Hành động này không thể hoàn tác.
              </p>
            </div>
            <Button
              variant="danger"
              onClick={() => setShowDeleteModal(true)}
            >
              🗑️ Xóa khách sạn
            </Button>
          </div>
        </div>
      </Card>

      {/* Delete Hotel Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
                <span className="text-3xl">⚠️</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Xóa khách sạn?</h3>
              <p className="text-gray-600 text-sm">
                Bạn sắp xóa vĩnh viễn khách sạn <strong>{hotelInfo.name}</strong>. 
                Tất cả dữ liệu bao gồm phòng, đặt phòng và đánh giá sẽ bị xóa và không thể khôi phục.
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Nhập <span className="text-red-600">XÓA KHÁCH SẠN</span> để xác nhận:
              </label>
              <Input
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="XÓA KHÁCH SẠN"
                className="text-center"
              />
            </div>

            <div className="flex space-x-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmText('');
                }}
                disabled={deletingHotel}
              >
                Hủy
              </Button>
              <Button
                variant="danger"
                className="flex-1"
                onClick={handleDeleteHotel}
                disabled={deleteConfirmText !== 'XÓA KHÁCH SẠN' || deletingHotel}
              >
                {deletingHotel ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Đang xóa...
                  </span>
                ) : (
                  'Xóa vĩnh viễn'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
