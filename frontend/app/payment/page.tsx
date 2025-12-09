/**
 * Payment Page - Booking Flow Step 2
 * FE2: Search & Booking
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';

export default function PaymentPage() {
  const router = useRouter();
  const [bookingData, setBookingData] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const [cardInfo, setCardInfo] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
  });

  useEffect(() => {
    // Get booking data from sessionStorage
    const data = sessionStorage.getItem('bookingData');
    if (!data) {
      alert('Không tìm thấy thông tin đặt phòng!');
      router.push('/');
      return;
    }
    setBookingData(JSON.parse(data));
  }, [router]);

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (bookingData.paymentMethod === 'credit_card') {
      if (!cardInfo.cardNumber || !cardInfo.cardName || !cardInfo.expiryDate || !cardInfo.cvv) {
        alert('Vui lòng điền đầy đủ thông tin thẻ!');
        return;
      }
    }

    setIsProcessing(true);

    // Simulate payment processing
    setTimeout(() => {
      // Create booking ID
      const bookingId = 'BK' + Date.now();

      // Store booking confirmation
      sessionStorage.setItem('bookingConfirmation', JSON.stringify({
        ...bookingData,
        bookingId,
        bookingDate: new Date().toISOString(),
        paymentStatus: 'paid',
      }));

      setIsProcessing(false);
      router.push(`/booking/confirmation?id=${bookingId}`);
    }, 2000);
  };

  if (!bookingData) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <p className="text-gray-600">Đang tải...</p>
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
                <div className="w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center font-bold">
                  ✓
                </div>
                <span className="ml-2 font-medium hidden sm:inline">Thông tin</span>
              </div>
              <div className="w-16 h-0.5 bg-[#0071c2]"></div>
              <div className="flex items-center text-[#0071c2]">
                <div className="w-10 h-10 rounded-full bg-[#0071c2] text-white flex items-center justify-center font-bold">
                  2
                </div>
                <span className="ml-2 font-medium hidden sm:inline">Thanh toán</span>
              </div>
              <div className="w-16 h-0.5 bg-gray-300"></div>
              <div className="flex items-center text-gray-400">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold">
                  3
                </div>
                <span className="ml-2 font-medium hidden sm:inline">Hoàn tất</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Payment Form */}
            <div className="lg:col-span-2">
              <Card>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Thanh toán</h2>

                <form onSubmit={handlePayment} className="space-y-6">
                  {bookingData.paymentMethod === 'credit_card' && (
                    <>
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                          Số thẻ *
                        </label>
                        <Input
                          value={cardInfo.cardNumber}
                          onChange={(e) => {
                            // Format card number with spaces
                            const value = e.target.value.replace(/\s/g, '');
                            const formatted = value.match(/.{1,4}/g)?.join(' ') || value;
                            setCardInfo({ ...cardInfo, cardNumber: formatted });
                          }}
                          placeholder="1234 5678 9012 3456"
                          maxLength={19}
                          required
                        />
                        <div className="flex items-center space-x-2 mt-2">
                          <img src="https://img.icons8.com/color/48/visa.png" alt="Visa" className="h-8" />
                          <img src="https://img.icons8.com/color/48/mastercard.png" alt="Mastercard" className="h-8" />
                          <img src="https://img.icons8.com/color/48/jcb.png" alt="JCB" className="h-8" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                          Tên chủ thẻ *
                        </label>
                        <Input
                          value={cardInfo.cardName}
                          onChange={(e) => setCardInfo({ ...cardInfo, cardName: e.target.value.toUpperCase() })}
                          placeholder="NGUYEN VAN A"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-900 mb-2">
                            Ngày hết hạn *
                          </label>
                          <Input
                            value={cardInfo.expiryDate}
                            onChange={(e) => {
                              // Format MM/YY
                              let value = e.target.value.replace(/\D/g, '');
                              if (value.length >= 2) {
                                value = value.slice(0, 2) + '/' + value.slice(2, 4);
                              }
                              setCardInfo({ ...cardInfo, expiryDate: value });
                            }}
                            placeholder="MM/YY"
                            maxLength={5}
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-900 mb-2">
                            CVV *
                          </label>
                          <Input
                            type="password"
                            value={cardInfo.cvv}
                            onChange={(e) => setCardInfo({ ...cardInfo, cvv: e.target.value.replace(/\D/g, '') })}
                            placeholder="123"
                            maxLength={3}
                            required
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {bookingData.paymentMethod === 'bank_transfer' && (
                    <div className="bg-blue-50 p-6 rounded-lg">
                      <h3 className="font-bold text-gray-900 mb-4">Thông tin chuyển khoản</h3>
                      <div className="space-y-2 text-sm">
                        <p className="text-gray-700">
                          <strong>Ngân hàng:</strong> Vietcombank - Chi nhánh TP.HCM
                        </p>
                        <p className="text-gray-700">
                          <strong>Số tài khoản:</strong> 0123456789
                        </p>
                        <p className="text-gray-700">
                          <strong>Chủ tài khoản:</strong> CÔNG TY TNHH VIETSTAY
                        </p>
                        <p className="text-gray-700">
                          <strong>Số tiền:</strong>{' '}
                          <span className="text-[#0071c2] font-bold">
                            {bookingData.totalPrice?.toLocaleString('vi-VN')} ₫
                          </span>
                        </p>
                        <p className="text-gray-700">
                          <strong>Nội dung:</strong> THANHTOAN {bookingData.guestInfo?.fullName}
                        </p>
                      </div>
                      <p className="text-xs text-gray-600 mt-4">
                        * Vui lòng chuyển khoản đúng nội dung để xử lý đơn hàng nhanh chóng
                      </p>
                    </div>
                  )}

                  {bookingData.paymentMethod === 'cash' && (
                    <div className="bg-green-50 p-6 rounded-lg">
                      <h3 className="font-bold text-gray-900 mb-4">Thanh toán tại khách sạn</h3>
                      <p className="text-sm text-gray-700 mb-4">
                        Bạn sẽ thanh toán trực tiếp tại khách sạn khi nhận phòng. Vui lòng mang theo:
                      </p>
                      <ul className="text-sm text-gray-700 space-y-2">
                        <li>• CMND/CCCD/Hộ chiếu gốc</li>
                        <li>• Mã đặt phòng (sẽ gửi qua email)</li>
                        <li>• Tiền mặt hoặc thẻ thanh toán</li>
                      </ul>
                    </div>
                  )}

                  {/* Security Info */}
                  <div className="flex items-center space-x-2 text-sm text-gray-600 bg-gray-50 p-4 rounded-lg">
                    <span className="text-green-600">🔒</span>
                    <p>
                      Thông tin của bạn được bảo mật bằng mã hóa SSL 256-bit
                    </p>
                  </div>

                  <div className="flex space-x-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.back()}
                      className="flex-1"
                    >
                      ← Quay lại
                    </Button>
                    <Button
                      type="submit"
                      disabled={isProcessing}
                      className="flex-1"
                      size="lg"
                    >
                      {isProcessing ? 'Đang xử lý...' : 'Xác nhận thanh toán'}
                    </Button>
                  </div>
                </form>
              </Card>
            </div>

            {/* Right Column - Booking Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Tóm tắt đặt phòng</h2>

                <div className="space-y-3 mb-6 pb-6 border-b">
                  <div>
                    <h3 className="font-bold text-gray-900">{bookingData.hotelName}</h3>
                    <p className="text-sm text-gray-600">{bookingData.roomType}</p>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Nhận phòng</span>
                    <span className="font-semibold text-gray-900">{bookingData.checkIn}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Trả phòng</span>
                    <span className="font-semibold text-gray-900">{bookingData.checkOut}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Số đêm</span>
                    <span className="font-semibold text-gray-900">{bookingData.nights} đêm</span>
                  </div>
                </div>

                <div className="flex justify-between mb-4">
                  <span className="text-lg font-bold text-gray-900">Tổng cộng</span>
                  <span className="text-2xl font-bold text-[#0071c2]">
                    {bookingData.totalPrice?.toLocaleString('vi-VN')} ₫
                  </span>
                </div>

                <div className="text-sm text-gray-600 space-y-2">
                  <p>✓ Xác nhận ngay lập tức</p>
                  <p>✓ Không tính phí hủy trước 24h</p>
                  <p>✓ Hỗ trợ 24/7</p>
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
