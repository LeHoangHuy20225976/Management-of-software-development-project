/**
 * Hotel Rooms Management
 * FE4: Hotel Manager Portal
 */

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { ROUTES } from '@/lib/routes';
import { hotelsApi } from '@/lib/api/services';
import type { RoomType } from '@/types';

type DisplayRoom = {
  id: string;
  type: string;
  description: string;
  maxGuests: number;
  quantity: number;
  availability: boolean;
  amenities?: string[];
};

export default function HotelRoomsPage() {
  const [rooms, setRooms] = useState<DisplayRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'available' | 'full'>('all');

  useEffect(() => {
    const loadRooms = async () => {
      try {
        const hotelId = '1';
        const data = await hotelsApi.getRooms(hotelId);
        const normalized = data.map<DisplayRoom>((room: RoomType) => ({
          id: String(room.type_id),
          type: room.type,
          description: room.description ?? '',
          maxGuests: room.max_guests,
          quantity: room.quantity ?? 0,
          availability: Boolean(room.availability),
          amenities: room.amenities ?? [],
        }));
        setRooms(normalized);
      } catch (error) {
        console.error('Error loading rooms', error);
        setRooms([]);
      } finally {
        setLoading(false);
      }
    };

    loadRooms();
  }, []);

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Quản lý phòng</h1>
        <Link href={ROUTES.HOTEL.ROOMS + '/create'}>
          <Button>+ Thêm loại phòng mới</Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <div className="text-center">
            <div className="text-4xl mb-2">🏨</div>
            <div className="text-3xl font-bold text-[#0071c2]">
              {totalRooms}
            </div>
            <div className="text-gray-600">Tổng số phòng</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-4xl mb-2">✅</div>
            <div className="text-3xl font-bold text-green-600">
              {availableRooms}
            </div>
            <div className="text-gray-600">Phòng trống</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-4xl mb-2">🔒</div>
            <div className="text-3xl font-bold text-red-600">
              {occupiedRooms}
            </div>
            <div className="text-gray-600">Đã đặt</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-4xl mb-2">📊</div>
            <div className="text-3xl font-bold text-[#0071c2]">
              {Math.round((occupiedRooms / totalRooms) * 100)}%
            </div>
            <div className="text-gray-600">Tỷ lệ lấp đầy</div>
          </div>
        </Card>
      </div>

      {/* Filter */}
      <Card>
        <div className="flex space-x-3">
          <Button
            variant={filter === 'all' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            Tất cả ({rooms.length})
          </Button>
          <Button
            variant={filter === 'available' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setFilter('available')}
          >
            Đang mở ({rooms.filter((r) => r.availability).length})
          </Button>
          <Button
            variant={filter === 'full' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setFilter('full')}
          >
            Tạm ngưng ({rooms.filter((r) => !r.availability).length})
          </Button>
        </div>
      </Card>

      {/* Rooms List */}
      <div className="grid grid-cols-1 gap-6">
        {loading ? (
          <Card className="text-center py-8">Đang tải phòng...</Card>
        ) : (
          filteredRooms.map((room) => (
            <Card key={room.id} className="overflow-hidden">
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-1">
                      {room.type}
                    </h3>
                    <p className="text-gray-600">
                      👥 Tối đa {room.maxGuests} khách
                    </p>
                  </div>
                </div>

                {/* Amenities */}
                <div className="mb-4">
                  <p className="text-sm font-semibold text-gray-900 mb-2">
                    Tiện nghi:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {(room.amenities || []).map((amenity) => (
                      <span
                        key={amenity}
                        className="text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-full"
                      >
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>

                <p className="text-gray-700">{room.description}</p>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="text-sm text-gray-800">
                    Số lượng: {room.quantity}
                  </div>
                  <Link href={`${ROUTES.HOTEL.ROOMS}/${room.id}/edit`}>
                    <Button variant="outline" size="sm">
                      ✏️ Chỉnh sửa
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {!loading && filteredRooms.length === 0 && (
        <Card className="text-center py-12">
          <div className="text-6xl mb-4">🛏️</div>
          <p className="text-gray-600">Không tìm thấy phòng nào</p>
        </Card>
      )}
    </div>
  );
}
