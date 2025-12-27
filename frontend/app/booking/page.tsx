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
import { hotelsApi, bookingsApi } from '@/lib/api/services';
import type { Hotel, RoomType, RoomPrice } from '@/types';

interface RoomTypeWithPrice extends RoomType {
  price?: RoomPrice;
}

function BookingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hotel_id = searchParams.get('hotel_id');
  const rooms_param = searchParams.get('rooms'); // Format: "typeId:qty,typeId:qty"
  const check_in = searchParams.get('check_in');
  const check_out = searchParams.get('check_out');
  const guests = searchParams.get('guests');

  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [selectedRoomTypes, setSelectedRoomTypes] = useState<Array<{ roomType: RoomTypeWithPrice; quantity: number }>>([]);
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
    if (!hotel_id || !rooms_param) {
      alert('Thiếu thông tin đặt phòng!');
      router.push('/search');
      return;
    }

    loadBookingData();
  }, [hotel_id, rooms_param]);

  const loadBookingData = async () => {
    try {
      // Load hotel info
      const hotelData = await hotelsApi.getById(hotel_id!);
      setHotel(hotelData);

      // Load real room types from API
      const roomTypesData = await hotelsApi.getRoomTypes(hotel_id!);

      // Transform API response to match expected format
      const transformedRoomTypes: RoomTypeWithPrice[] = roomTypesData.map((rt: any) => ({
        type_id: rt.type_id,
        hotel_id: rt.hotel_id,
        type: rt.type,
        availability: rt.availability,
        max_guests: rt.max_guests,
        description: rt.description,
        quantity: rt.quantity,
        services: rt.services || [],
        price: rt.RoomPrice ? {
          price_id: rt.RoomPrice.price_id,
          type_id: rt.RoomPrice.type_id,
          start_date: rt.RoomPrice.start_date,
          end_date: rt.RoomPrice.end_date,
          special_price: rt.RoomPrice.special_price ? parseInt(rt.RoomPrice.special_price) : null,
          event: rt.RoomPrice.event,
          basic_price: parseInt(rt.RoomPrice.basic_price),
          discount: rt.RoomPrice.discount,
        } : undefined,
      }));

      // Parse rooms parameter: "typeId:qty,typeId:qty"
      const roomSelections = rooms_param!.split(',').map(selection => {
        const [typeId, qty] = selection.split(':').map(Number);
        return { typeId, qty };
      });

      // Build selected room types array
      const selected = roomSelections
        .map(({ typeId, qty }) => {
          const roomType = transformedRoomTypes.find(rt => rt.type_id === typeId);
          return roomType ? { roomType, quantity: qty } : null;
        })
        .filter((item): item is { roomType: RoomTypeWithPrice; quantity: number } => item !== null);

      setSelectedRoomTypes(selected);
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
    const nights = calculateNights();
    let total = 0;

    selectedRoomTypes.forEach(({ roomType, quantity }) => {
      if (roomType.price) {
        const pricePerNight = roomType.price.special_price || roomType.price.basic_price;
        total += nights * pricePerNight * quantity;
      }
    });

    return total;
  };

  const getTotalRooms = () => {
    return selectedRoomTypes.reduce((sum, { quantity }) => sum + quantity, 0);
  };

  const getTotalCapacity = () => {
    return selectedRoomTypes.reduce((sum, { roomType, quantity }) =>
      sum + (roomType.max_guests * quantity), 0
    );
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

    const totalCapacity = getTotalCapacity();
    if (formData.people > totalCapacity) {
      alert(`Tổng sức chứa của các phòng đã chọn (${totalCapacity} khách) không đủ cho ${formData.people} khách!`);
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

    // Call API to create booking
    try {
      const result = await bookingsApi.create(bookingData);

      // Store booking info for confirmation page
      sessionStorage.setItem(
        'bookingConfirmation',
        JSON.stringify({
          bookingId: result.booking_id || 'BK' + Date.now(),
          bookingDate: result.created_at || new Date().toISOString(),
          paymentStatus: result.status || 'pending',
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
    } catch (error) {
      console.error('Error creating booking:', error);
      alert('Lỗi khi tạo đặt phòng. Vui lòng thử lại!');
    }
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

  if (!hotel || selectedRoomTypes.length === 0) {
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
                      max={getTotalCapacity()}
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
                      Tối đa: {getTotalCapacity()} khách ({getTotalRooms()} phòng)
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

                {/* Selected Rooms Info */}
                <div className="mb-4 pb-4 border-b">
                  <h3 className="font-bold text-gray-900 mb-3">Phòng đã chọn</h3>
                  <div className="space-y-3">
                    {selectedRoomTypes.map(({ roomType, quantity }) => (
                      <div key={roomType.type_id} className="bg-blue-50 p-3 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 text-sm">
                              {roomType.type}
                            </h4>
                            <p className="text-xs text-gray-600">
                              👥 {roomType.max_guests} khách/phòng
                            </p>
                          </div>
                          <span className="bg-[#0071c2] text-white text-xs font-bold px-2 py-1 rounded">
                            x{quantity}
                          </span>
                        </div>

                        {/* Room Services */}
                        {roomType.services && roomType.services.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {roomType.services.slice(0, 3).map((service) => {
                              const iconMap: { [key: string]: string } = {
                                'TV': '📺',
                                'Minibar': '🍷',
                                'Két sắt': '🔒',
                                'Điều hòa': '❄️',
                                'Bồn tắm': '🛁',
                                'Ban công': '🌅',
                                'WiFi': '📶',
                              };
                              const icon = iconMap[service.name] || '✨';
                              return (
                                <span
                                  key={service.service_id}
                                  className="text-xs text-gray-600"
                                >
                                  {icon}
                                </span>
                              );
                            })}
                          </div>
                        )}

                        {/* Price per room type */}
                        {roomType.price && (
                          <div className="flex justify-between text-xs border-t border-blue-200 pt-2">
                            <span className="text-gray-600">
                              {(roomType.price.special_price || roomType.price.basic_price).toLocaleString('vi-VN')} ₫/đêm
                            </span>
                            <span className="font-semibold text-gray-900">
                              {quantity} phòng
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 p-2 bg-gray-50 rounded text-xs">
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-600">Tổng số phòng:</span>
                      <span className="font-semibold text-gray-900">{getTotalRooms()} phòng</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Sức chứa tối đa:</span>
                      <span className="font-semibold text-gray-900">{getTotalCapacity()} khách</span>
                    </div>
                  </div>
                </div>

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
