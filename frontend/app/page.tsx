/**
 * Homepage - Main landing page
 * FE1: Core Site & Discovery
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Chatbot } from '@/components/ai/Chatbot';
import { hotelsApi, tourismApi } from '@/lib/api/services';
import type { Hotel, TourismSpot } from '@/types';

export default function HomePage() {
  const router = useRouter();
  const [featuredHotels, setFeaturedHotels] = useState<Hotel[]>([]);
  const [popularDestinations, setPopularDestinations] = useState<TourismSpot[]>(
    []
  );
  const [loading, setLoading] = useState(true);

  // Search form state
  const [searchForm, setSearchForm] = useState({
    location: '',
    checkIn: '',
    checkOut: '',
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [hotels, tourism] = await Promise.all([
          hotelsApi.getAll(),
          tourismApi.getAll(),
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

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchForm.location) params.append('location', searchForm.location);
    if (searchForm.checkIn) params.append('checkIn', searchForm.checkIn);
    if (searchForm.checkOut) params.append('checkOut', searchForm.checkOut);
    router.push(`/search?${params.toString()}`);
  };

  return (
    <>
      <Header />
      <main className="overflow-hidden">
        {/* Hero Section - Modern Glass Design */}
        <section className="relative min-h-[600px] bg-gradient-to-br from-[#003580] via-[#0052a3] to-[#0071c2] py-20 overflow-hidden">
          {/* Animated Background Elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute top-1/2 -left-20 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl animate-pulse animation-delay-2000"></div>
            <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-cyan-400/10 rounded-full blur-3xl animate-pulse animation-delay-4000"></div>
          </div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center mb-12 animate-fade-in">
              <span className="inline-block px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white/90 text-sm font-medium mb-6 border border-white/20">
                ✨ Nền tảng đặt phòng hàng đầu Việt Nam
              </span>
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
                Tìm chỗ nghỉ{' '}
                <span className="relative">
                  <span className="bg-gradient-to-r from-yellow-300 to-yellow-500 bg-clip-text text-transparent">hoàn hảo</span>
                  <svg className="absolute -bottom-2 left-0 w-full" height="8" viewBox="0 0 200 8" fill="none">
                    <path d="M2 6C50 2 150 2 198 6" stroke="url(#gradient)" strokeWidth="3" strokeLinecap="round"/>
                    <defs>
                      <linearGradient id="gradient" x1="0" y1="0" x2="200" y2="0">
                        <stop stopColor="#fcd34d"/>
                        <stop offset="1" stopColor="#f59e0b"/>
                      </linearGradient>
                    </defs>
                  </svg>
                </span>
              </h1>
              <p className="text-xl text-white/80 max-w-2xl mx-auto">
                Khám phá hàng nghìn khách sạn, resort và homestay với giá tốt nhất
              </p>
            </div>

            {/* Search Box - Glass Morphism */}
            <div className="max-w-5xl mx-auto animate-fade-in stagger-2">
              <div className="glass-card bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/50">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="md:col-span-1 group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-[#0071c2] transition-colors">
                      📍 Điểm đến
                    </label>
                    <input
                      type="text"
                      placeholder="Bạn muốn đi đâu?"
                      className="input-field w-full"
                      value={searchForm.location}
                      onChange={(e) => setSearchForm({ ...searchForm, location: e.target.value })}
                    />
                  </div>
                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-[#0071c2] transition-colors">
                      📅 Nhận phòng
                    </label>
                    <input
                      type="date"
                      className="input-field w-full"
                      value={searchForm.checkIn}
                      onChange={(e) => setSearchForm({ ...searchForm, checkIn: e.target.value })}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-[#0071c2] transition-colors">
                      📅 Trả phòng
                    </label>
                    <input
                      type="date"
                      className="input-field w-full"
                      value={searchForm.checkOut}
                      onChange={(e) => setSearchForm({ ...searchForm, checkOut: e.target.value })}
                      min={searchForm.checkIn || new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={handleSearch}
                      className="w-full btn-primary py-4 text-base rounded-xl relative overflow-hidden group">
                      <span className="relative z-10 flex items-center justify-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        Tìm kiếm
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-[#005999] to-[#0071c2] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Scroll Indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
            <div className="w-6 h-10 rounded-full border-2 border-white/30 flex items-start justify-center p-2">
              <div className="w-1 h-3 bg-white/50 rounded-full animate-pulse"></div>
            </div>
          </div>
        </section>

        {/* Featured Hotels */}
        <section className="py-20 bg-gradient-to-b from-white to-gray-50">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-end mb-12">
              <div className="animate-fade-in">
                <span className="inline-block px-3 py-1 bg-blue-50 text-[#0071c2] text-sm font-medium rounded-full mb-4">
                  🌟 Được yêu thích nhất
                </span>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                  Khách sạn nổi bật
                </h2>
                <p className="text-gray-600 max-w-md">
                  Những lựa chọn hàng đầu được đánh giá cao bởi khách hàng
                </p>
              </div>
              <Link href="/search" className="hidden md:block">
                <button className="group flex items-center gap-2 px-6 py-3 text-[#0071c2] hover:bg-blue-50 rounded-xl font-semibold transition-all duration-300">
                  Xem tất cả
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredHotels.map((hotel, index) => (
                <Link key={hotel.hotel_id} href={`/hotel/${hotel.hotel_id}`}>
                  <div 
                    className="card-interactive group h-full"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="relative h-64 overflow-hidden rounded-t-2xl">
                      <div
                        className="absolute inset-0 bg-cover bg-center transform group-hover:scale-110 transition-transform duration-700"
                        style={{ backgroundImage: `url('${hotel.thumbnail}')` }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      
                      {/* Rating Badge */}
                      <div className="absolute top-4 right-4 flex items-center gap-1 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg">
                        <span className="text-yellow-500">⭐</span>
                        <span className="font-bold text-gray-900">{hotel.rating}</span>
                      </div>
                      
                      {/* Quick Action on Hover */}
                      <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                        <button className="w-full py-2.5 bg-white/95 backdrop-blur-sm rounded-xl font-semibold text-[#0071c2] shadow-lg hover:bg-white transition-colors">
                          Xem chi tiết
                        </button>
                      </div>
                    </div>
                    
                    <div className="p-5">
                      <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-[#0071c2] transition-colors line-clamp-1">
                        {hotel.name}
                      </h3>
                      <p className="text-sm text-gray-500 mb-4 flex items-center gap-1.5">
                        <span className="text-[#0071c2]">📍</span>
                        <span className="line-clamp-1">{hotel.address}</span>
                      </p>
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        {hotel.basePrice ? (
                          <>
                            <span className="text-sm text-gray-600">Giá chỉ từ</span>
                            <div className="text-right">
                              <span className="text-xl font-bold text-[#0071c2]">
                                {hotel.basePrice.toLocaleString('vi-VN')}₫
                              </span>
                              <span className="text-xs text-gray-500 block">/ đêm</span>
                            </div>
                          </>
                        ) : (
                          <>
                            <span className="text-sm text-gray-500">Liên hệ</span>
                            <span className="font-semibold text-[#0071c2]">{hotel.contact_phone}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            
            {/* Mobile View All Button */}
            <div className="mt-8 text-center md:hidden">
              <Link href="/search">
                <button className="btn-primary px-8">
                  Xem tất cả khách sạn →
                </button>
              </Link>
            </div>
          </div>
        </section>

        {/* Popular Destinations */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-end mb-12">
              <div className="animate-fade-in">
                <span className="inline-block px-3 py-1 bg-green-50 text-green-600 text-sm font-medium rounded-full mb-4">
                  ✈️ Khám phá ngay
                </span>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                  Điểm đến phổ biến
                </h2>
                <p className="text-gray-600 max-w-md">
                  Khám phá những địa điểm tuyệt vời tại Việt Nam
                </p>
              </div>
              <Link href="/tourism" className="hidden md:block">
                <button className="group flex items-center gap-2 px-6 py-3 text-green-600 hover:bg-green-50 rounded-xl font-semibold transition-all duration-300">
                  Xem thêm
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {popularDestinations.map((spot, index) => (
                <Link key={spot.destination_id} href={`/tourism/${spot.destination_id}`}>
                  <div 
                    className="relative group h-80 rounded-3xl overflow-hidden cursor-pointer"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div
                      className="absolute inset-0 bg-cover bg-center transform group-hover:scale-110 transition-transform duration-700"
                      style={{ backgroundImage: `url('${spot.thumbnail}')` }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent group-hover:from-black/90 transition-all duration-300" />
                    
                    {/* Content */}
                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="px-2.5 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-medium">
                          ⭐ {spot.rating}
                        </span>
                        <span className="px-2.5 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-medium">
                          {(spot.visitCount ?? 0).toLocaleString()} lượt xem
                        </span>
                      </div>
                      <h3 className="text-2xl font-bold mb-2 group-hover:translate-y-0 transition-transform">{spot.name}</h3>
                      <p className="text-white/80 text-sm flex items-center gap-1.5">
                        <span>📍</span>
                        {spot.location}
                      </p>
                    </div>
                    
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <button className="px-6 py-3 bg-white/95 backdrop-blur-sm rounded-xl font-semibold text-gray-900 shadow-xl hover:bg-white transition-colors transform -translate-y-2 group-hover:translate-y-0 transition-transform">
                        Khám phá ngay →
                      </button>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section - Modern Design */}
        <section className="py-24 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-50">
            <div className="absolute top-20 left-10 w-72 h-72 bg-blue-100 rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-yellow-100 rounded-full blur-3xl"></div>
          </div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center mb-16">
              <span className="inline-block px-4 py-2 bg-[#0071c2]/10 text-[#0071c2] text-sm font-semibold rounded-full mb-4">
                🏆 Tại sao chọn chúng tôi
              </span>
              <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
                Tại sao chọn{' '}
                <span className="bg-gradient-to-r from-[#0071c2] to-[#00a2ff] bg-clip-text text-transparent">VietStay</span>?
              </h2>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                Trải nghiệm đặt phòng tuyệt vời nhất với những tính năng hàng đầu
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Feature 1 */}
              <div className="group p-8 bg-white rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_rgba(0,113,194,0.15)] transition-all duration-500 hover:-translate-y-2 border border-gray-100">
                <div className="w-16 h-16 mb-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg shadow-blue-500/30">
                  <span className="text-3xl">💰</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Giá tốt nhất
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Cam kết giá cạnh tranh nhất thị trường, hoàn tiền nếu tìm thấy giá rẻ hơn
                </p>
              </div>

              {/* Feature 2 */}
              <div className="group p-8 bg-white rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_rgba(0,113,194,0.15)] transition-all duration-500 hover:-translate-y-2 border border-gray-100">
                <div className="w-16 h-16 mb-6 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg shadow-green-500/30">
                  <span className="text-3xl">🛡️</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  An toàn & Bảo mật
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Thanh toán được mã hóa SSL, bảo vệ thông tin 100%
                </p>
              </div>

              {/* Feature 3 */}
              <div className="group p-8 bg-white rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_rgba(0,113,194,0.15)] transition-all duration-500 hover:-translate-y-2 border border-gray-100">
                <div className="w-16 h-16 mb-6 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg shadow-yellow-500/30">
                  <span className="text-3xl">⚡</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Đặt phòng nhanh
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Xác nhận đặt phòng tức thì, chỉ trong vài giây
                </p>
              </div>

              {/* Feature 4 */}
              <div className="group p-8 bg-white rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_rgba(0,113,194,0.15)] transition-all duration-500 hover:-translate-y-2 border border-gray-100">
                <div className="w-16 h-16 mb-6 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg shadow-purple-500/30">
                  <span className="text-3xl">🎧</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Hỗ trợ 24/7
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Đội ngũ hỗ trợ luôn sẵn sàng giúp đỡ bạn mọi lúc mọi nơi
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-[#003580] via-[#0052a3] to-[#0071c2] relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-white/5 rounded-full blur-3xl"></div>
          </div>
          
          <div className="container mx-auto px-4 relative z-10 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Sẵn sàng cho chuyến đi tiếp theo?
            </h2>
            <p className="text-white/80 text-lg mb-8 max-w-2xl mx-auto">
              Đăng ký ngay để nhận ưu đãi độc quyền và khám phá hàng nghìn địa điểm tuyệt vời
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/search">
                <button className="px-8 py-4 bg-white text-[#003580] font-bold rounded-xl hover:bg-gray-100 transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-1">
                  Tìm kiếm khách sạn
                </button>
              </Link>
              <Link href="/register">
                <button className="px-8 py-4 bg-transparent text-white font-bold rounded-xl border-2 border-white/50 hover:bg-white/10 hover:border-white transition-all duration-300">
                  Đăng ký miễn phí
                </button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <Chatbot />
    </>
  );
}
