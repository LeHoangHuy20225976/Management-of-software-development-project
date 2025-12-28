'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { hotelManagerApi } from '@/lib/api/services';
import { apiClient } from '@/lib/api/client';
import { API_CONFIG } from '@/lib/api/config';

type RoomsByHotelResponseItem = {
  roomData?: Record<string, unknown>;
  roomTypeData?: Record<string, unknown>;
  priceData?: Record<string, unknown> | null;
};

type DisplayRoom = {
  id: string;
  name?: string;
  location?: string;
  type: string;
  maxGuests: number;
  availability: boolean;
  price?: number;
};

const toNumberOrNull = (v: unknown): number | null => {
  if (typeof v === 'number') return Number.isFinite(v) ? v : null;
  if (typeof v === 'string' && v.trim() !== '') {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }
  return null;
};

const convertRoom = (item: RoomsByHotelResponseItem): DisplayRoom => {
  const roomData = item.roomData ?? {};
  const roomTypeData = item.roomTypeData ?? {};
  const priceData = item.priceData ?? {};

  return {
    id: String(roomData.room_id ?? ''),
    name: typeof roomData.name === 'string' ? roomData.name : undefined,
    location: typeof roomData.location === 'string' ? roomData.location : undefined,
    type: String(roomTypeData.type ?? roomTypeData.name ?? 'Unknown type'),
    maxGuests: Number(roomTypeData.max_guests ?? 0) || 0,
    availability: Boolean(roomData.isAvailable ?? roomData.availability ?? true),
    price: toNumberOrNull(priceData.price) ?? 0,
  };
};

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
      const items = await apiClient.get<RoomsByHotelResponseItem[]>(
        API_CONFIG.ENDPOINTS.VIEW_ALL_ROOMS,
        { hotel_id: hotelId },
      );
      const displayRooms = (items ?? [])
        .map((it) => convertRoom(it))
        .filter((r) => r.id !== '');
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
      alert('Backend chưa hỗ trợ xoá phòng ở màn này.');
      return;
      // loadRooms(selectedHotelId);
    } catch (error) {
      console.error('Error deleting room:', error);
      alert('Đã có lỗi khi xóa phòng!');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <div className="text-center py-8">
            <p className="text-gray-900 font-medium">Đang tải danh sách phòng...</p>
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

  const totalRooms = rooms.length;
  const availableRooms = rooms.filter((r) => r.availability).length;
  const occupiedRooms = Math.max(totalRooms - availableRooms, 0);
  const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

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
            <Button variant="outline">Lịch phòng trống</Button>
          </Link>
          <Link href="/hotel-manager/rooms/types">
            <Button variant="outline">Quản lý loại phòng</Button>
          </Link>
          <Link href="/hotel-manager/rooms/create">
            <Button>+ Thêm phòng mới</Button>
          </Link>
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

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <div className="text-center">
            <div className="text-4xl mb-2 font-bold text-gray-700">Phòng</div>
            <div className="text-3xl font-bold text-[#0071c2]">{totalRooms}</div>
            <div className="text-gray-900 font-medium">Tổng số phòng</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-4xl mb-2 font-bold text-green-600">Trống</div>
            <div className="text-3xl font-bold text-green-600">{availableRooms}</div>
            <div className="text-gray-900 font-medium">Phòng trống</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-4xl mb-2 font-bold text-orange-600">Đã đặt</div>
            <div className="text-3xl font-bold text-orange-600">{occupiedRooms}</div>
            <div className="text-gray-900 font-medium">Đang có khách</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-4xl mb-2 font-bold text-blue-600">Tỉ lệ</div>
            <div className="text-3xl font-bold text-blue-600">{occupancyRate}%</div>
            <div className="text-gray-900 font-medium">Tỷ lệ lấp đầy</div>
          </div>
        </Card>
      </div>

      <div className="flex space-x-3">
        <Button
          variant={filter === 'all' ? 'primary' : 'outline'}
          onClick={() => setFilter('all')}
          className={filter === 'all' ? 'bg-[#0071c2] text-white' : 'text-gray-800'}
        >
          Tất cả ({rooms.length})
        </Button>
        <Button
          variant={filter === 'available' ? 'primary' : 'outline'}
          onClick={() => setFilter('available')}
          className={filter === 'available' ? 'bg-green-600 text-white' : 'text-gray-800'}
        >
          Đang trống ({rooms.filter((r) => r.availability).length})
        </Button>
        <Button
          variant={filter === 'full' ? 'primary' : 'outline'}
          onClick={() => setFilter('full')}
          className={filter === 'full' ? 'bg-red-600 text-white' : 'text-gray-800'}
        >
          Đang có khách ({rooms.filter((r) => !r.availability).length})
        </Button>
      </div>

      {filteredRooms.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredRooms.map((room) => (
            <Card key={room.id}>
              <div className="flex gap-4">
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        {room.name ? `${room.name} • ${room.type}` : room.type}
                      </h3>
                      {room.location && (
                        <p className="text-sm text-gray-700 mt-1">Vị trí: {room.location}</p>
                      )}
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-medium ${
                        room.availability
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {room.availability ? 'Đang trống' : 'Đang có khách'}
                    </span>
                  </div>

                  <div className="space-y-1 text-sm text-gray-800 mb-3">
                    <p>Số khách tối đa: {room.maxGuests || 'N/A'}</p>
                    <p className="font-semibold text-[#0071c2] text-lg">
                      {formatCurrency(room.price)}/đêm
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Link href={`/hotel-manager/rooms/${room.id}/edit`}>
                      <Button variant="outline" size="sm">
                        Chỉnh sửa
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteRoom(room.id, room.name ?? room.type)}
                      className="text-red-600 border-red-200 hover:bg-red-50"
                    >
                      Xóa
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
            <div className="text-2xl font-bold mb-4">Phòng</div>
            <p className="text-gray-900 font-medium mb-4">
              {filter === 'all'
                ? 'Chưa có phòng nào'
                : filter === 'available'
                  ? 'Không có phòng trống'
                  : 'Không có phòng đang có khách'}
            </p>
            <Link href="/hotel-manager/rooms/create">
              <Button>+ Thêm phòng mới</Button>
            </Link>
          </div>
        </Card>
      )}
    </div>
  );
}
