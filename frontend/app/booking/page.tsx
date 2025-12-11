/**
 * Booking Page - Online Room Booking
 * Maps to: Booking, RoomType, RoomPrice tables
 */

'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { hotelsApi } from '@/lib/api/services';
import type { Hotel, RoomType, RoomPrice } from '@/types';

interface RoomTypeWithPrice extends RoomType {
  price?: RoomPrice;
}

function BookingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hotel_id = searchParams.get('hotel_id');
  const room_type_id = searchParams.get('room_type_id');
  const check_in = searchParams.get('check_in');
  const check_out = searchParams.get('check_out');
  const guests = searchParams.get('guests');

  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [roomType, setRoomType] = useState<RoomTypeWithPrice | null>(null);
  const [loading, setLoading] = useState(true);

  // Form data matching Booking table
  const [formData, setFormData] = useState({
    check_in_date: check_in || '',
    check_out_date: check_out || '',
    people: guests ? parseInt(guests) : 1,
    // Guest info
    fullName: '',
    email: '',
    phone: '',
    specialRequests: '',
  });

  useEffect(() => {
    if (!hotel_id || !room_type_id) {
      alert('Thiếu thông tin đặt phòng!');
      router.push('/search');
      return;
    }

    loadBookingData();
  }, [hotel_id, room_type_id]);

  const loadBookingData = async () => {
    try {
      // Load hotel info
      const hotelData = await hotelsApi.getById(hotel_id!);
      setHotel(hotelData);

      // Mock room type data - TODO: Replace with API call
      const mockRoomTypes: RoomTypeWithPrice[] = [
        {
          type_id: 1,
          hotel_id: parseInt(hotel_id!),
          type: 'Phòng Standard',
          availability: true,
          max_guests: 2,
          description: 'Phòng tiêu chuẩn với 1 giường đôi',
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
          hotel_id: parseInt(hotel_id!),
          type: 'Phòng Deluxe',
          availability: true,
          max_guests: 2,
          description: 'Phòng cao cấp với view đẹp',
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
          hotel_id: parseInt(hotel_id!),
          type: 'Phòng Suite',
          availability: true,
          max_guests: 4,
          description: 'Phòng suite sang trọng',
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
      ];

      const selectedRoom = mockRoomTypes.find(
        (r) => r.type_id === parseInt(room_type_id!)
      );
      setRoomType(selectedRoom || null);
    } catch (error) {
      console.error('Error loading booking data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateNights = () => {
    if (!formData.check_in_date || !formData.check_out_date) return 0;
    const checkIn = new Date(formData.check_in_date);
    const checkOut = new Date(formData.check_out_date);
    const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const calculateTotalPrice = () => {
    if (!roomType?.price) return 0;
    const nights = calculateNights();
    const pricePerNight = roomType.price.special_price || roomType.price.basic_price;
    return nights * pricePerNight;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate
    if (!formData.check_in_date || !formData.check_out_date) {
      alert('Vui lòng chọn ngày nhận và trả phòng!');
      return;
    }

    if (calculateNights() <= 0) {
      alert('Ngày trả phòng phải sau ngày nhận phòng!');
      return;
    }

    if (formData.people > (roomType?.max_guests || 0)) {
      alert(`Phòng này chỉ chứa tối đa ${roomType?.max_guests} khách!`);
      return;
    }

    // Create booking data matching Booking table schema
    const bookingData = {
      // user_id will be set by backend from auth
      user_id: null,
      room_id: roomType?.type_id, // TODO: Should select actual room_id, not type_id
      status: 'pending' as const,
      total_price: calculateTotalPrice(),
      check_in_date: formData.check_in_date,
      check_out_date: formData.check_out_date,
      created_at: new Date().toISOString().split('T')[0],
      people: formData.people,
    };

    console.log('Booking data:', bookingData);

    // TODO: Call API to create booking
    // await bookingsApi.create(bookingData);

    // Mock success - redirect to confirmation
    sessionStorage.setItem(
      'bookingConfirmation',
      JSON.stringify({
        bookingId: 'BK' + Date.now(),
        bookingDate: new Date().toISOString(),
        paymentStatus: 'pending',
        hotelName: hotel?.name,
        roomType: roomType?.type,
        guests: formData.people,
        checkIn: formData.check_in_date,
        checkOut: formData.check_out_date,
        roomPrice: roomType?.price?.special_price || roomType?.price?.basic_price || 0,
        nights: calculateNights(),
        paymentMethod: 'cash',
        guestInfo: {
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          specialRequests: formData.specialRequests,
        },
      })
    );

    router.push('/booking/confirmation');
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <p className="text-gray-600">Đang tải thông tin...</p>
        </div>
        <Footer />
      </>
    );
  }

  if (!hotel || !roomType) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Card className="text-center p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Không tìm thấy thông tin đặt phòng
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

  const nights = calculateNights();
  const totalPrice = calculateTotalPrice();

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-5xl">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Đặt phòng online
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Booking Form */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit}>
                <Card className="mb-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">
                    Thông tin đặt phòng
                  </h2>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Ngày nhận phòng *
                      </label>
                      <Input
                        type="date"
                        value={formData.check_in_date}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            check_in_date: e.target.value,
                          })
                        }
                        required
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Ngày trả phòng *
                      </label>
                      <Input
                        type="date"
                        value={formData.check_out_date}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            check_out_date: e.target.value,
                          })
                        }
                        required
                        min={formData.check_in_date || new Date().toISOString().split('T')[0]}
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Số khách *
                    </label>
                    <Input
                      type="number"
                      min={1}
                      max={roomType.max_guests}
                      value={formData.people}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          people: parseInt(e.target.value),
                        })
                      }
                      required
                    />
                    <p className="text-xs text-gray-600 mt-1">
                      Tối đa: {roomType.max_guests} khách
                    </p>
                  </div>
                </Card>

                <Card className="mb-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">
                    Thông tin khách hàng
                  </h2>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Họ và tên *
                      </label>
                      <Input
                        value={formData.fullName}
                        onChange={(e) =>
                          setFormData({ ...formData, fullName: e.target.value })
                        }
                        required
                        placeholder="Nguyễn Văn A"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                          Email *
                        </label>
                        <Input
                          type="email"
                          value={formData.email}
                          onChange={(e) =>
                            setFormData({ ...formData, email: e.target.value })
                          }
                          required
                          placeholder="email@example.com"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                          Số điện thoại *
                        </label>
                        <Input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) =>
                            setFormData({ ...formData, phone: e.target.value })
                          }
                          required
                          placeholder="0912345678"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Yêu cầu đặc biệt (tùy chọn)
                      </label>
                      <textarea
                        value={formData.specialRequests}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            specialRequests: e.target.value,
                          })
                        }
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0071c2] focus:border-[#0071c2] text-gray-900"
                        placeholder="Ví dụ: Phòng tầng cao, giường đơn..."
                      />
                    </div>
                  </div>
                </Card>

                <Button type="submit" className="w-full" size="lg">
                  Xác nhận đặt phòng
                </Button>
              </form>
            </div>

            {/* Booking Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Chi tiết đặt phòng
                </h2>

                {/* Hotel Info */}
                <div className="mb-4 pb-4 border-b">
                  <h3 className="font-bold text-gray-900 mb-2">{hotel.name}</h3>
                  <p className="text-sm text-gray-600">📍 {hotel.address}</p>
                  <p className="text-sm text-gray-600">📞 {hotel.contact_phone}</p>
                </div>

                {/* Room Info */}
                <div className="mb-4 pb-4 border-b">
                  <h3 className="font-bold text-gray-900 mb-2">{roomType.type}</h3>
                  <p className="text-sm text-gray-600">{roomType.description}</p>
                  <p className="text-sm text-gray-600 mt-2">
                    👥 Tối đa {roomType.max_guests} khách
                  </p>
                </div>

                {/* Price Info */}
                {roomType.price && (
                  <div className="mb-4 pb-4 border-b">
                    {roomType.price.event && (
                      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold px-3 py-1 rounded-full mb-2 inline-block">
                        🎉 {roomType.price.event}
                      </div>
                    )}

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Giá phòng/đêm:</span>
                        <span className="font-semibold text-gray-900">
                          {(roomType.price.special_price || roomType.price.basic_price).toLocaleString('vi-VN')} ₫
                        </span>
                      </div>

                      {roomType.price.special_price && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500 line-through">
                            Giá gốc:
                          </span>
                          <span className="text-gray-500 line-through">
                            {roomType.price.basic_price.toLocaleString('vi-VN')} ₫
                          </span>
                        </div>
                      )}

                      {roomType.price.discount > 0 && (
                        <div className="inline-block bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded">
                          Tiết kiệm {roomType.price.discount}%
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Calculation */}
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Số đêm:</span>
                    <span className="font-semibold text-gray-900">
                      {nights > 0 ? `${nights} đêm` : '-'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Số khách:</span>
                    <span className="font-semibold text-gray-900">
                      {formData.people} người
                    </span>
                  </div>
                </div>

                {/* Total */}
                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-gray-900">Tổng cộng:</span>
                    <span className="font-bold text-2xl text-[#0071c2]">
                      {nights > 0
                        ? totalPrice.toLocaleString('vi-VN') + ' ₫'
                        : '-'}
                    </span>
                  </div>
                  {nights > 0 && (
                    <p className="text-xs text-gray-600 text-right mt-1">
                      Đã bao gồm thuế và phí
                    </p>
                  )}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default function BookingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Đang tải...</p>
      </div>
    }>
      <BookingContent />
    </Suspense>
  );
}
