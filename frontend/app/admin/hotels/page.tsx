'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { adminApi, AdminHotel } from '@/lib/api/services';
import { useSearchParams } from 'next/navigation';

export default function AdminHotelsPage() {
  const searchParams = useSearchParams();
  const initialStatus = searchParams.get('status') as AdminHotel['status'] | null;
  
  const [hotels, setHotels] = useState<AdminHotel[]>([]);
  const [pendingHotels, setPendingHotels] = useState<AdminHotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'locked'>(
    initialStatus === 'pending' ? 'pending' : 'all'
  );
  const [processing, setProcessing] = useState<number | null>(null);

  useEffect(() => {
    loadHotels();
  }, []);

  const loadHotels = async () => {
    try {
      const pending = await adminApi.getPendingHotels();
      setPendingHotels(pending);
      
      // Create mock all hotels list
      const allHotels: AdminHotel[] = [
        ...pending,
        { hotel_id: 1, name: 'Vinpearl Resort', city: 'Nha Trang', district: 'Vĩnh Nguyên', status: 'approved', manager_name: 'Nguyễn Văn A', manager_email: 'a@vp.com', rooms_count: 150, created_at: '2024-01-15' },
        { hotel_id: 2, name: 'Mường Thanh Grand', city: 'Đà Nẵng', district: 'Hải Châu', status: 'approved', manager_name: 'Trần Thị B', manager_email: 'b@mt.com', rooms_count: 85, created_at: '2024-02-20' },
        { hotel_id: 3, name: 'JW Marriott', city: 'Hà Nội', district: 'Nam Từ Liêm', status: 'approved', manager_name: 'Lê Văn C', manager_email: 'c@jw.com', rooms_count: 200, created_at: '2024-03-10' },
        { hotel_id: 4, name: 'Hotel bị khóa', city: 'HCM', district: 'Quận 1', status: 'locked', manager_name: 'Phạm D', manager_email: 'd@h.com', rooms_count: 30, created_at: '2024-04-01' },
      ];
      setHotels(allHotels);
    } catch (error) {
      console.error('Error loading hotels:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (hotelId: number) => {
    setProcessing(hotelId);
    try {
      await adminApi.approveHotel(String(hotelId));
      setHotels(hotels.map(h => h.hotel_id === hotelId ? { ...h, status: 'approved' as const } : h));
      setPendingHotels(pendingHotels.filter(h => h.hotel_id !== hotelId));
      alert('Đã phê duyệt khách sạn!');
    } catch (error) {
      console.error('Error approving hotel:', error);
      alert('Lỗi khi phê duyệt');
    } finally {
      setProcessing(null);
    }
  };

  const handleLock = async (hotelId: number) => {
    if (!confirm('Bạn có chắc muốn khóa khách sạn này?')) return;
    setProcessing(hotelId);
    try {
      await adminApi.lockHotel(String(hotelId));
      setHotels(hotels.map(h => h.hotel_id === hotelId ? { ...h, status: 'locked' as const } : h));
      setPendingHotels(pendingHotels.filter(h => h.hotel_id !== hotelId));
      alert('Đã khóa khách sạn!');
    } catch (error) {
      console.error('Error locking hotel:', error);
      alert('Lỗi khi khóa khách sạn');
    } finally {
      setProcessing(null);
    }
  };

  const filteredHotels = filter === 'all' 
    ? hotels 
    : hotels.filter(h => h.status === filter);

  const getStatusBadge = (status: AdminHotel['status']) => {
    const styles: Record<AdminHotel['status'], string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      locked: 'bg-gray-100 text-gray-800',
    };
    const labels: Record<AdminHotel['status'], string> = {
      pending: 'Chờ duyệt',
      approved: 'Đã duyệt',
      rejected: 'Từ chối',
      locked: 'Đã khóa',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Quản lý khách sạn</h1>
        <Card>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">🏨 Quản lý khách sạn</h1>
        <div className="text-gray-600">
          Tổng: <strong>{hotels.length}</strong> khách sạn
        </div>
      </div>

      {/* Pending Hotels Alert */}
      {pendingHotels.length > 0 && (
        <Card className="bg-yellow-50 border-yellow-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="text-3xl">⏳</div>
              <div>
                <p className="font-bold text-yellow-800">
                  {pendingHotels.length} khách sạn đang chờ phê duyệt
                </p>
                <p className="text-sm text-yellow-700">
                  Vui lòng xem xét và xử lý các yêu cầu đăng ký mới
                </p>
              </div>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setFilter('pending')}
            >
              Xem ngay
            </Button>
          </div>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900">{hotels.length}</div>
            <div className="text-sm text-gray-600">Tổng cộng</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-600">
              {hotels.filter(h => h.status === 'pending').length}
            </div>
            <div className="text-sm text-gray-600">Chờ duyệt</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">
              {hotels.filter(h => h.status === 'approved').length}
            </div>
            <div className="text-sm text-gray-600">Đã duyệt</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-600">
              {hotels.filter(h => h.status === 'locked').length}
            </div>
            <div className="text-sm text-gray-600">Đã khóa</div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex gap-2">
          <Button
            variant={filter === 'all' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            Tất cả ({hotels.length})
          </Button>
          <Button
            variant={filter === 'pending' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setFilter('pending')}
          >
            Chờ duyệt ({hotels.filter(h => h.status === 'pending').length})
          </Button>
          <Button
            variant={filter === 'approved' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setFilter('approved')}
          >
            Đã duyệt ({hotels.filter(h => h.status === 'approved').length})
          </Button>
          <Button
            variant={filter === 'locked' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setFilter('locked')}
          >
            Đã khóa ({hotels.filter(h => h.status === 'locked').length})
          </Button>
        </div>
      </Card>

      {/* Hotels List */}
      <div className="space-y-4">
        {filteredHotels.map((hotel) => (
          <Card key={hotel.hotel_id} hover>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-bold text-gray-900">{hotel.name}</h3>
                  {getStatusBadge(hotel.status)}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Địa điểm:</span>
                    <p className="font-medium text-gray-900">{hotel.district}, {hotel.city}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Quản lý:</span>
                    <p className="font-medium text-gray-900">{hotel.manager_name}</p>
                    <p className="text-gray-600 text-xs">{hotel.manager_email}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Số phòng:</span>
                    <p className="font-medium text-gray-900">{hotel.rooms_count} phòng</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Ngày đăng ký:</span>
                    <p className="font-medium text-gray-900">
                      {new Date(hotel.created_at).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                {hotel.status === 'pending' && (
                  <>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleApprove(hotel.hotel_id)}
                      disabled={processing === hotel.hotel_id}
                    >
                      ✓ Phê duyệt
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleLock(hotel.hotel_id)}
                      disabled={processing === hotel.hotel_id}
                    >
                      ✕ Từ chối
                    </Button>
                  </>
                )}
                {hotel.status === 'approved' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleLock(hotel.hotel_id)}
                    disabled={processing === hotel.hotel_id}
                  >
                    🔒 Khóa
                  </Button>
                )}
                {hotel.status === 'locked' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleApprove(hotel.hotel_id)}
                    disabled={processing === hotel.hotel_id}
                  >
                    🔓 Mở khóa
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredHotels.length === 0 && (
        <Card className="text-center py-12">
          <div className="text-6xl mb-4">🏨</div>
          <p className="text-gray-600">Không có khách sạn nào</p>
        </Card>
      )}
    </div>
  );
}
