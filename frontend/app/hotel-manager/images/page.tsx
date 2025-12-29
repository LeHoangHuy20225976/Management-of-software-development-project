'use client';

import { hotelManagerApi } from '@/lib/api/services';
import { useState, useEffect } from 'react';

interface HotelImage {
  id: number;
  backendImageId?: number;
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
  const seenImageIds = new Set<number>();
  const seenUrls = new Set<string>();
  let nextSyntheticId = -1;

  const thumbnailUrl =
    typeof payload?.thumbnail === 'string' && payload.thumbnail
      ? payload.thumbnail
      : null;

  if (thumbnailUrl) {
    seenUrls.add(thumbnailUrl);
    images.push({
      id: nextSyntheticId--,
      url: thumbnailUrl,
      type: 'hotel',
      caption: 'Thumbnail',
      isThumbnail: true,
      uploadedAt: today(),
    });
  }

  const hotelImages: Array<{ image_id?: number; id?: number; url?: string }> =
    Array.isArray(payload?.hotelImages)
    ? payload.hotelImages
    : [];

  for (let index = 0; index < hotelImages.length; index++) {
    const url = hotelImages[index]?.url;
    if (typeof url !== 'string' || !url) continue;
    if (seenUrls.has(url)) continue;
    seenUrls.add(url);

    const backendImageId =
      typeof hotelImages[index]?.image_id === 'number'
        ? hotelImages[index].image_id
        : typeof hotelImages[index]?.id === 'number'
          ? hotelImages[index].id
          : undefined;

    if (typeof backendImageId === 'number') {
      if (seenImageIds.has(backendImageId)) continue;
      seenImageIds.add(backendImageId);
    }

    images.push({
      id: typeof backendImageId === 'number' ? backendImageId : nextSyntheticId--,
      backendImageId,
      url,
      type: 'hotel',
      caption: `Image ${index + 1}`,
      isThumbnail: thumbnailUrl ? url === thumbnailUrl : false,
      uploadedAt: today(),
    });
  }

  const rooms: any[] = Array.isArray(payload?.rooms) ? payload.rooms : [];
  for (const room of rooms) {
    const roomId = typeof room?.room_id === 'number' ? room.room_id : undefined;
    const roomName = room?.room_name ?? 'Room';
    const roomImages: Array<{ image_id?: number; id?: number; url?: string }> =
      Array.isArray(room?.images)
      ? room.images
      : [];

    for (let i = 0; i < roomImages.length; i++) {
      const url = roomImages[i]?.url;
      if (typeof url !== 'string' || !url) continue;
      if (seenUrls.has(url)) continue;
      seenUrls.add(url);

      const backendImageId =
        typeof roomImages[i]?.image_id === 'number'
          ? roomImages[i].image_id
          : typeof roomImages[i]?.id === 'number'
            ? roomImages[i].id
            : undefined;

      if (typeof backendImageId === 'number') {
        if (seenImageIds.has(backendImageId)) continue;
        seenImageIds.add(backendImageId);
      }

      images.push({
        id: typeof backendImageId === 'number' ? backendImageId : nextSyntheticId--,
        backendImageId,
        url,
        type: 'room',
        caption: `${roomName} - Image ${i + 1}`,
        isThumbnail: thumbnailUrl ? url === thumbnailUrl : false,
        roomId,
        uploadedAt: today(),
      });
    }
  }

  return images;
};

export default function HotelManagerImagesPage() {
  const [myHotels, setMyHotels] = useState<any[]>([]);
  const [images, setImages] = useState<HotelImage[]>([]);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedImage, setSelectedImage] = useState<HotelImage | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [loadingHotels, setLoadingHotels] = useState(true);
  const [loadingImages, setLoadingImages] = useState(false);
  const [hotelsError, setHotelsError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [hotelId, setHotelId] = useState<string | null>(null);

  const getHotelId = (hotel: any) =>
    hotel?.hotel_id ?? hotel?.id ?? hotel?.hotelId ?? hotel?.hotelID;
  const getHotelName = (hotel: any) =>
    hotel?.hotel_name ?? hotel?.name ?? hotel?.hotelName ?? hotel?.hotel_title ?? null;

  useEffect(() => {
    const loadHotels = async () => {
      try {
        setHotelsError(null);
        const hotels = await hotelManagerApi.getMyHotels();
        setMyHotels(Array.isArray(hotels) ? hotels : []);

        if (Array.isArray(hotels) && hotels.length === 1) {
          const onlyHotelId = String((hotels[0] as any).hotel_id || (hotels[0] as any).id);
          setHotelId(onlyHotelId);
        } else {
          setHotelId(null);
        }
      } catch (error) {
        console.error('Error loading hotels:', error);
        setMyHotels([]);
        setHotelId(null);
        setHotelsError(
          error instanceof Error
            ? error.message
            : 'Không thể tải danh sách khách sạn.'
        );
      } finally {
        setLoadingHotels(false);
      }
    };

    loadHotels();
  }, []);

  useEffect(() => {
    const loadImages = async () => {
      if (!hotelId) {
        setImages([]);
        setLoadError(null);
        setSelectedImage(null);
        return;
      }

      try {
        setLoadError(null);
        setLoadingImages(true);
        setSelectedImage(null);
        console.log('[HotelManagerImages] loading images for hotelId:', hotelId);
        const allImagesPayload = await hotelManagerApi.getAllImages(hotelId);
        console.log('[HotelManagerImages] getAllImages response:', allImagesPayload);
        setImages(buildImagesFromAllImagesResponse(allImagesPayload));
      } catch (error) {
        console.error('Error loading images:', error);
        setImages([]);
        setLoadError(error instanceof Error ? error.message : 'Không thể tải hình ảnh.');
      } finally {
        setLoadingImages(false);
      }
    };

    loadImages();
  }, [hotelId]);


  const handleSetThumbnail = async (image: HotelImage) => {
    if (!hotelId) {
      console.warn('Missing hotelId, cannot set thumbnail');
      return;
    }

    const imageId = image.backendImageId ?? image.id;
    if (typeof imageId !== 'number' || !Number.isFinite(imageId) || imageId < 0) {
      console.warn('Missing backend image id, cannot set thumbnail', image);
      alert('Không thể đặt ảnh đại diện: ảnh này không có image_id.');
      return;
    }
    try {
      await hotelManagerApi.setThumbnail(hotelId, imageId);
      const updated = images.map((img) => ({
        ...img,
        isThumbnail: (img.backendImageId ?? img.id) === imageId,
      }));
      setImages(updated);
      setSelectedImage((prev) =>
        prev
          ? { ...prev, isThumbnail: (prev.backendImageId ?? prev.id) === imageId }
          : prev
      );
    } catch (error) {
      console.error('Error setting thumbnail:', error);
    }
  };

  const handleDeleteImage = async (image: HotelImage) => {
    if (!hotelId) {
      console.warn('Missing hotelId, cannot delete image');
      return;
    }

    const imageId = image.backendImageId ?? image.id;
    if (typeof imageId !== 'number' || !Number.isFinite(imageId) || imageId < 0) {
      console.warn('Missing backend image id, cannot delete image', image);
      alert("Không thể xóa ảnh: ảnh này không có image_id.");
      return;
    }

    if (confirm('Bạn có chắc muốn xóa ảnh này?')) {
      try {
        await hotelManagerApi.deleteImage(hotelId, imageId);
        setImages(images.filter((img) => (img.backendImageId ?? img.id) !== imageId));
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

  return (
    <div className="space-y-6">
      {hotelsError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {hotelsError}
        </div>
      )}
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
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
          <label className="text-sm font-medium text-gray-700">Chon khach san</label>
          <select
            value={hotelId ?? ''}
            onChange={(e) => {
              const nextHotelId = e.target.value || null;
              setSelectedType('all');
              setHotelId(nextHotelId);
            }}
            disabled={loadingHotels || myHotels.length === 0}
            className="min-w-[240px] px-3 py-2 border rounded-lg bg-white disabled:bg-gray-100"
          >
            <option value="">
              {loadingHotels ? 'Dang tai...' : '-- Chon --'}
            </option>
            {myHotels.map((h) => {
              const rawId = getHotelId(h);
              if (!rawId) return null;
              const id = String(rawId);
              const name = getHotelName(h) || `Hotel ${id}`;
              return (
                <option key={id} value={id}>
                  {name}
                </option>
              );
            })}
          </select>
        </div>
      </div>

      {loadingImages && hotelId && (
        <div className="text-sm text-gray-600">Dang tai anh...</div>
      )}

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
              \1{hotelId ? 'Khong co anh nao cho khach san nay.' : 'Hay chon khach san de xem anh.'}\2
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
                          handleSetThumbnail(image);
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
                        handleDeleteImage(image);
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
      </div>      {/* Image Detail Modal */}
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
                        onClick={() => handleSetThumbnail(selectedImage)}
                        className="px-3 py-2 border border-green-500 text-green-600 rounded-lg hover:bg-green-50 flex items-center gap-2"
                      >
                        ⭐ Đặt làm ảnh đại diện
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteImage(selectedImage)}
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
