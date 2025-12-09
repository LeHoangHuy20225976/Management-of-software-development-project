/**
 * Hotel Info/Profile Page
 * FE4: Hotel Manager Portal
 */

'use client';

import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { useState } from 'react';

export default function HotelProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: 'Grand Hotel Saigon',
    stars: 5,
    address: '123 Đường Nguyễn Huệ',
    city: 'Hồ Chí Minh',
    district: 'Quận 1',
    description: 'Khách sạn 5 sao cao cấp tại trung tâm Sài Gòn với đầy đủ tiện nghi hiện đại.',
    phone: '0283 8291 234',
    email: 'contact@grandhotelsaigon.com',
    website: 'https://grandhotelsaigon.com',
    checkInTime: '14:00',
    checkOutTime: '12:00',
    cancellationPolicy: 'Miễn phí hủy trước 24 giờ',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Call API to update hotel info
    setIsEditing(false);
    alert('Cập nhật thông tin thành công!');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Thông tin khách sạn</h1>
        {!isEditing && (
          <Button onClick={() => setIsEditing(true)}>
            ✏️ Chỉnh sửa
          </Button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <h2 className="text-xl font-bold mb-4">Thông tin cơ bản</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Tên khách sạn</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={!isEditing}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Hạng sao</label>
              <select
                value={formData.stars}
                onChange={(e) => setFormData({ ...formData, stars: Number(e.target.value) })}
                disabled={!isEditing}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
              >
                {[1, 2, 3, 4, 5].map((star) => (
                  <option key={star} value={star}>
                    {star} sao
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium mb-2">Mô tả</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              disabled={!isEditing}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
              required
            />
          </div>
        </Card>

        {/* Location */}
        <Card>
          <h2 className="text-xl font-bold mb-4">Địa chỉ</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Địa chỉ</label>
              <Input
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                disabled={!isEditing}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Thành phố</label>
              <Input
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                disabled={!isEditing}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Quận/Huyện</label>
              <Input
                value={formData.district}
                onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                disabled={!isEditing}
                required
              />
            </div>
          </div>
        </Card>

        {/* Contact Information */}
        <Card>
          <h2 className="text-xl font-bold mb-4">Thông tin liên hệ</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Số điện thoại</label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                disabled={!isEditing}
                type="tel"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <Input
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={!isEditing}
                type="email"
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Website</label>
              <Input
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                disabled={!isEditing}
                type="url"
              />
            </div>
          </div>
        </Card>

        {/* Policies */}
        <Card>
          <h2 className="text-xl font-bold mb-4">Chính sách</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Giờ nhận phòng</label>
              <Input
                value={formData.checkInTime}
                onChange={(e) => setFormData({ ...formData, checkInTime: e.target.value })}
                disabled={!isEditing}
                type="time"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Giờ trả phòng</label>
              <Input
                value={formData.checkOutTime}
                onChange={(e) => setFormData({ ...formData, checkOutTime: e.target.value })}
                disabled={!isEditing}
                type="time"
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Chính sách hủy phòng</label>
              <textarea
                value={formData.cancellationPolicy}
                onChange={(e) => setFormData({ ...formData, cancellationPolicy: e.target.value })}
                disabled={!isEditing}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                required
              />
            </div>
          </div>
        </Card>

        {/* Amenities */}
        <Card>
          <h2 className="text-xl font-bold mb-4">Tiện nghi</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {['WiFi miễn phí', 'Hồ bơi', 'Gym', 'Spa', 'Nhà hàng', 'Bar', 'Phòng họp', 'Đưa đón sân bay'].map((amenity) => (
              <label key={amenity} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  defaultChecked
                  disabled={!isEditing}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 disabled:opacity-50"
                />
                <span className={!isEditing ? 'text-gray-700' : ''}>{amenity}</span>
              </label>
            ))}
          </div>
        </Card>

        {isEditing && (
          <div className="flex space-x-4">
            <Button type="submit">
              💾 Lưu thay đổi
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsEditing(false)}
            >
              Hủy
            </Button>
          </div>
        )}
      </form>
    </div>
  );
}
