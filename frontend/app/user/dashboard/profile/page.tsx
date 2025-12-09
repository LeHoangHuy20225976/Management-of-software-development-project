/**
 * User Profile Page
 * FE3: User Dashboard
 */

'use client';

import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { useState, useEffect } from 'react';
import { getMockUser, updateMockUser, getMockBookings, getMockReviews } from '@/lib/utils/mockData';

export default function UserProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    dateOfBirth: '1990-01-15',
    gender: 'male',
    address: '123 Đường Lê Lợi, Quận 1',
    city: 'Hồ Chí Minh',
    nationality: 'Việt Nam',
  });

  const [stats, setStats] = useState({
    bookings: 0,
    reviews: 0,
    points: 0,
  });

  useEffect(() => {
    const user = getMockUser();
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        dateOfBirth: '1990-01-15',
        gender: 'male',
        address: '123 Đường Lê Lợi, Quận 1',
        city: 'Hồ Chí Minh',
        nationality: 'Việt Nam',
      });
    }

    // Load stats
    const bookings = getMockBookings();
    const reviews = getMockReviews();
    setStats({
      bookings: bookings.length,
      reviews: reviews.length,
      points: user?.points || 0,
    });
  }, []);

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateMockUser({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
    });
    setIsEditing(false);
    alert('Cập nhật thông tin thành công!');
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('Mật khẩu mới không khớp!');
      return;
    }
    // TODO: Call API to change password
    alert('Đổi mật khẩu thành công!');
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Thông tin cá nhân</h1>

      {/* Profile Header */}
      <Card>
        <div className="flex items-center space-x-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#0071c2] to-[#005999] flex items-center justify-center text-white text-3xl font-bold">
              {formData.name.charAt(0)}
            </div>
            {isEditing && (
              <button className="absolute bottom-0 right-0 bg-white border-2 border-gray-200 rounded-full p-2 hover:bg-gray-50 transition-colors">
                📷
              </button>
            )}
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900">{formData.name}</h2>
            <p className="text-gray-600">{formData.email}</p>
            <div className="flex items-center space-x-4 mt-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                ⭐ Thành viên
              </span>
              <span className="text-sm text-gray-600">Tham gia từ: Tháng 1, 2024</span>
            </div>
          </div>
          {!isEditing && (
            <Button onClick={() => setIsEditing(true)}>
              ✏️ Chỉnh sửa
            </Button>
          )}
        </div>
      </Card>

      {/* Personal Information */}
      <form onSubmit={handleSaveProfile}>
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Thông tin cơ bản</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Họ và tên *
              </label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={!isEditing}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Email *
              </label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={!isEditing}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Số điện thoại
              </label>
              <Input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                disabled={!isEditing}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Ngày sinh
              </label>
              <Input
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                disabled={!isEditing}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Giới tính
              </label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                disabled={!isEditing}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 text-gray-900 font-medium"
              >
                <option value="male">Nam</option>
                <option value="female">Nữ</option>
                <option value="other">Khác</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Quốc tịch
              </label>
              <Input
                value={formData.nationality}
                onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                disabled={!isEditing}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Địa chỉ
              </label>
              <Input
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                disabled={!isEditing}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Thành phố
              </label>
              <select
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                disabled={!isEditing}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 text-gray-900 font-medium"
              >
                <option value="">Chọn thành phố</option>
                <option value="Hà Nội">Hà Nội</option>
                <option value="Hồ Chí Minh">Hồ Chí Minh</option>
                <option value="Đà Nẵng">Đà Nẵng</option>
                <option value="Nha Trang">Nha Trang</option>
                <option value="Đà Lạt">Đà Lạt</option>
              </select>
            </div>
          </div>

          {isEditing && (
            <div className="flex space-x-4 mt-6">
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
        </Card>
      </form>

      {/* Change Password */}
      <Card>
        <h3 className="text-xl font-bold text-gray-900 mb-6">Đổi mật khẩu</h3>
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Mật khẩu hiện tại *
            </label>
            <Input
              type="password"
              value={passwordData.currentPassword}
              onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
              placeholder="Nhập mật khẩu hiện tại"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Mật khẩu mới *
            </label>
            <Input
              type="password"
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
              placeholder="Nhập mật khẩu mới"
              required
            />
            <p className="mt-1 text-xs text-gray-600">Tối thiểu 8 ký tự</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Xác nhận mật khẩu mới *
            </label>
            <Input
              type="password"
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
              placeholder="Nhập lại mật khẩu mới"
              required
            />
          </div>

          <Button type="submit">
            🔒 Đổi mật khẩu
          </Button>
        </form>
      </Card>

      {/* Account Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="text-center">
            <div className="text-4xl mb-2">📋</div>
            <div className="text-3xl font-bold text-[#0071c2]">{stats.bookings}</div>
            <div className="text-sm font-medium text-gray-700 mt-1">Đặt phòng</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-4xl mb-2">⭐</div>
            <div className="text-3xl font-bold text-yellow-600">{stats.reviews}</div>
            <div className="text-sm font-medium text-gray-700 mt-1">Đánh giá</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-4xl mb-2">🎁</div>
            <div className="text-3xl font-bold text-green-600">{stats.points}</div>
            <div className="text-sm font-medium text-gray-700 mt-1">Điểm thưởng</div>
          </div>
        </Card>
      </div>

      {/* Preferences */}
      <Card>
        <h3 className="text-xl font-bold text-gray-900 mb-6">Tùy chọn</h3>
        <div className="space-y-4">
          <label className="flex items-center justify-between cursor-pointer p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <div>
              <p className="font-semibold text-gray-900">Nhận thông báo qua email</p>
              <p className="text-sm text-gray-600">Nhận cập nhật về ưu đãi và đặt phòng</p>
            </div>
            <input
              type="checkbox"
              defaultChecked
              className="w-5 h-5 text-[#0071c2] rounded focus:ring-2 focus:ring-[#0071c2]"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <div>
              <p className="font-semibold text-gray-900">Nhận thông báo qua SMS</p>
              <p className="text-sm text-gray-600">Nhận SMS xác nhận đặt phòng</p>
            </div>
            <input
              type="checkbox"
              defaultChecked
              className="w-5 h-5 text-[#0071c2] rounded focus:ring-2 focus:ring-[#0071c2]"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <div>
              <p className="font-semibold text-gray-900">Gợi ý cá nhân hóa</p>
              <p className="text-sm text-gray-600">Nhận gợi ý khách sạn phù hợp với bạn</p>
            </div>
            <input
              type="checkbox"
              defaultChecked
              className="w-5 h-5 text-[#0071c2] rounded focus:ring-2 focus:ring-[#0071c2]"
            />
          </label>
        </div>
      </Card>
    </div>
  );
}
