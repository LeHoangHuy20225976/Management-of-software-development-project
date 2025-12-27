'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { hotelManagerApi } from '@/lib/api/services';
import { apiClient } from '@/lib/api/client';
import { API_CONFIG } from '@/lib/api/config';
import type { RoomType } from '@/types';

type DisplayRoom = {
  id: string;
  type: string;
  description: string;
  maxGuests: number;
  availability: boolean;
  quantity: number;
  size?: string;
  beds?: string;
  price?: number;
  available?: number;
  total?: number;
  amenities?: string[];
};

const convertRoomType = (roomType: RoomType): DisplayRoom => ({
  id: String(roomType.type_id),
  type: roomType.type,
  description: roomType.description ?? '',
  maxGuests: roomType.max_guests,
  availability: Boolean(roomType.availability),
  quantity: roomType.quantity ?? 0,
  size: roomType.size ? `${roomType.size}m²` : undefined,
  beds: roomType.beds ?? undefined,
  // Display: prefer `special_price` if present, otherwise `basic_price` (values might be BIGINT strings).
  price: (() => {
    const rt = roomType as any;
    const priceData = rt?.priceData ?? rt?.RoomPrice ?? rt?.roomPrice ?? null;
    const toNumberOrNull = (v: unknown): number | null => {
      if (typeof v === 'number') return Number.isFinite(v) ? v : null;
      if (typeof v === 'string' && v.trim() !== '') {
        const n = Number(v);
        return Number.isFinite(n) ? n : null;
      }
      return null;
    };
    const special = toNumberOrNull(priceData?.special_price);
    const basic = toNumberOrNull(priceData?.basic_price);
    const fallback = toNumberOrNull(priceData?.price);
    return special ?? basic ?? fallback ?? 0;
  })(),
  available: roomType.available ?? roomType.quantity ?? 0,
  total: roomType.quantity ?? 0,
  amenities: roomType.amenities ?? [],
});

export default function HotelRoomsPage() {
  const [rooms, setRooms] = useState<DisplayRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'available' | 'full'>('all');
  const [hotels, setHotels] = useState<Array<Record<string, unknown>>>([]);
  const [selectedHotelId, setSelectedHotelId] = useState<string>('');

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
      } catch (error) {
        console.error('Error loading hotels:', error);
        alert('Lỗi khi tải danh sách khách sạn!');
      } finally {
        setLoading(false);
      }
    };

    loadHotels();
  }, []);

  useEffect(() => {
    if (!selectedHotelId) return;
    loadRooms(selectedHotelId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedHotelId]);

  const loadRooms = async (hotelId: string) => {
    try {
      setLoading(true);
      const roomTypes = await apiClient.get<RoomType[]>(API_CONFIG.ENDPOINTS.VIEW_ROOM_TYPES, {
        hotel_id: hotelId,
      });

      const displayRooms = roomTypes.map((rt) => convertRoomType(rt));

      setRooms(displayRooms);
    } catch (error) {
      console.error('Error loading rooms:', error);
      alert('Có lỗi khi tải danh sách phòng!');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRoom = async (roomId: string, roomName: string) => {
    if (!confirm(`Bạn có chắc muốn xóa "${roomName}"?`)) {
      return;
    }

    try {
      alert('Backend chưa hỗ trợ xoá loại phòng ở màn này.');
      return;
      // alert('✅ Xóa phòng thành công!');
      // loadRooms(); // Reload list
    } catch (error) {
      console.error('Error deleting room:', error);
      alert('❌ Có lỗi khi xóa phòng!');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <div className="text-center py-8">
            <p className="text-gray-900 font-medium">
              ⏳ Đang tải danh sách phòng...
            </p>
          </div>
        </Card>
      </div>
    );
  }

  const filteredRooms =
    filter === 'all'
      ? rooms
      : filter === 'available'
      ? rooms.filter((r) => r.availability)
      : rooms.filter((r) => !r.availability);

  const totalRooms = rooms.reduce((sum, r) => sum + (r.quantity || 0), 0);
  const availableRooms = rooms.reduce(
    (sum, r) => sum + (r.availability ? r.quantity || 0 : 0),
    0
  );
  const occupiedRooms = Math.max(totalRooms - availableRooms, 0);
  const occupancyRate =
    totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

  // Format currency helper
  const formatCurrency = (amount: number | undefined) => {
    if (amount === undefined || amount === 0) return 'Liên hệ';
    return amount.toLocaleString('vi-VN') + '₫';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Quản lý phòng</h1>
        <div className="flex gap-3">
          <Link href="/hotel-manager/rooms/inventory">
            <Button variant="outline">📅 Lịch phòng trống</Button>
          </Link>
          <Link href="/hotel-manager/rooms/types">
            <Button variant="outline">📋 Quản lý loại phòng</Button>
          </Link>
          <Link href="/hotel-manager/rooms/create">
            <Button>+ Thêm loại phòng mới</Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <div className="text-center">
            <div className="text-4xl mb-2">🏨</div>
            <div className="text-3xl font-bold text-[#0071c2]">
              {totalRooms}
            </div>
            <div className="text-gray-900 font-medium">Tổng số phòng</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-4xl mb-2">✅</div>
            <div className="text-3xl font-bold text-green-600">
              {availableRooms}
            </div>
            <div className="text-gray-900 font-medium">Phòng trống</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-4xl mb-2">📋</div>
            <div className="text-3xl font-bold text-yellow-600">
              {occupiedRooms}
            </div>
            <div className="text-gray-900 font-medium">Đã đặt</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-4xl mb-2">📊</div>
            <div className="text-3xl font-bold text-blue-600">
              {occupancyRate}%
            </div>
            <div className="text-gray-900 font-medium">Tỷ lệ lấp đầy</div>
          </div>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-3">
        <Button
          variant={filter === 'all' ? 'primary' : 'outline'}
          onClick={() => setFilter('all')}
          className={
            filter === 'all' ? 'bg-[#0071c2] text-white' : 'text-gray-800'
          }
        >
          Tất cả ({rooms.length})
        </Button>
        <Button
          variant={filter === 'available' ? 'primary' : 'outline'}
          onClick={() => setFilter('available')}
          className={
            filter === 'available' ? 'bg-green-600 text-white' : 'text-gray-800'
          }
        >
          Đang mở ({rooms.filter((r) => r.availability).length})
        </Button>
        <Button
          variant={filter === 'full' ? 'primary' : 'outline'}
          onClick={() => setFilter('full')}
          className={
            filter === 'full' ? 'bg-red-600 text-white' : 'text-gray-800'
          }
        >
          Tạm ngưng ({rooms.filter((r) => !r.availability).length})
        </Button>
      </div>

      <Card>
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          <div className="text-sm font-semibold text-gray-900">Khách sạn</div>
          <select
            value={selectedHotelId}
            onChange={(e) => setSelectedHotelId(e.target.value)}
            className="w-full md:w-[420px] px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0071c2] focus:border-[#0071c2] text-gray-900 disabled:bg-gray-100"
            disabled={hotels.length === 0}
          >
            {hotels.length === 0 ? (
              <option value="">Chưa có khách sạn</option>
            ) : (
              hotels.map((h) => (
                <option
                  key={String((h as any).hotel_id ?? (h as any).id)}
                  value={String((h as any).hotel_id ?? (h as any).id)}
                >
                  {String((h as any).name ?? 'Unnamed hotel')}
                </option>
              ))
            )}
          </select>
        </div>
      </Card>

      {/* Rooms List */}
      {filteredRooms.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredRooms.map((room) => (
            <Card key={room.id}>
              <div className="flex gap-4">
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        {room.type}
                      </h3>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-medium ${
                        room.availability
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {room.availability ? 'Đang mở' : 'Tạm ngưng'}
                    </span>
                  </div>

                  <div className="space-y-1 text-sm text-gray-800 mb-3">
                    <p>
                      📏 {room.size || 'N/A'} • 🛏️ {room.beds || 'N/A'} • 👥 {room.maxGuests}{' '}
                      khách
                    </p>
                    <p className="font-semibold text-[#0071c2] text-lg">
                      {formatCurrency(room.price)}/đêm
                    </p>
                    <p>
                      Trống:{' '}
                      <span
                        className={`font-semibold ${
                          (room.available ?? 0) > 0 ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {room.available ?? 0}/{room.total ?? 0}
                      </span>
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-3">
                    {(room.amenities || []).slice(0, 3).map((amenity: string) => (
                      <span
                        key={amenity}
                        className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium"
                      >
                        {amenity}
                      </span>
                    ))}
                    {(room.amenities || []).length > 3 && (
                      <span className="text-xs text-gray-600">
                        +{(room.amenities || []).length - 3} khác
                      </span>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Link href={`/hotel-manager/rooms/${room.id}/edit`}>
                      <Button variant="outline" size="sm">
                        ✏️ Chỉnh sửa
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteRoom(room.id, room.type)}
                      className="text-red-600 border-red-200 hover:bg-red-50"
                    >
                      🗑️ Xóa
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🏨</div>
            <p className="text-gray-900 font-medium mb-4">
              {filter === 'all'
                ? 'Chưa có loại phòng nào'
                : filter === 'available'
                ? 'Không có phòng trống'
                : 'Không có phòng nào hết'}
            </p>
            <Link href="/hotel-manager/rooms/create">
              <Button>+ Thêm loại phòng mới</Button>
            </Link>
          </div>
        </Card>
      )}
    </div>
  );
}
