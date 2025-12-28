/**
 * User Profile Page
 * FE3: User Dashboard
 */

'use client';

import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import { authApi } from '@/lib/api/auth';
import { userApi, userProfileApi, bookingsApi, reviewsApi } from '@/lib/api/services';

export default function UserProfilePage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone_number: '',
    date_of_birth: '',
    gender: 'male',
  });

  const [stats, setStats] = useState({
    bookings: 0,
    reviews: 0,
  });

  // Initialize form data from auth user
  useEffect(() => {
    if (user) {
      const phoneFromContext =
        (user as { phone_number?: string } | null)?.phone_number || '';
      const dobFromContext =
        (user as { date_of_birth?: string } | null)?.date_of_birth || '';
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone_number: phoneFromContext,
        date_of_birth: dobFromContext,
        gender: user.gender || 'male',
      });
      setProfileImage(user.profile_image || null);
    }

    // Load stats from API
    const loadStats = async () => {
      try {
        const bookingsData = await bookingsApi.getAll();
        const bookingsArray = Array.isArray(bookingsData?.bookings)
          ? bookingsData.bookings
          : Array.isArray(bookingsData)
          ? bookingsData
          : [];

        setStats({
          bookings: bookingsArray.length,
          reviews: 0, // TODO: Need user reviews endpoint from backend
        });
      } catch (error) {
        console.error('Error loading stats:', error);
      }
    };
    loadStats();
  }, [user]);

  // Handle profile image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn file ảnh!');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Kích thước ảnh tối đa là 5MB!');
      return;
    }

    setUploadingImage(true);
    try {
      const result = await userProfileApi.uploadProfileImage(file);
      setProfileImage(result.imageUrl);
      alert('Cập nhật ảnh đại diện thành công!');
    } catch (error) {
      console.error('Upload error:', error);
      alert('Không thể tải ảnh lên, vui lòng thử lại.');
    } finally {
      setUploadingImage(false);
    }
  };

  // Handle delete profile image
  const handleDeleteImage = async () => {
    if (!profileImage) return;
    
    if (!confirm('Bạn có chắc muốn xóa ảnh đại diện?')) return;

    try {
      await userProfileApi.deleteProfileImage();
      setProfileImage(null);
      alert('Đã xóa ảnh đại diện!');
    } catch (error) {
      console.error('Delete image error:', error);
      alert('Không thể xóa ảnh, vui lòng thử lại.');
    }
  };

  // Handle delete account
  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'XÓA TÀI KHOẢN') {
      alert('Vui lòng nhập đúng "XÓA TÀI KHOẢN" để xác nhận!');
      return;
    }

    setDeletingAccount(true);
    try {
      await userProfileApi.deleteAccount();
      await logout();
      router.push('/');
      alert('Tài khoản của bạn đã được xóa!');
    } catch (error) {
      console.error('Delete account error:', error);
      alert('Không thể xóa tài khoản, vui lòng thử lại.');
    } finally {
      setDeletingAccount(false);
      setShowDeleteModal(false);
    }
  };

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await userApi.updateProfile({
        name: formData.name,
        email: formData.email,
        phone_number: formData.phone_number,
        date_of_birth: formData.date_of_birth,
        gender: formData.gender,
      });
      setIsEditing(false);
      alert('Cập nhật thông tin thành công!');
    } catch (error) {
      console.error('Update profile error', error);
      alert('Không thể cập nhật thông tin, vui lòng thử lại.');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    // Validate passwords match
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('Mật khẩu mới không khớp!');
      return;
    }

    // Validate minimum length
    if (passwordData.newPassword.length < 8) {
      setPasswordError('Mật khẩu mới phải có ít nhất 8 ký tự');
      return;
    }

    setPasswordLoading(true);

    try {
      await authApi.changePassword(
        passwordData.currentPassword,
        passwordData.newPassword,
        passwordData.confirmPassword
      );

      setPasswordSuccess('Đổi mật khẩu thành công!');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });

      // Clear success message after 3 seconds
      setTimeout(() => setPasswordSuccess(''), 3000);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Đổi mật khẩu thất bại. Vui lòng thử lại!';
      setPasswordError(errorMessage);
    } finally {
      setPasswordLoading(false);
    }
  };

  const displayName = user?.name || formData.name || '';
  const displayEmail = user?.email || formData.email || '';
  const avatarChar = displayName.charAt(0).toUpperCase() || '?';

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Thông tin cá nhân</h1>

      {/* Profile Header */}
      <Card>
        <div className="flex items-center space-x-6">
          <div className="relative">
            {profileImage || user?.profile_image ? (
              <img
                src={profileImage || user?.profile_image || ''}
                alt={displayName}
                className="w-24 h-24 rounded-full object-cover"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#0071c2] to-[#005999] flex items-center justify-center text-white text-3xl font-bold">
                {avatarChar}
              </div>
            )}
            {/* Upload/Edit Button */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingImage}
              className="absolute bottom-0 right-0 bg-white border-2 border-gray-200 rounded-full p-2 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              {uploadingImage ? '⏳' : '📷'}
            </button>
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900">{displayName}</h2>
            <p className="text-gray-600">{displayEmail}</p>
            <div className="flex items-center space-x-4 mt-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                ⭐ Thành viên
              </span>
              <span className="text-sm text-gray-600">
                Tham gia từ: Tháng 1, 2024
              </span>
            </div>
            {/* Profile image actions */}
            {(profileImage || user?.profile_image) && (
              <div className="flex items-center space-x-2 mt-3">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-sm text-[#0071c2] hover:underline"
                >
                  Đổi ảnh
                </button>
                <span className="text-gray-300">|</span>
                <button
                  onClick={handleDeleteImage}
                  className="text-sm text-red-600 hover:underline"
                >
                  Xóa ảnh
                </button>
              </div>
            )}
          </div>
          {!isEditing && (
            <Button onClick={() => setIsEditing(true)}>✏️ Chỉnh sửa</Button>
          )}
        </div>
      </Card>

      {/* Personal Information */}
      <form onSubmit={handleSaveProfile}>
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">
              Thông tin cơ bản
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Họ và tên *
              </label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
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
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
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
                value={formData.phone_number}
                onChange={(e) =>
                  setFormData({ ...formData, phone_number: e.target.value })
                }
                disabled={!isEditing}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Ngày sinh
              </label>
              <Input
                type="date"
                value={formData.date_of_birth}
                onChange={(e) =>
                  setFormData({ ...formData, date_of_birth: e.target.value })
                }
                disabled={!isEditing}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Giới tính
              </label>
              <select
                value={formData.gender}
                onChange={(e) =>
                  setFormData({ ...formData, gender: e.target.value })
                }
                disabled={!isEditing}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 text-gray-900 font-medium"
              >
                <option value="male">Nam</option>
                <option value="female">Nữ</option>
                <option value="other">Khác</option>
              </select>
            </div>

            {/* DB không lưu nationality/address/city */}
          </div>

          {isEditing && (
            <div className="flex space-x-4 mt-6">
              <Button type="submit">💾 Lưu thay đổi</Button>
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

        {/* Success message */}
        {passwordSuccess && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2">
              <span className="text-green-600">✓</span>
              <p className="text-green-700 text-sm font-medium">
                {passwordSuccess}
              </p>
            </div>
          </div>
        )}

        {/* Error message */}
        {passwordError && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm font-medium">{passwordError}</p>
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Mật khẩu hiện tại *
            </label>
            <Input
              type="password"
              value={passwordData.currentPassword}
              onChange={(e) =>
                setPasswordData({
                  ...passwordData,
                  currentPassword: e.target.value,
                })
              }
              placeholder="Nhập mật khẩu hiện tại"
              required
              disabled={passwordLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Mật khẩu mới *
            </label>
            <Input
              type="password"
              value={passwordData.newPassword}
              onChange={(e) =>
                setPasswordData({
                  ...passwordData,
                  newPassword: e.target.value,
                })
              }
              placeholder="Nhập mật khẩu mới"
              required
              minLength={8}
              disabled={passwordLoading}
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
              onChange={(e) =>
                setPasswordData({
                  ...passwordData,
                  confirmPassword: e.target.value,
                })
              }
              placeholder="Nhập lại mật khẩu mới"
              required
              disabled={passwordLoading}
            />
          </div>

          <Button type="submit" disabled={passwordLoading}>
            {passwordLoading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Đang xử lý...
              </span>
            ) : (
              '🔒 Đổi mật khẩu'
            )}
          </Button>
        </form>
      </Card>

      {/* Account Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <div className="text-center">
            <div className="text-4xl mb-2">📋</div>
            <div className="text-3xl font-bold text-[#0071c2]">
              {stats.bookings}
            </div>
            <div className="text-sm font-medium text-gray-700 mt-1">
              Đặt phòng
            </div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-4xl mb-2">⭐</div>
            <div className="text-3xl font-bold text-yellow-600">
              {stats.reviews}
            </div>
            <div className="text-sm font-medium text-gray-700 mt-1">
              Đánh giá
            </div>
          </div>
        </Card>
      </div>

      {/* Preferences */}
      <Card>
        <h3 className="text-xl font-bold text-gray-900 mb-6">Tùy chọn</h3>
        <div className="space-y-4">
          <label className="flex items-center justify-between cursor-pointer p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <div>
              <p className="font-semibold text-gray-900">
                Nhận thông báo qua email
              </p>
              <p className="text-sm text-gray-600">
                Nhận cập nhật về ưu đãi và đặt phòng
              </p>
            </div>
            <input
              type="checkbox"
              defaultChecked
              className="w-5 h-5 text-[#0071c2] rounded focus:ring-2 focus:ring-[#0071c2]"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <div>
              <p className="font-semibold text-gray-900">
                Nhận thông báo qua SMS
              </p>
              <p className="text-sm text-gray-600">
                Nhận SMS xác nhận đặt phòng
              </p>
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
              <p className="text-sm text-gray-600">
                Nhận gợi ý khách sạn phù hợp với bạn
              </p>
            </div>
            <input
              type="checkbox"
              defaultChecked
              className="w-5 h-5 text-[#0071c2] rounded focus:ring-2 focus:ring-[#0071c2]"
            />
          </label>
        </div>
      </Card>

      {/* Danger Zone - Delete Account */}
      <Card className="border-red-200 bg-red-50">
        <h3 className="text-xl font-bold text-red-800 mb-4">⚠️ Vùng nguy hiểm</h3>
        <div className="p-4 bg-white rounded-lg border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-gray-900">Xóa tài khoản</p>
              <p className="text-sm text-gray-600">
                Xóa vĩnh viễn tài khoản và tất cả dữ liệu của bạn. Hành động này không thể hoàn tác.
              </p>
            </div>
            <Button
              variant="danger"
              onClick={() => setShowDeleteModal(true)}
            >
              🗑️ Xóa tài khoản
            </Button>
          </div>
        </div>
      </Card>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
                <span className="text-3xl">⚠️</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Xóa tài khoản?</h3>
              <p className="text-gray-600 text-sm">
                Bạn sắp xóa vĩnh viễn tài khoản của mình. Tất cả dữ liệu bao gồm đặt phòng, đánh giá và thông tin cá nhân sẽ bị xóa và không thể khôi phục.
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Nhập <span className="text-red-600">XÓA TÀI KHOẢN</span> để xác nhận:
              </label>
              <Input
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="XÓA TÀI KHOẢN"
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
                disabled={deletingAccount}
              >
                Hủy
              </Button>
              <Button
                variant="danger"
                className="flex-1"
                onClick={handleDeleteAccount}
                disabled={deleteConfirmText !== 'XÓA TÀI KHOẢN' || deletingAccount}
              >
                {deletingAccount ? (
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
