'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { hotelManagerApi, bookingsApi } from '@/lib/api/services';
import { formatCurrency, formatDate } from '@/lib/utils/format';
import type { Booking } from '@/types';

export default function HotelBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<
    'all' | 'accepted' | 'pending' | 'cancelled' | 'checked_in' | 'checked_out'
  >('all');
  
  // Modal states
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [processingAction, setProcessingAction] = useState(false);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      const data = await bookingsApi.getAll();
      console.log('data', data);
      // Backend returns { bookings: [...], total, limit, offset }
      const bookingsArray = data?.bookings || data || [];
      setBookings(Array.isArray(bookingsArray) ? bookingsArray : []);
    } catch (error) {
      console.error('Error loading bookings:', error);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle Check-in
  const handleCheckIn = async (booking: Booking) => {
    if (!confirm(`Xác nhận check-in cho đơn #${booking.booking_id}?`)) return;
    
    setProcessingAction(true);
    try {
      await hotelManagerApi.checkInBooking(String(booking.booking_id));
      // Update local state
      setBookings(bookings.map(b => 
        b.booking_id === booking.booking_id 
          ? { ...b, status: 'checked_in' as const } 
          : b
      ));
      alert('Check-in thành công!');
    } catch (error) {
      console.error('Check-in error:', error);
      alert('Không thể check-in, vui lòng thử lại.');
    } finally {
      setProcessingAction(false);
    }
  };

  // Handle Check-out
  const handleCheckOut = async (booking: Booking) => {
    if (!confirm(`Xác nhận check-out cho đơn #${booking.booking_id}?`)) return;
    
    setProcessingAction(true);
    try {
      await hotelManagerApi.checkOutBooking(String(booking.booking_id));
      // Update local state
      setBookings(bookings.map(b => 
        b.booking_id === booking.booking_id 
          ? { ...b, status: 'checked_out' as const } 
          : b
      ));
      alert('Check-out thành công!');
    } catch (error) {
      console.error('Check-out error:', error);
      alert('Không thể check-out, vui lòng thử lại.');
    } finally {
      setProcessingAction(false);
    }
  };

  // Handle Update Status
  const handleUpdateStatus = async (booking: Booking, newStatus: Booking['status']) => {
    setProcessingAction(true);
    try {
      await hotelManagerApi.updateBookingStatus(String(booking.booking_id), newStatus);
      // Update local state
      setBookings(bookings.map(b => 
        b.booking_id === booking.booking_id 
          ? { ...b, status: newStatus } 
          : b
      ));
      setShowStatusModal(false);
      setSelectedBooking(null);
      alert('Cập nhật trạng thái thành công!');
    } catch (error) {
      console.error('Update status error:', error);
      alert('Không thể cập nhật trạng thái, vui lòng thử lại.');
    } finally {
      setProcessingAction(false);
    }
  };

  // Handle Confirm/Reject booking
  const handleConfirmBooking = async (booking: Booking) => {
    await handleUpdateStatus(booking, 'accepted');
  };

  const handleRejectBooking = async (booking: Booking) => {
    if (!confirm('Bạn có chắc muốn từ chối đơn đặt phòng này?')) return;
    await handleUpdateStatus(booking, 'rejected');
  };

  const filteredBookings =
    filter === 'all'
      ? bookings
      : bookings.filter((b) => b.status === filter);

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      accepted: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      rejected: 'bg-red-100 text-red-800',
      'cancel requested': 'bg-orange-100 text-orange-800',
      cancelled: 'bg-red-100 text-red-800',
      maintained: 'bg-gray-100 text-gray-800',
      checked_in: 'bg-blue-100 text-blue-800',
      checked_out: 'bg-purple-100 text-purple-800',
    };
    const labels: Record<string, string> = {
      accepted: 'Đã xác nhận',
      pending: 'Chờ xác nhận',
      rejected: 'Bị từ chối',
      'cancel requested': 'Yêu cầu hủy',
      cancelled: 'Đã hủy',
      maintained: 'Bảo trì',
      checked_in: 'Đã nhận phòng',
      checked_out: 'Đã trả phòng',
    };
    return (
      <span
        className={`px-3 py-1 rounded-full text-sm font-semibold ${
          styles[status] || 'bg-gray-100 text-gray-800'
        }`}
      >
        {labels[status] || status}
      </span>
    );
  };

  const getPaymentBadge = (status: NonNullable<Booking['paymentStatus']>) => {
    return status === 'paid' ? (
      <span className="text-green-600 text-sm">✓ Đã thanh toán</span>
    ) : status === 'refunded' ? (
      <span className="text-gray-600 text-sm">↩ Đã hoàn tiền</span>
    ) : (
      <span className="text-yellow-600 text-sm">⏳ Chờ thanh toán</span>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>Đang tải...</Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Quản lý đặt phòng</h1>
        <div className="text-right">
          <p className="text-sm text-gray-600">Tổng đơn</p>
          <p className="text-2xl font-bold text-[#0071c2]">{bookings.length}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card>
          <div className="text-center">
            <div className="text-3xl mb-2">⏳</div>
            <div className="text-2xl font-bold text-yellow-600">
              {bookings.filter((b) => b.status === 'pending').length}
            </div>
            <div className="text-gray-900 font-medium text-sm">Chờ xác nhận</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-3xl mb-2">✅</div>
            <div className="text-2xl font-bold text-green-600">
              {bookings.filter((b) => b.status === 'accepted').length}
            </div>
            <div className="text-gray-900 font-medium text-sm">Đã xác nhận</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-3xl mb-2">🏨</div>
            <div className="text-2xl font-bold text-blue-600">
              {bookings.filter((b) => b.status === 'checked_in').length}
            </div>
            <div className="text-gray-900 font-medium text-sm">Đã nhận phòng</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-3xl mb-2">🚪</div>
            <div className="text-2xl font-bold text-purple-600">
              {bookings.filter((b) => b.status === 'checked_out').length}
            </div>
            <div className="text-gray-900 font-medium text-sm">Đã trả phòng</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-3xl mb-2">🔧</div>
            <div className="text-2xl font-bold text-gray-600">
              {bookings.filter((b) => b.status === 'maintained').length}
            </div>
            <div className="text-gray-900 font-medium text-sm">Bảo trì</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-3xl mb-2">❌</div>
            <div className="text-2xl font-bold text-red-600">
              {bookings.filter((b) => b.status === 'cancelled').length}
            </div>
            <div className="text-gray-900 font-medium text-sm">Đã hủy</div>
          </div>
        </Card>
      </div>

      {/* Filter */}
      <Card>
        <div className="flex flex-wrap gap-3">
          <Button
            variant={filter === 'all' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            Tất cả ({bookings.length})
          </Button>
          <Button
            variant={filter === 'pending' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setFilter('pending')}
          >
            Chờ xác nhận (
            {bookings.filter((b) => b.status === 'pending').length})
          </Button>
          <Button
            variant={filter === 'accepted' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setFilter('accepted')}
          >
            Đã xác nhận (
            {bookings.filter((b) => b.status === 'accepted').length})
          </Button>
          <Button
            variant={filter === 'checked_in' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setFilter('checked_in')}
          >
            Đã nhận phòng (
            {bookings.filter((b) => b.status === 'checked_in').length})
          </Button>
          <Button
            variant={filter === 'checked_out' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setFilter('checked_out')}
          >
            Đã trả phòng (
            {bookings.filter((b) => b.status === 'checked_out').length})
          </Button>
          <Button
            variant={filter === 'cancelled' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setFilter('cancelled')}
          >
            Đã hủy ({bookings.filter((b) => b.status === 'cancelled').length})
          </Button>
        </div>
      </Card>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <Card className="text-center py-12">
          <div className="text-6xl mb-4">📋</div>
          <p className="text-gray-900 font-medium">
            Không có đơn đặt phòng nào
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking) => (
            <Card key={booking.booking_id} hover>
              <div className="flex flex-col md:flex-row gap-4">
                {/* Hotel Image */}
                <div
                  className="w-full md:w-48 h-48 rounded-lg bg-cover bg-center flex-shrink-0"
                  style={{
                    backgroundImage: `url('${booking.hotelImage || ''}')`,
                  }}
                />

                {/* Booking Info */}
                <div className="flex-grow">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center space-x-3 mb-1">
                        <h3 className="text-xl font-bold text-gray-900">
                          {booking.hotelName || 'N/A'}
                        </h3>
                        {getStatusBadge(booking.status)}
                      </div>
                      <p className="text-gray-600">
                        {booking.roomType || 'N/A'}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        Mã đơn: {booking.booking_id}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-800 font-medium">
                        Nhận phòng
                      </p>
                      <p className="font-semibold text-gray-900">
                        {formatDate(booking.check_in_date, 'long')}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-800 font-medium">
                        Trả phòng
                      </p>
                      <p className="font-semibold text-gray-900">
                        {formatDate(booking.check_out_date, 'long')}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-800 font-medium">
                        Số đêm
                      </p>
                      <p className="font-semibold text-gray-900">
                        {booking.nights !== null && booking.nights !== undefined
                          ? `${booking.nights} đêm`
                          : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-800 font-medium">
                        Số khách
                      </p>
                      <p className="font-semibold text-gray-900">
                        {booking.people !== null && booking.people !== undefined
                          ? `${booking.people} người`
                          : 'N/A'}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between pt-4 border-t border-gray-200">
                    <div>
                      <p className="text-sm text-gray-800 font-medium mb-1">
                        Thanh toán
                      </p>
                      <div className="flex items-center space-x-3">
                        <p className="text-2xl font-bold text-[#0071c2]">
                          {formatCurrency(booking.total_price ?? 0)}
                        </p>
                        {booking.paymentStatus
                          ? getPaymentBadge(booking.paymentStatus)
                          : null}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3 md:mt-0">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setSelectedBooking(booking);
                          setShowDetailModal(true);
                        }}
                      >
                        📄 Chi tiết
                      </Button>
                      
                      {/* Pending: Show Confirm/Reject */}
                      {booking.status === 'pending' && (
                        <>
                          <Button 
                            variant="primary" 
                            size="sm"
                            disabled={processingAction}
                            onClick={() => handleConfirmBooking(booking)}
                          >
                            ✓ Xác nhận
                          </Button>
                          <Button 
                            variant="danger" 
                            size="sm"
                            disabled={processingAction}
                            onClick={() => handleRejectBooking(booking)}
                          >
                            ✕ Từ chối
                          </Button>
                        </>
                      )}
                      
                      {/* Accepted: Show Check-in and Update Status */}
                      {booking.status === 'accepted' && (
                        <>
                          <Button 
                            variant="primary" 
                            size="sm"
                            disabled={processingAction}
                            onClick={() => handleCheckIn(booking)}
                          >
                            🏨 Check-in
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setSelectedBooking(booking);
                              setShowStatusModal(true);
                            }}
                          >
                            📝 Đổi trạng thái
                          </Button>
                        </>
                      )}
                      
                      {/* Checked In: Show Check-out */}
                      {booking.status === 'checked_in' && (
                        <>
                          <Button 
                            variant="primary" 
                            size="sm"
                            disabled={processingAction}
                            onClick={() => handleCheckOut(booking)}
                          >
                            🚪 Check-out
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setSelectedBooking(booking);
                              setShowStatusModal(true);
                            }}
                          >
                            📝 Đổi trạng thái
                          </Button>
                        </>
                      )}
                      
                      {/* Checked Out: Completed */}
                      {booking.status === 'checked_out' && (
                        <span className="text-green-600 font-medium px-3 py-1">
                          ✓ Hoàn thành
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Chi tiết đặt phòng</h2>
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    setSelectedBooking(null);
                  }}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <span className="text-gray-600">Mã đơn:</span>
                  <span className="font-bold">#{selectedBooking.booking_id}</span>
                  {getStatusBadge(selectedBooking.status)}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Khách sạn</p>
                    <p className="font-semibold">{selectedBooking.hotelName || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Loại phòng</p>
                    <p className="font-semibold">{selectedBooking.roomType || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Nhận phòng</p>
                    <p className="font-semibold">{formatDate(selectedBooking.check_in_date, 'long')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Trả phòng</p>
                    <p className="font-semibold">{formatDate(selectedBooking.check_out_date, 'long')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Số đêm</p>
                    <p className="font-semibold">{selectedBooking.nights ?? 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Số khách</p>
                    <p className="font-semibold">{selectedBooking.people ?? 'N/A'}</p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <p className="text-sm text-gray-600">Tổng thanh toán</p>
                  <p className="text-2xl font-bold text-[#0071c2]">
                    {formatCurrency(selectedBooking.total_price ?? 0)}
                  </p>
                  {selectedBooking.paymentStatus && getPaymentBadge(selectedBooking.paymentStatus)}
                </div>

                {selectedBooking.note && (
                  <div className="border-t pt-4">
                    <p className="text-sm text-gray-600">Ghi chú</p>
                    <p className="text-gray-900">{selectedBooking.note}</p>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowDetailModal(false);
                    setSelectedBooking(null);
                  }}
                >
                  Đóng
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Status Update Modal */}
      {showStatusModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Cập nhật trạng thái</h2>
                <button
                  onClick={() => {
                    setShowStatusModal(false);
                    setSelectedBooking(null);
                  }}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="mb-4">
                <p className="text-gray-600 mb-2">
                  Đơn đặt phòng: <strong>#{selectedBooking.booking_id}</strong>
                </p>
                <p className="text-gray-600">
                  Trạng thái hiện tại: {getStatusBadge(selectedBooking.status)}
                </p>
              </div>

              <div className="space-y-3">
                <p className="font-medium text-gray-900">Chọn trạng thái mới:</p>
                
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={processingAction || selectedBooking.status === 'pending'}
                    onClick={() => handleUpdateStatus(selectedBooking, 'pending')}
                    className="w-full"
                  >
                    ⏳ Chờ xác nhận
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={processingAction || selectedBooking.status === 'accepted'}
                    onClick={() => handleUpdateStatus(selectedBooking, 'accepted')}
                    className="w-full"
                  >
                    ✅ Đã xác nhận
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={processingAction || selectedBooking.status === 'checked_in'}
                    onClick={() => handleUpdateStatus(selectedBooking, 'checked_in' as Booking['status'])}
                    className="w-full"
                  >
                    🏨 Đã nhận phòng
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={processingAction || selectedBooking.status === 'checked_out'}
                    onClick={() => handleUpdateStatus(selectedBooking, 'checked_out' as Booking['status'])}
                    className="w-full"
                  >
                    🚪 Đã trả phòng
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={processingAction || selectedBooking.status === 'maintained'}
                    onClick={() => handleUpdateStatus(selectedBooking, 'maintained')}
                    className="w-full"
                  >
                    🔧 Bảo trì
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    disabled={processingAction || selectedBooking.status === 'cancelled'}
                    onClick={() => handleUpdateStatus(selectedBooking, 'cancelled')}
                    className="w-full"
                  >
                    ❌ Đã hủy
                  </Button>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowStatusModal(false);
                    setSelectedBooking(null);
                  }}
                >
                  Hủy
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
