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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                          <div className="absolute top-4 left-4 bg-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
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

                          <div className="flex flex-wrap gap-2 mb-4">
                            {(hotel.amenities || []).slice(0, 5).map((amenity) => (
                              <span
                                key={amenity}
                                className="text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-full"
                              >
                                {amenity}
                              </span>
                            ))}
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-lg font-bold text-[#0071c2]">
                                ⭐ {hotel.rating}
                              </span>
                              <span className="text-sm font-medium text-gray-700">
                                / 5
                              </span>
                            </div>
                            <div className="text-right">
                              <div className="text-sm text-gray-600 mb-1">
                                Giá chỉ từ
                              </div>
                              <div className="text-2xl font-bold text-[#0071c2]">
                                {hotel.basePrice ? `${hotel.basePrice.toLocaleString('vi-VN')}₫` : 'Liên hệ'}
                              </div>
                              <div className="text-xs text-gray-600">
                                / đêm
                              </div>
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
