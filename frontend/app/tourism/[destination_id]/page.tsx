'use client';

import { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { destinationsApi, reviewsApi } from '@/lib/api/services';
import { useAuth } from '@/lib/context/AuthContext';
import type { TourismSpot, Review } from '@/types';

export default function TourismDetailPage({
  params,
}: {
  params: Promise<{ destination_id: string }>;
}) {
  const resolvedParams = use(params);
  const { user, isAuthenticated } = useAuth();
  const [destination, setDestination] = useState<TourismSpot | null>(null);
  const [relatedSpots, setRelatedSpots] = useState<TourismSpot[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Review form state
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [spot, allSpots] = await Promise.all([
          destinationsApi.getById(String(resolvedParams.destination_id)),
          destinationsApi.getAll(),
        ]);
        setDestination(spot);
        setRelatedSpots(
          allSpots
            .filter((s) => s.destination_id !== spot?.destination_id)
            .slice(0, 3)
        );
        
        // Load reviews for this destination from API
        try {
          const allReviews = await reviewsApi.getAll();
          const destinationReviews = allReviews.filter(
            r => r.destination_id === Number(resolvedParams.destination_id)
          );
          setReviews(destinationReviews);
        } catch (reviewError) {
          console.error('Error loading reviews:', reviewError);
        }
      } catch (error) {
        console.error('Error loading tourism spot:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [resolvedParams.destination_id]);

  // Handle submit review
  const handleSubmitReview = async () => {
    if (!reviewComment.trim()) {
      alert('Vui lòng nhập nội dung đánh giá!');
      return;
    }

    setSubmittingReview(true);
    try {
      const newReview = await destinationsApi.addReview(
        String(resolvedParams.destination_id),
        {
          user_id: user?.user_id || 0,
          rating: reviewRating,
          comment: reviewComment,
          title: reviewTitle,
          userName: user?.name || 'Khách',
          userAvatar: user?.profile_image || undefined,
        }
      );
      
      setReviews([newReview, ...reviews]);
      setShowReviewForm(false);
      setReviewRating(5);
      setReviewTitle('');
      setReviewComment('');
      alert('Cảm ơn bạn đã đánh giá!');
    } catch (error) {
      console.error('Submit review error:', error);
      alert('Không thể gửi đánh giá, vui lòng thử lại.');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 py-12">
          <div className="container mx-auto px-4">
            <Card className="text-center py-12">
              <p className="text-gray-900 font-medium">Đang tải...</p>
            </Card>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!destination) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 py-12">
          <div className="container mx-auto px-4">
            <Card className="text-center py-12">
              <div className="text-6xl mb-4">🗺️</div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Không tìm thấy điểm đến
              </h1>
              <p className="text-gray-600 mb-6">
                Điểm đến này không tồn tại hoặc đã bị xóa
              </p>
              <Link href="/tourism">
                <Button>Quay lại danh sách</Button>
              </Link>
            </Card>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const highlights = [
    { icon: '🎨', title: 'Văn hóa', description: 'Di sản văn hóa độc đáo' },
    {
      icon: '🏞️',
      title: 'Thiên nhiên',
      description: 'Cảnh đẹp thiên nhiên tuyệt vời',
    },
    { icon: '🍜', title: 'Ẩm thực', description: 'Đặc sản địa phương hấp dẫn' },
    { icon: '📸', title: 'Check-in', description: 'Địa điểm chụp ảnh đẹp' },
  ];

  const activities = [
    {
      name: 'Tham quan di tích lịch sử',
      duration: '2-3 giờ',
      price: 'Miễn phí',
    },
    { name: 'Tour khám phá ẩm thực', duration: '3-4 giờ', price: '500.000đ' },
    { name: 'Chèo kayak & Trekking', duration: '4-5 giờ', price: '800.000đ' },
  ];

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50">
        <section className="relative h-96 md:h-[500px] bg-gray-900">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url('${destination.thumbnail}')` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
            <div className="container mx-auto">
              <h1 className="text-4xl md:text-5xl font-bold mb-3">
                {destination.name}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-lg">
                <span className="flex items-center gap-2">
                  📍 {destination.location}
                </span>
                <span className="flex items-center gap-2">
                  ⭐ {destination.rating} / 5.0
                </span>
              </div>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Giới thiệu
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  {destination.description}
                </p>
                <p className="text-gray-700 leading-relaxed">
                  {destination.name} là một trong những điểm đến du lịch hấp dẫn
                  nhất tại {destination.location}, thu hút hàng triệu du khách
                  mỗi năm với vẻ đẹp thiên nhiên tuyệt vời và nền văn hóa phong
                  phú.
                </p>
              </Card>

              <Card>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Điểm nổi bật
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {highlights.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-4 p-4 bg-gradient-to-br from-blue-50 to-white rounded-xl border border-gray-200 hover:shadow-md transition-all"
                    >
                      <div className="text-4xl">{item.icon}</div>
                      <div>
                        <h3 className="font-bold text-gray-900 mb-1">
                          {item.title}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Hoạt động tham quan
                </h2>
                <div className="space-y-4">
                  {activities.map((activity, index) => (
                    <div
                      key={index}
                      className="p-5 border-2 border-gray-200 rounded-xl hover:border-[#0071c2] transition-all"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-900 mb-2">
                            {activity.name}
                          </h3>
                          <div className="flex gap-4 text-sm text-gray-600">
                            <span>⏱️ {activity.duration}</span>
                            <span>💰 {activity.price}</span>
                          </div>
                        </div>
                        <Button size="sm" variant="outline">
                          Đặt ngay
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Lời khuyên du lịch
                </h2>
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <span className="text-xl">🌤️</span>
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        Thời điểm tốt nhất
                      </h4>
                      <p className="text-gray-600">
                        Từ tháng 3 đến tháng 9, thời tiết mát mẻ và ít mưa
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-xl">🚗</span>
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        Phương tiện di chuyển
                      </h4>
                      <p className="text-gray-600">
                        Có thể đi bằng xe máy, ô tô hoặc xe bus từ trung tâm
                        thành phố
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-xl">💡</span>
                    <div>
                      <h4 className="font-semibold text-gray-900">Lưu ý</h4>
                      <p className="text-gray-600">
                        Nên đi theo nhóm và chuẩn bị đầy đủ nước uống, kem chống
                        nắng
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            <div className="lg:col-span-1">
              <div className="sticky top-20 space-y-6">
                <Card>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    Thông tin nhanh
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between py-2 border-b border-gray-200">
                      <span className="text-gray-600">Phí tham quan</span>
                      <span className="font-semibold text-gray-900">
                        {destination.entry_fee
                          ? `${destination.entry_fee.toLocaleString('vi-VN')} ₫`
                          : 'Đang cập nhật'}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-200">
                      <span className="text-gray-600">Phương tiện</span>
                      <span className="font-semibold text-gray-900">
                        {destination.transportation || 'Đang cập nhật'}
                      </span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-gray-600">Loại hình</span>
                      <span className="font-semibold text-gray-900">
                        {destination.type || 'Đang cập nhật'}
                      </span>
                    </div>
                  </div>
                </Card>

                <Card>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    Tìm khách sạn gần đây
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Khám phá các khách sạn gần {destination.name}
                  </p>
                  <Link
                    href={`/search?location=${encodeURIComponent(
                      destination.location
                    )}`}
                  >
                    <Button className="w-full">Tìm khách sạn</Button>
                  </Link>
                </Card>

                <Card>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    Chia sẻ
                  </h3>
                  <div className="flex gap-2">
                    <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      📘 Facebook
                    </button>
                    <button className="flex-1 px-4 py-2 bg-blue-400 text-white rounded-lg hover:bg-blue-500 transition-colors">
                      🐦 Twitter
                    </button>
                  </div>
                </Card>
              </div>
            </div>
          </div>
          {/* Reviews Section */}
          <section className="mt-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-gray-900">
                Đánh giá từ du khách ({reviews.length})
              </h2>
              {isAuthenticated ? (
                <Button onClick={() => setShowReviewForm(!showReviewForm)}>
                  {showReviewForm ? 'Hủy' : '✍️ Viết đánh giá'}
                </Button>
              ) : (
                <Link href="/login">
                  <Button variant="outline">Đăng nhập để đánh giá</Button>
                </Link>
              )}
            </div>

            {/* Review Form */}
            {showReviewForm && (
              <Card className="mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Viết đánh giá của bạn</h3>
                
                {/* Rating Stars */}
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Đánh giá sao *</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewRating(star)}
                        className={`text-3xl transition-transform hover:scale-110 ${star <= reviewRating ? 'text-yellow-400' : 'text-gray-300'}`}
                      >
                        ⭐
                      </button>
                    ))}
                    <span className="ml-2 text-gray-600 self-center">{reviewRating}/5 sao</span>
                  </div>
                </div>

                {/* Title */}
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Tiêu đề (tùy chọn)</label>
                  <input
                    type="text"
                    value={reviewTitle}
                    onChange={(e) => setReviewTitle(e.target.value)}
                    placeholder="VD: Trải nghiệm tuyệt vời!"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0071c2] focus:border-[#0071c2]"
                  />
                </div>

                {/* Comment */}
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Nội dung đánh giá *</label>
                  <textarea
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Chia sẻ trải nghiệm của bạn tại đây..."
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0071c2] focus:border-[#0071c2] resize-none"
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={handleSubmitReview}
                    disabled={submittingReview || !reviewComment.trim()}
                  >
                    {submittingReview ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Đang gửi...
                      </span>
                    ) : (
                      'Gửi đánh giá'
                    )}
                  </Button>
                  <Button variant="outline" onClick={() => setShowReviewForm(false)}>
                    Hủy
                  </Button>
                </div>
              </Card>
            )}

            {/* Reviews List */}
            {reviews.length === 0 ? (
              <Card className="text-center py-8">
                <div className="text-5xl mb-4">💬</div>
                <p className="text-gray-600">Chưa có đánh giá nào. Hãy là người đầu tiên đánh giá!</p>
              </Card>
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <Card key={review.review_id}>
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        {review.userAvatar ? (
                          <img
                            src={review.userAvatar}
                            alt={review.userName}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#0071c2] to-[#005999] flex items-center justify-center text-white font-bold">
                            {(review.userName || 'K').charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h4 className="font-bold text-gray-900">{review.userName || 'Khách'}</h4>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <span className="text-yellow-400">{'⭐'.repeat(review.rating)}</span>
                              <span>•</span>
                              <span>{new Date(review.date_created).toLocaleDateString('vi-VN')}</span>
                              {review.verified && (
                                <>
                                  <span>•</span>
                                  <span className="text-green-600">✓ Đã xác minh</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        {review.title && (
                          <h5 className="font-semibold text-gray-900 mb-1">{review.title}</h5>
                        )}
                        <p className="text-gray-700">{review.comment}</p>
                        {review.images && review.images.length > 0 && (
                          <div className="flex gap-2 mt-3">
                            {review.images.map((img, idx) => (
                              <img
                                key={idx}
                                src={img}
                                alt={`Review image ${idx + 1}`}
                                className="w-20 h-20 object-cover rounded-lg"
                              />
                            ))}
                          </div>
                        )}
                        <div className="flex items-center gap-4 mt-3 text-sm">
                          <button className="text-gray-500 hover:text-[#0071c2] flex items-center gap-1">
                            👍 Hữu ích ({review.helpful || 0})
                          </button>
                          <button className="text-gray-500 hover:text-red-500">
                            🚩 Báo cáo
                          </button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </section>
          <section className="mt-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Điểm đến liên quan
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedSpots.map((spot) => (
                <Link
                  key={spot.destination_id}
                  href={`/tourism/${spot.destination_id}`}
                >
                  <div className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden hover:border-[#0071c2] hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group">
                    <div className="relative h-48 overflow-hidden">
                      <div
                        className="absolute inset-0 bg-cover bg-center transform group-hover:scale-110 transition-transform duration-500"
                        style={{ backgroundImage: `url('${spot.thumbnail}')` }}
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-gray-900 mb-1">
                        {spot.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        📍 {spot.location}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </div>
      <Footer />
    </>
  );
}
