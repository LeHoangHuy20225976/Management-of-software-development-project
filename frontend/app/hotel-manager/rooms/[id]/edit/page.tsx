'use client';

import { use, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { hotelManagerApi } from '@/lib/api/services';
import { apiClient } from '@/lib/api/client';
import { API_CONFIG } from '@/lib/api/config';

type RoomDetailResponse = {
  roomData?: Record<string, unknown>;
  roomTypeData?: Record<string, unknown>;
  priceData?: Record<string, unknown> | null;
};

export default function EditRoomPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const [roomTypeName, setRoomTypeName] = useState<string>('');

  const [formData, setFormData] = useState({
    name: '',
    location: '',
    status: 1,
    number_of_single_beds: 0,
    number_of_double_beds: 0,
    room_view: '',
    room_size: '',
    notes: '',
  });

  useEffect(() => {
    const loadRoom = async () => {
      try {
        const detail = await apiClient.get<RoomDetailResponse>(API_CONFIG.ENDPOINTS.VIEW_ROOM, {
          room_id: resolvedParams.id,
        });

        const roomData = detail?.roomData ?? {};
        const roomTypeData = detail?.roomTypeData ?? {};

        setRoomTypeName(String(roomTypeData.type ?? ''));

        setFormData({
          name: typeof roomData.name === 'string' ? roomData.name : '',
          location: typeof roomData.location === 'string' ? roomData.location : '',
          status: Number(roomData.status ?? 1) || 1,
          number_of_single_beds: Number(roomData.number_of_single_beds ?? 0) || 0,
          number_of_double_beds: Number(roomData.number_of_double_beds ?? 0) || 0,
          room_view: typeof roomData.room_view === 'string' ? roomData.room_view : '',
          room_size:
            roomData.room_size === null || roomData.room_size === undefined
              ? ''
              : String(roomData.room_size),
          notes: typeof roomData.notes === 'string' ? roomData.notes : '',
        });
      } catch (error) {
        console.error('Error loading room:', error);
        alert('Có lỗi khi tải thông tin phòng!');
        router.push('/hotel-manager/rooms');
      } finally {
        setLoading(false);
      }
    };

    loadRoom();
  }, [resolvedParams.id, router]);

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

  const handleUploadImages = async () => {
    if (selectedImages.length === 0) {
      alert('Vui lòng chọn ít nhất 1 ảnh!');
      return;
    }

    setUploadingImages(true);
    try {
      await hotelManagerApi.uploadRoomImages(resolvedParams.id, selectedImages);
      alert('Tải ảnh lên thành công!');

      setSelectedImages([]);
      imagePreviews.forEach((preview) => URL.revokeObjectURL(preview));
      setImagePreviews([]);

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error uploading images:', error);
      alert('Đã có lỗi khi tải ảnh lên. Vui lòng thử lại!');
    } finally {
      setUploadingImages(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert('Vui lòng nhập tên phòng!');
      return;
    }

    if (!formData.location.trim()) {
      alert('Vui lòng nhập vị trí phòng!');
      return;
    }

    setIsSubmitting(true);
    try {
      const room_size = formData.room_size.trim() === '' ? undefined : Number(formData.room_size);
      if (room_size !== undefined && Number.isNaN(room_size)) {
        alert('Diện tích phòng không hợp lệ!');
        return;
      }

      await hotelManagerApi.updateRoom(resolvedParams.id, {
        name: formData.name.trim(),
        location: formData.location.trim(),
        status: formData.status,
        number_of_single_beds: formData.number_of_single_beds,
        number_of_double_beds: formData.number_of_double_beds,
        room_view: formData.room_view.trim(),
        room_size,
        notes: formData.notes.trim(),
      });

      alert('Cập nhật phòng thành công!');
      router.push('/hotel-manager/rooms');
    } catch (error) {
      console.error('Error updating room:', error);
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
            <p className="text-gray-900 font-medium">Đang tải thông tin phòng...</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Chỉnh sửa phòng</h1>
          <p className="text-gray-800 mt-1">Cập nhật thông tin phòng #{resolvedParams.id}</p>
        </div>
        <Link href="/hotel-manager/rooms">
          <Button variant="outline">Quay lại</Button>
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Thông tin phòng</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Loại phòng</label>
              <Input value={roomTypeName} disabled />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Tên phòng *</label>
                <Input
                  required
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="VD: Deluxe 101"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Vị trí *</label>
                <Input
                  required
                  value={formData.location}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, location: e.target.value }))
                  }
                  placeholder="VD: Tầng 1"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Giường đơn</label>
                <Input
                  type="number"
                  value={formData.number_of_single_beds}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      number_of_single_beds: Number(e.target.value),
                    }))
                  }
                  min={0}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Giường đôi</label>
                <Input
                  type="number"
                  value={formData.number_of_double_beds}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      number_of_double_beds: Number(e.target.value),
                    }))
                  }
                  min={0}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Trạng thái</label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, status: Number(e.target.value) }))
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0071c2] focus:border-[#0071c2] text-gray-900"
                >
                  <option value={1}>Đang hoạt động</option>
                  <option value={0}>Tạm ngưng</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">View</label>
                <Input
                  value={formData.room_view}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, room_view: e.target.value }))
                  }
                  placeholder="VD: Sea view"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Diện tích (m2)
                </label>
                <Input
                  type="number"
                  value={formData.room_size}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, room_size: e.target.value }))
                  }
                  min={0}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Ghi chú</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                rows={4}
                placeholder="Ghi chú chi tiết về phòng..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0071c2] focus:border-[#0071c2] text-gray-900"
              />
            </div>
          </div>
        </Card>

        <Card>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Thêm hình ảnh phòng</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Chọn ảnh để thêm vào phòng (tối đa 10 ảnh, mỗi ảnh tối đa 5MB)
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageSelect}
                className="hidden"
                disabled={uploadingImages}
              />
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingImages}
                >
                  Chọn ảnh
                </Button>
                {selectedImages.length > 0 && (
                  <Button type="button" onClick={handleUploadImages} disabled={uploadingImages}>
                    {uploadingImages
                      ? 'Đang tải lên...'
                      : `Tải lên ${selectedImages.length} ảnh`}
                  </Button>
                )}
              </div>
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
                      disabled={uploadingImages}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                    {selectedImages[index] && (
                      <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                        {(selectedImages[index].size / 1024 / 1024).toFixed(2)} MB
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>

        <div className="flex justify-end space-x-3">
          <Link href="/hotel-manager/rooms">
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

