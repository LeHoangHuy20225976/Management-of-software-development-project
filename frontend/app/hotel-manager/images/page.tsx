'use client';

import { hotelManagerApi } from '@/lib/api/services';
import { useState, useEffect, useRef } from 'react';

interface HotelImage {
  id: number;
  url: string;
  type: 'hotel' | 'room' | 'facility' | 'exterior' | 'restaurant' | 'lobby';
  caption: string;
  isThumbnail: boolean;
  roomId?: number;
  uploadedAt: string;
}

const imageTypes = [
  { id: 'hotel', name: 'Khách sạn', icon: '🏨' },
  { id: 'room', name: 'Phòng', icon: '🛏️' },
  { id: 'facility', name: 'Tiện nghi', icon: '🏊' },
  { id: 'exterior', name: 'Ngoại thất', icon: '🌆' },
  { id: 'restaurant', name: 'Nhà hàng', icon: '🍽️' },
  { id: 'lobby', name: 'Sảnh', icon: '🛋️' },
];

const defaultImages: HotelImage[] = [
  {
    id: 1,
    url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
    type: 'hotel',
    caption: 'Toàn cảnh khách sạn',
    isThumbnail: true,
    uploadedAt: '2024-12-20',
  },
  {
    id: 2,
    url: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800',
    type: 'lobby',
    caption: 'Sảnh chính',
    isThumbnail: false,
    uploadedAt: '2024-12-20',
  },
  {
    id: 3,
    url: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800',
    type: 'room',
    caption: 'Phòng Deluxe King',
    isThumbnail: false,
    roomId: 1,
    uploadedAt: '2024-12-21',
  },
  {
    id: 4,
    url: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800',
    type: 'room',
    caption: 'Phòng Suite',
    isThumbnail: false,
    roomId: 2,
    uploadedAt: '2024-12-21',
  },
  {
    id: 5,
    url: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800',
    type: 'facility',
    caption: 'Hồ bơi vô cực',
    isThumbnail: false,
    uploadedAt: '2024-12-22',
  },
  {
    id: 6,
    url: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=800',
    type: 'exterior',
    caption: 'Mặt tiền khách sạn',
    isThumbnail: false,
    uploadedAt: '2024-12-22',
  },
  {
    id: 7,
    url: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800',
    type: 'restaurant',
    caption: 'Nhà hàng chính',
    isThumbnail: false,
    uploadedAt: '2024-12-23',
  },
  {
    id: 8,
    url: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800',
    type: 'room',
    caption: 'Phòng Standard Twin',
    isThumbnail: false,
    roomId: 3,
    uploadedAt: '2024-12-23',
  },
];

const today = () => new Date().toISOString().split('T')[0];

const buildImagesFromAllImagesResponse = (payload: any): HotelImage[] => {
  const images: HotelImage[] = [];
  const seenUrls = new Set<string>();

  const thumbnailUrl = typeof payload?.thumbnail === 'string' ? payload.thumbnail : null;
  if (thumbnailUrl) {
    seenUrls.add(thumbnailUrl);
    images.push({
      id: 1,
      url: thumbnailUrl,
      type: 'hotel',
      caption: 'Ảnh đại diện',
      isThumbnail: true,
      uploadedAt: today(),
    });
  }

  const hotelImages: Array<{ url: string }> = Array.isArray(payload?.hotelImages)
    ? payload.hotelImages
    : [];
  const hotelUrls = hotelImages.map((i) => i?.url).filter(Boolean);
  const uniqueHotelUrls = [...new Set(hotelUrls)].filter((u) => !!u && !seenUrls.has(u));

  uniqueHotelUrls.forEach((url, index) => {
    seenUrls.add(url);
    images.push({
      id: 2 + index,
      url,
      type: 'hotel',
      caption: `Ảnh ${index + 1}`,
      isThumbnail: false,
      uploadedAt: today(),
    });
  });

  const rooms: any[] = Array.isArray(payload?.rooms) ? payload.rooms : [];
  let nextId = 2 + uniqueHotelUrls.length;
  for (const room of rooms) {
    const roomId = typeof room?.room_id === 'number' ? room.room_id : undefined;
    const roomName = room?.room_name ?? 'Phòng';
    const roomImages: any[] = Array.isArray(room?.images) ? room.images : [];

    for (let i = 0; i < roomImages.length; i++) {
      const url = roomImages[i]?.url;
      if (typeof url !== 'string' || !url || seenUrls.has(url)) continue;
      seenUrls.add(url);
      images.push({
        id: nextId++,
        url,
        type: 'room',
        caption: `${roomName} - Ảnh ${i + 1}`,
        isThumbnail: false,
        roomId,
        uploadedAt: today(),
      });
    }
  }

  return images;
};

export default function HotelManagerImagesPage() {
  const [images, setImages] = useState<HotelImage[]>([]);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedImage, setSelectedImage] = useState<HotelImage | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [hotelId, setHotelId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [uploadForm, setUploadForm] = useState({
    type: 'hotel' as HotelImage['type'],
    caption: '',
    files: [] as File[],
  });

  useEffect(() => {
    const loadHotelAndImages = async () => {
      try {
        setLoadError(null);
        // Get hotel ID first
        const myHotels = await hotelManagerApi.getMyHotels();
        if (myHotels && myHotels.length > 0) {
          const currentHotelId = String((myHotels[0] as any).hotel_id || (myHotels[0] as any).id);
          setHotelId(currentHotelId);

          const allImagesPayload = await hotelManagerApi.getAllImages(currentHotelId);
          setImages(buildImagesFromAllImagesResponse(allImagesPayload));
        } else {
          console.warn('No hotels found');
          setImages([]);
          setLoadError('Không tìm thấy khách sạn của bạn (getMyHotels trả về rỗng).');
        }
      } catch (error) {
        console.error('Error loading hotel:', error);
        setImages([]);
        setLoadError(error instanceof Error ? error.message : 'Không load được ảnh/khách sạn.');
      } finally {
        setLoading(false);
      }
    };
    loadHotelAndImages();
  }, []);

  const saveImages = async (newImages: HotelImage[]) => {
    setImages(newImages);
    // Images will be saved via API calls when adding/deleting
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFiles = (files: File[]) => {
    const imageFiles = files.filter((f) => f.type.startsWith('image/'));
    setUploadForm((prev) => ({
      ...prev,
      files: [...prev.files, ...imageFiles],
    }));
  };

  const handleUpload = async () => {
    if (uploadForm.files.length === 0) return;

    setUploading(true);

    // Simulate upload delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const newImages: HotelImage[] = uploadForm.files.map((file, index) => ({
      id: Date.now() + index,
      url: URL.createObjectURL(file),
      type: uploadForm.type,
      caption: uploadForm.caption || file.name.replace(/\.[^/.]+$/, ''),
      isThumbnail: false,
      uploadedAt: new Date().toISOString().split('T')[0],
    }));

    saveImages([...images, ...newImages]);
    setUploadForm({ type: 'hotel', caption: '', files: [] });
    setShowUploadModal(false);
    setUploading(false);
  };

  const handleSetThumbnail = async (id: number) => {
    if (!hotelId) {
      console.warn('Missing hotelId, cannot set thumbnail');
      return;
    }
    try {
      await hotelManagerApi.setThumbnail(hotelId, id);
      const updated = images.map((img) => ({
        ...img,
        isThumbnail: img.id === id,
      }));
      setImages(updated);
    } catch (error) {
      console.error('Error setting thumbnail:', error);
    }
  };

  const handleDeleteImage = async (id: number) => {
    if (!hotelId) {
      console.warn('Missing hotelId, cannot delete image');
      return;
    }
    if (confirm('Bạn có chắc muốn xóa ảnh này?')) {
      try {
        await hotelManagerApi.deleteImage(hotelId, id);
        setImages(images.filter((img) => img.id !== id));
        setSelectedImage(null);
      } catch (error) {
        console.error('Error deleting image:', error);
        alert('Lỗi khi xóa ảnh!');
      }
    }
  };

  const handleUpdateCaption = (id: number, caption: string) => {
    const updated = images.map((img) =>
      img.id === id ? { ...img, caption } : img
    );
    setImages(updated);
    setShowEditModal(false);
    setSelectedImage(null);
  };

  const filteredImages =
    selectedType === 'all'
      ? images
      : images.filter((img) => img.type === selectedType);

  const thumbnailImage = images.find((img) => img.isThumbnail);

  const getTypeName = (type: string) => {
    return imageTypes.find((t) => t.id === type)?.name || type;
  };

  const removeUploadFile = (index: number) => {
    setUploadForm((prev) => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="space-y-6">
      {loadError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {loadError}
        </div>
      )}
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý Hình ảnh</h1>
          <p className="text-gray-600 mt-1">
            Tải lên và quản lý hình ảnh khách sạn của bạn
          </p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          Tải ảnh lên
        </button>
      </div>

      {/* Thumbnail Preview */}
      {thumbnailImage && (
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="p-4 border-b bg-gray-50">
            <h3 className="font-semibold text-gray-900">
              Ảnh đại diện khách sạn
            </h3>
            <p className="text-sm text-gray-500">
              Ảnh này sẽ hiển thị trong kết quả tìm kiếm
            </p>
          </div>
          <div className="p-4">
            <div className="relative aspect-video max-w-2xl rounded-lg overflow-hidden">
              <img
                src={thumbnailImage.url}
                alt={thumbnailImage.caption}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                <span className="text-white font-medium">
                  {thumbnailImage.caption}
                </span>
                <span className="ml-2 px-2 py-1 bg-green-500 text-white text-xs rounded-full">
                  Ảnh đại diện
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <div
          onClick={() => setSelectedType('all')}
          className={`bg-white p-4 rounded-lg shadow-sm border cursor-pointer transition-all ${
            selectedType === 'all' ? 'ring-2 ring-blue-500' : 'hover:shadow-md'
          }`}
        >
          <div className="text-2xl font-bold text-blue-600">
            {images.length}
          </div>
          <div className="text-sm text-gray-600">Tất cả</div>
        </div>
        {imageTypes.map((type) => {
          const count = images.filter((img) => img.type === type.id).length;
          return (
            <div
              key={type.id}
              onClick={() => setSelectedType(type.id)}
              className={`bg-white p-4 rounded-lg shadow-sm border cursor-pointer transition-all ${
                selectedType === type.id
                  ? 'ring-2 ring-blue-500'
                  : 'hover:shadow-md'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-xl">{type.icon}</span>
                <span className="text-2xl font-bold text-gray-700">
                  {count}
                </span>
              </div>
              <div className="text-sm text-gray-600">{type.name}</div>
            </div>
          );
        })}
      </div>

      {/* Image Gallery */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="p-4 border-b bg-gray-50 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">
            {selectedType === 'all'
              ? 'Tất cả hình ảnh'
              : `Hình ảnh ${getTypeName(selectedType)}`}
            <span className="ml-2 text-sm font-normal text-gray-500">
              ({filteredImages.length} ảnh)
            </span>
          </h3>
        </div>

        <div className="p-4">
          {filteredImages.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📷</div>
              <h3 className="text-lg font-medium text-gray-900">
                Chưa có hình ảnh nào
              </h3>
              <p className="text-gray-500 mt-1">
                Tải lên hình ảnh để hiển thị tại đây
              </p>
              <button
                onClick={() => setShowUploadModal(true)}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Tải ảnh lên
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredImages.map((image) => (
                <div
                  key={image.id}
                  className="group relative aspect-square rounded-lg overflow-hidden cursor-pointer border"
                  onClick={() => setSelectedImage(image)}
                >
                  <img
                    src={image.url}
                    alt={image.caption}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all">
                    <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-white text-sm truncate">
                        {image.caption}
                      </p>
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="absolute top-2 left-2 flex gap-1">
                    {image.isThumbnail && (
                      <span className="px-2 py-1 bg-green-500 text-white text-xs rounded-full">
                        ⭐ Đại diện
                      </span>
                    )}
                    <span className="px-2 py-1 bg-black/50 text-white text-xs rounded-full">
                      {getTypeName(image.type)}
                    </span>
                  </div>

                  {/* Quick Actions */}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                    {!image.isThumbnail && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSetThumbnail(image.id);
                        }}
                        className="p-1.5 bg-white rounded-full shadow hover:bg-gray-100"
                        title="Đặt làm ảnh đại diện"
                      >
                        ⭐
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteImage(image.id);
                      }}
                      className="p-1.5 bg-white rounded-full shadow hover:bg-red-100 text-red-600"
                      title="Xóa ảnh"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b sticky top-0 bg-white">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">
                  Tải hình ảnh lên
                </h2>
                <button
                  onClick={() => {
                    setShowUploadModal(false);
                    setUploadForm({ type: 'hotel', caption: '', files: [] });
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Drop Zone */}
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                  dragActive
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) =>
                    e.target.files && handleFiles(Array.from(e.target.files))
                  }
                  className="hidden"
                />
                <div className="text-5xl mb-4">📁</div>
                <p className="text-lg font-medium text-gray-700">
                  Kéo thả ảnh vào đây hoặc click để chọn
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Hỗ trợ: JPG, PNG, GIF (tối đa 10MB mỗi ảnh)
                </p>
              </div>

              {/* Preview Selected Files */}
              {uploadForm.files.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">
                    Đã chọn {uploadForm.files.length} ảnh
                  </h4>
                  <div className="grid grid-cols-4 gap-3">
                    {uploadForm.files.map((file, index) => (
                      <div
                        key={index}
                        className="relative aspect-square rounded-lg overflow-hidden"
                      >
                        <img
                          src={URL.createObjectURL(file)}
                          alt={file.name}
                          className="w-full h-full object-cover"
                        />
                        <button
                          onClick={() => removeUploadFile(index)}
                          className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Upload Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Loại ảnh
                  </label>
                  <select
                    value={uploadForm.type}
                    onChange={(e) =>
                      setUploadForm({
                        ...uploadForm,
                        type: e.target.value as HotelImage['type'],
                      })
                    }
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {imageTypes.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.icon} {type.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mô tả (tùy chọn)
                  </label>
                  <input
                    type="text"
                    value={uploadForm.caption}
                    onChange={(e) =>
                      setUploadForm({ ...uploadForm, caption: e.target.value })
                    }
                    placeholder="Ví dụ: Phòng Deluxe view biển"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="p-6 border-t bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  setUploadForm({ type: 'hotel', caption: '', files: [] });
                }}
                className="px-4 py-2 border rounded-lg hover:bg-gray-100"
              >
                Hủy
              </button>
              <button
                onClick={handleUpload}
                disabled={uploadForm.files.length === 0 || uploading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
              >
                {uploading ? (
                  <>
                    <svg
                      className="animate-spin w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Đang tải lên...
                  </>
                ) : (
                  <>
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                      />
                    </svg>
                    Tải lên {uploadForm.files.length} ảnh
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Detail Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-5xl w-full">
            {/* Close button */}
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300"
            >
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            <div className="bg-white rounded-xl overflow-hidden">
              <div className="relative">
                <img
                  src={selectedImage.url}
                  alt={selectedImage.caption}
                  className="w-full max-h-[60vh] object-contain bg-gray-100"
                />
              </div>

              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {selectedImage.caption}
                    </h3>
                    <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
                      <span className="px-2 py-1 bg-gray-100 rounded">
                        {getTypeName(selectedImage.type)}
                      </span>
                      <span>Tải lên: {selectedImage.uploadedAt}</span>
                      {selectedImage.isThumbnail && (
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded">
                          ⭐ Ảnh đại diện
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowEditModal(true)}
                      className="px-3 py-2 border rounded-lg hover:bg-gray-50 flex items-center gap-2"
                    >
                      ✏️ Sửa mô tả
                    </button>
                    {!selectedImage.isThumbnail && (
                      <button
                        onClick={() => handleSetThumbnail(selectedImage.id)}
                        className="px-3 py-2 border border-green-500 text-green-600 rounded-lg hover:bg-green-50 flex items-center gap-2"
                      >
                        ⭐ Đặt làm ảnh đại diện
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteImage(selectedImage.id)}
                      className="px-3 py-2 border border-red-500 text-red-600 rounded-lg hover:bg-red-50 flex items-center gap-2"
                    >
                      🗑️ Xóa
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Caption Modal */}
      {showEditModal && selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="p-6 border-b">
              <h3 className="text-lg font-bold text-gray-900">
                Chỉnh sửa mô tả
              </h3>
            </div>
            <div className="p-6">
              <input
                type="text"
                defaultValue={selectedImage.caption}
                id="editCaption"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Nhập mô tả cho ảnh..."
              />
            </div>
            <div className="p-6 border-t bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-100"
              >
                Hủy
              </button>
              <button
                onClick={() => {
                  const input = document.getElementById(
                    'editCaption'
                  ) as HTMLInputElement;
                  handleUpdateCaption(selectedImage.id, input.value);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
