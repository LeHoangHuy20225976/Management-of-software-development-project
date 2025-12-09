/**
 * Hotel Rooms Management
 * FE4: Hotel Manager Portal
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { ROUTES } from '@/lib/routes';

// Mock rooms data - in real app would fetch from API
const mockRooms = [
  {
    id: 'r1',
    name: 'Phòng Standard',
    type: 'Standard Room',
    price: 1500000,
    size: '25m²',
    beds: '1 giường đôi',
    maxGuests: 2,
    available: 8,
    total: 10,
    amenities: ['WiFi', 'TV', 'Minibar', 'Điều hòa'],
    status: 'active',
    image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=400',
  },
  {
    id: 'r2',
    name: 'Phòng Deluxe',
    type: 'Deluxe Room',
    price: 2200000,
    size: '35m²',
    beds: '1 giường king',
    maxGuests: 2,
    available: 5,
    total: 8,
    amenities: ['WiFi', 'TV', 'Minibar', 'Điều hòa', 'Ban công', 'Bồn tắm'],
    status: 'active',
    image: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400',
  },
  {
    id: 'r3',
    name: 'Phòng Suite',
    type: 'Executive Suite',
    price: 3500000,
    size: '55m²',
    beds: '1 giường king + Sofa',
    maxGuests: 4,
    available: 2,
    total: 5,
    amenities: [
      'WiFi',
      'TV',
      'Minibar',
      'Điều hòa',
      'Ban công',
      'Bồn tắm',
      'Phòng khách riêng',
    ],
    status: 'active',
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400',
  },
  {
    id: 'r4',
    name: 'Phòng Family',
    type: 'Family Room',
    price: 2800000,
    size: '45m²',
    beds: '2 giường đôi',
    maxGuests: 4,
    available: 3,
    total: 6,
    amenities: ['WiFi', 'TV', 'Minibar', 'Điều hòa', 'Khu vực chơi cho trẻ'],
    status: 'active',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400',
  },
];

export default function HotelRoomsPage() {
  const [rooms] = useState(mockRooms);
  const [filter, setFilter] = useState<'all' | 'available' | 'full'>('all');

  const filteredRooms =
    filter === 'all'
      ? rooms
      : filter === 'available'
      ? rooms.filter((r) => r.available > 0)
      : rooms.filter((r) => r.available === 0);

  const totalRooms = rooms.reduce((sum, r) => sum + r.total, 0);
  const availableRooms = rooms.reduce((sum, r) => sum + r.available, 0);
  const occupiedRooms = totalRooms - availableRooms;

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
            Còn trống ({rooms.filter((r) => r.available > 0).length})
          </Button>
          <Button
            variant={filter === 'full' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setFilter('full')}
          >
            Hết phòng ({rooms.filter((r) => r.available === 0).length})
          </Button>
        </div>
      </Card>

      {/* Rooms List */}
      <div className="grid grid-cols-1 gap-6">
        {filteredRooms.map((room) => (
          <Card key={room.id} padding="none" className="overflow-hidden">
            <div className="md:flex">
              {/* Image */}
              <div className="md:w-1/3 relative h-64 md:h-auto">
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url('${room.image}')` }}
                />
                <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded-full shadow-lg">
                  <span className="font-bold text-[#0071c2]">
                    {room.available}/{room.total}
                  </span>
                  <span className="text-sm text-gray-600 ml-1">
                    phòng trống
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="md:w-2/3 p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-1">
                      {room.name}
                    </h3>
                    <p className="text-gray-600">{room.type}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-[#0071c2]">
                      {room.price.toLocaleString('vi-VN')} ₫
                    </p>
                    <p className="text-sm text-gray-600">/ đêm</p>
                  </div>
                </div>

                {/* Room Info */}
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center space-x-2 text-gray-700">
                    <span>📏</span>
                    <span>{room.size}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-700">
                    <span>🛏️</span>
                    <span>{room.beds}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-700">
                    <span>👥</span>
                    <span>{room.maxGuests} khách</span>
                  </div>
                </div>

                {/* Amenities */}
                <div className="mb-4">
                  <p className="text-sm font-semibold text-gray-900 mb-2">
                    Tiện nghi:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {room.amenities.map((amenity) => (
                      <span
                        key={amenity}
                        className="text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-full"
                      >
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Status & Actions */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`inline-block w-3 h-3 rounded-full ${
                        room.available > 0 ? 'bg-green-500' : 'bg-red-500'
                      }`}
                    />
                    <span className="font-semibold text-gray-900">
                      {room.available > 0 ? 'Còn phòng' : 'Hết phòng'}
                    </span>
                  </div>
                  <div className="flex space-x-2">
                    <Link href={`${ROUTES.HOTEL.ROOMS}/${room.id}/edit`}>
                      <Button variant="outline" size="sm">
                        ✏️ Chỉnh sửa
                      </Button>
                    </Link>
                    <Button variant="outline" size="sm">
                      📊 Thống kê
                    </Button>
                    <Button variant="danger" size="sm">
                      🗑️ Xóa
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredRooms.length === 0 && (
        <Card className="text-center py-12">
          <div className="text-6xl mb-4">🛏️</div>
          <p className="text-gray-600">Không tìm thấy phòng nào</p>
        </Card>
      )}
    </div>
  );
}
