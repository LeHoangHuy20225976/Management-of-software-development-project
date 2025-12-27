/**
 * User Reviews Page
 * FE3: User Dashboard
 */

'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import Link from 'next/link';
import { reviewsApi } from '@/lib/api/services';
import { useAuth } from '@/lib/context/AuthContext';
import type { Review } from '@/types';

export default function UserReviewsPage() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'with_reply' | 'no_reply'>(
    'all'
  );

  useEffect(() => {
    const loadReviews = async () => {
      try {
        const allReviews = await reviewsApi.getAll();
        // Filter reviews by current user
        const userReviews = allReviews.filter(
          r => r.user_id === user?.user_id
        );
        setReviews(userReviews);
      } catch (error) {
        console.error('Error loading reviews:', error);
      } finally {
        setLoading(false);
      }
    };
    loadReviews();
  }, [user]);

  const filteredReviews = reviews.filter((review) => {
    if (filter === 'all') return true;
    if (filter === 'with_reply') return !!(review as any).reply;
    if (filter === 'no_reply') return !(review as any).reply;
    return true;
  });

  const handleDelete = async (id: string) => {
    if (confirm('Bạn có chắc muốn xóa đánh giá này?')) {
      try {
        await reviewsApi.delete(id);
        setReviews(reviews.filter((r) => String(r.review_id) !== id));
      } catch (error) {
        console.error('Error deleting review:', error);
        alert('Không thể xóa đánh giá. Vui lòng thử lại.');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0071c2] mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải đánh giá...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Đánh giá của tôi</h1>
        <Button>✍️ Viết đánh giá mới</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-6">
        <Card>
          <div className="text-center">
            <div className="text-4xl mb-2">⭐</div>
            <div className="text-3xl font-bold text-[#0071c2]">
              {reviews.length}
            </div>
            <div className="text-sm font-medium text-gray-700">
              Tổng đánh giá
            </div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-4xl mb-2">💬</div>
            <div className="text-3xl font-bold text-green-600">
              {reviews.filter((r) => r.reply).length}
            </div>
            <div className="text-sm font-medium text-gray-700">
              Đã có phản hồi
            </div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-4xl mb-2">👍</div>
            <div className="text-3xl font-bold text-yellow-600">
              {reviews.reduce(
                (sum, r) =>
                  sum + (typeof r.helpful === 'number' ? r.helpful : 0),
                0
              )}
            </div>
            <div className="text-sm font-medium text-gray-700">
              Lượt hữu ích
            </div>
          </div>
        </Card>
      </div>

      {/* Filter */}
      <Card>
        <div className="flex flex-wrap gap-3">
          <Button
            variant={filter === 'all' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            Tất cả ({reviews.length})
          </Button>
          <Button
            variant={filter === 'with_reply' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setFilter('with_reply')}
          >
            Đã phản hồi ({reviews.filter((r) => r.reply).length})
          </Button>
          <Button
            variant={filter === 'no_reply' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setFilter('no_reply')}
          >
            Chưa phản hồi ({reviews.filter((r) => !r.reply).length})
          </Button>
        </div>
      </Card>

      {/* Reviews List */}
      {filteredReviews.length === 0 ? (
        <Card className="text-center py-12">
          <div className="text-6xl mb-4">⭐</div>
          <p className="text-gray-700 font-medium mb-4">
            Bạn chưa có đánh giá nào
          </p>
          <Button>Viết đánh giá đầu tiên</Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredReviews.map((review) => (
            <Card key={review.review_id}>
              <div className="flex gap-4">
                <img
                  src={review.hotelImage}
                  alt={review.hotelName}
                  className="w-32 h-32 object-cover rounded-lg flex-shrink-0"
                />
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <Link href={`/hotel/${review.hotel_id}`}>
                        <h3 className="text-xl font-bold text-gray-900 hover:text-[#0071c2] transition-colors">
                          {review.hotelName}
                        </h3>
                      </Link>
                      <div className="flex items-center space-x-2 mt-1">
                        <div className="flex">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <span
                              key={i}
                              className={`text-lg ${
                                i < review.rating
                                  ? 'text-yellow-500'
                                  : 'text-gray-300'
                              }`}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                        <span className="text-sm text-gray-600 font-medium">
                          {new Date(review.date_created).toLocaleDateString(
                            'vi-VN'
                          )}
                        </span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        ✏️ Sửa
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDelete(review.review_id)}
                      >
                        🗑️ Xóa
                      </Button>
                    </div>
                  </div>

                  <h4 className="font-bold text-gray-900 mb-2">
                    {review.title}
                  </h4>
                  <p className="text-gray-700 mb-3">{review.comment}</p>

                  {Array.isArray(review.images) && review.images.length > 0 && (
                    <div className="flex space-x-2 mb-3">
                      {review.images.map((img, i) => (
                        <img
                          key={i}
                          src={img}
                          alt="Review"
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                      ))}
                    </div>
                  )}

                  <div className="flex items-center space-x-4 text-sm text-gray-600 font-medium mb-3">
                    <span>👍 {review.helpful ?? 0} người thấy hữu ích</span>
                  </div>

                  {review.reply && (
                    <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="font-semibold text-blue-900">
                          📝 Phản hồi từ khách sạn:
                        </span>
                      </div>
                      <p className="text-gray-700">{review.reply}</p>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
