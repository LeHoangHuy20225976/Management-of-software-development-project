'use client';

import { use, useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { hotelManagerApi, hotelManagerApiExtended } from '@/lib/api/services';
import type { RoomType } from '@/types';

export default function EditRoomPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [roomId, setRoomId] = useState<string>('');

  const [formData, setFormData] = useState({
    type: '',
    max_guests: 1,
    description: '',
    quantity: 0,
    availability: true,
  });

  useEffect(() => {
    const loadRoom = async () => {
      try {
        const hotelId = 'h1';
        const rooms = await hotelManagerApi.getRooms(hotelId);
        const room = rooms.find((r) => String(r.type_id) === resolvedParams.id);

        if (room) {
          setFormData({
            type: room.type || '',
            max_guests: room.max_guests || 1,
            description: room.description || '',
            quantity: room.quantity ?? 0,
            availability: Boolean(room.availability),
          });
          // Store type_id for image upload
          if (room.type_id) {
            setRoomId(String(room.type_id));
          }
        } else {
          alert('Không tìm thấy phòng!');
          router.push('/hotel-manager/rooms');
        }
      } catch (error) {
        console.error('Error loading room:', error);
        alert('Có lỗi khi tải thông tin phòng!');
      } finally {
        setLoading(false);
      }
    };

    loadRoom();
  }, [resolvedParams.id, router]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    // Validate max 10 images
    if (files.length > 10) {
      alert('Tối đa 10 ảnh!');
      return;
    }

    // Validate file types
    const invalidFiles = files.filter(file => !file.type.startsWith('image/'));
    if (invalidFiles.length > 0) {
      alert('Vui lòng chỉ chọn file ảnh!');
      return;
    }

    // Validate file sizes (max 5MB each)
    const oversizedFiles = files.filter(file => file.size > 5 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      alert('Kích thước mỗi ảnh tối đa là 5MB!');
      return;
    }

    setSelectedImages(files);

    // Create previews
    const previews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(previews);
  };

  const handleRemoveImage = (index: number) => {
    const newImages = selectedImages.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    
    // Revoke the URL to avoid memory leaks
    URL.revokeObjectURL(imagePreviews[index]);
    
    setSelectedImages(newImages);
    setImagePreviews(newPreviews);
  };

  const handleUploadImages = async () => {
    if (selectedImages.length === 0) {
      alert('Vui lòng chọn ít nhất 1 ảnh!');
      return;
    }

    if (!roomId) {
      alert('Không tìm thấy room_id. Vui lòng thử lại!');
      return;
    }

    setUploadingImages(true);
    try {
      await hotelManagerApiExtended.uploadRoomImages(roomId, selectedImages);
      alert('✅ Tải ảnh lên thành công!');
      
      // Clear selected images
      setSelectedImages([]);
      imagePreviews.forEach(preview => URL.revokeObjectURL(preview));
      setImagePreviews([]);
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error uploading images:', error);
      alert('❌ Có lỗi khi tải ảnh lên. Vui lòng thử lại!');
    } finally {
      setUploadingImages(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.type) {
      alert('Vui lòng điền đầy đủ thông tin bắt buộc!');
      return;
    }

    setIsSubmitting(true);
    try {
      const updates = {
        type: formData.type,
        max_guests: formData.max_guests,
        description: formData.description,
        quantity: formData.quantity,
        availability: formData.availability,
      };

      await hotelManagerApi.updateRoom(resolvedParams.id, updates);

      alert('✅ Cập nhật loại phòng thành công!');
      router.push('/hotel-manager/rooms');
    } catch (error) {
      console.error('Error updating room:', error);
      alert('❌ Có lỗi xảy ra. Vui lòng thử lại!');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <div className="text-center py-8">
            <p className="text-gray-900 font-medium">
              ⏳ Đang tải thông tin phòng...
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Chỉnh sửa loại phòng
          </h1>
          <p className="text-gray-800 mt-1">
            Cập nhật thông tin loại phòng #{resolvedParams.id}
          </p>
        </div>
        <Link href="/hotel-manager/rooms">
          <Button variant="outline">← Quay lại</Button>
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <Card>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Thông tin cơ bản
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Tên loại phòng *
              </label>
              <Input
                required
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value })
                }
                placeholder="VD: Phòng Deluxe"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Số khách tối đa *
                </label>
                <select
                  value={formData.max_guests}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      max_guests: Number(e.target.value),
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0071c2] focus:border-[#0071c2] text-gray-900"
                >
                  {[1, 2, 3, 4, 5, 6].map((n) => (
                    <option key={n} value={n}>
                      {n} người
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Số phòng (tổng) *
                </label>
                <Input
                  type="number"
                  required
                  value={formData.quantity}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      quantity: Number(e.target.value),
                    })
                  }
                  min={0}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Trạng thái *
                </label>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                  <input
                    type="checkbox"
                    checked={formData.availability}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        availability: e.target.checked,
                      })
                    }
                    className="w-4 h-4 text-[#0071c2] rounded focus:ring-2 focus:ring-[#0071c2]"
                  />
                  Đang mở bán
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Mô tả
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={4}
                placeholder="Mô tả chi tiết về phòng..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0071c2] focus:border-[#0071c2] text-gray-900"
              />
            </div>
          </div>
        </Card>

        {/* Room Images Upload */}
        <Card>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Thêm hình ảnh phòng
          </h2>
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
                  📷 Chọn ảnh
                </Button>
                {selectedImages.length > 0 && (
                  <Button
                    type="button"
                    onClick={handleUploadImages}
                    disabled={uploadingImages}
                  >
                    {uploadingImages ? '⏳ Đang tải lên...' : `📤 Tải lên ${selectedImages.length} ảnh`}
                  </Button>
                )}
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Đã chọn: {selectedImages.length} ảnh
              </p>
            </div>

            {/* Image Previews */}
            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative group">
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
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                    <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                      {(selectedImages[index].size / 1024 / 1024).toFixed(2)} MB
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>

        {/* Actions */}
        <div className="flex justify-end space-x-3">
          <Link href="/hotel-manager/rooms">
            <Button variant="outline" type="button" disabled={isSubmitting}>
              Hủy
            </Button>
          </Link>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? '⏳ Đang lưu...' : '💾 Lưu thay đổi'}
          </Button>
        </div>
      </form>
    </div>
  );
}
