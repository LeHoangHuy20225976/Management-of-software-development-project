'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';

export default function TestHotelManagerPage() {
  const [selectedModule, setSelectedModule] = useState<string>('');

  const modules = [
    {
      id: 'pricing',
      name: 'Pricing Engine',
      description: 'Tính giá phòng với dynamic pricing',
      url: '/admin/pricing',
      status: '✅ Hoạt động'
    },
    {
      id: 'sync',
      name: 'Synchronization',
      description: 'Đồng bộ data với external systems',
      url: '/admin/sync',
      status: '✅ Hoạt động'
    },
    {
      id: 'inventory',
      name: 'Room Inventory',
      description: 'Quản lý availability và calendar phòng',
      url: '/hotel-manager/rooms/inventory',
      status: '🔄 Cần test'
    },
    {
      id: 'dashboard',
      name: 'Hotel Dashboard',
      description: 'Dashboard quản lý khách sạn',
      url: '/hotel-manager/dashboard',
      status: '🔄 Cần test'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              🏨 Test Modules của Huy
            </h1>
            <p className="text-xl text-gray-600">
              Truy cập trực tiếp các trang mà không cần đăng nhập
            </p>
          </div>

          {/* Module Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {modules.map((module) => (
              <Card key={module.id} className="hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xl font-bold text-gray-900">{module.name}</h3>
                    <span className={`px-2 py-1 rounded-full text-sm font-medium ${
                      module.status.includes('✅')
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {module.status}
                    </span>
                  </div>

                  <p className="text-gray-600 mb-4">{module.description}</p>

                  <Link href={module.url}>
                    <Button className="w-full">
                      🧪 Test {module.name}
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>

          {/* Info */}
          <Card>
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">ℹ️ Thông tin</h3>
              <div className="space-y-3 text-gray-600">
                <p><strong>Pricing Engine:</strong> Đã test thành công với dynamic pricing</p>
                <p><strong>Synchronization:</strong> API hoạt động, UI có thể cần fix</p>
                <p><strong>Room Inventory:</strong> API hoạt động, cần test UI calendar</p>
                <p><strong>Authentication:</strong> Đã disable để test - có thể login sau</p>
              </div>
            </div>
          </Card>

          {/* Quick Login */}
          <Card className="mt-6">
            <div className="p-6 text-center">
              <h3 className="text-lg font-bold text-gray-900 mb-2">🔐 Muốn test với login?</h3>
              <p className="text-gray-600 mb-4">Email: manager@hotel.com | Password: password123</p>
              <Link href="/hotel-manager/login">
                <Button variant="outline">
                  Đăng nhập Hotel Manager
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
