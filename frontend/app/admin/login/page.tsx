'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Card } from '@/components/common/Card';
import { useAuth } from '@/lib/context/AuthContext';

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isAuthenticated, user, isLoading: authLoading } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [sessionExpired, setSessionExpired] = useState(false);

  // Check if redirected due to session expiration
  useEffect(() => {
    if (searchParams.get('expired') === 'true') {
      setSessionExpired(true);
      // Clear the query param from URL without refresh
      router.replace('/admin/login', { scroll: false });
    }
  }, [searchParams, router]);

  // Redirect if already authenticated as admin
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      if (user?.role === 'admin') {
        router.push('/admin/destinations');
      } else {
        // Not an admin, redirect to user dashboard
        router.push('/user/dashboard');
      }
    }
  }, [isAuthenticated, authLoading, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSessionExpired(false);

    try {
      await login(formData.email, formData.password, 'admin');
      router.push('/admin/dashboard');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Email hoặc mật khẩu không đúng!';
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
          <div className="max-w-md mx-auto">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl mb-4 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-3">Quản trị viên</h1>
              <p className="text-gray-600">Đăng nhập vào hệ thống quản trị VietStay</p>
            </div>

            <Card className="p-8">
              {/* Session expired warning */}
              {sessionExpired && (
                <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="text-yellow-600">⚠️</span>
                    <p className="text-yellow-700 text-sm font-medium">
                      Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.
                    </p>
                  </div>
                </div>
              )}

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
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="admin@hotel.com"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0071c2] focus:border-[#0071c2] transition-all text-gray-900 placeholder:text-gray-400"
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Mật khẩu
                  </label>
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0071c2] focus:border-[#0071c2] transition-all text-gray-900 placeholder:text-gray-400"
                    disabled={isLoading}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.rememberMe}
                      onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
                      className="w-4 h-4 text-[#0071c2] rounded focus:ring-2 focus:ring-[#0071c2]"
                      disabled={isLoading}
                    />
                    <span className="ml-2 text-sm text-gray-700">Ghi nhớ đăng nhập</span>
                  </label>
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
                      Đang đăng nhập...
                    </span>
                  ) : (
                    'Đăng nhập'
                  )}
                </button>
              </form>

              {/* Demo Credentials */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
                <p className="text-xs font-semibold text-blue-900 mb-2">🔐 Tài khoản demo:</p>
                <div className="text-xs text-blue-700 space-y-1">
                  <p>Email: <code className="bg-blue-100 px-2 py-0.5 rounded">admin@hotel.com</code></p>
                  <p>Password: <code className="bg-blue-100 px-2 py-0.5 rounded">password123</code></p>
                </div>
              </div>
            </Card>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                <Link href="/" className="font-semibold text-[#0071c2] hover:text-[#005999] transition-colors">
                  ← Quay về trang chủ
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
