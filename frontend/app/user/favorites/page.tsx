/**
 * User Favorites Page - Danh sách điểm đến yêu thích
 * FE3: User Dashboard
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { destinationsApi } from '@/lib/api/services';
import type { Destination } from '@/types';

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [lovingListLoading, setLovingListLoading] = useState<Set<number>>(new Set());

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      setLoading(true);
      const data = await destinationsApi.getLovingList();
      console.log('❤️ Favorites loaded:', data);
      setFavorites(data);
    } catch (error) {
      console.error('Error loading favorites:', error);
      alert('❌ Lỗi khi tải danh sách yêu thích!');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromLovingList = async (destinationId: number) => {
    const newLoadingSet = new Set(lovingListLoading);
    newLoadingSet.add(destinationId);
    setLovingListLoading(newLoadingSet);

    try {
      await destinationsApi.removeFromLovingList(destinationId.toString());
      // Remove from local state
      setFavorites(favorites.filter(fav => fav.destination_id !== destinationId));
      console.log('❤️ Removed from favorites:', destinationId);
    } catch (error) {
      console.error('Error removing from favorites:', error);
      alert('❌ Lỗi khi xóa khỏi danh sách yêu thích!');
    } finally {
      const newLoadingSet = new Set(lovingListLoading);
      newLoadingSet.delete(destinationId);
      setLovingListLoading(newLoadingSet);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Điểm đến yêu thích</h1>
        </div>
        <Card>
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0071c2]"></div>
            <span className="ml-3 text-gray-600">Đang tải...</span>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Điểm đến yêu thích</h1>
          <p className="text-gray-600 mt-2">
            Danh sách các điểm đến bạn đã đánh dấu yêu thích ({favorites.length})
          </p>
        </div>
      </div>

      {favorites.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <div className="text-6xl mb-4">❤️</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Chưa có điểm đến yêu thích
            </h3>
            <p className="text-gray-600 mb-6">
              Khám phá và đánh dấu các điểm đến bạn yêu thích để dễ dàng tìm lại sau này!
            </p>
            <Link href="/tourism">
              <Button>Khám phá điểm đến</Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((destination) => (
            <div
              key={destination.destination_id}
              className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden hover:border-[#0071c2] hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group"
            >
              <div className="relative h-64 overflow-hidden">
                {/* Remove from favorites button */}
                <button
                  onClick={() => handleRemoveFromLovingList(destination.destination_id)}
                  disabled={lovingListLoading.has(destination.destination_id)}
                  className="absolute top-3 right-3 z-10 p-2 rounded-full bg-white/90 backdrop-blur-sm shadow-lg hover:bg-white transition-all duration-200 disabled:opacity-50"
                  title="Xóa khỏi yêu thích"
                >
                  {lovingListLoading.has(destination.destination_id) ? (
                    <div className="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <span className="text-xl text-red-500">❤️</span>
                  )}
                </button>

                <div
                  className="absolute inset-0 bg-cover bg-center transform group-hover:scale-110 transition-transform duration-500"
                  style={{
                    backgroundImage: `url('${destination.thumbnail}')`,
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent group-hover:from-black/80 transition-all" />
                <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                  <h3 className="text-2xl font-bold mb-2">
                    {destination.name}
                  </h3>
                  <p className="text-sm text-white/90 flex items-center">
                    📍 {destination.location}
                  </p>
                </div>
              </div>
              <div className="p-5">
                <p className="text-gray-700 mb-4 line-clamp-2">
                  {destination.description}
                </p>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1 font-semibold text-gray-900">
                    <span className="text-xl">⭐</span>
                    <span>{destination.rating}</span>
                  </div>
                  <span className="text-gray-600">
                    {destination.type
                      ? `Loại hình: ${destination.type}`
                      : 'Đang cập nhật'}
                  </span>
                </div>
                <div className="mt-4 flex gap-2">
                  <Link
                    href={`/tourism/${destination.destination_id}`}
                    className="flex-1"
                  >
                    <Button className="w-full">Xem chi tiết</Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
