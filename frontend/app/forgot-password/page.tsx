'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Card } from '@/components/common/Card';
import { authApi } from '@/lib/api/auth';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess(false);

    try {
      await authApi.forgotPassword(email);
      setSuccess(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Có lỗi xảy ra. Vui lòng thử lại!';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-3">Quên mật khẩu</h1>
              <p className="text-gray-600">
                Nhập email của bạn và chúng tôi sẽ gửi link đặt lại mật khẩu
              </p>
            </div>

            <Card className="p-8">
              {success ? (
                /* Success state */
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">Email đã được gửi!</h2>
                  <p className="text-gray-600 mb-6">
                    Chúng tôi đã gửi link đặt lại mật khẩu đến <strong>{email}</strong>. 
                    Vui lòng kiểm tra hộp thư của bạn.
                  </p>
                  <p className="text-sm text-gray-500 mb-6">
                    Không nhận được email? Kiểm tra thư mục spam hoặc{' '}
                    <button 
                      onClick={() => setSuccess(false)}
                      className="text-[#0071c2] hover:text-[#005999] font-medium"
                    >
                      thử lại
                    </button>
                  </p>
                  <Link href="/login">
                    <button className="w-full px-6 py-3 bg-[#0071c2] hover:bg-[#005999] text-white font-semibold rounded-lg transition-colors">
                      Quay lại đăng nhập
                    </button>
                  </Link>
                </div>
              ) : (
                /* Form state */
                <>
                  {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-red-600 text-sm font-medium">{error}</p>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="example@email.com"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0071c2] focus:border-[#0071c2] transition-all text-gray-900 placeholder:text-gray-400"
                        disabled={isLoading}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full px-6 py-3 bg-[#0071c2] hover:bg-[#005999] text-white font-semibold rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      {isLoading ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Đang gửi...
                        </span>
                      ) : (
                        'Gửi link đặt lại mật khẩu'
                      )}
                    </button>
                  </form>

                  <div className="mt-6 text-center">
                    <p className="text-gray-600">
                      Nhớ mật khẩu rồi?{' '}
                      <Link href="/login" className="font-semibold text-[#0071c2] hover:text-[#005999] transition-colors">
                        Đăng nhập
                      </Link>
                    </p>
                  </div>
                </>
              )}
            </Card>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Chưa có tài khoản?{' '}
                <Link href="/register" className="font-semibold text-[#0071c2] hover:text-[#005999] transition-colors">
                  Đăng ký ngay
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

