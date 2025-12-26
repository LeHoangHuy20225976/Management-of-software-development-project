'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { paymentApi, bookingsApi } from '@/lib/api/services';
import { formatCurrency } from '@/lib/utils/format';

interface BookingData {
  hotelId: string;
  hotelName: string;
  hotelImage: string;
  roomId: string;
  roomType: string;
  roomPrice: number;
  checkIn: string;
  checkOut: string;
  nights: number;
  guests: number;
  guestInfo: {
    fullName: string;
    email: string;
    phone: string;
    specialRequests: string;
  };
  paymentMethod: string;
  totalPrice: number;
}

export default function PaymentPage() {
  const router = useRouter();
  const [bookingData, setBookingData] = useState<BookingData | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'vnpay' | 'momo' | 'cash' | 'bank_transfer'>('vnpay');
  const [bankCode, setBankCode] = useState('NCB');
  const [loading, setLoading] = useState(false);
  const [paymentConfig, setPaymentConfig] = useState<{
    supportedMethods: string[];
    bankCodes: { code: string; name: string }[];
  } | null>(null);

  useEffect(() => {
    // Get booking data from sessionStorage
    const data = sessionStorage.getItem('bookingData');
    if (data) {
      setBookingData(JSON.parse(data));
    }

    // Load payment config
    const loadConfig = async () => {
      try {
        const config = await paymentApi.getConfig();
        setPaymentConfig(config);
      } catch (error) {
        console.error('Error loading payment config:', error);
      }
    };
    loadConfig();
  }, []);

  const handlePayment = async () => {
    if (!bookingData) return;

    setLoading(true);
    try {
      // First create booking
      const booking = await bookingsApi.create({
        room_id: Number(bookingData.roomId),
        check_in_date: bookingData.checkIn,
        check_out_date: bookingData.checkOut,
        people: bookingData.guests,
        total_price: bookingData.totalPrice,
        status: 'pending',
        hotelName: bookingData.hotelName,
        hotelImage: bookingData.hotelImage,
        roomType: bookingData.roomType,
        nights: bookingData.nights,
        paymentMethod: paymentMethod,
      });

      // Then create payment
      const payment = await paymentApi.createPayment({
        bookingId: booking.booking_id,
        amount: bookingData.totalPrice,
        paymentMethod: paymentMethod,
        bankCode: paymentMethod === 'vnpay' ? bankCode : undefined,
        orderInfo: `Thanh toán đặt phòng ${bookingData.hotelName}`,
        returnUrl: `${window.location.origin}/payment/result`,
      });

      if (payment.payment_url && paymentMethod === 'vnpay') {
        // Redirect to VNPay
        // For mock, we'll simulate by going to result page
        sessionStorage.setItem('paymentResult', JSON.stringify({
          success: true,
          bookingId: booking.booking_id,
          paymentId: payment.payment_id,
          amount: bookingData.totalPrice,
          method: paymentMethod,
        }));
        router.push('/payment/result?status=success');
      } else {
        // For cash/bank_transfer, go directly to success
        sessionStorage.setItem('paymentResult', JSON.stringify({
          success: true,
          bookingId: booking.booking_id,
          paymentId: payment.payment_id,
          amount: bookingData.totalPrice,
          method: paymentMethod,
        }));
        router.push('/payment/result?status=success');
      }
    } catch (error) {
      console.error('Payment error:', error);
      router.push('/payment/result?status=failed');
    } finally {
      setLoading(false);
    }
  };

  if (!bookingData) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="container mx-auto px-4">
            <Card className="text-center py-12">
              <div className="text-6xl mb-4">🛒</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Không có thông tin đặt phòng</h2>
              <p className="text-gray-600 mb-6">Vui lòng quay lại trang đặt phòng để tiếp tục.</p>
              <Button onClick={() => router.push('/search')}>Tìm khách sạn</Button>
            </Card>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-center space-x-4">
              <div className="flex items-center text-green-600">
                <div className="w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center font-bold">✓</div>
                <span className="ml-2 font-medium hidden sm:inline">Thông tin</span>
              </div>
              <div className="w-16 h-0.5 bg-[#0071c2]"></div>
              <div className="flex items-center text-[#0071c2]">
                <div className="w-10 h-10 rounded-full bg-[#0071c2] text-white flex items-center justify-center font-bold">2</div>
                <span className="ml-2 font-medium hidden sm:inline">Thanh toán</span>
              </div>
              <div className="w-16 h-0.5 bg-gray-300"></div>
              <div className="flex items-center text-gray-400">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold">3</div>
                <span className="ml-2 font-medium hidden sm:inline">Hoàn tất</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Payment Methods */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Chọn phương thức thanh toán</h2>
                
                <div className="space-y-4">
                  {/* VNPay */}
                  <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${paymentMethod === 'vnpay' ? 'border-[#0071c2] bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="vnpay"
                      checked={paymentMethod === 'vnpay'}
                      onChange={() => setPaymentMethod('vnpay')}
                      className="w-5 h-5 text-[#0071c2]"
                    />
                    <div className="ml-4 flex-grow">
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">💳</span>
                        <div>
                          <p className="font-semibold text-gray-900">VNPay</p>
                          <p className="text-sm text-gray-600">Thanh toán qua cổng VNPay (ATM, Visa, MasterCard)</p>
                        </div>
                      </div>
                    </div>
                    <img src="https://vnpay.vn/assets/images/logo-icon/logo-primary.svg" alt="VNPay" className="h-8" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                  </label>

                  {/* Bank Selection for VNPay */}
                  {paymentMethod === 'vnpay' && paymentConfig && (
                    <div className="ml-9 p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm font-medium text-gray-700 mb-3">Chọn ngân hàng:</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {paymentConfig.bankCodes.map((bank) => (
                          <button
                            key={bank.code}
                            onClick={() => setBankCode(bank.code)}
                            className={`p-2 text-sm border rounded-lg transition-all ${bankCode === bank.code ? 'border-[#0071c2] bg-blue-50 text-[#0071c2]' : 'border-gray-200 hover:border-gray-300'}`}
                          >
                            {bank.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* MoMo */}
                  <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${paymentMethod === 'momo' ? 'border-[#0071c2] bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="momo"
                      checked={paymentMethod === 'momo'}
                      onChange={() => setPaymentMethod('momo')}
                      className="w-5 h-5 text-[#0071c2]"
                    />
                    <div className="ml-4 flex-grow">
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">📱</span>
                        <div>
                          <p className="font-semibold text-gray-900">MoMo</p>
                          <p className="text-sm text-gray-600">Thanh toán qua ví điện tử MoMo</p>
                        </div>
                      </div>
                    </div>
                  </label>

                  {/* Bank Transfer */}
                  <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${paymentMethod === 'bank_transfer' ? 'border-[#0071c2] bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="bank_transfer"
                      checked={paymentMethod === 'bank_transfer'}
                      onChange={() => setPaymentMethod('bank_transfer')}
                      className="w-5 h-5 text-[#0071c2]"
                    />
                    <div className="ml-4 flex-grow">
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">🏦</span>
                        <div>
                          <p className="font-semibold text-gray-900">Chuyển khoản ngân hàng</p>
                          <p className="text-sm text-gray-600">Chuyển khoản trực tiếp qua tài khoản ngân hàng</p>
                        </div>
                      </div>
                    </div>
                  </label>

                  {/* Cash */}
                  <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${paymentMethod === 'cash' ? 'border-[#0071c2] bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cash"
                      checked={paymentMethod === 'cash'}
                      onChange={() => setPaymentMethod('cash')}
                      className="w-5 h-5 text-[#0071c2]"
                    />
                    <div className="ml-4 flex-grow">
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">💵</span>
                        <div>
                          <p className="font-semibold text-gray-900">Thanh toán tại khách sạn</p>
                          <p className="text-sm text-gray-600">Thanh toán bằng tiền mặt khi nhận phòng</p>
                        </div>
                      </div>
                    </div>
                  </label>
                </div>

                {/* Security Notice */}
                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">🔒</span>
                    <div>
                      <p className="font-semibold text-green-800">Thanh toán an toàn</p>
                      <p className="text-sm text-green-700">Thông tin thanh toán của bạn được mã hóa và bảo mật tuyệt đối</p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Guest Info Summary */}
              <Card>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Thông tin khách hàng</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Họ tên:</p>
                    <p className="font-semibold text-gray-900">{bookingData.guestInfo.fullName}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Email:</p>
                    <p className="font-semibold text-gray-900">{bookingData.guestInfo.email}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Điện thoại:</p>
                    <p className="font-semibold text-gray-900">{bookingData.guestInfo.phone}</p>
                  </div>
                  {bookingData.guestInfo.specialRequests && (
                    <div>
                      <p className="text-gray-600">Yêu cầu đặc biệt:</p>
                      <p className="font-semibold text-gray-900">{bookingData.guestInfo.specialRequests}</p>
                    </div>
                  )}
                </div>
              </Card>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Chi tiết đặt phòng</h3>
                
                {/* Hotel Info */}
                <div className="flex items-start space-x-4 pb-4 border-b border-gray-200">
                  <div
                    className="w-20 h-20 rounded-lg bg-cover bg-center flex-shrink-0"
                    style={{ backgroundImage: `url('${bookingData.hotelImage}')` }}
                  />
                  <div>
                    <h4 className="font-bold text-gray-900">{bookingData.hotelName}</h4>
                    <p className="text-sm text-gray-600">{bookingData.roomType}</p>
                  </div>
                </div>

                {/* Booking Details */}
                <div className="py-4 border-b border-gray-200 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Nhận phòng:</span>
                    <span className="font-semibold text-gray-900">{bookingData.checkIn}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Trả phòng:</span>
                    <span className="font-semibold text-gray-900">{bookingData.checkOut}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Số đêm:</span>
                    <span className="font-semibold text-gray-900">{bookingData.nights} đêm</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Số khách:</span>
                    <span className="font-semibold text-gray-900">{bookingData.guests} người</span>
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="py-4 border-b border-gray-200 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">{formatCurrency(bookingData.roomPrice)} x {bookingData.nights} đêm</span>
                    <span className="text-gray-900">{formatCurrency(bookingData.roomPrice * bookingData.nights)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Thuế & phí dịch vụ (10%)</span>
                    <span className="text-gray-900">{formatCurrency(bookingData.roomPrice * bookingData.nights * 0.1)}</span>
                  </div>
                </div>

                {/* Total */}
                <div className="py-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-900">Tổng cộng</span>
                    <span className="text-2xl font-bold text-[#0071c2]">{formatCurrency(bookingData.totalPrice)}</span>
                  </div>
                </div>

                <Button
                  onClick={handlePayment}
                  disabled={loading}
                  className="w-full"
                  size="lg"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Đang xử lý...
                    </span>
                  ) : (
                    `Thanh toán ${formatCurrency(bookingData.totalPrice)}`
                  )}
                </Button>

                <p className="text-xs text-gray-500 text-center mt-4">
                  Bằng việc nhấn "Thanh toán", bạn đồng ý với{' '}
                  <a href="#" className="text-[#0071c2] hover:underline">Điều khoản sử dụng</a> và{' '}
                  <a href="#" className="text-[#0071c2] hover:underline">Chính sách bảo mật</a>
                </p>
              </Card>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
