'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { hotelManagerApi } from '@/lib/api/services';

export default function HotelOnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    description: '',
    contact_phone: '',
    longitude: 0,
    latitude: 0,
    thumbnail: null as File | null,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Tên khách sạn là bắt buộc';
    }
    if (!formData.address.trim()) {
      newErrors.address = 'Địa chỉ là bắt buộc';
    }
    if (!formData.contact_phone.trim()) {
      newErrors.contact_phone = 'Số điện thoại là bắt buộc';
    } else if (!/^[0-9]{10,11}$/.test(formData.contact_phone)) {
      newErrors.contact_phone = 'Số điện thoại không hợp lệ';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.description.trim()) {
      newErrors.description = 'Mô tả khách sạn là bắt buộc';
    } else if (formData.description.length < 50) {
      newErrors.description = 'Mô tả phải có ít nhất 50 ký tự';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = () => {
    const newErrors: Record<string, string> = {};

    if (formData.longitude === 0 || formData.latitude === 0) {
      newErrors.location = 'Vui lòng nhập tọa độ khách sạn';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    let isValid = false;

    if (step === 1) {
      isValid = validateStep1();
    } else if (step === 2) {
      isValid = validateStep2();
    } else if (step === 3) {
      isValid = validateStep3();
    }

    if (isValid && step < 4) {
      setStep(step + 1);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep3()) return;

    setLoading(true);
    try {
      const result = await hotelManagerApi.createHotel({
        name: formData.name,
        address: formData.address,
        description: formData.description,
        contact_phone: formData.contact_phone,
        longitude: formData.longitude,
        latitude: formData.latitude,
        thumbnail: formData.thumbnail || undefined,
      });

      alert('✅ Tạo khách sạn thành công! Vui lòng đợi admin phê duyệt.');
      router.push('/hotel-manager');
    } catch (error) {
      console.error('Error creating hotel:', error);
      alert('❌ Lỗi khi tạo khách sạn! Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File ảnh quá lớn! Vui lòng chọn file nhỏ hơn 5MB.');
        return;
      }
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Vui lòng chọn file ảnh!');
        return;
      }
      setFormData({ ...formData, thumbnail: file });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            🏨 Đăng ký khách sạn mới
          </h1>
          <p className="text-gray-600">
            Hoàn thành các bước dưới đây để đăng ký khách sạn của bạn lên hệ thống
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex items-center justify-center">
            {[1, 2, 3, 4].map((stepNum, index) => (
              <div key={stepNum} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center font-bold ${
                      step >= stepNum
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {step > stepNum ? '✓' : stepNum}
                  </div>
                  <span className="text-xs mt-2 text-gray-600">
                    {stepNum === 1 && 'Thông tin cơ bản'}
                    {stepNum === 2 && 'Mô tả'}
                    {stepNum === 3 && 'Vị trí'}
                    {stepNum === 4 && 'Xác nhận'}
                  </span>
                </div>
                {index < 3 && (
                  <div
                    className={`w-24 h-1 mx-2 ${
                      step > stepNum ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Steps */}
        <Card className="p-8">
          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Thông tin cơ bản
              </h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tên khách sạn <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Ví dụ: Khách sạn ABC"
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Địa chỉ <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    errors.address ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Số nhà, đường, phường, quận, thành phố"
                />
                {errors.address && (
                  <p className="text-red-500 text-sm mt-1">{errors.address}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số điện thoại <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={formData.contact_phone}
                  onChange={(e) =>
                    setFormData({ ...formData, contact_phone: e.target.value })
                  }
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    errors.contact_phone ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="0987654321"
                />
                {errors.contact_phone && (
                  <p className="text-red-500 text-sm mt-1">{errors.contact_phone}</p>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Description */}
          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Mô tả khách sạn
              </h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mô tả chi tiết <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={8}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    errors.description ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Giới thiệu về khách sạn của bạn: vị trí, tiện nghi, dịch vụ, điểm đặc biệt..."
                />
                <p className="text-sm text-gray-500 mt-1">
                  Tối thiểu 50 ký tự ({formData.description.length}/50)
                </p>
                {errors.description && (
                  <p className="text-red-500 text-sm mt-1">{errors.description}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ảnh đại diện (tùy chọn)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Tối đa 5MB, định dạng: JPG, PNG, GIF
                </p>
                {formData.thumbnail && (
                  <div className="mt-3">
                    <img
                      src={URL.createObjectURL(formData.thumbnail)}
                      alt="Preview"
                      className="w-48 h-48 object-cover rounded-lg"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Location */}
          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Vị trí</h2>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kinh độ (Longitude) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.000001"
                    value={formData.longitude || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        longitude: parseFloat(e.target.value) || 0,
                      })
                    }
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                      errors.location ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="105.123456"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vĩ độ (Latitude) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.000001"
                    value={formData.latitude || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        latitude: parseFloat(e.target.value) || 0,
                      })
                    }
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                      errors.location ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="21.123456"
                  />
                </div>
              </div>

              {errors.location && (
                <p className="text-red-500 text-sm">{errors.location}</p>
              )}

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  💡 <strong>Mẹo:</strong> Bạn có thể lấy tọa độ từ Google Maps:
                  <br />
                  1. Mở Google Maps và tìm vị trí khách sạn
                  <br />
                  2. Nhấp chuột phải vào vị trí và chọn "Đây là gì?"
                  <br />
                  3. Tọa độ sẽ hiển thị ở cuối màn hình
                </p>
              </div>
            </div>
          )}

          {/* Step 4: Confirmation */}
          {step === 4 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Xác nhận thông tin
              </h2>

              <div className="space-y-4 bg-gray-50 p-6 rounded-lg">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Tên khách sạn:</p>
                    <p className="font-semibold text-gray-900">{formData.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Số điện thoại:</p>
                    <p className="font-semibold text-gray-900">
                      {formData.contact_phone}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Địa chỉ:</p>
                  <p className="font-semibold text-gray-900">{formData.address}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Mô tả:</p>
                  <p className="font-semibold text-gray-900 whitespace-pre-line">
                    {formData.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Kinh độ:</p>
                    <p className="font-semibold text-gray-900">
                      {formData.longitude}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Vĩ độ:</p>
                    <p className="font-semibold text-gray-900">
                      {formData.latitude}
                    </p>
                  </div>
                </div>

                {formData.thumbnail && (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Ảnh đại diện:</p>
                    <img
                      src={URL.createObjectURL(formData.thumbnail)}
                      alt="Thumbnail"
                      className="w-48 h-48 object-cover rounded-lg"
                    />
                  </div>
                )}
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  ⚠️ <strong>Lưu ý:</strong> Sau khi gửi, khách sạn của bạn sẽ được
                  đưa vào hàng đợi chờ admin phê duyệt. Thời gian phê duyệt thường
                  trong vòng 24-48 giờ.
                </p>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t">
            <Button
              variant="outline"
              onClick={() => {
                if (step > 1) setStep(step - 1);
                else router.push('/hotel-manager');
              }}
              disabled={loading}
            >
              ← {step === 1 ? 'Hủy' : 'Quay lại'}
            </Button>

            <Button
              variant="primary"
              onClick={step === 4 ? handleSubmit : handleNext}
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
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
                  Đang xử lý...
                </span>
              ) : step === 4 ? (
                '✓ Hoàn thành'
              ) : (
                'Tiếp theo →'
              )}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
