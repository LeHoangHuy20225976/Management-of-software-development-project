'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Card } from '@/components/common/Card';
import { HotelChat } from '@/components/hotel/HotelChat';
import { Button } from '@/components/common/Button';
import { hotelsApi, reviewsApi } from '@/lib/api/services';
import { useAuth } from '@/lib/context/AuthContext';
import type { Hotel, RoomType, RoomPrice, Review } from '@/types';

interface RoomTypeWithPrice extends RoomType {
  price?: RoomPrice;
}

export default function HotelDetailPage({
  params,
}: {
  params: Promise<{ hotel_id: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { user } = useAuth();
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [roomTypes, setRoomTypes] = useState<RoomTypeWithPrice[]>([]);
  const [loading, setLoading] = useState(true);

  // Reviews state
  const [reviews, setReviews] = useState<Review[]>([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    title: '',
    comment: '',
  });

  // Search criteria
  const [searchDates, setSearchDates] = useState({
    checkIn: '',
    checkOut: '',
    guests: 2,
  });

  useEffect(() => {
    const loadHotel = async () => {
      try {
        const data = await hotelsApi.getById(resolvedParams.hotel_id);
        setHotel(data);

        // Mock room types with prices for testing UI
        const mockRoomTypes: RoomTypeWithPrice[] = [
          {
            type_id: 1,
            hotel_id: parseInt(resolvedParams.hotel_id),
            type: 'Phòng Standard',
            availability: true,
            max_guests: 2,
            description:
              'Phòng tiêu chuẩn với 1 giường đôi, phù hợp cho 2 người. Bao gồm: WiFi miễn phí, điều hòa, TV, tủ lạnh mini.',
            quantity: 10,
            price: {
              price_id: 1,
              type_id: 1,
              start_date: null,
              end_date: null,
              special_price: null,
              event: null,
              basic_price: 500000,
              discount: 0,
            },
          },
          {
            type_id: 2,
            hotel_id: parseInt(resolvedParams.hotel_id),
            type: 'Phòng Deluxe',
            availability: true,
            max_guests: 2,
            description:
              'Phòng cao cấp với view đẹp, 1 giường king size. Bao gồm: WiFi, điều hòa, TV 43", minibar, bồn tắm.',
            quantity: 5,
            price: {
              price_id: 2,
              type_id: 2,
              start_date: '2025-12-01',
              end_date: '2025-12-31',
              special_price: 850000,
              event: 'Khuyến mãi Giáng Sinh',
              basic_price: 1000000,
              discount: 15,
            },
          },
          {
            type_id: 3,
            hotel_id: parseInt(resolvedParams.hotel_id),
            type: 'Phòng Suite',
            availability: true,
            max_guests: 4,
            description:
              'Phòng suite sang trọng với phòng khách riêng, 2 giường queen. Bao gồm: WiFi, điều hòa, Smart TV 55", bếp nhỏ, ban công.',
            quantity: 3,
            price: {
              price_id: 3,
              type_id: 3,
              start_date: null,
              end_date: null,
              special_price: null,
              event: null,
              basic_price: 2000000,
              discount: 10,
            },
          },
          {
            type_id: 4,
            hotel_id: parseInt(resolvedParams.hotel_id),
            type: 'Phòng Family',
            availability: false,
            max_guests: 4,
            description:
              'Phòng gia đình rộng rãi với 2 giường đôi, thích hợp cho gia đình có trẻ em. Bao gồm: WiFi, điều hòa, TV, tủ lạnh.',
            quantity: 4,
            price: {
              price_id: 4,
              type_id: 4,
              start_date: null,
              end_date: null,
              special_price: null,
              event: null,
              basic_price: 1200000,
              discount: 5,
            },
          },
          {
            type_id: 5,
            hotel_id: parseInt(resolvedParams.hotel_id),
            type: 'Phòng VIP',
            availability: true,
            max_guests: 2,
            description:
              'Phòng VIP đẳng cấp với view toàn cảnh thành phố, giường king size cao cấp, phòng tắm jacuzzi. Full tiện nghi 5 sao.',
            quantity: 2,
            price: {
              price_id: 5,
              type_id: 5,
              start_date: '2025-12-20',
              end_date: '2026-01-05',
              special_price: 2800000,
              event: 'Ưu đãi Tết Dương Lịch',
              basic_price: 3500000,
              discount: 20,
            },
          },
        ];

        setRoomTypes(mockRoomTypes);

        // TODO: Replace with actual API call
        // const rooms = await roomTypesApi.getByHotelId(resolvedParams.hotel_id);
        // setRoomTypes(rooms);
      } catch (error) {
        console.error('Error loading hotel:', error);
      } finally {
        setLoading(false);
      }
    };
    loadHotel();
    loadReviews();
  }, [resolvedParams.hotel_id]);

  const loadReviews = async () => {
    try {
      const data = await reviewsApi.getAll(resolvedParams.hotel_id);
      setReviews(data);
    } catch (error) {
      console.error('Error loading reviews:', error);
    }
  };

  const handleSubmitReview = async () => {
    if (!reviewForm.comment || reviewForm.rating < 1 || reviewForm.rating > 5) {
      alert('Vui lòng điền đầy đủ thông tin đánh giá!');
      return;
    }

    try {
      if (editingReview) {
        // Update existing review
        await reviewsApi.update(editingReview.review_id.toString(), {
          rating: reviewForm.rating,
          title: reviewForm.title,
          comment: reviewForm.comment,
        });
        alert('✅ Cập nhật đánh giá thành công!');
      } else {
        // Create new review
        await reviewsApi.create({
          hotel_id: Number(resolvedParams.hotel_id),
          rating: reviewForm.rating,
          title: reviewForm.title,
          comment: reviewForm.comment,
        });
        alert('✅ Thêm đánh giá thành công!');
      }

      // Reset form and reload reviews
      setReviewForm({ rating: 5, title: '', comment: '' });
      setShowReviewForm(false);
      setEditingReview(null);
      await loadReviews();
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('❌ Lỗi khi gửi đánh giá!');
    }
  };

  const handleDeleteReview = async (reviewId: number) => {
    if (!confirm('Bạn có chắc muốn xóa đánh giá này?')) return;

    try {
      await reviewsApi.delete(reviewId.toString());
      alert('✅ Xóa đánh giá thành công!');
      await loadReviews();
    } catch (error) {
      console.error('Error deleting review:', error);
      alert('❌ Lỗi khi xóa đánh giá!');
    }
  };

  const handleEditReview = (review: Review) => {
    setEditingReview(review);
    setReviewForm({
      rating: review.rating,
      title: review.title || '',
      comment: review.comment,
    });
    setShowReviewForm(true);
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <p className="text-gray-600">Đang tải thông tin khách sạn...</p>
        </div>
        <Footer />
      </>
    );
  }

  if (!hotel) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Card className="text-center p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Không tìm thấy khách sạn
            </h2>
            <Button onClick={() => router.push('/search')}>
              Quay lại tìm kiếm
            </Button>
          </Card>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          {/* Hotel Header */}
          <Card className="mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <img
                  src={hotel.thumbnail}
                  alt={hotel.name}
                  className="w-full h-64 object-cover rounded-lg"
                />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  {hotel.name}
                </h1>
                <div className="space-y-2 text-gray-700">
                  <p className="flex items-center">
                    <span className="mr-2">📍</span>
                    {hotel.address}
                  </p>
                  <p className="flex items-center">
                    <span className="mr-2">📞</span>
                    {hotel.contact_phone}
                  </p>
                  <p className="flex items-center">
                    <span className="mr-2">⭐</span>
                    Đánh giá: {hotel.rating}/5
                  </p>
                  <p className="flex items-center">
                    <span className="mr-2">
                      {hotel.status === 1 ? '✅' : '❌'}
                    </span>
                    {hotel.status === 1 ? 'Đang hoạt động' : 'Tạm ngưng'}
                  </p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="mt-6 pt-6 border-t">
              <h2 className="text-xl font-bold text-gray-900 mb-3">Mô tả</h2>
              <p className="text-gray-700 whitespace-pre-line">
                {hotel.description}
              </p>
            </div>

            {/* Location */}
            <div className="mt-6 pt-6 border-t">
              <h2 className="text-xl font-bold text-gray-900 mb-3">Vị trí</h2>
              <p className="text-gray-700">
                Tọa độ: {hotel.latitude}, {hotel.longitude}
              </p>
            </div>

            {/* Contact Info */}
            <div className="mt-6 pt-6 border-t">
              <h2 className="text-xl font-bold text-gray-900 mb-3">
                Thông tin liên hệ
              </h2>
              <div className="space-y-2">
                <p className="text-gray-700">
                  <strong>Điện thoại:</strong> {hotel.contact_phone}
                </p>
                <p className="text-gray-700">
                  <strong>Địa chỉ:</strong> {hotel.address}
                </p>
              </div>
            </div>
          </Card>

          {/* Availability & Rooms Section */}
          <div className="mb-8">
            {/* Date Selection Sticky Bar */}
            <div className="sticky top-4 z-10 mb-6">
              <Card className="bg-white shadow-lg border-2 border-[#0071c2]">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-gray-900">
                    Kiểm tra phòng trống
                  </h2>
                  <div className="flex items-center gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">
                        Nhận phòng
                      </label>
                      <input
                        type="date"
                        value={searchDates.checkIn}
                        onChange={(e) =>
                          setSearchDates({ ...searchDates, checkIn: e.target.value })
                        }
                        min={new Date().toISOString().split('T')[0]}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0071c2] focus:border-[#0071c2] text-gray-900 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">
                        Trả phòng
                      </label>
                      <input
                        type="date"
                        value={searchDates.checkOut}
                        onChange={(e) =>
                          setSearchDates({ ...searchDates, checkOut: e.target.value })
                        }
                        min={searchDates.checkIn || new Date().toISOString().split('T')[0]}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0071c2] focus:border-[#0071c2] text-gray-900 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">
                        Số khách
                      </label>
                      <input
                        type="number"
                        value={searchDates.guests}
                        onChange={(e) =>
                          setSearchDates({
                            ...searchDates,
                            guests: parseInt(e.target.value),
                          })
                        }
                        min={1}
                        max={10}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0071c2] focus:border-[#0071c2] text-gray-900 text-sm w-20"
                      />
                    </div>
                    {searchDates.checkIn && searchDates.checkOut && (
                      <div className="text-sm font-semibold text-[#0071c2] bg-blue-50 px-4 py-2 rounded-lg">
                        {Math.ceil((new Date(searchDates.checkOut).getTime() - new Date(searchDates.checkIn).getTime()) / (1000 * 60 * 60 * 24))} đêm
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </div>

            {/* Room List */}
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Chọn phòng của bạn
            </h2>

            {!searchDates.checkIn || !searchDates.checkOut ? (
              <Card className="text-center py-12 bg-gradient-to-br from-gray-50 to-blue-50">
                <div className="text-6xl mb-4">📅</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Chọn ngày để xem phòng trống
                </h3>
                <p className="text-gray-600">
                  Nhập ngày nhận phòng và trả phòng ở thanh tìm kiếm phía trên
                </p>
              </Card>
            ) : roomTypes.length > 0 ? (
              <div className="space-y-4">
                {roomTypes
                  .filter((roomType) => roomType.max_guests >= searchDates.guests)
                  .map((roomType) => {
                    // Mock availability check - TODO: Replace with actual API call
                    const isAvailable = roomType.availability;
                    const isGuestsExceeded = searchDates.guests > roomType.max_guests;

                    return (
                      <div
                        key={roomType.type_id}
                        className={`border rounded-lg p-6 transition-all ${
                          isAvailable && !isGuestsExceeded
                            ? 'border-gray-200 hover:shadow-md hover:border-[#0071c2]'
                            : 'border-gray-200 bg-gray-50 opacity-75'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                              {roomType.type}
                            </h3>
                            <p className="text-gray-700 mb-3">
                              {roomType.description}
                            </p>
                            <div className="flex items-center gap-4 text-sm">
                              <span className="text-gray-600">
                                👥 Tối đa {roomType.max_guests} khách
                              </span>
                              {isAvailable && !isGuestsExceeded ? (
                                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full font-semibold text-xs">
                                  ✅ Còn phòng
                                </span>
                              ) : (
                                <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full font-semibold text-xs">
                                  ❌ Hết phòng
                                </span>
                              )}
                              <span className="text-gray-600">
                                📦 Còn lại: {roomType.quantity} phòng
                              </span>
                            </div>
                          </div>
                      <div className="text-right ml-6">
                        {roomType.price ? (
                          <div>
                            {/* Event Banner */}
                            {roomType.price.event && (
                              <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold px-3 py-1 rounded-full mb-2 inline-block">
                                🎉 {roomType.price.event}
                              </div>
                            )}

                            {/* Price Display */}
                            <div className="space-y-1">
                              {roomType.price.special_price ? (
                                <>
                                  <div className="text-lg text-gray-400 line-through">
                                    {roomType.price.basic_price.toLocaleString(
                                      'vi-VN'
                                    )}{' '}
                                    ₫
                                  </div>
                                  <div className="text-3xl font-bold text-orange-600 mb-1">
                                    {roomType.price.special_price.toLocaleString(
                                      'vi-VN'
                                    )}{' '}
                                    ₫
                                  </div>
                                </>
                              ) : (
                                <div className="text-3xl font-bold text-[#0071c2] mb-1">
                                  {roomType.price.basic_price.toLocaleString(
                                    'vi-VN'
                                  )}{' '}
                                  ₫
                                </div>
                              )}
                              <div className="text-sm text-gray-600">/ đêm</div>
                            </div>

                            {/* Discount Badge */}
                            {roomType.price.discount > 0 && (
                              <div className="inline-block bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full mt-2">
                                -{roomType.price.discount}% OFF
                              </div>
                            )}

                            {/* Date Range for Special Price */}
                            {roomType.price.special_price &&
                              roomType.price.start_date &&
                              roomType.price.end_date && (
                                <div className="text-xs text-gray-500 mt-2">
                                  📅 Áp dụng:{' '}
                                  {new Date(
                                    roomType.price.start_date
                                  ).toLocaleDateString('vi-VN')}{' '}
                                  -{' '}
                                  {new Date(
                                    roomType.price.end_date
                                  ).toLocaleDateString('vi-VN')}
                                </div>
                              )}
                          </div>
                        ) : (
                          <div className="text-gray-500">
                            Liên hệ để biết giá
                          </div>
                        )}

                            {/* Booking Button */}
                            <Button
                              className="mt-4 w-full"
                              onClick={() => {
                                // Redirect to booking page with room type and dates
                                router.push(
                                  `/booking?hotel_id=${hotel.hotel_id}&room_type_id=${roomType.type_id}&check_in=${searchDates.checkIn}&check_out=${searchDates.checkOut}&guests=${searchDates.guests}`
                                );
                              }}
                              disabled={!isAvailable || isGuestsExceeded}
                            >
                              {!isAvailable || isGuestsExceeded
                                ? '❌ Không khả dụng'
                                : '🛒 Đặt phòng online'}
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                {roomTypes.filter((rt) => rt.max_guests >= searchDates.guests).length === 0 && (
                  <Card className="text-center py-8 bg-yellow-50 border-yellow-200">
                    <div className="text-4xl mb-2">⚠️</div>
                    <p className="text-gray-700 font-semibold">
                      Không có phòng phù hợp với {searchDates.guests} khách.
                    </p>
                    <p className="text-gray-600 text-sm mt-2">
                      Vui lòng giảm số lượng khách hoặc liên hệ khách sạn: {hotel.contact_phone}
                    </p>
                  </Card>
                )}
              </div>
            ) : (
              <Card className="text-center py-12">
                <p className="text-gray-600 mb-4">
                  Chưa có thông tin phòng. Vui lòng liên hệ khách sạn để biết
                  thêm chi tiết.
                </p>
                <p className="text-gray-700">
                  <strong>Hotline:</strong> {hotel.contact_phone}
                </p>
              </Card>
            )}
          </div>

          {/* Reviews Section */}
          <div className="mt-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                ⭐ Đánh giá từ khách hàng ({reviews.length})
              </h2>
              {user && (
                <Button
                  onClick={() => {
                    setShowReviewForm(!showReviewForm);
                    setEditingReview(null);
                    setReviewForm({ rating: 5, title: '', comment: '' });
                  }}
                  variant="primary"
                  size="sm"
                >
                  ✍️ Viết đánh giá
                </Button>
              )}
            </div>

            {/* Review Form */}
            {showReviewForm && (
              <Card className="mb-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  {editingReview ? 'Chỉnh sửa đánh giá' : 'Đánh giá của bạn'}
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Đánh giá sao
                    </label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                          className={`text-3xl ${
                            star <= reviewForm.rating
                              ? 'text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        >
                          ⭐
                        </button>
                      ))}
                      <span className="ml-2 text-gray-600">
                        {reviewForm.rating}/5
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tiêu đề (tùy chọn)
                    </label>
                    <input
                      type="text"
                      value={reviewForm.title}
                      onChange={(e) =>
                        setReviewForm({ ...reviewForm, title: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Ví dụ: Khách sạn tuyệt vời!"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nội dung đánh giá *
                    </label>
                    <textarea
                      value={reviewForm.comment}
                      onChange={(e) =>
                        setReviewForm({ ...reviewForm, comment: e.target.value })
                      }
                      rows={5}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Chia sẻ trải nghiệm của bạn tại khách sạn..."
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button onClick={handleSubmitReview} variant="primary">
                      {editingReview ? 'Cập nhật' : 'Gửi đánh giá'}
                    </Button>
                    <Button
                      onClick={() => {
                        setShowReviewForm(false);
                        setEditingReview(null);
                        setReviewForm({ rating: 5, title: '', comment: '' });
                      }}
                      variant="outline"
                    >
                      Hủy
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {/* Reviews List */}
            {reviews.length === 0 ? (
              <Card className="text-center py-12">
                <div className="text-6xl mb-4">💬</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Chưa có đánh giá nào
                </h3>
                <p className="text-gray-600">
                  Hãy là người đầu tiên đánh giá khách sạn này!
                </p>
              </Card>
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <Card key={review.review_id} className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-gray-900">
                            {review.userName || 'Khách hàng'}
                          </span>
                          <div className="flex">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <span
                                key={i}
                                className={
                                  i < review.rating
                                    ? 'text-yellow-400'
                                    : 'text-gray-300'
                                }
                              >
                                ⭐
                              </span>
                            ))}
                          </div>
                        </div>
                        {review.title && (
                          <h4 className="font-semibold text-gray-900 mb-2">
                            {review.title}
                          </h4>
                        )}
                        <p className="text-sm text-gray-600">
                          {new Date(review.createdAt || new Date()).toLocaleDateString('vi-VN')}
                        </p>
                      </div>
                      {user && user.user_id === review.user_id && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditReview(review)}
                          >
                            ✏️ Sửa
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => handleDeleteReview(review.review_id)}
                          >
                            🗑️ Xóa
                          </Button>
                        </div>
                      )}
                    </div>
                    <p className="text-gray-700 whitespace-pre-line">
                      {review.comment}
                    </p>
                    {review.reply && (
                      <div className="mt-4 pl-6 border-l-4 border-blue-200 bg-blue-50 p-4 rounded">
                        <p className="text-sm font-semibold text-blue-900 mb-1">
                          📢 Phản hồi từ khách sạn:
                        </p>
                        <p className="text-sm text-blue-800">{review.reply.content}</p>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
      <HotelChat hotelId={hotel.hotel_id.toString()} hotelName={hotel.name} hotelImage={hotel.thumbnail} />
      <Footer />
    </>
  );
}
