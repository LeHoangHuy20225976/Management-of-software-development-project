/**
 * Hotel Manager Dashboard
 * FE4: Hotel Manager Portal
 */

import { Card } from '@/components/common/Card';

export default function HotelDashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <div className="text-center">
            <div className="text-4xl mb-2">📋</div>
            <div className="text-3xl font-bold text-blue-600">24</div>
            <div className="text-gray-600">Đặt phòng mới</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-4xl mb-2">💰</div>
            <div className="text-3xl font-bold text-green-600">85%</div>
            <div className="text-gray-600">Tỷ lệ lấp đầy</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-4xl mb-2">⭐</div>
            <div className="text-3xl font-bold text-yellow-600">4.8</div>
            <div className="text-gray-600">Đánh giá TB</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-4xl mb-2">💵</div>
            <div className="text-3xl font-bold text-blue-600">125M</div>
            <div className="text-gray-600">Doanh thu tháng</div>
          </div>
        </Card>
      </div>

      {/* Recent Bookings */}
      <Card>
        <h2 className="text-2xl font-bold mb-4">Đặt phòng gần đây</h2>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <p className="font-semibold">Nguyễn Văn A</p>
                <p className="text-sm text-gray-600">Deluxe Room - 2 đêm</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-blue-600">5.000.000 ₫</p>
                <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full">
                  Đã xác nhận
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
