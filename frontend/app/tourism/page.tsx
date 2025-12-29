'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { destinationsApi } from '@/lib/api/services';
import type { TourismSpot } from '@/types';
import { DestinationCard } from '@/components/tourism/DestinationCard';

export default function TourismPage() {
  const [tourismSpots, setTourismSpots] = useState<TourismSpot[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'north' | 'central' | 'south'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'rating' | 'name' | 'popular'>('rating');
  const [minRating, setMinRating] = useState<number>(0);

  // Get unique types from data
  const [types, setTypes] = useState<string[]>([]);

  useEffect(() => {
    const loadTourism = async () => {
      try {
        const data = await destinationsApi.getAll();
        setTourismSpots(data);
        
        // Extract unique types
        const uniqueTypes = [...new Set(data.map(s => s.type).filter(Boolean))];
        setTypes(uniqueTypes);
      } catch (error) {
        console.error('Error loading tourism:', error);
      } finally {
        setLoading(false);
      }
    };
    loadTourism();
  }, []);

  // Handle search with API
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      const data = await destinationsApi.getAll();
      setTourismSpots(data);
      return;
    }
    
    setLoading(true);
    try {
      const results = await destinationsApi.search(searchQuery);
      setTourismSpots(results);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSpots = tourismSpots
    .filter((spot) => {
      // Search filter
      const matchesSearch =
        spot.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        spot.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        spot.description.toLowerCase().includes(searchQuery.toLowerCase());

      // Region filter
      let matchesRegion = true;
      if (filter !== 'all') {
        const region =
          spot.location.includes('Hà Nội') || spot.location.includes('Hạ Long') || spot.location.includes('Sa Pa') || spot.location.includes('Ninh Bình')
            ? 'north'
            : spot.location.includes('Huế') || spot.location.includes('Đà Nẵng') || spot.location.includes('Hội An') || spot.location.includes('Nha Trang')
            ? 'central'
            : 'south';
        matchesRegion = region === filter;
      }

      // Type filter
      const matchesType = typeFilter === 'all' || spot.type === typeFilter;

      // Rating filter
      const matchesRating = spot.rating >= minRating;

      return matchesSearch && matchesRegion && matchesType && matchesRating;
    })
    .sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return 0; // popular - keep original order
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
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0071c2] focus:border-[#0071c2] transition-all text-gray-900 placeholder:text-gray-400"
                  />
                  <button 
                    onClick={handleSearch}
                    className="px-8 py-3 bg-[#0071c2] hover:bg-[#005999] text-white font-semibold rounded-lg transition-colors"
                  >
                    Tìm kiếm
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Advanced Filters */}
        <section className="py-4 bg-white border-b shadow-sm">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap gap-4 items-center">
              {/* Region Filter */}
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={filter === 'all' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('all')}
                >
                  Tất cả
                </Button>
                <Button
                  variant={filter === 'north' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('north')}
                >
                  🏔️ Miền Bắc
                </Button>
                <Button
                  variant={filter === 'central' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('central')}
                >
                  🏖️ Miền Trung
                </Button>
                <Button
                  variant={filter === 'south' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('south')}
                >
                  🌴 Miền Nam
                </Button>
              </div>

              <div className="h-8 w-px bg-gray-300 hidden md:block"></div>

              {/* Type Filter */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Loại:</span>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0071c2] focus:border-[#0071c2]"
                >
                  <option value="all">Tất cả loại</option>
                  {types.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              {/* Rating Filter */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Đánh giá:</span>
                <select
                  value={minRating}
                  onChange={(e) => setMinRating(Number(e.target.value))}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0071c2] focus:border-[#0071c2]"
                >
                  <option value={0}>Tất cả</option>
                  <option value={4}>⭐ 4+ sao</option>
                  <option value={4.5}>⭐ 4.5+ sao</option>
                </select>
              </div>

              {/* Sort */}
              <div className="flex items-center gap-2 ml-auto">
                <span className="text-sm text-gray-600">Sắp xếp:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'rating' | 'name' | 'popular')}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0071c2] focus:border-[#0071c2]"
                >
                  <option value="rating">Đánh giá cao nhất</option>
                  <option value="name">Tên A-Z</option>
                  <option value="popular">Phổ biến nhất</option>
                </select>
              </div>
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
                  <DestinationCard key={spot.destination_id} spot={spot} />
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
