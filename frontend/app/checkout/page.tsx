'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get booking details from URL params
  const hotelId = searchParams.get('hotelId') || '';
  const hotelName = searchParams.get('hotelName') || '';
  const hotelImage = searchParams.get('hotelImage') || '';
  const hotelSlug = searchParams.get('hotelSlug') || '';
  const roomId = searchParams.get('roomId') || '';
  const roomType = searchParams.get('roomType') || '';
  const roomPrice = Number(searchParams.get('roomPrice')) || 0;
  const checkIn = searchParams.get('checkIn') || '';
  const checkOut = searchParams.get('checkOut') || '';
  const nights = Number(searchParams.get('nights')) || 0;
  const guests = Number(searchParams.get('guests')) || 2;

  const bookingInfo = {
    hotelId,
    hotelName,
    hotelImage,
    hotelSlug,
    roomId,
    roomType,
    roomPrice,
    checkIn,
    checkOut,
    nights,
    guests,
  };

  const [guestInfo, setGuestInfo] = useState({
    fullName: '',
    email: '',
    phone: '',
    specialRequests: '',
  });

  const [paymentMethod, setPaymentMethod] = useState<
    'credit_card' | 'bank_transfer' | 'cash'
  >('credit_card');

  const totalPrice = bookingInfo.roomPrice * bookingInfo.nights;
  const tax = totalPrice * 0.1;
  const grandTotal = totalPrice + tax;

  const handleProceedToPayment = () => {
    if (!guestInfo.fullName || !guestInfo.email || !guestInfo.phone) {
      alert('Vui lòng điền đầy đủ thông tin!');
      return;
    }

    // Store booking data in sessionStorage
    sessionStorage.setItem(
      'bookingData',
      JSON.stringify({
        ...bookingInfo,
        guestInfo,
        paymentMethod,
        totalPrice: grandTotal,
      })
    );

    router.push('/payment');
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-center space-x-4">
              <div className="flex items-center text-[#0071c2]">
                <div className="w-10 h-10 rounded-full bg-[#0071c2] text-white flex items-center justify-center font-bold">
                  1
                </div>
                <span className="ml-2 font-medium hidden sm:inline">
                  Thông tin
                </span>
              </div>
              <div className="w-16 h-0.5 bg-gray-300"></div>
              <div className="flex items-center text-gray-400">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold">
                  2
                </div>
                <span className="ml-2 font-medium hidden sm:inline">
                  Thanh toán
                </span>
              </div>
              <div className="w-16 h-0.5 bg-gray-300"></div>
              <div className="flex items-center text-gray-400">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold">
                  3
                </div>
                <span className="ml-2 font-medium hidden sm:inline">
                  Hoàn tất
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Guest Information */}
            <div className="lg:col-span-2 space-y-6">
              {/* Guest Details */}
              <Card>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Thông tin khách hàng
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Họ và tên *
                    </label>
                    <Input
                      value={guestInfo.fullName}
                      onChange={(e) =>
                        setGuestInfo({ ...guestInfo, fullName: e.target.value })
                      }
                      placeholder="Nguyễn Văn A"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Email *
                      </label>
                      <Input
                        type="email"
                        value={guestInfo.email}
                        onChange={(e) =>
                          setGuestInfo({ ...guestInfo, email: e.target.value })
                        }
                        placeholder="example@email.com"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Số điện thoại *
                      </label>
                      <Input
                        type="tel"
                        value={guestInfo.phone}
                        onChange={(e) =>
                          setGuestInfo({ ...guestInfo, phone: e.target.value })
                        }
                        placeholder="0901 234 567"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Yêu cầu đặc biệt
                    </label>
                    <textarea
                      value={guestInfo.specialRequests}
                      onChange={(e) =>
                        setGuestInfo({
                          ...guestInfo,
                          specialRequests: e.target.value,
                        })
                      }
                      placeholder="VD: Giường đơn, tầng cao, không hút thuốc..."
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    />
                  </div>
                </div>
              </Card>

              {/* Payment Method */}
              <Card>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Phương thức thanh toán
                </h2>
                <div className="space-y-3">
                  <label className="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-[#0071c2] transition-colors">
                    <input
                      type="radio"
                      value="credit_card"
                      checked={paymentMethod === 'credit_card'}
                      onChange={(e) =>
                        setPaymentMethod(
                          e.target.value as
                            | 'credit_card'
                            | 'bank_transfer'
                            | 'cash'
                        )
                      }
                      className="w-5 h-5 text-[#0071c2]"
                    />
                    <div className="ml-3 flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-xl">💳</span>
                        <span className="font-semibold text-gray-900">
                          Thẻ tín dụng / Ghi nợ
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        Visa, Mastercard, JCB
                      </p>
                    </div>
                  </label>

                  <label className="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-[#0071c2] transition-colors">
                    <input
                      type="radio"
                      value="bank_transfer"
                      checked={paymentMethod === 'bank_transfer'}
                      onChange={(e) =>
                        setPaymentMethod(
                          e.target.value as
                            | 'credit_card'
                            | 'bank_transfer'
                            | 'cash'
                        )
                      }
                      className="w-5 h-5 text-[#0071c2]"
                    />
                    <div className="ml-3 flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-xl">🏦</span>
                        <span className="font-semibold text-gray-900">
                          Chuyển khoản ngân hàng
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        Thanh toán qua tài khoản ngân hàng
                      </p>
                    </div>
                  </label>

                  <label className="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-[#0071c2] transition-colors">
                    <input
                      type="radio"
                      value="cash"
                      checked={paymentMethod === 'cash'}
                      onChange={(e) =>
                        setPaymentMethod(
                          e.target.value as
                            | 'credit_card'
                            | 'bank_transfer'
                            | 'cash'
                        )
                      }
                      className="w-5 h-5 text-[#0071c2]"
                    />
                    <div className="ml-3 flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-xl">💵</span>
                        <span className="font-semibold text-gray-900">
                          Thanh toán tại khách sạn
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        Trả tiền mặt khi nhận phòng
                      </p>
                    </div>
                  </label>
                </div>
              </Card>

              {/* Terms */}
              <Card className="bg-blue-50 border-blue-200">
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    required
                    className="w-5 h-5 mt-1 text-[#0071c2] rounded focus:ring-2 focus:ring-[#0071c2]"
                  />
                  <p className="text-sm text-gray-700">
                    Tôi đồng ý với{' '}
                    <a
                      href="/terms"
                      className="font-semibold text-[#0071c2] hover:underline"
                    >
                      Điều khoản sử dụng
                    </a>{' '}
                    và{' '}
                    <a
                      href="/privacy"
                      className="font-semibold text-[#0071c2] hover:underline"
                    >
                      Chính sách bảo mật
                    </a>{' '}
                    của VietStay
                  </p>
                </div>
              </Card>
            </div>

            {/* Right Column - Booking Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Chi tiết đặt phòng
                </h2>

                {/* Hotel Info */}
                <div className="mb-6">
                  <img
                    src={bookingInfo.hotelImage}
                    alt={bookingInfo.hotelName}
                    className="w-full h-40 object-cover rounded-lg mb-3"
                  />
                  <h3 className="font-bold text-gray-900">
                    {bookingInfo.hotelName}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {bookingInfo.roomType}
                  </p>
                </div>

                {/* Booking Details */}
                <div className="space-y-3 mb-6 pb-6 border-b">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Nhận phòng</span>
                    <span className="font-semibold text-gray-900">
                      {bookingInfo.checkIn}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Trả phòng</span>
                    <span className="font-semibold text-gray-900">
                      {bookingInfo.checkOut}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Số đêm</span>
                    <span className="font-semibold text-gray-900">
                      {bookingInfo.nights} đêm
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Số khách</span>
                    <span className="font-semibold text-gray-900">
                      {bookingInfo.guests} người
                    </span>
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="space-y-3 mb-6 pb-6 border-b">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      {bookingInfo.roomPrice.toLocaleString('vi-VN')} ₫ x{' '}
                      {bookingInfo.nights} đêm
                    </span>
                    <span className="font-semibold text-gray-900">
                      {totalPrice.toLocaleString('vi-VN')} ₫
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Thuế & phí (10%)</span>
                    <span className="font-semibold text-gray-900">
                      {tax.toLocaleString('vi-VN')} ₫
                    </span>
                  </div>
                </div>

                {/* Total */}
                <div className="flex justify-between mb-6">
                  <span className="text-lg font-bold text-gray-900">
                    Tổng cộng
                  </span>
                  <span className="text-2xl font-bold text-[#0071c2]">
                    {grandTotal.toLocaleString('vi-VN')} ₫
                  </span>
                </div>

                {/* Action Button */}
                <Button
                  onClick={handleProceedToPayment}
                  className="w-full"
                  size="lg"
                >
                  Tiếp tục thanh toán →
                </Button>

                {/* Cancellation Policy */}
                <div className="mt-6 p-4 bg-green-50 rounded-lg">
                  <p className="text-sm font-semibold text-green-800 mb-2">
                    ✓ Miễn phí hủy phòng
                  </p>
                  <p className="text-xs text-green-700">
                    Hủy miễn phí trước 24 giờ trước giờ nhận phòng
                  </p>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
