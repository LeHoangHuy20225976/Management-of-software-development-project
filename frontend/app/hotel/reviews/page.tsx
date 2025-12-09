/**
 * Reviews Management for Hotel Owners
 * FE4: Hotel Manager Portal
 */

'use client';

import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { useState } from 'react';
import type { Review } from '@/types';

export default function HotelReviewsPage() {
  const [filter, setFilter] = useState<'all' | 'replied' | 'pending'>('all');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  // Mock data
  const reviews: (Review & { reply?: string })[] = [
    {
      id: '1',
      hotelId: 'h1',
      userId: 'u1',
      userName: 'Nguyễn Văn A',
      userAvatar: 'https://i.pravatar.cc/150?u=1',
      rating: 5,
      title: 'Tuyệt vời!',
      comment: 'Khách sạn rất đẹp, phòng sạch sẽ, nhân viên thân thiện. Sẽ quay lại!',
      images: [],
      date: '2025-11-25',
      helpful: 12,
      verified: true,
      reply: 'Cảm ơn quý khách đã dành thời gian đánh giá! Chúng tôi rất vui khi quý khách hài lòng với dịch vụ. Hy vọng được đón tiếp quý khách trong lần tới!',
    },
    {
      id: '2',
      hotelId: 'h1',
      userId: 'u2',
      userName: 'Trần Thị B',
      userAvatar: 'https://i.pravatar.cc/150?u=2',
      rating: 4,
      title: 'Tốt nhưng có thể cải thiện',
      comment: 'Phòng đẹp, view đẹp. Nhưng wifi hơi chậm. Bữa sáng ngon.',
      images: ['https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400'],
      date: '2025-11-20',
      helpful: 8,
      verified: true,
    },
    {
      id: '3',
      hotelId: 'h1',
      userId: 'u3',
      userName: 'Lê Văn C',
      userAvatar: 'https://i.pravatar.cc/150?u=3',
      rating: 5,
      title: 'Hoàn hảo cho kỳ nghỉ gia đình',
      comment: 'Khách sạn rất phù hợp cho gia đình. Hồ bơi rộng, bé thích lắm. Phòng Family Suite rất thoải mái.',
      images: [],
      date: '2025-11-18',
      helpful: 15,
      verified: true,
      reply: 'Cảm ơn gia đình quý khách! Rất vui khi các bé thích hồ bơi. Mong được phục vụ gia đình quý khách trong những chuyến đi tiếp theo!',
    },
    {
      id: '4',
      hotelId: 'h1',
      userId: 'u4',
      userName: 'Phạm Thị D',
      userAvatar: 'https://i.pravatar.cc/150?u=4',
      rating: 3,
      title: 'Tạm được',
      comment: 'Vị trí tốt nhưng cách âm không tốt lắm. Nghe thấy tiếng ồn từ phòng bên.',
      images: [],
      date: '2025-11-15',
      helpful: 5,
      verified: true,
    },
  ];

  const filteredReviews = reviews.filter((review) => {
    if (filter === 'all') return true;
    if (filter === 'replied') return !!review.reply;
    if (filter === 'pending') return !review.reply;
    return true;
  });

  const handleReply = (reviewId: string) => {
    if (!replyText.trim()) {
      alert('Vui lòng nhập nội dung phản hồi');
      return;
    }
    // TODO: Call API to submit reply
    alert('Đã gửi phản hồi!');
    setReplyingTo(null);
    setReplyText('');
  };

  const stats = {
    total: reviews.length,
    avgRating: (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1),
    replied: reviews.filter(r => !!r.reply).length,
    pending: reviews.filter(r => !r.reply).length,
    fiveStar: reviews.filter(r => r.rating === 5).length,
    fourStar: reviews.filter(r => r.rating === 4).length,
    threeStar: reviews.filter(r => r.rating === 3).length,
    twoStar: reviews.filter(r => r.rating === 2).length,
    oneStar: reviews.filter(r => r.rating === 1).length,
  };

  const getRatingPercentage = (count: number) => {
    return (count / stats.total * 100).toFixed(0);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Quản lý đánh giá</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <div className="text-center">
            <div className="text-6xl font-bold text-[#0071c2] mb-2">{stats.avgRating}</div>
            <div className="flex justify-center mb-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i} className="text-2xl text-yellow-500">★</span>
              ))}
            </div>
            <div className="text-gray-600">Trung bình từ {stats.total} đánh giá</div>
          </div>
        </Card>

        <Card>
          <h3 className="font-semibold mb-3">Phân bố đánh giá</h3>
          <div className="space-y-2">
            {[
              { stars: 5, count: stats.fiveStar },
              { stars: 4, count: stats.fourStar },
              { stars: 3, count: stats.threeStar },
              { stars: 2, count: stats.twoStar },
              { stars: 1, count: stats.oneStar },
            ].map(({ stars, count }) => (
              <div key={stars} className="flex items-center space-x-2">
                <div className="w-12 text-sm">{stars} ⭐</div>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-yellow-500 h-2 rounded-full"
                    style={{ width: `${getRatingPercentage(count)}%` }}
                  />
                </div>
                <div className="w-12 text-sm text-right">{count}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card padding="sm">
          <div className="text-center">
            <div className="text-2xl font-bold text-[#0071c2]">{stats.total}</div>
            <div className="text-sm text-gray-600">Tổng đánh giá</div>
          </div>
        </Card>
        <Card padding="sm">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{stats.replied}</div>
            <div className="text-sm text-gray-600">Đã phản hồi</div>
          </div>
        </Card>
        <Card padding="sm">
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <div className="text-sm text-gray-600">Chờ phản hồi</div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-wrap gap-2">
          {(['all', 'pending', 'replied'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === status
                  ? 'bg-[#0071c2] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status === 'all' && 'Tất cả'}
              {status === 'pending' && 'Chờ phản hồi'}
              {status === 'replied' && 'Đã phản hồi'}
            </button>
          ))}
        </div>
      </Card>

      {/* Reviews List */}
      <div className="space-y-4">
        {filteredReviews.length > 0 ? (
          filteredReviews.map((review) => (
            <Card key={review.id}>
              <div className="flex items-start space-x-4">
                <img
                  src={review.userAvatar}
                  alt={review.userName}
                  className="w-12 h-12 rounded-full"
                />
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold">{review.userName}</h3>
                        {review.verified && (
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                            ✓ Đã xác minh
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 mt-1">
                        <div className="flex">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <span
                              key={i}
                              className={i < review.rating ? 'text-yellow-500' : 'text-gray-300'}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                        <span className="text-sm text-gray-600">
                          {new Date(review.date).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                    </div>
                  </div>

                  <h4 className="font-semibold mb-2">{review.title}</h4>
                  <p className="text-gray-700 mb-3">{review.comment}</p>

                  {review.images.length > 0 && (
                    <div className="flex space-x-2 mb-3">
                      {review.images.map((img, i) => (
                        <img
                          key={i}
                          src={img}
                          alt="Review"
                          className="w-24 h-24 object-cover rounded-lg"
                        />
                      ))}
                    </div>
                  )}

                  <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                    <span>👍 {review.helpful} người thấy hữu ích</span>
                  </div>

                  {/* Hotel Reply */}
                  {review.reply ? (
                    <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="font-semibold text-blue-900">📝 Phản hồi từ khách sạn:</span>
                      </div>
                      <p className="text-gray-700">{review.reply}</p>
                    </div>
                  ) : (
                    <div>
                      {replyingTo === review.id ? (
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <textarea
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder="Nhập phản hồi của bạn..."
                            rows={4}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 mb-3"
                          />
                          <div className="flex space-x-2">
                            <Button onClick={() => handleReply(review.id)}>
                              📤 Gửi phản hồi
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => {
                                setReplyingTo(null);
                                setReplyText('');
                              }}
                            >
                              Hủy
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <Button variant="outline" onClick={() => setReplyingTo(review.id)}>
                          💬 Phản hồi
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))
        ) : (
          <Card>
            <div className="text-center py-12">
              <div className="text-6xl mb-4">⭐</div>
              <p className="text-gray-600">Không có đánh giá nào</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
