'use client';

import { useEffect, useState, useMemo } from 'react';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { roomInventoryApi } from '@/lib/api/services';
import Link from 'next/link';

interface InventoryDay {
  date: string;
  available: number;
  booked: number;
  held: number;
  total: number;
}

interface RoomInventory {
  room_type_id: number;
  room_type_name: string;
  inventory: InventoryDay[];
}

export default function RoomInventoryCalendarPage() {
  const [inventoryData, setInventoryData] = useState<RoomInventory[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedRoomType, setSelectedRoomType] = useState<number | null>(null);

  // Generate days of current month
  const daysInMonth = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: Date[] = [];
    
    for (let d = new Date(firstDay); d <= lastDay; d.setDate(d.getDate() + 1)) {
      days.push(new Date(d));
    }
    return days;
  }, [currentMonth]);

  const startDate = daysInMonth[0]?.toISOString().split('T')[0] || '';
  const endDate = daysInMonth[daysInMonth.length - 1]?.toISOString().split('T')[0] || '';

  useEffect(() => {
    loadInventory();
  }, [currentMonth]);

  const loadInventory = async () => {
    setLoading(true);
    try {
      // In mock mode, generate sample data
      const mockData: RoomInventory[] = [
        {
          room_type_id: 1,
          room_type_name: 'Phòng Standard',
          inventory: daysInMonth.map((day) => {
            const dateStr = day.toISOString().split('T')[0];
            const booked = Math.floor(Math.random() * 5);
            const held = Math.floor(Math.random() * 2);
            return {
              date: dateStr,
              total: 10,
              booked,
              held,
              available: Math.max(0, 10 - booked - held),
            };
          }),
        },
        {
          room_type_id: 2,
          room_type_name: 'Phòng Deluxe',
          inventory: daysInMonth.map((day) => {
            const dateStr = day.toISOString().split('T')[0];
            const booked = Math.floor(Math.random() * 3);
            const held = Math.floor(Math.random() * 1);
            return {
              date: dateStr,
              total: 5,
              booked,
              held,
              available: Math.max(0, 5 - booked - held),
            };
          }),
        },
        {
          room_type_id: 3,
          room_type_name: 'Phòng Suite',
          inventory: daysInMonth.map((day) => {
            const dateStr = day.toISOString().split('T')[0];
            const booked = Math.floor(Math.random() * 2);
            const held = 0;
            return {
              date: dateStr,
              total: 3,
              booked,
              held,
              available: Math.max(0, 3 - booked - held),
            };
          }),
        },
      ];

      // Try API first, fallback to mock
      try {
        const data = await roomInventoryApi.getInventoryCalendar(
          '1', // hotelId - would come from context
          startDate,
          endDate
        );
        // Transform API response if needed
        if (Array.isArray(data) && data.length > 0 && 'room_type_id' in data[0]) {
          setInventoryData(data as unknown as RoomInventory[]);
        } else {
          setInventoryData(mockData);
        }
      } catch {
        setInventoryData(mockData);
      }
    } catch (error) {
      console.error('Error loading inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' });
  };

  const getDayOfWeek = (date: Date) => {
    return date.toLocaleDateString('vi-VN', { weekday: 'short' });
  };

  const getAvailabilityColor = (available: number, total: number) => {
    const ratio = available / total;
    if (ratio === 0) return 'bg-red-500 text-white';
    if (ratio <= 0.3) return 'bg-orange-400 text-white';
    if (ratio <= 0.6) return 'bg-yellow-400 text-gray-900';
    return 'bg-green-500 text-white';
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const filteredInventory = selectedRoomType
    ? inventoryData.filter((r) => r.room_type_id === selectedRoomType)
    : inventoryData;

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">📅 Lịch phòng trống</h1>
          <p className="text-gray-600 mt-1">Xem và quản lý tình trạng phòng theo ngày</p>
        </div>
        <Link href="/hotel-manager/rooms">
          <Button variant="outline">← Quản lý phòng</Button>
        </Link>
      </div>

      {/* Month Navigation */}
      <Card>
        <div className="flex items-center justify-between">
          <Button variant="outline" size="sm" onClick={prevMonth}>
            ← Tháng trước
          </Button>
          <h2 className="text-xl font-bold text-gray-900 capitalize">
            {formatMonthYear(currentMonth)}
          </h2>
          <Button variant="outline" size="sm" onClick={nextMonth}>
            Tháng sau →
          </Button>
        </div>
      </Card>

      {/* Room Type Filter */}
      <Card>
        <div className="flex flex-wrap gap-3">
          <Button
            variant={selectedRoomType === null ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setSelectedRoomType(null)}
          >
            Tất cả loại phòng
          </Button>
          {inventoryData.map((room) => (
            <Button
              key={room.room_type_id}
              variant={selectedRoomType === room.room_type_id ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setSelectedRoomType(room.room_type_id)}
            >
              {room.room_type_name}
            </Button>
          ))}
        </div>
      </Card>

      {/* Legend */}
      <Card>
        <div className="flex flex-wrap items-center gap-6">
          <span className="font-medium text-gray-900">Chú thích:</span>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-green-500"></div>
            <span className="text-sm text-gray-700">Còn nhiều (&gt;60%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-yellow-400"></div>
            <span className="text-sm text-gray-700">Còn ít (30-60%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-orange-400"></div>
            <span className="text-sm text-gray-700">Gần hết (&lt;30%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-red-500"></div>
            <span className="text-sm text-gray-700">Hết phòng</span>
          </div>
        </div>
      </Card>

      {/* Calendar Grid for each room type */}
      {filteredInventory.map((roomType) => (
        <Card key={roomType.room_type_id}>
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            🏨 {roomType.room_type_name}
          </h3>

          {/* Calendar Header - Days of Week */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map((day) => (
              <div
                key={day}
                className="text-center text-sm font-medium text-gray-600 py-2"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Empty cells for days before first day of month */}
            {Array.from({ length: daysInMonth[0].getDay() }).map((_, i) => (
              <div key={`empty-${i}`} className="h-20"></div>
            ))}

            {/* Days of month */}
            {daysInMonth.map((day) => {
              const dateStr = day.toISOString().split('T')[0];
              const inventory = roomType.inventory.find((inv) => inv.date === dateStr);
              const available = inventory?.available ?? 0;
              const total = inventory?.total ?? 1;
              const booked = inventory?.booked ?? 0;
              const held = inventory?.held ?? 0;

              return (
                <div
                  key={dateStr}
                  className={`h-20 p-1 border rounded-lg ${
                    isToday(day) ? 'ring-2 ring-blue-500' : 'border-gray-200'
                  }`}
                >
                  <div className="flex flex-col h-full">
                    <div
                      className={`text-xs font-medium ${
                        isToday(day) ? 'text-blue-600' : 'text-gray-600'
                      }`}
                    >
                      {day.getDate()}
                    </div>
                    <div
                      className={`flex-1 flex flex-col items-center justify-center rounded mt-1 ${getAvailabilityColor(
                        available,
                        total
                      )}`}
                    >
                      <span className="text-lg font-bold">{available}</span>
                      <span className="text-xs opacity-80">/{total}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Room Type Summary */}
          <div className="mt-4 pt-4 border-t grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {roomType.inventory.reduce((sum, inv) => sum + inv.total, 0) / roomType.inventory.length}
              </div>
              <div className="text-sm text-gray-600">Tổng phòng</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {Math.round(
                  roomType.inventory.reduce((sum, inv) => sum + inv.available, 0) /
                    roomType.inventory.length
                )}
              </div>
              <div className="text-sm text-gray-600">TB còn trống</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {Math.round(
                  roomType.inventory.reduce((sum, inv) => sum + inv.booked, 0) /
                    roomType.inventory.length
                )}
              </div>
              <div className="text-sm text-gray-600">TB đã đặt</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {roomType.inventory.filter((inv) => inv.available === 0).length}
              </div>
              <div className="text-sm text-gray-600">Ngày hết phòng</div>
            </div>
          </div>
        </Card>
      ))}

      {/* Quick Stats */}
      <Card>
        <h3 className="text-xl font-bold text-gray-900 mb-4">📊 Thống kê tổng hợp</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-3xl font-bold text-green-600">
              {Math.round(
                (inventoryData.reduce(
                  (sum, rt) =>
                    sum + rt.inventory.reduce((s, inv) => s + inv.available, 0),
                  0
                ) /
                  inventoryData.reduce(
                    (sum, rt) =>
                      sum + rt.inventory.reduce((s, inv) => s + inv.total, 0),
                    0
                  )) *
                  100
              ) || 0}%
            </div>
            <div className="text-sm text-gray-600 mt-1">Tỷ lệ trống TB</div>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-3xl font-bold text-blue-600">
              {Math.round(
                (inventoryData.reduce(
                  (sum, rt) =>
                    sum + rt.inventory.reduce((s, inv) => s + inv.booked, 0),
                  0
                ) /
                  inventoryData.reduce(
                    (sum, rt) =>
                      sum + rt.inventory.reduce((s, inv) => s + inv.total, 0),
                    0
                  )) *
                  100
              ) || 0}%
            </div>
            <div className="text-sm text-gray-600 mt-1">Tỷ lệ đặt TB</div>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <div className="text-3xl font-bold text-red-600">
              {inventoryData.reduce(
                (sum, rt) =>
                  sum + rt.inventory.filter((inv) => inv.available === 0).length,
                0
              )}
            </div>
            <div className="text-sm text-gray-600 mt-1">Ngày hết phòng</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-3xl font-bold text-purple-600">
              {inventoryData.reduce(
                (sum, rt) =>
                  sum +
                  rt.inventory.reduce(
                    (s, inv) => s + (inv.available === inv.total ? 1 : 0),
                    0
                  ),
                0
              )}
            </div>
            <div className="text-sm text-gray-600 mt-1">Ngày còn trống 100%</div>
          </div>
        </div>
      </Card>
    </div>
  );
}
