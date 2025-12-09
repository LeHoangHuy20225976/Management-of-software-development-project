/**
 * Booking Confirmation & Invoice Page
 * FE2: Search & Booking
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import Link from 'next/link';
import { ROUTES } from '@/lib/routes';

export default function BookingConfirmationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingId = searchParams.get('id');

  const [bookingData, setBookingData] = useState<any>(null);

  useEffect(() => {
    // Get booking confirmation data from sessionStorage
    const data = sessionStorage.getItem('bookingConfirmation');
    if (!data) {
      alert('Không tìm thấy thông tin đặt phòng!');
      router.push('/');
      return;
    }
    setBookingData(JSON.parse(data));
  }, [router]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    // TODO: Implement PDF download
    alert('Tính năng tải PDF đang được phát triển!');
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

  const totalPrice = bookingData.roomPrice * bookingData.nights;
  const serviceFee = totalPrice * 0.05;
  const tax = totalPrice * 0.1;
  const grandTotal = totalPrice + serviceFee + tax;

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          {/* Success Message */}
          <div className="max-w-4xl mx-auto mb-8">
            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-8 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500 rounded-full mb-4">
                <span className="text-4xl text-white">✓</span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Đặt phòng thành công!
              </h1>
              <p className="text-gray-600 mb-4">
                Cảm ơn bạn đã đặt phòng tại VietStay. Chúng tôi đã gửi email xác nhận đến{' '}
                <strong>{bookingData.guestInfo?.email}</strong>
              </p>
              <div className="inline-block bg-white px-6 py-3 rounded-lg border-2 border-green-200">
                <p className="text-sm text-gray-600 mb-1">Mã đặt phòng</p>
                <p className="text-2xl font-bold text-[#0071c2]">{bookingData.bookingId}</p>
              </div>
            </div>
          </div>

          {/* Booking Details & Invoice */}
          <div className="max-w-4xl mx-auto">
            <Card className="print:shadow-none">
              {/* Invoice Header */}
              <div className="flex items-start justify-between mb-8 pb-6 border-b print:border-black">
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-10 h-10 bg-[#0071c2] rounded-lg flex items-center justify-center">
                      <span className="text-white text-xl">🏨</span>
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">VietStay</h2>
                      <p className="text-xs text-gray-600">Hotel Booking Platform</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">123 Lê Lợi, Quận 1, TP.HCM</p>
                  <p className="text-sm text-gray-600">Email: support@vietstay.com</p>
                  <p className="text-sm text-gray-600">Hotline: 1900 xxxx</p>
                </div>
                <div className="text-right">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">HÓA ĐƠN</h3>
                  <p className="text-sm text-gray-600">Mã: {bookingData.bookingId}</p>
                  <p className="text-sm text-gray-600">
                    Ngày: {new Date(bookingData.bookingDate).toLocaleDateString('vi-VN')}
                  </p>
                  <span className={`inline-block mt-2 px-3 py-1 rounded-full text-sm ${
                    bookingData.paymentStatus === 'paid'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {bookingData.paymentStatus === 'paid' ? '✓ Đã thanh toán' : '⏳ Chờ thanh toán'}
                  </span>
                </div>
              </div>

              {/* Customer Info */}
              <div className="grid grid-cols-2 gap-8 mb-8">
                <div>
                  <h4 className="font-bold text-gray-900 mb-3">Thông tin khách hàng</h4>
                  <div className="text-sm space-y-1">
                    <p className="text-gray-700">
                      <strong>Họ tên:</strong> {bookingData.guestInfo?.fullName}
                    </p>
                    <p className="text-gray-700">
                      <strong>Email:</strong> {bookingData.guestInfo?.email}
                    </p>
                    <p className="text-gray-700">
                      <strong>Điện thoại:</strong> {bookingData.guestInfo?.phone}
                    </p>
                  </div>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-3">Thông tin khách sạn</h4>
                  <div className="text-sm space-y-1">
                    <p className="text-gray-700">
                      <strong>Khách sạn:</strong> {bookingData.hotelName}
                    </p>
                    <p className="text-gray-700">
                      <strong>Loại phòng:</strong> {bookingData.roomType}
                    </p>
                    <p className="text-gray-700">
                      <strong>Số khách:</strong> {bookingData.guests} người
                    </p>
                  </div>
                </div>
              </div>

              {/* Booking Details */}
              <div className="mb-8">
                <h4 className="font-bold text-gray-900 mb-3">Chi tiết đặt phòng</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600 mb-1">Nhận phòng</p>
                      <p className="font-semibold text-gray-900">{bookingData.checkIn}</p>
                      <p className="text-xs text-gray-600">Sau 14:00</p>
                    </div>
                    <div>
                      <p className="text-gray-600 mb-1">Trả phòng</p>
                      <p className="font-semibold text-gray-900">{bookingData.checkOut}</p>
                      <p className="text-xs text-gray-600">Trước 12:00</p>
                    </div>
                    <div>
                      <p className="text-gray-600 mb-1">Thời gian lưu trú</p>
                      <p className="font-semibold text-gray-900">{bookingData.nights} đêm</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Price Breakdown Table */}
              <div className="mb-8">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b-2 border-gray-300">
                      <th className="text-left py-3 font-bold text-gray-900">Mô tả</th>
                      <th className="text-right py-3 font-bold text-gray-900">Số lượng</th>
                      <th className="text-right py-3 font-bold text-gray-900">Đơn giá</th>
                      <th className="text-right py-3 font-bold text-gray-900">Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-200">
                      <td className="py-3 text-gray-700">{bookingData.roomType}</td>
                      <td className="text-right text-gray-700">{bookingData.nights} đêm</td>
                      <td className="text-right text-gray-700">
                        {bookingData.roomPrice.toLocaleString('vi-VN')} ₫
                      </td>
                      <td className="text-right font-semibold text-gray-900">
                        {totalPrice.toLocaleString('vi-VN')} ₫
                      </td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="py-3 text-gray-700" colSpan={3}>Phí dịch vụ (5%)</td>
                      <td className="text-right font-semibold text-gray-900">
                        {serviceFee.toLocaleString('vi-VN')} ₫
                      </td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="py-3 text-gray-700" colSpan={3}>Thuế VAT (10%)</td>
                      <td className="text-right font-semibold text-gray-900">
                        {tax.toLocaleString('vi-VN')} ₫
                      </td>
                    </tr>
                    <tr className="border-t-2 border-gray-300">
                      <td className="py-4 font-bold text-gray-900 text-lg" colSpan={3}>
                        TỔNG CỘNG
                      </td>
                      <td className="text-right font-bold text-[#0071c2] text-2xl">
                        {grandTotal.toLocaleString('vi-VN')} ₫
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Payment Info */}
              <div className="mb-8 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-bold text-gray-900 mb-2">Phương thức thanh toán</h4>
                <p className="text-sm text-gray-700">
                  {bookingData.paymentMethod === 'credit_card' && '💳 Thẻ tín dụng/Ghi nợ'}
                  {bookingData.paymentMethod === 'bank_transfer' && '🏦 Chuyển khoản ngân hàng'}
                  {bookingData.paymentMethod === 'cash' && '💵 Thanh toán tại khách sạn'}
                </p>
              </div>

              {/* Special Requests */}
              {bookingData.guestInfo?.specialRequests && (
                <div className="mb-8">
                  <h4 className="font-bold text-gray-900 mb-2">Yêu cầu đặc biệt</h4>
                  <p className="text-sm text-gray-700 bg-gray-50 p-4 rounded-lg">
                    {bookingData.guestInfo.specialRequests}
                  </p>
                </div>
              )}

              {/* Cancellation Policy */}
              <div className="mb-8 p-4 border-2 border-yellow-200 bg-yellow-50 rounded-lg">
                <h4 className="font-bold text-gray-900 mb-2">Chính sách hủy phòng</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Hủy miễn phí trước 24 giờ so với giờ nhận phòng</li>
                  <li>• Hủy trong vòng 24 giờ: phí 50% tổng giá trị đặt phòng</li>
                  <li>• Không đến (No-show): không hoàn tiền</li>
                </ul>
              </div>

              {/* Important Notes */}
              <div className="text-sm text-gray-600 space-y-2 mb-8">
                <p>📌 Vui lòng mang theo CMND/CCCD/Hộ chiếu khi nhận phòng</p>
                <p>📌 Check-in: 14:00 | Check-out: 12:00</p>
                <p>📌 Liên hệ khách sạn trước nếu bạn đến muộn sau 18:00</p>
              </div>

              {/* Actions (hidden when printing) */}
              <div className="flex flex-col sm:flex-row gap-4 print:hidden">
                <Button onClick={handlePrint} variant="outline" className="flex-1">
                  🖨️ In hóa đơn
                </Button>
                <Button onClick={handleDownloadPDF} variant="outline" className="flex-1">
                  📥 Tải PDF
                </Button>
                <Link href={ROUTES.USER.DASHBOARD} className="flex-1">
                  <Button className="w-full">
                    📊 Xem đơn đặt phòng
                  </Button>
                </Link>
              </div>
            </Card>

            {/* Contact Support */}
            <Card className="mt-6 bg-blue-50 border-blue-200 print:hidden">
              <div className="text-center">
                <h3 className="font-bold text-gray-900 mb-2">Cần hỗ trợ?</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Đội ngũ hỗ trợ của chúng tôi luôn sẵn sàng 24/7
                </p>
                <div className="flex justify-center space-x-4">
                  <Button variant="outline" size="sm">
                    📞 Gọi hotline
                  </Button>
                  <Button variant="outline" size="sm">
                    💬 Chat ngay
                  </Button>
                  <Button variant="outline" size="sm">
                    ✉️ Gửi email
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
      <Footer />

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body {
            background: white;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:shadow-none {
            box-shadow: none !important;
          }
          .print\\:border-black {
            border-color: black !important;
          }
        }
      `}</style>
    </>
  );
}
