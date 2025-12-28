'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { hotelManagerApi } from '@/lib/api/services';

export default function HotelProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hotelInfo, setHotelInfo] = useState({
    name: '',
    description: '',
    address: '',
    contact_phone: '',
    rating: 0,
    status: 1,
    longitude: 0,
    latitude: 0,
    thumbnail: '',
  });

  useEffect(() => {
    const loadHotelInfo = async () => {
      try {
        const hotelId = 'h1';
        const info = await hotelManagerApi.getHotelInfo(hotelId);
        setHotelInfo({
          name: info.name || '',
          description: info.description || '',
          address: info.address || '',
          contact_phone: info.contact_phone || '',
          rating: info.rating ?? 0,
          status: info.status ?? 1,
          longitude: info.longitude ?? 0,
          latitude: info.latitude ?? 0,
          thumbnail: info.thumbnail || '',
        });
      } catch (error) {
        console.error('Error loading hotel info:', error);
      } finally {
        setLoading(false);
      }
    };
    loadHotelInfo();
  }, []);

  const handleSave = async () => {
    try {
      const hotelId = 'h1';
      await hotelManagerApi.updateHotelInfo(hotelId, {
        name: hotelInfo.name,
        description: hotelInfo.description,
        address: hotelInfo.address,
        contact_phone: hotelInfo.contact_phone,
        rating: hotelInfo.rating,
        status: hotelInfo.status,
        longitude: hotelInfo.longitude,
        latitude: hotelInfo.latitude,
        thumbnail: hotelInfo.thumbnail,
      });
      alert('✅ Cập nhật thông tin thành công!');
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving hotel info:', error);
      alert('❌ Có lỗi khi lưu thông tin!');
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
                      longitude: Number(e.target.value),
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
                      latitude: Number(e.target.value),
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
    </div>
  );
}
