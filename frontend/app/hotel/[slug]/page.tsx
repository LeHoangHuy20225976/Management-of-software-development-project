'use client';

import { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { amenitiesList } from '@/lib/mock/data';
import { formatCurrency, formatStars } from '@/lib/utils/format';
import { bookingsApi, hotelsApi } from '@/lib/api/services';
import type { Hotel } from '@/types';

export default function HotelDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [loading, setLoading] = useState(true);
  const [nights, setNights] = useState<number>(0);
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [isBooking, setIsBooking] = useState(false);

  useEffect(() => {
    const loadHotel = async () => {
      try {
        const data = await hotelsApi.getBySlug(resolvedParams.slug);
        setHotel(data);
      } catch (error) {
        console.error('Error loading hotel:', error);
      } finally {
        setLoading(false);
      }
    };
    loadHotel();
  }, [resolvedParams.slug]);

  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(2);

  const calcNights = (start: string, end: string) => {
    if (!start || !end) return 0;
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diff = endDate.getTime() - startDate.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  useEffect(() => {
    if (!hotel) return;

    const newNights = calcNights(checkIn, checkOut);
    setNights(newNights);

    // Calculate room price based on selectedRoom and hotel.basePrice
    if (selectedRoom && newNights > 0) {
      let roomPrice = hotel.basePrice;
      if (selectedRoom === '2') {
        roomPrice = hotel.basePrice * 1.3;
      } else if (selectedRoom === '3') {
        roomPrice = hotel.basePrice * 1.8;
      }
      setTotalPrice(roomPrice * newNights);
    } else {
      setTotalPrice(0);
    }
  }, [checkIn, checkOut, selectedRoom, hotel]);

  const handleBook = () => {
    if (!hotel) return;
    if (!selectedRoom) {
      alert('Vui lòng chọn loại phòng');
      return;
    }
    if (!checkIn || !checkOut) {
      alert('Vui lòng chọn ngày nhận và trả phòng');
      return;
    }
    const stayNights = calcNights(checkIn, checkOut);
    if (stayNights <= 0) {
      alert('Ngày trả phòng phải sau ngày nhận phòng');
      return;
    }

    // Calculate room price and name
    let roomPrice = hotel.basePrice;
    let roomName = 'Phòng Standard';
    if (selectedRoom === '2') {
      roomPrice = hotel.basePrice * 1.3;
      roomName = 'Phòng Deluxe';
    } else if (selectedRoom === '3') {
      roomPrice = hotel.basePrice * 1.8;
      roomName = 'Phòng Suite';
    }

    // Navigate to checkout with booking info
    const checkoutParams = new URLSearchParams({
      hotelId: hotel.id,
      hotelName: hotel.name,
      hotelImage: hotel.thumbnail,
      hotelSlug: hotel.slug,
      roomId: selectedRoom,
      roomType: roomName,
      roomPrice: roomPrice.toString(),
      checkIn,
      checkOut,
      nights: stayNights.toString(),
      guests: guests.toString(),
    });

    router.push(`/checkout?${checkoutParams.toString()}`);
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

  if (!hotel) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 py-12">
          <div className="container mx-auto px-4">
            <Card className="text-center py-12">
              <div className="text-6xl mb-4">🏨</div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Không tìm thấy khách sạn
              </h1>
              <p className="text-gray-600 mb-6">
                Khách sạn này không tồn tại hoặc đã bị xóa
              </p>
              <Link href="/search">
                <Button>Quay lại tìm kiếm</Button>
              </Link>
            </Card>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const rooms = [
    {
      id: '1',
      name: 'Phòng Standard',
      price: hotel.basePrice,
      size: '25m²',
      bed: '1 giường đôi',
      guests: 2,
    },
    {
      id: '2',
      name: 'Phòng Deluxe',
      price: hotel.basePrice * 1.3,
      size: '32m²',
      bed: '1 giường king',
      guests: 2,
    },
    {
      id: '3',
      name: 'Phòng Suite',
      price: hotel.basePrice * 1.8,
      size: '45m²',
      bed: '1 giường king + Sofa',
      guests: 3,
    },
  ];

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50">
        <section className="relative h-96 md:h-[500px] bg-gray-900">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url('${hotel.thumbnail}')` }}
          />
          <div className="absolute inset-0 bg-black/30" />
          <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
            <div className="container mx-auto">
              <div className="inline-block bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-semibold mb-3">
                {formatStars(hotel.stars)}
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-2">
                {hotel.name}
              </h1>
              <p className="text-lg text-white/90 flex items-center">
                📍 {hotel.address}
              </p>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Tổng quan
                  </h2>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">⭐</span>
                    <span className="text-2xl font-bold text-gray-900">
                      {hotel.rating}
                    </span>
                    <span className="text-sm text-gray-600">
                      ({hotel.reviewCount} đánh giá)
                    </span>
                  </div>
                </div>
                <p className="text-gray-700 leading-relaxed">
                  {hotel.description}
                </p>
              </Card>

              <Card>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Tiện ích
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {hotel.amenities.map((amenityId) => {
                    const amenity = amenitiesList.find(
                      (a) => a.id === amenityId
                    );
                    return amenity ? (
                      <div
                        key={amenity.id}
                        className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg"
                      >
                        <span className="text-2xl">{amenity.icon}</span>
                        <span className="text-sm font-medium text-gray-900">
                          {amenity.name}
                        </span>
                      </div>
                    ) : null;
                  })}
                </div>
              </Card>

              <Card>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Chọn phòng
                </h2>
                <div className="space-y-4">
                  {rooms.map((room) => (
                    <div
                      key={room.id}
                      className={`p-6 border-2 rounded-xl transition-all cursor-pointer ${
                        selectedRoom === room.id
                          ? 'border-[#0071c2] bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedRoom(room.id)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-900 mb-2">
                            {room.name}
                          </h3>
                          <div className="grid grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
                            <div>📏 {room.size}</div>
                            <div>🛏️ {room.bed}</div>
                            <div>👥 {room.guests} người</div>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                              ✓ Miễn phí hủy
                            </span>
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              ✓ Bao gồm ăn sáng
                            </span>
                          </div>
                        </div>
                        <div className="text-right ml-4">
                          <div className="text-3xl font-bold text-[#0071c2]">
                            {formatCurrency(room.price)}
                          </div>
                          <div className="text-sm text-gray-600">/ đêm</div>
                          {selectedRoom === room.id && nights > 0 && (
                            <div className="text-sm text-blue-600 font-semibold mt-1">
                              {nights} đêm:{' '}
                              {formatCurrency(room.price * nights)}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Đánh giá
                </h2>
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="pb-4 border-b border-gray-200 last:border-0"
                    >
                      <div className="flex items-start gap-3 mb-2">
                        <div className="w-10 h-10 bg-[#0071c2] rounded-full flex items-center justify-center text-white font-bold">
                          U{i}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-bold text-gray-900">
                              Người dùng {i}
                            </h4>
                            <span className="text-sm text-gray-500">
                              2 ngày trước
                            </span>
                          </div>
                          <div className="flex items-center gap-1 mb-2">
                            <span className="text-yellow-500">⭐⭐⭐⭐⭐</span>
                            <span className="text-sm font-semibold text-gray-900">
                              5.0
                            </span>
                          </div>
                          <p className="text-gray-700">
                            Khách sạn rất đẹp, sạch sẽ và nhân viên thân thiện.
                            Sẽ quay lại lần sau!
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            <div className="lg:col-span-1">
              <div className="sticky top-20">
                <Card>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    Đặt phòng
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Nhận phòng
                      </label>
                      <input
                        type="date"
                        value={checkIn}
                        onChange={(e) => setCheckIn(e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0071c2] focus:border-[#0071c2] transition-all text-gray-900"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Trả phòng
                      </label>
                      <input
                        type="date"
                        value={checkOut}
                        onChange={(e) => setCheckOut(e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0071c2] focus:border-[#0071c2] transition-all text-gray-900"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Số khách
                      </label>
                      <select
                        value={guests}
                        onChange={(e) => setGuests(Number(e.target.value))}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0071c2] focus:border-[#0071c2] transition-all text-gray-900 font-medium"
                      >
                        {[1, 2, 3, 4, 5, 6].map((n) => (
                          <option key={n} value={n}>
                            {n} người
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="pt-4 border-t border-gray-200">
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-600">Giá phòng</span>
                        <span className="font-semibold text-gray-900">
                          {formatCurrency(
                            totalPrice > 0 ? totalPrice : hotel.basePrice
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-600">Thuế & phí (10%)</span>
                        <span className="font-semibold text-gray-900">
                          {formatCurrency(
                            (totalPrice > 0 ? totalPrice : hotel.basePrice) *
                              0.1
                          )}
                        </span>
                      </div>
                      <div className="pt-2 border-t border-gray-200 flex justify-between">
                        <span className="font-bold text-gray-900">Tổng</span>
                        <span className="text-2xl font-bold text-[#0071c2]">
                          {formatCurrency(
                            (totalPrice > 0 ? totalPrice : hotel.basePrice) *
                              1.1
                          )}
                        </span>
                      </div>
                    </div>

                    <Button
                      className="w-full"
                      disabled={
                        !selectedRoom ||
                        !checkIn ||
                        !checkOut ||
                        nights <= 0 ||
                        isBooking
                      }
                      onClick={handleBook}
                    >
                      {isBooking
                        ? 'Đang xử lý...'
                        : !selectedRoom
                        ? 'Chọn phòng để đặt'
                        : nights <= 0
                        ? 'Chọn ngày nhận/trả phòng'
                        : 'Đặt ngay'}
                    </Button>

                    <p className="text-xs text-center text-gray-500">
                      Miễn phí hủy trong 24 giờ
                    </p>
                  </div>
                </Card>

                <Card className="mt-4">
                  <h4 className="font-bold text-gray-900 mb-3">Cần hỗ trợ?</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-700">
                      <span>📞</span>
                      <span>1900-xxxx</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <span>📧</span>
                      <span>support@vietstay.vn</span>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
