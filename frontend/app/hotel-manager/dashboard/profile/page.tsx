'use client';

import { useState } from 'react';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';

export default function HotelProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [hotelInfo, setHotelInfo] = useState({
    name: 'Grand Hotel Saigon',
    description:
      'Khách sạn 5 sao sang trọng tại trung tâm Sài Gòn với thiết kế hiện đại, view toàn cảnh thành phố.',
    address: '123 Đường Nguyễn Huệ',
    city: 'Hồ Chí Minh',
    district: 'Quận 1',
    phone: '028 3823 5678',
    email: 'contact@grandhotelsaigon.vn',
    website: 'www.grandhotelsaigon.vn',
    stars: 5,
    checkInTime: '14:00',
    checkOutTime: '12:00',
  });

  const [policies, setPolicies] = useState({
    cancellation: 'Miễn phí hủy trước 24 giờ',
    children: 'Chấp nhận trẻ em dưới 12 tuổi miễn phí',
    pets: 'Không chấp nhận thú cưng',
    smoking: 'Không hút thuốc trong phòng',
    payment: 'Chấp nhận thẻ tín dụng, chuyển khoản, tiền mặt',
  });

  const amenities = [
    { id: 'pool', name: 'Hồ bơi', icon: '🏊', enabled: true },
    { id: 'gym', name: 'Phòng gym', icon: '💪', enabled: true },
    { id: 'spa', name: 'Spa', icon: '💆', enabled: true },
    { id: 'restaurant', name: 'Nhà hàng', icon: '🍽️', enabled: true },
    { id: 'wifi', name: 'WiFi miễn phí', icon: '📶', enabled: true },
    { id: 'parking', name: 'Bãi đỗ xe', icon: '🅿️', enabled: true },
    { id: 'bar', name: 'Quầy bar', icon: '🍸', enabled: true },
    { id: 'beach', name: 'Bãi biển riêng', icon: '🏖️', enabled: false },
    { id: 'concierge', name: 'Lễ tân 24/7', icon: '🛎️', enabled: true },
    { id: 'meeting', name: 'Phòng họp', icon: '👔', enabled: true },
  ];

  const handleSave = () => {
    console.log('Saving hotel info:', hotelInfo, policies);
    setIsEditing(false);
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

      {/* Basic Info */}
      <Card>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Thông tin cơ bản
        </h2>
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
                Thành phố
              </label>
              <Input
                value={hotelInfo.city}
                onChange={(e) =>
                  setHotelInfo({ ...hotelInfo, city: e.target.value })
                }
                disabled={!isEditing}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Quận/Huyện
              </label>
              <Input
                value={hotelInfo.district}
                onChange={(e) =>
                  setHotelInfo({ ...hotelInfo, district: e.target.value })
                }
                disabled={!isEditing}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Điện thoại
              </label>
              <Input
                value={hotelInfo.phone}
                onChange={(e) =>
                  setHotelInfo({ ...hotelInfo, phone: e.target.value })
                }
                disabled={!isEditing}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Hạng sao
              </label>
              <select
                value={hotelInfo.stars}
                onChange={(e) =>
                  setHotelInfo({ ...hotelInfo, stars: Number(e.target.value) })
                }
                disabled={!isEditing}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0071c2] focus:border-[#0071c2] text-gray-900 disabled:bg-gray-100"
              >
                {[1, 2, 3, 4, 5].map((star) => (
                  <option key={star} value={star}>
                    {star} sao
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Email
              </label>
              <Input
                type="email"
                value={hotelInfo.email}
                onChange={(e) =>
                  setHotelInfo({ ...hotelInfo, email: e.target.value })
                }
                disabled={!isEditing}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Website
              </label>
              <Input
                value={hotelInfo.website}
                onChange={(e) =>
                  setHotelInfo({ ...hotelInfo, website: e.target.value })
                }
                disabled={!isEditing}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Giờ nhận phòng
              </label>
              <Input
                type="time"
                value={hotelInfo.checkInTime}
                onChange={(e) =>
                  setHotelInfo({ ...hotelInfo, checkInTime: e.target.value })
                }
                disabled={!isEditing}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Giờ trả phòng
              </label>
              <Input
                type="time"
                value={hotelInfo.checkOutTime}
                onChange={(e) =>
                  setHotelInfo({ ...hotelInfo, checkOutTime: e.target.value })
                }
                disabled={!isEditing}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Amenities */}
      <Card>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Tiện ích</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {amenities.map((amenity) => (
            <label
              key={amenity.id}
              className={`flex flex-col items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                amenity.enabled
                  ? 'border-[#0071c2] bg-blue-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              } ${!isEditing ? 'cursor-not-allowed opacity-70' : ''}`}
            >
              <input
                type="checkbox"
                checked={amenity.enabled}
                disabled={!isEditing}
                className="sr-only"
              />
              <span className="text-4xl mb-2">{amenity.icon}</span>
              <span className="text-sm font-semibold text-gray-900 text-center">
                {amenity.name}
              </span>
            </label>
          ))}
        </div>
      </Card>

      {/* Policies */}
      <Card>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Chính sách</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Chính sách hủy phòng
            </label>
            <Input
              value={policies.cancellation}
              onChange={(e) =>
                setPolicies({ ...policies, cancellation: e.target.value })
              }
              disabled={!isEditing}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Chính sách trẻ em
            </label>
            <Input
              value={policies.children}
              onChange={(e) =>
                setPolicies({ ...policies, children: e.target.value })
              }
              disabled={!isEditing}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Chính sách thú cưng
            </label>
            <Input
              value={policies.pets}
              onChange={(e) =>
                setPolicies({ ...policies, pets: e.target.value })
              }
              disabled={!isEditing}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Chính sách hút thuốc
            </label>
            <Input
              value={policies.smoking}
              onChange={(e) =>
                setPolicies({ ...policies, smoking: e.target.value })
              }
              disabled={!isEditing}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Phương thức thanh toán
            </label>
            <Input
              value={policies.payment}
              onChange={(e) =>
                setPolicies({ ...policies, payment: e.target.value })
              }
              disabled={!isEditing}
            />
          </div>
        </div>
      </Card>

      {/* Images Management */}
      <Card>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Hình ảnh</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="relative aspect-video bg-gray-200 rounded-lg overflow-hidden group"
            >
              <img
                src={`https://images.unsplash.com/photo-${
                  1566073771259 + i
                }-6a8506099945?w=400`}
                alt={`Hotel ${i}`}
                className="w-full h-full object-cover"
              />
              {isEditing && (
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                  <button className="px-3 py-1 bg-white text-gray-900 rounded text-sm">
                    Sửa
                  </button>
                  <button className="px-3 py-1 bg-red-600 text-white rounded text-sm">
                    Xóa
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
        {isEditing && <Button variant="outline">📷 Thêm hình ảnh</Button>}
      </Card>
    </div>
  );
}
