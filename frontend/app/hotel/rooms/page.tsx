/**
 * Room Management - List View
 * FE4: Hotel Manager Portal
 */

'use client';

import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import Link from 'next/link';
import { ROUTES } from '@/lib/routes';

// Mock data
const rooms = [
  {
    id: '1',
    name: 'Deluxe Room',
    size: 35,
    maxGuests: 2,
    beds: '1 King Bed',
    basePrice: 2000000,
    available: 5,
    amenities: ['WiFi', 'TV', 'Minibar', 'Air conditioning'],
    image: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400',
  },
  {
    id: '2',
    name: 'Superior Room',
    size: 28,
    maxGuests: 2,
    beds: '1 Queen Bed',
    basePrice: 1500000,
    available: 8,
    amenities: ['WiFi', 'TV', 'Air conditioning'],
    image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=400',
  },
  {
    id: '3',
    name: 'Family Suite',
    size: 50,
    maxGuests: 4,
    beds: '1 King + 2 Single Beds',
    basePrice: 3500000,
    available: 3,
    amenities: ['WiFi', 'TV', 'Minibar', 'Air conditioning', 'Kitchenette', 'Living room'],
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400',
  },
  {
    id: '4',
    name: 'Standard Room',
    size: 25,
    maxGuests: 2,
    beds: '2 Single Beds',
    basePrice: 1200000,
    available: 10,
    amenities: ['WiFi', 'TV'],
    image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400',
  },
];

export default function RoomsPage() {
  const handleDelete = (id: string, name: string) => {
    if (confirm(`Bạn có chắc muốn xóa phòng "${name}"?`)) {
      // TODO: Call API to delete room
      alert('Đã xóa phòng thành công!');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Quản lý phòng</h1>
        <Link href={ROUTES.HOTEL.ROOM_CREATE}>
          <Button>
            ➕ Thêm loại phòng mới
          </Button>
        </Link>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="text-center">
            <div className="text-4xl mb-2">🛏️</div>
            <div className="text-3xl font-bold text-[#0071c2]">{rooms.length}</div>
            <div className="text-gray-600">Loại phòng</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-4xl mb-2">🏨</div>
            <div className="text-3xl font-bold text-green-600">
              {rooms.reduce((sum, room) => sum + room.available, 0)}
            </div>
            <div className="text-gray-600">Tổng số phòng</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-4xl mb-2">💰</div>
            <div className="text-3xl font-bold text-[#0071c2]">
              {(rooms.reduce((sum, room) => sum + room.basePrice, 0) / rooms.length / 1000000).toFixed(1)}M
            </div>
            <div className="text-gray-600">Giá TB/đêm</div>
          </div>
        </Card>
      </div>

      {/* Room List */}
      <div className="space-y-4">
        {rooms.map((room) => (
          <Card key={room.id} padding="none">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-6">
              {/* Image */}
              <div className="md:col-span-1">
                <img
                  src={room.image}
                  alt={room.name}
                  className="w-full h-40 object-cover rounded-lg"
                />
              </div>

              {/* Info */}
              <div className="md:col-span-2">
                <h3 className="text-xl font-bold mb-2">{room.name}</h3>
                <div className="space-y-1 text-sm text-gray-600">
                  <p>📐 Diện tích: {room.size}m²</p>
                  <p>👥 Tối đa: {room.maxGuests} khách</p>
                  <p>🛏️ {room.beds}</p>
                  <p>
                    ✅ Còn trống: <span className="font-semibold text-green-600">{room.available} phòng</span>
                  </p>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {room.amenities.map((amenity) => (
                    <span
                      key={amenity}
                      className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full"
                    >
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="md:col-span-1 flex flex-col justify-between">
                <div className="text-right">
                  <div className="text-2xl font-bold text-[#0071c2]">
                    {room.basePrice.toLocaleString('vi-VN')} ₫
                  </div>
                  <div className="text-sm text-gray-600">/ đêm</div>
                </div>
                <div className="flex flex-col gap-2 mt-4">
                  <Link href={ROUTES.HOTEL.ROOM_EDIT(room.id)}>
                    <Button variant="outline" className="w-full">
                      ✏️ Sửa
                    </Button>
                  </Link>
                  <Button
                    variant="danger"
                    onClick={() => handleDelete(room.id, room.name)}
                    className="w-full"
                  >
                    🗑️ Xóa
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {rooms.length === 0 && (
        <Card>
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🛏️</div>
            <p className="text-gray-600 mb-4">Chưa có loại phòng nào</p>
            <Link href={ROUTES.HOTEL.ROOM_CREATE}>
              <Button>Thêm loại phòng đầu tiên</Button>
            </Link>
          </div>
        </Card>
      )}
    </div>
  );
}
