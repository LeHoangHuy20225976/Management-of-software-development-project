/**
 * Hotel Reviews Management
 * FE4: Hotel Manager Portal
 */

'use client';

import { useState } from 'react';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';

// Mock reviews data - in real app would fetch from API
const mockReviews = [
  {
    review_id: 'rv1',
    guestName: 'Nguyễn Văn A',
    guestAvatar: 'https://i.pravatar.cc/150?u=user1',
    rating: 5,
    title: 'Trải nghiệm tuyệt vời!',
    comment:
      'Khách sạn rất đẹp, phòng sạch sẽ, nhân viên thân thiện. View từ phòng nhìn ra thành phố rất đẹp. Bữa sáng buffet đa dạng và ngon. Chắc chắn sẽ quay lại!',
    date: '2025-12-05',
    bookingId: 'BK001',
    roomType: 'Deluxe Room',
    verified: true,
    replied: false,
  },
  {
    review_id: 'rv2',
    guestName: 'Trần Thị B',
    guestAvatar: 'https://i.pravatar.cc/150?u=user2',
    rating: 4,
    title: 'Tốt nhưng có thể cải thiện',
    comment:
      'Vị trí khách sạn thuận tiện. Phòng đẹp và sạch sẽ. Tuy nhiên wifi hơi chậm, hy vọng khách sạn sẽ cải thiện điểm này.',
    date: '2025-12-03',
    bookingId: 'BK002',
    roomType: 'Standard Room',
    verified: true,
    replied: true,
    reply: {
      content:
        'Cảm ơn bạn đã góp ý. Chúng tôi đã nâng cấp hệ thống wifi và hi vọng bạn sẽ có trải nghiệm tốt hơn trong lần tới.',
      date: '2025-12-04',
    },
  },
  {
    review_id: 'rv3',
    guestName: 'Lê Văn C',
    guestAvatar: 'https://i.pravatar.cc/150?u=user3',
    rating: 5,
    title: 'Hoàn hảo cho kỳ nghỉ gia đình',
    comment:
      'Khách sạn view biển tuyệt đẹp! Hồ bơi rộng rãi, bãi biển riêng sạch sẽ. Con tôi rất thích khu vui chơi trẻ em. Staff nhiệt tình và chu đáo.',
    date: '2025-12-01',
    bookingId: 'BK003',
    roomType: 'Family Suite',
    verified: true,
    replied: false,
  },
  {
    review_id: 'rv4',
    guestName: 'Phạm Thị D',
    guestAvatar: 'https://i.pravatar.cc/150?u=user4',
    rating: 3,
    title: 'Bình thường',
    comment:
      'Phòng ốc ổn nhưng không có gì đặc biệt. Giá hơi cao so với chất lượng dịch vụ.',
    date: '2025-11-28',
    bookingId: 'BK004',
    roomType: 'Standard Room',
    verified: true,
    replied: false,
  },
];

export default function HotelReviewsPage() {
  const [reviews] = useState(mockReviews);
  const [filter, setFilter] = useState<'all' | 'unreplied' | '5star' | 'low'>(
    'all'
  );
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

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

  const submitReply = (reviewId: string) => {
    // In real app, would call API to submit reply
    console.log('Submitting reply to review:', reviewId, replyText);
    setReplyingTo(null);
    setReplyText('');
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
                    <span className="text-sm text-gray-600 w-8">{count}</span>
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
          <p className="text-gray-600">Không có đánh giá nào</p>
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
                            className={`text-lg ${
                              star <= review.rating
                                ? 'text-yellow-500'
                                : 'text-gray-300'
                            }`}
                          >
                            ⭐
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
