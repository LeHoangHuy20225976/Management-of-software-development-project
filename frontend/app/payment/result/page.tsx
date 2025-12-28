'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { formatCurrency } from '@/lib/utils/format';
import { paymentApi } from '@/lib/api/services';

interface PaymentResult {
  success: boolean;
  bookingId: number;
  paymentId: number;
  amount: number;
  method: string;
}

export default function PaymentResultPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const status = searchParams.get('status');
  
  const [paymentResult, setPaymentResult] = useState<PaymentResult | null>(null);

  useEffect(() => {
    const data = sessionStorage.getItem('paymentResult');
    if (data) {
      const result = JSON.parse(data);
      setPaymentResult(result);
      
      // Mark payment as completed for mock
      if (result.success && result.paymentId) {
        paymentApi.completePayment(String(result.paymentId)).catch(console.error);
      }
      
      // Clear session storage
      sessionStorage.removeItem('paymentResult');
      sessionStorage.removeItem('bookingData');
    }
  }, []);

  const isSuccess = status === 'success';

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
              <div className="w-16 h-0.5 bg-green-600"></div>
              <div className="flex items-center text-green-600">
                <div className="w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center font-bold">✓</div>
                <span className="ml-2 font-medium hidden sm:inline">Thanh toán</span>
              </div>
              <div className="w-16 h-0.5 bg-green-600"></div>
              <div className={`flex items-center ${isSuccess ? 'text-green-600' : 'text-red-600'}`}>
                <div className={`w-10 h-10 rounded-full ${isSuccess ? 'bg-green-600' : 'bg-red-600'} text-white flex items-center justify-center font-bold`}>
                  {isSuccess ? '✓' : '✕'}
                </div>
                <span className="ml-2 font-medium hidden sm:inline">Hoàn tất</span>
              </div>
            </div>
          </div>

          <div className="max-w-2xl mx-auto">
            {isSuccess ? (
              <Card className="text-center py-12">
                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
                  <span className="text-5xl">✅</span>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">Đặt phòng thành công!</h1>
                <p className="text-gray-600 mb-6">
                  Cảm ơn bạn đã đặt phòng. Chúng tôi đã gửi email xác nhận đến địa chỉ email của bạn.
                </p>

                {paymentResult && (
                  <div className="bg-gray-50 rounded-lg p-6 mb-6 text-left">
                    <h3 className="font-bold text-gray-900 mb-4">Chi tiết đơn hàng</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Mã đặt phòng:</span>
                        <span className="font-semibold text-gray-900">#{paymentResult.bookingId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Mã thanh toán:</span>
                        <span className="font-semibold text-gray-900">#{paymentResult.paymentId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Phương thức:</span>
                        <span className="font-semibold text-gray-900">
                          {paymentResult.method === 'vnpay' ? 'VNPay' :
                           paymentResult.method === 'momo' ? 'MoMo' :
                           paymentResult.method === 'bank_transfer' ? 'Chuyển khoản' : 'Tiền mặt'}
                        </span>
                      </div>
                      <div className="flex justify-between border-t border-gray-200 pt-2 mt-2">
                        <span className="text-gray-900 font-semibold">Tổng thanh toán:</span>
                        <span className="font-bold text-[#0071c2] text-xl">{formatCurrency(paymentResult.amount)}</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/user/dashboard/bookings">
                    <Button variant="primary">Xem đơn đặt phòng</Button>
                  </Link>
                  <Link href="/search">
                    <Button variant="outline">Tiếp tục tìm kiếm</Button>
                  </Link>
                </div>

                <div className="mt-8 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    💡 <strong>Lưu ý:</strong> Vui lòng kiểm tra email để xem chi tiết đặt phòng và hướng dẫn nhận phòng.
                  </p>
                </div>
              </Card>
            ) : (
              <Card className="text-center py-12">
                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-red-100 flex items-center justify-center">
                  <span className="text-5xl">❌</span>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">Thanh toán thất bại</h1>
                <p className="text-gray-600 mb-6">
                  Đã có lỗi xảy ra trong quá trình thanh toán. Vui lòng thử lại hoặc chọn phương thức thanh toán khác.
                </p>

                <div className="bg-red-50 rounded-lg p-4 mb-6">
                  <p className="text-sm text-red-800">
                    ⚠️ Nếu tiền đã bị trừ, vui lòng liên hệ hotline <strong>1900 xxxx</strong> để được hỗ trợ.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button onClick={() => router.back()} variant="primary">
                    Thử lại
                  </Button>
                  <Link href="/search">
                    <Button variant="outline">Quay lại tìm kiếm</Button>
                  </Link>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
