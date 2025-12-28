'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { hotelManagerApi, reviewsApi } from '@/lib/api/services';
import { useAuth } from '@/lib/context/AuthContext';
import type { Review } from '@/types';

export default function HotelReviewsPage() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hotelId, setHotelId] = useState<string | null>(null);
  const [hotels, setHotels] = useState<Array<Record<string, unknown>>>([]);
  const [selectedHotelId, setSelectedHotelId] = useState<string>('');
  const [filter, setFilter] = useState<'all' | 'unreplied' | '5star' | 'low'>(
    'all'
  );
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  useEffect(() => {
    const loadHotels = async () => {
      try {
        const myHotels = await hotelManagerApi.getMyHotels();
        const normalized = (myHotels as unknown as Array<Record<string, unknown>>) ?? [];
        setHotels(normalized);
        const firstId = normalized.length
          ? String((normalized[0] as any).hotel_id ?? (normalized[0] as any).id)
          : '';
        setSelectedHotelId(firstId);
        setHotelId(firstId);
      } catch (error) {
        console.error('Error loading hotels:', error);
      }
    };
    loadHotels();
  }, []);

  useEffect(() => {
    if (selectedHotelId) {
      loadReviews();
    }
  }, [selectedHotelId]);

  const loadReviews = async () => {
    if (!selectedHotelId) return;

    try {
      setLoading(true);
      setHotelId(selectedHotelId);

      const data = await reviewsApi.getAll(selectedHotelId);
      const transformedReviews = data.map((review: any) => ({
        review_id: review.review_id?.toString() || '',
        guestName: review.User?.name || 'Khách hàng',
        guestAvatar: review.User?.profile_image || 'https://i.pravatar.cc/150',
        rating: review.rating || 0,
        title: review.comment?.substring(0, 50) || '',
        comment: review.comment || '',
        date: review.date_created || new Date().toISOString(),
        bookingId: review.booking_id?.toString() || '',
        roomType: review.Room?.RoomType?.type || 'N/A',
        verified: true,
        replied: false,
      }));
      setReviews(transformedReviews);
    } catch (error) {
      console.error('Error loading reviews:', error);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredReviews =
    filter === 'all'
      ? reviews
      : filter === 'unreplied'
      ? reviews.filter((r) => !r.replied)
      : filter === '5star'
      ? reviews.filter((r) => r.rating === 5)
      : reviews.filter((r) => r.rating <= 3);

  const averageRating = (
    reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
  ).toFixed(1);

  const getRatingDistribution = (rating: number) => {
    const count = reviews.filter((r) => r.rating === rating).length;
    const percentage = (count / reviews.length) * 100;
    return { count, percentage };
  };

  const handleReply = (reviewId: string) => {
    setReplyingTo(reviewId);
    setReplyText('');
  };

  const submitReply = async (reviewId: string) => {
    if (!replyText.trim()) {
      alert('Vui lòng nhập nội dung phản hồi.');
      return;
    }

    try {
      await hotelManagerApi.replyToReview(
        reviewId,
        replyText
      );
      setReviews((prevReviews) =>
        prevReviews.map((review) =>
          review.review_id === reviewId
            ? { ...review, replied: true, reply: { content: replyText, date: new Date().toISOString().split('T')[0] } }
            : review
        )
      );
      setReplyingTo(null);
      setReplyText('');
      alert('✅ Phản hồi đã được gửi thành công!');
    } catch (error) {
      console.error('Error sending reply:', error);
      alert('❌ Gửi phản hồi thất bại. Vui lòng thử lại!');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Quản lý đánh giá</h1>
        <div className="text-right">
          <p className="text-sm text-gray-600">Tổng đánh giá</p>
          <p className="text-2xl font-bold text-[#0071c2]">{reviews.length}</p>
        </div>
      </div>

      {/* Hotel Selector */}
      {hotels.length > 1 && (
        <Card>
          <div className="flex items-center gap-4">
            <label className="text-gray-900 font-semibold">Chọn khách sạn:</label>
            <select
              value={selectedHotelId}
              onChange={(e) => setSelectedHotelId(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-[300px] text-gray-900"
            >
              {hotels.map((hotel) => (
                <option
                  key={String((hotel as any).hotel_id || (hotel as any).id)}
                  value={String((hotel as any).hotel_id || (hotel as any).id)}
                  className="text-gray-900"
                >
                  {String((hotel as any).name || 'Khách sạn')} - ID: {String((hotel as any).hotel_id || (hotel as any).id)}
                </option>
              ))}
            </select>
          </div>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Average Rating */}
        <Card>
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            Đánh giá trung bình
          </h3>
          <div className="flex items-center space-x-6">
            <div className="text-center">
              <div className="text-5xl font-bold text-[#0071c2] mb-2">
                {averageRating}
              </div>
              <div className="flex items-center justify-center space-x-1 mb-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span key={star} className="text-2xl text-yellow-500">
                    {star <= Math.round(Number(averageRating)) ? '⭐' : '☆'}
                  </span>
                ))}
              </div>
              <p className="text-sm text-gray-600">
                từ {reviews.length} đánh giá
              </p>
            </div>

            <div className="flex-1 space-y-2">
              {[5, 4, 3, 2, 1].map((rating) => {
                const { count, percentage } = getRatingDistribution(rating);
                return (
                  <div key={rating} className="flex items-center space-x-2">
                    <span className="text-sm font-semibold text-gray-700 w-8">
                      {rating}⭐
                    </span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-[#0071c2] h-full rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-800 font-medium w-8">
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>

        {/* Quick Stats */}
        <Card>
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            Thống kê nhanh
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">⭐</span>
                <span className="font-semibold text-gray-900">
                  Đánh giá 5 sao
                </span>
              </div>
              <span className="text-2xl font-bold text-green-600">
                {reviews.filter((r) => r.rating === 5).length}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">💬</span>
                <span className="font-semibold text-gray-900">
                  Chưa phản hồi
                </span>
              </div>
              <span className="text-2xl font-bold text-yellow-600">
                {reviews.filter((r) => !r.replied).length}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">⚠️</span>
                <span className="font-semibold text-gray-900">
                  Đánh giá thấp
                </span>
              </div>
              <span className="text-2xl font-bold text-red-600">
                {reviews.filter((r) => r.rating <= 3).length}
              </span>
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
            variant={filter === 'unreplied' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setFilter('unreplied')}
          >
            Chưa phản hồi ({reviews.filter((r) => !r.replied).length})
          </Button>
          <Button
            variant={filter === '5star' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setFilter('5star')}
          >
            5 sao ({reviews.filter((r) => r.rating === 5).length})
          </Button>
          <Button
            variant={filter === 'low' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setFilter('low')}
          >
            Thấp ({reviews.filter((r) => r.rating <= 3).length})
          </Button>
        </div>
      </Card>

      {/* Reviews List */}
      {filteredReviews.length === 0 ? (
        <Card className="text-center py-12">
          <div className="text-6xl mb-4">⭐</div>
          <p className="text-gray-900 font-medium">Không có đánh giá nào</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredReviews.map((review) => (
            <Card key={review.review_id}>
              {/* Review Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-3">
                  <img
                    src={review.guestAvatar}
                    alt={review.guestName}
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-bold text-gray-900">
                        {review.guestName}
                      </h4>
                      {review.verified && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                          ✓ Đã xác minh
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 mt-1">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span
                            key={star}
                            className="text-lg text-yellow-500"
                          >
                            {star <= review.rating ? '⭐' : '☆'}
                          </span>
                        ))}
                      </div>
                      <span className="text-sm text-gray-500">
                        {review.date}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {review.roomType} • Mã đơn: {review.bookingId}
                    </p>
                  </div>
                </div>
              </div>

              {/* Review Content */}
              <div className="mb-4">
                <h5 className="font-semibold text-gray-900 mb-2">
                  {review.title}
                </h5>
                <p className="text-gray-700 leading-relaxed">
                  {review.comment}
                </p>
              </div>

              {/* Hotel Reply */}
              {review.replied && review.reply && (
                <div className="bg-blue-50 border-l-4 border-[#0071c2] p-4 mb-4">
                  <div className="flex items-start space-x-2">
                    <span className="text-xl">🏨</span>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 mb-1">
                        Phản hồi từ khách sạn
                      </p>
                      <p className="text-gray-700">{review.reply.content}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        {review.reply.date}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Reply Form */}
              {replyingTo === review.review_id && (
                <div className="border-t pt-4 mt-4">
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Nhập phản hồi của bạn..."
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0071c2] focus:border-[#0071c2] text-gray-900"
                  />
                  <div className="flex justify-end space-x-2 mt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setReplyingTo(null)}
                    >
                      Hủy
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => submitReply(review.review_id)}
                      disabled={!replyText.trim()}
                    >
                      Gửi phản hồi
                    </Button>
                  </div>
                </div>
              )}

              {/* Actions */}
              {!review.replied && replyingTo !== review.review_id && (
                <div className="flex justify-end pt-4 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleReply(review.review_id)}
                  >
                    💬 Phản hồi
                  </Button>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
