'use client';

import RoomHoldDemo from '@/components/rooms/RoomHoldDemo';

export default function RoomInventoryDemoPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">🏨 Room Inventory Demo</h1>
          <p className="text-gray-600 mt-1">Test reservation holds and inventory management</p>
        </div>
      </div>

      <RoomHoldDemo />
    </div>
  );
}

