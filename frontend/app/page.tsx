/**
 * Homepage - Main landing page
 * FE1: Core Site & Discovery
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Chatbot } from '@/components/ai/Chatbot';
import { hotelsApi, tourismApi } from '@/lib/api/services';
import { formatCurrency, formatStars } from '@/lib/utils/format';
import type { Hotel, TourismSpot } from '@/types';

export default function HomePage() {
  const [featuredHotels, setFeaturedHotels] = useState<Hotel[]>([]);
  const [popularDestinations, setPopularDestinations] = useState<TourismSpot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [hotels, tourism] = await Promise.all([
          hotelsApi.getAll(),
          tourismApi.getAll()
        ]);
        setFeaturedHotels(hotels.slice(0, 3));
        setPopularDestinations(tourism.slice(0, 3));
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  return (
    <>
      <Header />
      <main>
        {/* Hero Section - Booking.com style */}
        <section className="relative bg-[#003580] py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-8">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Tìm chỗ nghỉ tiếp theo
              </h1>
              <p className="text-xl text-white/90">
                Tìm kiếm khách sạn, nhà và nhiều hơn nữa...
              </p>
            </div>

            {/* Search Box - Clean white box */}
            <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-xl p-8 transform hover:shadow-2xl transition-all duration-300">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-1">
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Bạn muốn đi đâu?
                  </label>
                  <input
                    type="text"
                    placeholder="Thành phố, khách sạn..."
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0071c2] focus:border-[#0071c2] transition-all hover:border-gray-300 text-gray-900 placeholder:text-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Nhận phòng
                  </label>
                  <input
                    type="date"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0071c2] focus:border-[#0071c2] transition-all hover:border-gray-300 text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Trả phòng
                  </label>
                  <input
                    type="date"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0071c2] focus:border-[#0071c2] transition-all hover:border-gray-300 text-gray-900"
                  />
                </div>
                <div className="flex items-end">
                  <button className="w-full px-6 py-3 bg-[#0071c2] hover:bg-[#005999] text-white font-semibold rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200">
                    Tìm kiếm
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Hotels */}
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                  Khách sạn được yêu thích
                </h2>
                <p className="text-gray-600">
                  Những lựa chọn hàng đầu cho kỳ nghỉ của bạn
                </p>
              </div>
              <Link href="/search">
                <button className="px-4 py-2 text-[#0071c2] hover:bg-blue-50 rounded font-medium transition-colors">
                  Xem tất cả →
                </button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredHotels.map((hotel) => (
                <Link key={hotel.id} href={`/hotel/${hotel.slug}`}>
                  <div className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden hover:border-[#0071c2] hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group">
                    <div className="relative h-56 overflow-hidden">
                      <div
                        className="absolute inset-0 bg-cover bg-center transform group-hover:scale-110 transition-transform duration-500"
                        style={{ backgroundImage: `url('${hotel.thumbnail}')` }}
                      />
                    </div>
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                          {hotel.name}
                        </h3>
                        <div className="flex items-center gap-1 bg-[#003580] text-white px-2 py-1 rounded text-sm font-semibold">
                          <span>{hotel.rating}</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-2 line-clamp-1">
                        {hotel.address}
                      </p>
                      <div className="flex items-center gap-1 text-sm text-gray-500 mb-3">
                        <span>{formatStars(hotel.stars)}</span>
                        <span>•</span>
                        <span>{hotel.reviewCount} đánh giá</span>
                      </div>
                      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <span className="text-sm font-medium text-gray-500">Giá mỗi đêm từ</span>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-[#0071c2] group-hover:scale-110 transition-transform">
                            {formatCurrency(hotel.basePrice)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Popular Destinations */}
        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                  Điểm đến phổ biến
                </h2>
                <p className="text-gray-600">
                  Khám phá những địa điểm tuyệt vời tại Việt Nam
                </p>
              </div>
              <Link href="/tourism">
                <button className="px-4 py-2 text-[#0071c2] hover:bg-blue-50 rounded font-medium transition-colors">
                  Xem thêm →
                </button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {popularDestinations.map((spot) => (
                <Link key={spot.id} href={`/tourism/${spot.slug}`}>
                  <div className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden hover:border-[#0071c2] hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group">
                    <div className="relative h-64 overflow-hidden">
                      <div
                        className="absolute inset-0 bg-cover bg-center transform group-hover:scale-110 transition-transform duration-500"
                        style={{ backgroundImage: `url('${spot.thumbnail}')` }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent group-hover:from-black/80 transition-all" />
                      <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                        <h3 className="text-xl font-bold mb-1">
                          {spot.name}
                        </h3>
                        <p className="text-sm text-white/90">
                          {spot.location}
                        </p>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <span>⭐</span>
                          <span>{spot.rating}</span>
                        </span>
                        <span>{spot.visitCount.toLocaleString()} lượt xem</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Features - Clean Booking.com style */}
        <section className="py-16 bg-gray-50 border-t border-gray-200">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-3">Tại sao chọn VietStay?</h2>
              <p className="text-gray-600">Trải nghiệm đặt phòng tuyệt vời nhất</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {/* Feature 1 */}
              <div className="text-center p-6 bg-white rounded-xl hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 group">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <span className="text-3xl">💰</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Giá tốt nhất</h3>
                <p className="text-sm text-gray-600">
                  Cam kết giá cạnh tranh
                </p>
              </div>

              {/* Feature 2 */}
              <div className="text-center p-6 bg-white rounded-xl hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 group">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-green-50 to-green-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <span className="text-3xl">🛡️</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">An toàn & bảo mật</h3>
                <p className="text-sm text-gray-600">
                  Thanh toán an toàn
                </p>
              </div>

              {/* Feature 3 */}
              <div className="text-center p-6 bg-white rounded-xl hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 group">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <span className="text-3xl">⚡</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Đặt phòng nhanh</h3>
                <p className="text-sm text-gray-600">
                  Xác nhận tức thì
                </p>
              </div>

              {/* Feature 4 */}
              <div className="text-center p-6 bg-white rounded-xl hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 group">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <span className="text-3xl">🎧</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Hỗ trợ 24/7</h3>
                <p className="text-sm text-gray-600">
                  Luôn sẵn sàng hỗ trợ
                </p>
              </div>
            </div>
          </div>
        </section>

      </main>
      <Footer />
      <Chatbot />
    </>
  );
}
