'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Card } from '@/components/common/Card';
import { HotelLogo } from '@/components/hotel/HotelLogo';
import { useAuth } from '@/lib/context/AuthContext';
import { authApi } from '@/lib/api/auth';
import { apiClient } from '@/lib/api/client';
import { API_CONFIG } from '@/lib/api/config';
import { aiApi } from '@/lib/api/services';

const IMAGE_TYPES = [
  { value: 'hotel_exterior', label: 'Ảnh bên ngoài' },
  { value: 'room_interior', label: 'Ảnh phòng' },
  { value: 'facility', label: 'Tiện ích' },
  { value: 'food', label: 'Ẩm thực' },
  { value: 'general', label: 'Chung' }
];

const DOCUMENT_TYPES = [
  { value: 'brochure', label: 'Brochure' },
  { value: 'policy', label: 'Chính sách' },
  { value: 'menu', label: 'Thực đơn' },
  { value: 'guide', label: 'Hướng dẫn' }
];

export default function HotelRegisterPage() {
  const router = useRouter();
  const { register, isAuthenticated, user, isLoading: authLoading } = useAuth();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    // Hotel Info (for later use)
    hotelName: '',
    hotelStars: 3,
    hotelAddress: '',
    hotelCity: '',
    hotelDistrict: '',
    hotelPhone: '',
    hotelDescription: '',
    // Manager Info
    managerName: '',
    managerEmail: '',
    managerPhone: '',
    gender: 'male',
    dateOfBirth: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false,
  });

  // Media files state
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imageTypes, setImageTypes] = useState<string[]>([]);
  const [imageDescriptions, setImageDescriptions] = useState<string[]>([]);
  const [selectedDocuments, setSelectedDocuments] = useState<File[]>([]);
  const [documentTypes, setDocumentTypes] = useState<string[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Redirect if already logged in as hotel manager
  useEffect(() => {
    if (isAuthenticated && user?.role === 'hotel_manager' && !authLoading) {
      router.push('/hotel-manager/dashboard');
    }
  }, [isAuthenticated, user, authLoading, router]);

  const handleNext = () => {
    setError('');
    if (step === 1) {
      if (
        !formData.hotelName ||
        !formData.hotelAddress ||
        !formData.hotelCity ||
        !formData.hotelPhone
      ) {
        setError('Vui lòng điền đầy đủ thông tin khách sạn');
        return;
      }
    }
    if (step === 2) {
      // Step 2: Media - optional, can skip
      // No validation required
    }
    setStep(step + 1);
  };

  const handleBack = () => {
    setError('');
    setStep(step - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu không khớp!');
      return;
    }

    if (formData.password.length < 8) {
      setError('Mật khẩu phải có ít nhất 8 ký tự');
      return;
    }

    if (!formData.agreeTerms) {
      setError('Vui lòng đồng ý với điều khoản đối tác');
      return;
    }

    if (!formData.dateOfBirth) {
      setError('Vui lòng nhập ngày sinh');
      return;
    }

    setIsLoading(true);

    try {
      // Register hotel manager account
      await register({
        name: formData.managerName,
        email: formData.managerEmail,
        phone_number: formData.managerPhone,
        gender: formData.gender,
        date_of_birth: formData.dateOfBirth,
        password: formData.password,
        role: 'hotel_manager',
      });

      // Backend requires auth for /hotel-profile/add-hotel, so login to obtain httpOnly cookies
      await authApi.login(formData.managerEmail, formData.password, 'hotel_manager');

      const address = `${formData.hotelAddress} ${formData.hotelDistrict} ${formData.hotelCity}`
        .split(' ')
        .map((v) => v.trim())
        .filter(Boolean)
        .join(' ');

      // Note: backend validation uses `.optional().isFloat()` which will FAIL for `null`.
      // So we omit longitude/latitute entirely unless we have numbers.
      const hotelData: Record<string, unknown> = {
        hotelName: formData.hotelName,
        address,
        contact_phone: formData.hotelPhone,
        rating: formData.hotelStars,
        description: formData.hotelDescription?.trim() || '',
      };

      const hotelFormData = new FormData();
      hotelFormData.append(
        'hotelData',
        JSON.stringify(hotelData)
      );

      const hotelResponse = await apiClient.postFormData(API_CONFIG.ENDPOINTS.ADD_HOTEL, {}, hotelFormData);
      const createdHotelId = hotelResponse?.hotel_id;

      // Upload images if any
      if (createdHotelId && selectedImages.length > 0) {
        const imageFormData = new FormData();
        selectedImages.forEach((file) => {
          imageFormData.append('files', file);
        });
        imageFormData.append('image_types', imageTypes.join(','));
        imageFormData.append('descriptions', imageDescriptions.join(','));

        await aiApi.uploadHotelImages(createdHotelId, imageFormData).catch((err) => {
          console.error('Failed to upload images:', err);
          // Continue even if image upload fails
        });
      }

      // Upload documents if any
      if (createdHotelId && selectedDocuments.length > 0) {
        for (let i = 0; i < selectedDocuments.length; i++) {
          const docFormData = new FormData();
          docFormData.append('file', selectedDocuments[i]);
          docFormData.append('document_type', documentTypes[i]);

          await aiApi.uploadHotelDocument(createdHotelId, docFormData).catch((err) => {
            console.error('Failed to upload document:', err);
            // Continue even if document upload fails
          });
        }
      }

      // Clear session after setup; user will login manually next
      await authApi.logout().catch(() => authApi.clearAuthState());

      setSuccess(true);

      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push('/hotel-manager/login');
      }, 2000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Có lỗi xảy ra. Vui lòng thử lại!';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state while checking auth
  if (authLoading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 py-12 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0071c2]"></div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <HotelLogo size="lg" />
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-3">
                Đăng ký đối tác
              </h1>
              <p className="text-gray-600">
                Tham gia VietStay và tiếp cận hàng triệu khách hàng
              </p>
            </div>

            {/* Progress Steps */}
            <div className="mb-8">
              <div className="flex items-center justify-center space-x-2">
                <div
                  className={`flex items-center ${
                    step >= 1 ? 'text-[#0071c2]' : 'text-gray-400'
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                      step >= 1 ? 'bg-[#0071c2] text-white' : 'bg-gray-200'
                    }`}
                  >
                    1
                  </div>
                  <span className="ml-2 font-medium hidden sm:inline">
                    Thông tin KS
                  </span>
                </div>
                <div className="w-12 h-0.5 bg-gray-300"></div>
                <div
                  className={`flex items-center ${
                    step >= 2 ? 'text-[#0071c2]' : 'text-gray-400'
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                      step >= 2 ? 'bg-[#0071c2] text-white' : 'bg-gray-200'
                    }`}
                  >
                    2
                  </div>
                  <span className="ml-2 font-medium hidden sm:inline">
                    Ảnh & Tài liệu
                  </span>
                </div>
                <div className="w-12 h-0.5 bg-gray-300"></div>
                <div
                  className={`flex items-center ${
                    step >= 3 ? 'text-[#0071c2]' : 'text-gray-400'
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                      step >= 3 ? 'bg-[#0071c2] text-white' : 'bg-gray-200'
                    }`}
                  >
                    3
                  </div>
                  <span className="ml-2 font-medium hidden sm:inline">
                    Quản lý
                  </span>
                </div>
              </div>
            </div>

            <Card className="p-8">
              {/* Success message */}
              {success && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-600 text-sm font-medium">
                    🎉 Đăng ký thành công! Đang chuyển hướng đến trang đăng nhập...
                  </p>
                </div>
              )}

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-sm font-medium">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {step === 1 && (
                  <>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">
                      Bước 1: Thông tin khách sạn
                    </h2>

                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Tên khách sạn *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.hotelName}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            hotelName: e.target.value,
                          })
                        }
                        placeholder="VD: Grand Hotel Saigon"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0071c2] focus:border-[#0071c2] transition-all text-gray-900 placeholder:text-gray-400"
                        disabled={isLoading || success}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Hạng sao *
                      </label>
                      <select
                        value={formData.hotelStars}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            hotelStars: Number(e.target.value),
                          })
                        }
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0071c2] focus:border-[#0071c2] transition-all text-gray-900"
                        disabled={isLoading || success}
                      >
                        {[1, 2, 3, 4, 5].map((star) => (
                          <option key={star} value={star}>
                            {star} sao
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Địa chỉ *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.hotelAddress}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            hotelAddress: e.target.value,
                          })
                        }
                        placeholder="Số nhà, đường..."
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0071c2] focus:border-[#0071c2] transition-all text-gray-900 placeholder:text-gray-400"
                        disabled={isLoading || success}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                          Thành phố *
                        </label>
                        <select
                          required
                          value={formData.hotelCity}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              hotelCity: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0071c2] focus:border-[#0071c2] transition-all text-gray-900"
                          disabled={isLoading || success}
                        >
                          <option value="">Chọn thành phố</option>
                          <option value="Hà Nội">Hà Nội</option>
                          <option value="Hồ Chí Minh">Hồ Chí Minh</option>
                          <option value="Đà Nẵng">Đà Nẵng</option>
                          <option value="Nha Trang">Nha Trang</option>
                          <option value="Đà Lạt">Đà Lạt</option>
                          <option value="Phú Quốc">Phú Quốc</option>
                          <option value="Hạ Long">Hạ Long</option>
                          <option value="Huế">Huế</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                          Quận/Huyện
                        </label>
                        <input
                          type="text"
                          value={formData.hotelDistrict}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              hotelDistrict: e.target.value,
                            })
                          }
                          placeholder="VD: Quận 1"
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0071c2] focus:border-[#0071c2] transition-all text-gray-900 placeholder:text-gray-400"
                          disabled={isLoading || success}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Số điện thoại khách sạn *
                      </label>
                      <input
                        type="tel"
                        required
                        value={formData.hotelPhone}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            hotelPhone: e.target.value,
                          })
                        }
                        placeholder="0283 xxx xxxx"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0071c2] focus:border-[#0071c2] transition-all text-gray-900 placeholder:text-gray-400"
                        disabled={isLoading || success}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Mô tả (không bắt buộc)
                      </label>
                      <textarea
                        value={formData.hotelDescription}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            hotelDescription: e.target.value,
                          })
                        }
                        placeholder="Mô tả ngắn về khách sạn..."
                        rows={3}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0071c2] focus:border-[#0071c2] transition-all text-gray-900 placeholder:text-gray-400"
                        disabled={isLoading || success}
                      />
                    </div>

                    <button
                      type="button"
                      onClick={handleNext}
                      disabled={isLoading || success}
                      className="w-full px-6 py-3 bg-[#0071c2] hover:bg-[#005999] text-white font-semibold rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      Tiếp theo →
                    </button>
                  </>
                )}

                {step === 2 && (
                  <>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">
                      Bước 2: Ảnh minh họa & Tài liệu
                    </h2>

                    <p className="text-sm text-gray-600 mb-6">
                      Thêm ảnh và tài liệu giới thiệu khách sạn (không bắt buộc, có thể bỏ qua)
                    </p>

                    {/* Images Section */}
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">📸 Ảnh minh họa</h3>

                      <input
                        type="file"
                        multiple
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        onChange={(e) => {
                          const files = Array.from(e.target.files || []);
                          setSelectedImages(files);
                          setImageTypes(files.map(() => 'general'));
                          setImageDescriptions(files.map(() => ''));
                        }}
                        className="block w-full text-sm text-gray-500
                          file:mr-4 file:py-2 file:px-4
                          file:rounded-md file:border-0
                          file:text-sm file:font-semibold
                          file:bg-blue-50 file:text-blue-700
                          hover:file:bg-blue-100
                          cursor-pointer mb-2"
                        disabled={isLoading || success}
                      />
                      <p className="text-xs text-gray-500 mb-4">
                        JPG, PNG, WEBP (max 50MB/file, 20 files)
                      </p>

                      {selectedImages.length > 0 && (
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                          {selectedImages.map((file, idx) => (
                            <div key={idx} className="border rounded-lg p-3 bg-gray-50 flex gap-3">
                              <img
                                src={URL.createObjectURL(file)}
                                alt={file.name}
                                className="w-16 h-16 object-cover rounded"
                              />
                              <div className="flex-1 space-y-2">
                                <p className="text-sm font-medium text-gray-900">{file.name}</p>
                                <select
                                  value={imageTypes[idx]}
                                  onChange={(e) => {
                                    const newTypes = [...imageTypes];
                                    newTypes[idx] = e.target.value;
                                    setImageTypes(newTypes);
                                  }}
                                  className="w-full text-sm px-2 py-1 border border-gray-300 rounded"
                                  disabled={isLoading || success}
                                >
                                  {IMAGE_TYPES.map(t => (
                                    <option key={t.value} value={t.value}>{t.label}</option>
                                  ))}
                                </select>
                                <input
                                  type="text"
                                  value={imageDescriptions[idx]}
                                  onChange={(e) => {
                                    const newDescs = [...imageDescriptions];
                                    newDescs[idx] = e.target.value;
                                    setImageDescriptions(newDescs);
                                  }}
                                  placeholder="Mô tả (tùy chọn)"
                                  className="w-full text-sm px-2 py-1 border border-gray-300 rounded"
                                  disabled={isLoading || success}
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedImages(selectedImages.filter((_, i) => i !== idx));
                                  setImageTypes(imageTypes.filter((_, i) => i !== idx));
                                  setImageDescriptions(imageDescriptions.filter((_, i) => i !== idx));
                                }}
                                className="text-red-600 hover:text-red-800 text-sm"
                              >
                                Xóa
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Documents Section */}
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">📄 Tài liệu</h3>

                      <input
                        type="file"
                        multiple
                        accept=".pdf,.docx,.doc,.txt"
                        onChange={(e) => {
                          const files = Array.from(e.target.files || []);
                          setSelectedDocuments(files);
                          setDocumentTypes(files.map(() => 'brochure'));
                        }}
                        className="block w-full text-sm text-gray-500
                          file:mr-4 file:py-2 file:px-4
                          file:rounded-md file:border-0
                          file:text-sm file:font-semibold
                          file:bg-blue-50 file:text-blue-700
                          hover:file:bg-blue-100
                          cursor-pointer mb-2"
                        disabled={isLoading || success}
                      />
                      <p className="text-xs text-gray-500 mb-4">
                        PDF, DOCX, DOC, TXT (max 50MB/file)
                      </p>

                      {selectedDocuments.length > 0 && (
                        <div className="space-y-3">
                          {selectedDocuments.map((file, idx) => (
                            <div key={idx} className="border rounded-lg p-3 bg-gray-50 flex gap-3 items-center">
                              <div className="flex-1 space-y-2">
                                <p className="text-sm font-medium text-gray-900">{file.name}</p>
                                <select
                                  value={documentTypes[idx]}
                                  onChange={(e) => {
                                    const newTypes = [...documentTypes];
                                    newTypes[idx] = e.target.value;
                                    setDocumentTypes(newTypes);
                                  }}
                                  className="w-full text-sm px-2 py-1 border border-gray-300 rounded"
                                  disabled={isLoading || success}
                                >
                                  {DOCUMENT_TYPES.map(t => (
                                    <option key={t.value} value={t.value}>{t.label}</option>
                                  ))}
                                </select>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedDocuments(selectedDocuments.filter((_, i) => i !== idx));
                                  setDocumentTypes(documentTypes.filter((_, i) => i !== idx));
                                }}
                                className="text-red-600 hover:text-red-800 text-sm"
                              >
                                Xóa
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        type="button"
                        onClick={handleBack}
                        disabled={isLoading || success}
                        className="flex-1 px-6 py-3 border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-semibold rounded-lg transition-colors disabled:opacity-50"
                      >
                        ← Quay lại
                      </button>
                      <button
                        type="button"
                        onClick={handleNext}
                        disabled={isLoading || success}
                        className="flex-1 px-6 py-3 bg-[#0071c2] hover:bg-[#005999] text-white font-semibold rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                      >
                        Tiếp theo →
                      </button>
                    </div>
                  </>
                )}

                {step === 3 && (
                  <>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">
                      Bước 3: Thông tin người quản lý
                    </h2>

                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Họ và tên *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.managerName}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            managerName: e.target.value,
                          })
                        }
                        placeholder="Nguyễn Văn A"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0071c2] focus:border-[#0071c2] transition-all text-gray-900 placeholder:text-gray-400"
                        disabled={isLoading || success}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.managerEmail}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            managerEmail: e.target.value,
                          })
                        }
                        placeholder="manager@hotel.com"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0071c2] focus:border-[#0071c2] transition-all text-gray-900 placeholder:text-gray-400"
                        disabled={isLoading || success}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Số điện thoại *
                      </label>
                      <input
                        type="tel"
                        required
                        value={formData.managerPhone}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            managerPhone: e.target.value,
                          })
                        }
                        placeholder="0901 xxx xxx"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0071c2] focus:border-[#0071c2] transition-all text-gray-900 placeholder:text-gray-400"
                        disabled={isLoading || success}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                          Giới tính *
                        </label>
                        <select
                          value={formData.gender}
                          onChange={(e) =>
                            setFormData({ ...formData, gender: e.target.value })
                          }
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0071c2] focus:border-[#0071c2] transition-all text-gray-900"
                          disabled={isLoading || success}
                        >
                          <option value="male">Nam</option>
                          <option value="female">Nữ</option>
                          <option value="other">Khác</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                          Ngày sinh *
                        </label>
                        <input
                          type="date"
                          required
                          value={formData.dateOfBirth}
                          onChange={(e) =>
                            setFormData({ ...formData, dateOfBirth: e.target.value })
                          }
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0071c2] focus:border-[#0071c2] transition-all text-gray-900"
                          disabled={isLoading || success}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Mật khẩu *
                      </label>
                      <input
                        type="password"
                        required
                        value={formData.password}
                        onChange={(e) =>
                          setFormData({ ...formData, password: e.target.value })
                        }
                        placeholder="••••••••"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0071c2] focus:border-[#0071c2] transition-all text-gray-900 placeholder:text-gray-400"
                        disabled={isLoading || success}
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        Tối thiểu 8 ký tự
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Xác nhận mật khẩu *
                      </label>
                      <input
                        type="password"
                        required
                        value={formData.confirmPassword}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            confirmPassword: e.target.value,
                          })
                        }
                        placeholder="••••••••"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0071c2] focus:border-[#0071c2] transition-all text-gray-900 placeholder:text-gray-400"
                        disabled={isLoading || success}
                      />
                    </div>

                    <div>
                      <label className="flex items-start cursor-pointer">
                        <input
                          type="checkbox"
                          required
                          checked={formData.agreeTerms}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              agreeTerms: e.target.checked,
                            })
                          }
                          className="w-4 h-4 mt-1 text-[#0071c2] rounded focus:ring-2 focus:ring-[#0071c2]"
                          disabled={isLoading || success}
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          Tôi đồng ý với{' '}
                          <Link
                            href="/terms"
                            className="font-medium text-[#0071c2] hover:text-[#005999]"
                          >
                            Điều khoản đối tác
                          </Link>{' '}
                          và{' '}
                          <Link
                            href="/privacy"
                            className="font-medium text-[#0071c2] hover:text-[#005999]"
                          >
                            Chính sách bảo mật
                          </Link>
                        </span>
                      </label>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        type="button"
                        onClick={handleBack}
                        disabled={isLoading || success}
                        className="flex-1 px-6 py-3 border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-semibold rounded-lg transition-colors disabled:opacity-50"
                      >
                        ← Quay lại
                      </button>
                      <button
                        type="submit"
                        disabled={isLoading || success}
                        className="flex-1 px-6 py-3 bg-[#0071c2] hover:bg-[#005999] text-white font-semibold rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                      >
                        {isLoading ? (
                          <span className="flex items-center justify-center gap-2">
                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Đang đăng ký...
                          </span>
                        ) : success ? (
                          '✓ Đăng ký thành công'
                        ) : (
                          'Hoàn tất đăng ký'
                        )}
                      </button>
                    </div>
                  </>
                )}
              </form>

              <div className="mt-6 text-center">
                <p className="text-gray-600">
                  Đã có tài khoản?{' '}
                  <Link
                    href="/hotel-manager/login"
                    className="font-semibold text-[#0071c2] hover:text-[#005999] transition-colors"
                  >
                    Đăng nhập
                  </Link>
                </p>
              </div>
            </Card>

            {/* Benefits */}
            <Card className="mt-6">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <span className="text-xl">🎯</span>
                Lợi ích khi trở thành đối tác
              </h3>
              <ul className="text-sm text-gray-600 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span>Tiếp cận hàng triệu khách hàng tiềm năng</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span>Hệ thống quản lý đặt phòng dễ dàng</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span>Báo cáo và thống kê chi tiết theo thời gian thực</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span>Hỗ trợ 24/7 từ đội ngũ VietStay</span>
                </li>
              </ul>
            </Card>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600 mb-2">
                Bạn là khách hàng?{' '}
                <Link
                  href="/register"
                  className="font-semibold text-[#0071c2] hover:text-[#005999] transition-colors"
                >
                  Đăng ký tài khoản người dùng
                </Link>
              </p>
              <p className="text-sm text-gray-600">
                Cần hỗ trợ?{' '}
                <a
                  href="mailto:partner@vietstay.com"
                  className="font-semibold text-[#0071c2] hover:text-[#005999] transition-colors"
                >
                  Liên hệ chúng tôi
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
