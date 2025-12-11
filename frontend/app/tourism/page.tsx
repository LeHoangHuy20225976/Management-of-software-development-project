'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { tourismApi } from '@/lib/api/services';
import type { TourismSpot } from '@/types';

export default function TourismPage() {
  const [tourismSpots, setTourismSpots] = useState<TourismSpot[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'north' | 'central' | 'south'>(
    'all'
  );
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const loadTourism = async () => {
      try {
        const data = await tourismApi.getAll();
        setTourismSpots(data);
      } catch (error) {
        console.error('Error loading tourism:', error);
      } finally {
        setLoading(false);
      }
    };
    loadTourism();
  }, []);

  const filteredSpots = tourismSpots.filter((spot) => {
    const matchesSearch =
      spot.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      spot.location.toLowerCase().includes(searchQuery.toLowerCase());

    if (filter === 'all') return matchesSearch;

    const region =
      spot.location.includes('Hà Nội') || spot.location.includes('Hạ Long')
        ? 'north'
        : spot.location.includes('Huế') ||
          spot.location.includes('Đà Nẵng') ||
          spot.location.includes('Hội An')
        ? 'central'
        : 'south';

    return matchesSearch && region === filter;
  });

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50">
        <section className="bg-gradient-to-br from-[#003580] to-[#0071c2] py-16 text-white">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Khám phá Việt Nam
              </h1>
              <p className="text-xl text-white/90 mb-8">
                Trải nghiệm vẻ đẹp thiên nhiên và văn hóa độc đáo của đất nước
                hình chữ S
              </p>

              <div className="bg-white rounded-lg p-4 shadow-xl">
                <div className="flex gap-3">
                  <input
                    type="text"
                    placeholder="Tìm điểm đến..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0071c2] focus:border-[#0071c2] transition-all text-gray-900 placeholder:text-gray-400"
                  />
                  <button className="px-8 py-3 bg-[#0071c2] hover:bg-[#005999] text-white font-semibold rounded-lg transition-colors">
                    Tìm kiếm
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-8 bg-white border-b">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap gap-3 justify-center">
              <Button
                variant={filter === 'all' ? 'primary' : 'outline'}
                onClick={() => setFilter('all')}
              >
                Tất cả
              </Button>
              <Button
                variant={filter === 'north' ? 'primary' : 'outline'}
                onClick={() => setFilter('north')}
              >
                🏔️ Miền Bắc
              </Button>
              <Button
                variant={filter === 'central' ? 'primary' : 'outline'}
                onClick={() => setFilter('central')}
              >
                🏖️ Miền Trung
              </Button>
              <Button
                variant={filter === 'south' ? 'primary' : 'outline'}
                onClick={() => setFilter('south')}
              >
                🌴 Miền Nam
              </Button>
            </div>
          </div>
        </section>

        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                {loading ? 'Đang tải...' : `${filteredSpots.length} điểm đến`}
              </h2>
              <p className="text-gray-600">
                Những địa điểm du lịch tuyệt vời đang chờ bạn khám phá
              </p>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <div className="h-64 bg-gray-200 rounded-lg mb-4" />
                    <div className="h-6 bg-gray-200 rounded w-3/4 mb-2" />
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                  </Card>
                ))}
              </div>
            ) : filteredSpots.length === 0 ? (
              <Card className="text-center py-12">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Không tìm thấy điểm đến
                </h3>
                <p className="text-gray-600">Hãy thử từ khóa khác</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredSpots.map((spot) => (
                  <Link key={spot.slug} href={`/tourism/${spot.slug}`}>
                    <div className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden hover:border-[#0071c2] hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group">
                      <div className="relative h-64 overflow-hidden">
                        <div
                          className="absolute inset-0 bg-cover bg-center transform group-hover:scale-110 transition-transform duration-500"
                          style={{
                            backgroundImage: `url('${spot.thumbnail}')`,
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent group-hover:from-black/80 transition-all" />
                        <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                          <h3 className="text-2xl font-bold mb-2">
                            {spot.name}
                          </h3>
                          <p className="text-sm text-white/90 flex items-center">
                            📍 {spot.location}
                          </p>
                        </div>
                      </div>
                      <div className="p-5">
                        <p className="text-gray-700 mb-4 line-clamp-2">
                          {spot.description}
                        </p>
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-1 font-semibold text-gray-900">
                            <span className="text-xl">⭐</span>
                            <span>{spot.rating}</span>
                          </div>
                          <span className="text-gray-600">
                            {typeof spot.visitCount === 'number'
                              ? `${spot.visitCount.toLocaleString()} lượt xem`
                              : 'Chưa có lượt xem'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
