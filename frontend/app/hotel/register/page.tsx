/**
 * Hotel Manager Register Page
 * FE4: Hotel Manager Portal
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Card } from '@/components/common/Card';
import { HotelLogo } from '@/components/hotel/HotelLogo';
import { ROUTES } from '@/lib/routes';

export default function HotelRegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    // Hotel Info
    hotelName: '',
    hotelStars: 3,
    hotelAddress: '',
    hotelCity: '',
    hotelDistrict: '',
    hotelPhone: '',
    // Manager Info
    managerName: '',
    managerEmail: '',
    managerPhone: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

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
    setStep(2);
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

    setIsLoading(true);

    try {
      // Create hotel manager account
      const hotelManager = {
        id: `hotel-${Date.now()}`,
        email: formData.managerEmail,
        name: formData.hotelName,
        managerName: formData.managerName,
        phone: formData.managerPhone,
        hotelInfo: {
          name: formData.hotelName,
          stars: formData.hotelStars,
          address: formData.hotelAddress,
          city: formData.hotelCity,
          district: formData.hotelDistrict,
          phone: formData.hotelPhone,
        },
        status: 'pending', // pending approval
        registeredDate: new Date().toISOString().split('T')[0],
      };

      // Save to localStorage
      localStorage.setItem('hotelManager', JSON.stringify(hotelManager));

      // Generate auth token
      const token = `hotel_token_${Date.now()}`;
      localStorage.setItem('hotel_auth_token', token);

      // Show success message and redirect
      setTimeout(() => {
        alert(
          'Đăng ký thành công! Chúng tôi sẽ xem xét và liên hệ với bạn trong vòng 24 giờ.'
        );
        router.push(ROUTES.HOTEL.DASHBOARD);
        window.location.reload();
      }, 500);
    } catch (err) {
      setError('Có lỗi xảy ra. Vui lòng thử lại!');
      setIsLoading(false);
    }
  };

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
              <div className="flex items-center justify-center space-x-4">
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
                    Thông tin khách sạn
                  </span>
                </div>
                <div className="w-16 h-0.5 bg-gray-300"></div>
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
                    Thông tin quản lý
                  </span>
                </div>
              </div>
            </div>

            <Card className="p-8">
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
                      />
                    </div>

                    <button
                      type="button"
                      onClick={handleNext}
                      className="w-full px-6 py-3 bg-[#0071c2] hover:bg-[#005999] text-white font-semibold rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
                    >
                      Tiếp theo →
                    </button>
                  </>
                )}

                {step === 2 && (
                  <>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">
                      Bước 2: Thông tin người quản lý
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
                      />
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
                        onClick={() => setStep(1)}
                        className="flex-1 px-6 py-3 border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-semibold rounded-lg transition-colors"
                      >
                        ← Quay lại
                      </button>
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="flex-1 px-6 py-3 bg-[#0071c2] hover:bg-[#005999] text-white font-semibold rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isLoading ? 'Đang đăng ký...' : 'Hoàn tất đăng ký'}
                      </button>
                    </div>
                  </>
                )}
              </form>

              <div className="mt-6 text-center">
                <p className="text-gray-600">
                  Đã có tài khoản?{' '}
                  <Link
                    href={ROUTES.HOTEL.LOGIN}
                    className="font-semibold text-[#0071c2] hover:text-[#005999] transition-colors"
                  >
                    Đăng nhập
                  </Link>
                </p>
              </div>
            </Card>

            {/* Info Card */}
            <Card className="mt-6">
              <h3 className="font-semibold text-gray-900 mb-3">
                📝 Quy trình xét duyệt
              </h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p className="flex items-start gap-2">
                  <span className="text-[#0071c2] mt-0.5">1.</span>
                  <span>Điền đầy đủ thông tin khách sạn và người quản lý</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-[#0071c2] mt-0.5">2.</span>
                  <span>
                    Đội ngũ VietStay sẽ xem xét hồ sơ trong vòng 24 giờ
                  </span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-[#0071c2] mt-0.5">3.</span>
                  <span>Nhận email xác nhận và bắt đầu sử dụng hệ thống</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-[#0071c2] mt-0.5">4.</span>
                  <span>Hoàn thiện thông tin khách sạn, phòng và giá cả</span>
                </p>
              </div>
            </Card>

            <div className="mt-6 text-center">
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
