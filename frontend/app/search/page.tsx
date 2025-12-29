'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { hotelsApi } from '@/lib/api/services';
import type { Hotel, SearchFilters } from '@/types';

const MapView = dynamic(() => import('@/components/search/MapView'), {
  ssr: false,
});

type ViewMode = 'list' | 'map';

export default function SearchPage() {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [filters, setFilters] = useState<SearchFilters>({
    location: '',
    sortBy: 'popularity',
    guests: 2,
  });

  // Load hotels
  useEffect(() => {
    loadHotels();
  }, [filters]);

  const loadHotels = async () => {
    setLoading(true);
    try {
      const data = await hotelsApi.getAll(filters);
      setHotels(data || []); // Ensure always array
    } catch (error) {
      console.error('Error loading hotels:', error);
      setHotels([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          {/* Search Header */}
          <Card className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Địa điểm
                </label>
                <input
                  type="text"
                  placeholder="Bạn muốn đi đâu?"
                  value={filters.location || ''}
                  onChange={(e) =>
                    setFilters({ ...filters, location: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#0071c2] focus:border-[#0071c2] transition-all text-gray-900 placeholder:text-gray-400"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Nhận phòng
                </label>
                <input
                  type="date"
                  value={filters.checkIn || ''}
                  onChange={(e) =>
                    setFilters({ ...filters, checkIn: e.target.value })
                  }
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#0071c2] focus:border-[#0071c2] transition-all text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Trả phòng
                </label>
                <input
                  type="date"
                  value={filters.checkOut || ''}
                  onChange={(e) =>
                    setFilters({ ...filters, checkOut: e.target.value })
                  }
                  min={filters.checkIn || new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#0071c2] focus:border-[#0071c2] transition-all text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Số khách
                </label>
                <input
                  type="number"
                  value={filters.guests || ''}
                  onChange={(e) =>
                    setFilters({ ...filters, guests: parseInt(e.target.value) || 1 })
                  }
                  min={1}
                  max={10}
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#0071c2] focus:border-[#0071c2] transition-all text-gray-900"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={loadHotels}
                  className="w-full px-6 py-3 bg-[#0071c2] hover:bg-[#005999] text-white font-medium rounded transition-colors"
                >
                  Tìm kiếm
                </button>
              </div>
            </div>

            {/* Search Summary */}
            {(filters.location || filters.checkIn || filters.checkOut || filters.guests) && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  <span className="font-semibold text-gray-700">Tìm kiếm:</span>
                  {filters.location && (
                    <span className="bg-white px-3 py-1 rounded-full border border-blue-300 text-gray-800">
                      📍 {filters.location}
                    </span>
                  )}
                  {filters.checkIn && (
                    <span className="bg-white px-3 py-1 rounded-full border border-blue-300 text-gray-800">
                      📅 Nhận: {new Date(filters.checkIn).toLocaleDateString('vi-VN')}
                    </span>
                  )}
                  {filters.checkOut && (
                    <span className="bg-white px-3 py-1 rounded-full border border-blue-300 text-gray-800">
                      📅 Trả: {new Date(filters.checkOut).toLocaleDateString('vi-VN')}
                    </span>
                  )}
                  {filters.checkIn && filters.checkOut && (
                    <span className="bg-white px-3 py-1 rounded-full border border-blue-300 text-gray-800 font-semibold">
                      🌙 {Math.ceil((new Date(filters.checkOut).getTime() - new Date(filters.checkIn).getTime()) / (1000 * 60 * 60 * 24))} đêm
                    </span>
                  )}
                  {filters.guests && (
                    <span className="bg-white px-3 py-1 rounded-full border border-blue-300 text-gray-800">
                      👥 {filters.guests} khách
                    </span>
                  )}
                </div>
              </div>
            )}
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Filters Sidebar */}
            <div className="lg:col-span-1">
              <Card>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Bộ lọc</h3>

                {/* Sort */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Sắp xếp theo
                  </label>
                  <select
                    value={filters.sortBy}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        sortBy: e.target.value as
                          | 'popularity'
                          | 'price'
                          | 'rating',
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#0071c2] focus:border-[#0071c2] transition-all text-gray-900 font-medium"
                  >
                    <option value="popularity">Phổ biến</option>
                    <option value="price">Giá thấp nhất</option>
                    <option value="rating">Đánh giá cao</option>
                  </select>
                </div>

                {/* Price Range */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Khoảng giá
                  </label>
                  <div className="space-y-2">
                    <input
                      type="number"
                      placeholder="Từ"
                      value={filters.minPrice || ''}
                      onChange={(e) =>
                        setFilters({
                          ...filters,
                          minPrice: Number(e.target.value),
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#0071c2] focus:border-[#0071c2] transition-all text-gray-900 placeholder:text-gray-400"
                    />
                    <input
                      type="number"
                      placeholder="Đến"
                      value={filters.maxPrice || ''}
                      onChange={(e) =>
                        setFilters({
                          ...filters,
                          maxPrice: Number(e.target.value),
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#0071c2] focus:border-[#0071c2] transition-all text-gray-900 placeholder:text-gray-400"
                    />
                  </div>
                </div>


                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setFilters({ sortBy: 'popularity' })}
                >
                  Xóa bộ lọc
                </Button>
              </Card>
            </div>

            {/* Results */}
            <div className="lg:col-span-3">
              <div className="mb-4 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">
                  {loading ? 'Đang tìm kiếm...' : `${hotels.length} khách sạn`}
                </h2>
                <div className="flex items-center space-x-2">
                  <Button
                    variant={viewMode === 'list' ? 'primary' : 'outline'}
                    onClick={() => setViewMode('list')}
                  >
                    List
                  </Button>
                  <Button
                    variant={viewMode === 'map' ? 'primary' : 'outline'}
                    onClick={() => setViewMode('map')}
                  >
                    Map
                  </Button>
                </div>
              </div>

            {loading ? (
              <div className="grid grid-cols-1 gap-6">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <div className="h-48 bg-gray-200 rounded-lg mb-4" />
                    <div className="h-6 bg-gray-200 rounded w-3/4 mb-2" />
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                  </Card>
                ))}
              </div>
            ) : viewMode === 'map' ? (
              <Card className="h-[600px]">
                <MapView hotels={hotels} />
              </Card>
            ) : !hotels || hotels.length === 0 ? (
              <Card className="text-center py-12">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-bold mb-2">Không tìm thấy khách sạn</h3>
                <p className="text-gray-600">Hãy thử thay đổi bộ lọc của bạn</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {hotels.map((hotel) => (
                  <Link key={hotel.hotel_id} href={`/hotel/${hotel.hotel_id}`}>
                    <Card hover padding="none" className="overflow-hidden group">
                      <div className="md:flex">
                        <div className="md:w-1/3 relative h-64 md:h-auto">
                          <div
                            className="absolute inset-0 bg-cover bg-center transform group-hover:scale-110 transition-transform duration-500"
                            style={{ backgroundImage: `url('${hotel.thumbnail}')` }}
                          />
                          <div className="absolute top-4 left-4 bg-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg text-yellow-600">
                            ⭐ {hotel.stars ?? hotel.rating}
                          </div>
                        </div>
                        <div className="md:w-2/3 p-6">
                          <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                            {hotel.name}
                          </h3>
                          <p className="text-sm text-gray-600 mb-3 flex items-center">
                            📍 {hotel.address}
                          </p>
                          <p className="text-gray-700 mb-4 line-clamp-2">
                            {hotel.description}
                          </p>

                          {/* Facilities */}
                          {hotel.facilities && hotel.facilities.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-4">
                              {hotel.facilities.slice(0, 5).map((facility) => {
                                // Icon mapping for facilities
                                const iconMap: { [key: string]: string } = {
                                  'Hồ bơi': '🏊',
                                  'Phòng gym': '🏋️',
                                  'Spa': '💆',
                                  'Nhà hàng': '🍽️',
                                  'WiFi miễn phí': '📶',
                                  'Bãi đỗ xe': '🚗',
                                  'Quầy bar': '🍸',
                                  'Bãi biển riêng': '🏖️',
                                  'Lễ tân 24/7': '🛎️',
                                  'Phòng họp': '👔',
                                };
                                const icon = iconMap[facility.name] || '✨';

                                return (
                                  <span
                                    key={facility.facility_id}
                                    className="flex items-center gap-1 text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-medium"
                                  >
                                    <span>{icon}</span>
                                    <span>{facility.name}</span>
                                  </span>
                                );
                              })}
                              {hotel.facilities.length > 5 && (
                                <span className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-full font-medium">
                                  +{hotel.facilities.length - 5} tiện ích khác
                                </span>
                              )}
                            </div>
                          )}

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-lg font-bold text-yellow-500">
                                ⭐ {hotel.rating}
                              </span>
                              <span className="text-sm font-medium text-gray-700">
                                / 5
                              </span>
                            </div>
                            <div className="text-right">
                              {(() => {
                                // Calculate lowest price from basePrice or contact
                                const price = hotel.basePrice;
                                const discountRateRaw = hotel.discount ?? 0;
                                const discountRate = Math.max(0, Math.min(1, discountRateRaw));

                                if (price) {
                                  return (
                                    <>
                                      <div className="text-sm text-gray-600 mb-1">
                                        Giá chỉ từ
                                      </div>
                                      {discountRate > 0 && (
                                        <div className="text-sm text-gray-400 line-through">
                                          {price.toLocaleString('vi-VN')}₫
                                        </div>
                                      )}
                                      <div className="flex items-baseline justify-end gap-2">
                                        <span className="text-2xl font-bold text-[#0071c2]">
                                          {discountRate > 0
                                            ? Math.round(price * (1 - discountRate)).toLocaleString('vi-VN')
                                            : price.toLocaleString('vi-VN')
                                          }₫
                                        </span>
                                        <span className="text-xs text-gray-600">/ đêm</span>
                                      </div>
                                      {discountRate > 0 && (
                                        <div className="inline-block bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded mt-1">
                                          -{Math.round(discountRate * 100)}% OFF
                                        </div>
                                      )}
                                    </>
                                  );
                                } else {
                                  return (
                                    <>
                                      <div className="text-sm text-gray-600 mb-1">
                                        Liên hệ
                                      </div>
                                      <div className="text-lg font-semibold text-[#0071c2]">
                                        {hotel.contact_phone}
                                      </div>
                                    </>
                                  );
                                }
                              })()}
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
    <Footer />
  </>
);
}
