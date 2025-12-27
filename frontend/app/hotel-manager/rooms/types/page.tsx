'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { hotelManagerApi } from '@/lib/api/services';
import { formatCurrency } from '@/lib/utils/format';
import type { RoomType } from '@/types';

export default function RoomTypesPage() {
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedType, setSelectedType] = useState<RoomType | null>(null);
  const [processing, setProcessing] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    type: '',
    description: '',
    max_guests: 2,
    basePrice: 0,
    quantity: 1,
  });

  useEffect(() => {
    loadRoomTypes();
  }, []);

  const loadRoomTypes = async () => {
    try {
      const hotelId = 'h1';
      const data = await hotelManagerApi.getRoomTypes(hotelId);
      setRoomTypes(data);
    } catch (error) {
      console.error('Error loading room types:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddRoomType = async () => {
    if (!formData.type.trim()) {
      alert('Vui lòng nhập tên loại phòng');
      return;
    }
    
    setProcessing(true);
    try {
      await hotelManagerApi.addRoomType({
        type: formData.type,
        description: formData.description,
        max_guests: formData.max_guests,
        base_price: formData.basePrice,
        quantity: formData.quantity,
        hotel_id: 1,
      });
      setShowAddModal(false);
      resetForm();
      loadRoomTypes();
      alert('Thêm loại phòng thành công!');
    } catch (error) {
      console.error('Error adding room type:', error);
      alert('Lỗi khi thêm loại phòng');
    } finally {
      setProcessing(false);
    }
  };

  const handleUpdatePrice = async () => {
    if (!selectedType) return;
    
    setProcessing(true);
    try {
      await hotelManagerApi.updateRoomPrice(String(selectedType.type_id), formData.basePrice);
      setShowEditModal(false);
      setSelectedType(null);
      loadRoomTypes();
      alert('Cập nhật giá thành công!');
    } catch (error) {
      console.error('Error updating price:', error);
      alert('Lỗi khi cập nhật giá');
    } finally {
      setProcessing(false);
    }
  };

  const resetForm = () => {
    setFormData({
      type: '',
      description: '',
      max_guests: 2,
      basePrice: 0,
      quantity: 1,
    });
  };

  const openEditModal = (roomType: RoomType) => {
    setSelectedType(roomType);
    setFormData({
      type: roomType.type,
      description: roomType.description || '',
      max_guests: roomType.max_guests,
      basePrice: roomType.basePrice || 0,
      quantity: roomType.quantity || 1,
    });
    setShowEditModal(true);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Quản lý loại phòng</h1>
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
        <div>
          <h1 className="text-3xl font-bold text-gray-900">📋 Quản lý loại phòng</h1>
          <p className="text-gray-600 mt-1">Thêm, sửa, cập nhật giá cho các loại phòng</p>
        </div>
        <div className="flex gap-3">
          <Link href="/hotel-manager/rooms">
            <Button variant="outline">← Quản lý phòng</Button>
          </Link>
          <Button onClick={() => {
            resetForm();
            setShowAddModal(true);
          }}>
            + Thêm loại phòng
          </Button>
        </div>
      </div>

      {/* Room Types Grid */}
      {roomTypes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {roomTypes.map((roomType) => (
            <Card key={roomType.type_id} hover>
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{roomType.type}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {roomType.description || 'Không có mô tả'}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    roomType.availability !== false
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {roomType.availability !== false ? 'Hoạt động' : 'Tạm ngưng'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Sức chứa:</span>
                    <p className="font-medium text-gray-900">👥 {roomType.max_guests} khách</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Số lượng:</span>
                    <p className="font-medium text-gray-900">🛏️ {roomType.quantity || 0} phòng</p>
                  </div>
                </div>

                <div className="pt-3 border-t">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-gray-500 text-sm">Giá/đêm:</span>
                      <p className="text-xl font-bold text-[#0071c2]">
                        {formatCurrency(roomType.basePrice || 0)}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditModal(roomType)}
                    >
                      💰 Cập nhật giá
                    </Button>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Link href={`/hotel-manager/rooms/${roomType.type_id}/edit`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      ✏️ Chỉnh sửa
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="text-center py-12">
          <div className="text-6xl mb-4">📋</div>
          <p className="text-gray-600 mb-4">Chưa có loại phòng nào</p>
          <Button onClick={() => setShowAddModal(true)}>
            + Thêm loại phòng đầu tiên
          </Button>
        </Card>
      )}

      {/* Add Room Type Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">➕ Thêm loại phòng mới</h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tên loại phòng *
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="VD: Phòng Deluxe, Suite..."
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mô tả
                  </label>
                  <textarea
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Mô tả về loại phòng..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sức chứa (người)
                    </label>
                    <input
                      type="number"
                      min="1"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      value={formData.max_guests}
                      onChange={(e) => setFormData({ ...formData, max_guests: parseInt(e.target.value) || 1 })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Số lượng phòng
                    </label>
                    <input
                      type="number"
                      min="1"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Giá cơ bản (VNĐ/đêm)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="10000"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={formData.basePrice}
                    onChange={(e) => setFormData({ ...formData, basePrice: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6 pt-4 border-t">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowAddModal(false)}
                >
                  Hủy
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleAddRoomType}
                  disabled={processing}
                >
                  {processing ? 'Đang thêm...' : 'Thêm loại phòng'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Price Modal */}
      {showEditModal && selectedType && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">💰 Cập nhật giá</h2>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedType(null);
                  }}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-gray-600">Loại phòng:</p>
                  <p className="text-lg font-bold text-gray-900">{selectedType.type}</p>
                </div>

                <div>
                  <p className="text-gray-600 mb-1">Giá hiện tại:</p>
                  <p className="text-xl font-bold text-gray-500 line-through">
                    {formatCurrency(selectedType.basePrice || 0)}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Giá mới (VNĐ/đêm)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="10000"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-xl"
                    value={formData.basePrice}
                    onChange={(e) => setFormData({ ...formData, basePrice: parseInt(e.target.value) || 0 })}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    = {formatCurrency(formData.basePrice)}/đêm
                  </p>
                </div>
              </div>

              <div className="flex gap-3 mt-6 pt-4 border-t">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedType(null);
                  }}
                >
                  Hủy
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleUpdatePrice}
                  disabled={processing}
                >
                  {processing ? 'Đang lưu...' : 'Lưu thay đổi'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
