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

  const handleNext = () => {
    if (step === 1) {
      if (!formData.hotelName || !formData.hotelAddress || !formData.hotelCity) {
        alert('Vui lòng điền đầy đủ thông tin khách sạn');
        return;
      }
    }
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert('Mật khẩu không khớp!');
      return;
    }

    if (!formData.agreeTerms) {
      alert('Vui lòng đồng ý với điều khoản đối tác');
      return;
    }

    setIsLoading(true);

    // TODO: Call API to register hotel
    setTimeout(() => {
      setIsLoading(false);
      alert('Đăng ký thành công! Vui lòng chờ xét duyệt từ VietStay.');
      router.push(ROUTES.HOTEL.LOGIN);
    }, 1500);
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <div className="inline-block p-4 bg-[#0071c2] rounded-full mb-4">
                <span className="text-4xl">🏨</span>
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-3">
                Đăng ký trở thành đối tác
              </h1>
              <p className="text-gray-600">
                Tham gia VietStay và tiếp cận hàng triệu khách hàng
              </p>
            </div>

            {/* Progress Steps */}
            <div className="mb-8">
              <div className="flex items-center justify-center space-x-4">
                <div className={`flex items-center ${step >= 1 ? 'text-[#0071c2]' : 'text-gray-400'}`}>
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                      step >= 1 ? 'bg-[#0071c2] text-white' : 'bg-gray-200'
                    }`}
                  >
                    1
                  </div>
                  <span className="ml-2 font-medium hidden sm:inline">Thông tin khách sạn</span>
                </div>
                <div className="w-16 h-0.5 bg-gray-300"></div>
                <div className={`flex items-center ${step >= 2 ? 'text-[#0071c2]' : 'text-gray-400'}`}>
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                      step >= 2 ? 'bg-[#0071c2] text-white' : 'bg-gray-200'
                    }`}
                  >
                    2
                  </div>
                  <span className="ml-2 font-medium hidden sm:inline">Thông tin quản lý</span>
                </div>
              </div>
            </div>

            <Card className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
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
                        onChange={(e) => setFormData({ ...formData, hotelName: e.target.value })}
                        placeholder="VD: Grand Hotel Saigon"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0071c2] focus:border-[#0071c2] transition-all text-gray-900"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Hạng sao *
                      </label>
                      <select
                        value={formData.hotelStars}
                        onChange={(e) => setFormData({ ...formData, hotelStars: Number(e.target.value) })}
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
                        onChange={(e) => setFormData({ ...formData, hotelAddress: e.target.value })}
                        placeholder="Số nhà, đường..."
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0071c2] focus:border-[#0071c2] transition-all text-gray-900"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                          Thành phố *
                        </label>
                        <select
                          value={formData.hotelCity}
                          onChange={(e) => setFormData({ ...formData, hotelCity: e.target.value })}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0071c2] focus:border-[#0071c2] transition-all text-gray-900"
                        >
                          <option value="">Chọn thành phố</option>
                          <option value="Hà Nội">Hà Nội</option>
                          <option value="Hồ Chí Minh">Hồ Chí Minh</option>
                          <option value="Đà Nẵng">Đà Nẵng</option>
                          <option value="Nha Trang">Nha Trang</option>
                          <option value="Đà Lạt">Đà Lạt</option>
                          <option value="Phú Quốc">Phú Quốc</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                          Quận/Huyện
                        </label>
                        <input
                          type="text"
                          value={formData.hotelDistrict}
                          onChange={(e) => setFormData({ ...formData, hotelDistrict: e.target.value })}
                          placeholder="VD: Quận 1"
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0071c2] focus:border-[#0071c2] transition-all text-gray-900"
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
                        onChange={(e) => setFormData({ ...formData, hotelPhone: e.target.value })}
                        placeholder="0283 xxx xxxx"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0071c2] focus:border-[#0071c2] transition-all text-gray-900"
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
                        onChange={(e) => setFormData({ ...formData, managerName: e.target.value })}
                        placeholder="Nguyễn Văn A"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0071c2] focus:border-[#0071c2] transition-all text-gray-900"
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
                        onChange={(e) => setFormData({ ...formData, managerEmail: e.target.value })}
                        placeholder="manager@hotel.com"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0071c2] focus:border-[#0071c2] transition-all text-gray-900"
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
                        onChange={(e) => setFormData({ ...formData, managerPhone: e.target.value })}
                        placeholder="0901 xxx xxx"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0071c2] focus:border-[#0071c2] transition-all text-gray-900"
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
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        placeholder="••••••••"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0071c2] focus:border-[#0071c2] transition-all text-gray-900"
                      />
                      <p className="mt-1 text-xs text-gray-500">Tối thiểu 8 ký tự</p>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Xác nhận mật khẩu *
                      </label>
                      <input
                        type="password"
                        required
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        placeholder="••••••••"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0071c2] focus:border-[#0071c2] transition-all text-gray-900"
                      />
                    </div>

                    <div>
                      <label className="flex items-start cursor-pointer">
                        <input
                          type="checkbox"
                          required
                          checked={formData.agreeTerms}
                          onChange={(e) => setFormData({ ...formData, agreeTerms: e.target.checked })}
                          className="w-4 h-4 mt-1 text-[#0071c2] rounded focus:ring-2 focus:ring-[#0071c2]"
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          Tôi đồng ý với{' '}
                          <Link href="/terms" className="font-medium text-[#0071c2] hover:text-[#005999]">
                            Điều khoản đối tác
                          </Link>
                          {' '}và{' '}
                          <Link href="/privacy" className="font-medium text-[#0071c2] hover:text-[#005999]">
                            Chính sách bảo mật
                          </Link>
                        </span>
                      </label>
                    </div>

                    <div className="flex space-x-4">
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
                        className="flex-1 px-6 py-3 bg-[#0071c2] hover:bg-[#005999] text-white font-semibold rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50"
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
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
