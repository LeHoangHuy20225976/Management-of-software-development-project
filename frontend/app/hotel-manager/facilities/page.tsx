'use client';

import { useState, useEffect } from 'react';
import { hotelManagerApi } from '@/lib/api/services';

interface Facility {
  id: number;
  name: string;
  icon: string;
  category: string;
  isActive: boolean;
}

const facilityCategories = [
  { id: 'general', name: 'Tiện nghi chung', icon: '🏨' },
  { id: 'room', name: 'Tiện nghi phòng', icon: '🛏️' },
  { id: 'dining', name: 'Ẩm thực', icon: '🍽️' },
  { id: 'recreation', name: 'Giải trí', icon: '🎮' },
  { id: 'business', name: 'Dịch vụ kinh doanh', icon: '💼' },
  { id: 'wellness', name: 'Sức khỏe & Spa', icon: '💆' },
  { id: 'transport', name: 'Giao thông', icon: '🚗' },
];

const defaultFacilities: Facility[] = [
  // General
  { id: 1, name: 'WiFi miễn phí', icon: '📶', category: 'general', isActive: true },
  { id: 2, name: 'Lễ tân 24/7', icon: '🛎️', category: 'general', isActive: true },
  { id: 3, name: 'Thang máy', icon: '🛗', category: 'general', isActive: true },
  { id: 4, name: 'Két an toàn', icon: '🔐', category: 'general', isActive: true },
  { id: 5, name: 'Dịch vụ giặt ủi', icon: '👔', category: 'general', isActive: false },
  { id: 6, name: 'Dịch vụ phòng', icon: '🍳', category: 'general', isActive: true },
  // Room
  { id: 7, name: 'Điều hòa', icon: '❄️', category: 'room', isActive: true },
  { id: 8, name: 'TV màn hình phẳng', icon: '📺', category: 'room', isActive: true },
  { id: 9, name: 'Minibar', icon: '🍷', category: 'room', isActive: true },
  { id: 10, name: 'Máy sấy tóc', icon: '💇', category: 'room', isActive: true },
  { id: 11, name: 'Bồn tắm', icon: '🛁', category: 'room', isActive: false },
  { id: 12, name: 'Ban công', icon: '🌅', category: 'room', isActive: false },
  // Dining
  { id: 13, name: 'Nhà hàng', icon: '🍴', category: 'dining', isActive: true },
  { id: 14, name: 'Quầy bar', icon: '🍸', category: 'dining', isActive: true },
  { id: 15, name: 'Bữa sáng buffet', icon: '🥐', category: 'dining', isActive: true },
  { id: 16, name: 'Phục vụ phòng 24h', icon: '🛎️', category: 'dining', isActive: false },
  // Recreation
  { id: 17, name: 'Hồ bơi', icon: '🏊', category: 'recreation', isActive: true },
  { id: 18, name: 'Phòng gym', icon: '🏋️', category: 'recreation', isActive: true },
  { id: 19, name: 'Sân tennis', icon: '🎾', category: 'recreation', isActive: false },
  { id: 20, name: 'Khu vui chơi trẻ em', icon: '🎠', category: 'recreation', isActive: false },
  // Business
  { id: 21, name: 'Phòng họp', icon: '📊', category: 'business', isActive: true },
  { id: 22, name: 'Trung tâm hội nghị', icon: '🎤', category: 'business', isActive: false },
  { id: 23, name: 'Máy in/Fax', icon: '🖨️', category: 'business', isActive: true },
  // Wellness
  { id: 24, name: 'Spa', icon: '💆', category: 'wellness', isActive: true },
  { id: 25, name: 'Phòng xông hơi', icon: '🧖', category: 'wellness', isActive: false },
  { id: 26, name: 'Massage', icon: '💪', category: 'wellness', isActive: true },
  // Transport
  { id: 27, name: 'Bãi đậu xe miễn phí', icon: '🅿️', category: 'transport', isActive: true },
  { id: 28, name: 'Đưa đón sân bay', icon: '✈️', category: 'transport', isActive: true },
  { id: 29, name: 'Thuê xe', icon: '🚗', category: 'transport', isActive: false },
  { id: 30, name: 'Dịch vụ taxi', icon: '🚕', category: 'transport', isActive: true },
];

export default function HotelManagerFacilitiesPage() {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newFacility, setNewFacility] = useState({ name: '', icon: '', category: 'general' });
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [loading, setLoading] = useState(true);

  // TODO: Get actual hotel ID from auth context or props
  const hotelId = '1';

  useEffect(() => {
    const loadFacilities = async () => {
      try {
        const savedFacilities = await hotelManagerApi.getFacilities(hotelId);
        if (savedFacilities && savedFacilities.length > 0) {
          setFacilities(savedFacilities);
        } else {
          setFacilities(defaultFacilities);
        }
      } catch (error) {
        console.error('Error loading facilities:', error);
        setFacilities(defaultFacilities);
      } finally {
        setLoading(false);
      }
    };
    loadFacilities();
  }, [hotelId]);

  const toggleFacility = (id: number) => {
    setFacilities(prev => 
      prev.map(f => f.id === id ? { ...f, isActive: !f.isActive } : f)
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await hotelManagerApi.updateFacilities(hotelId, facilities);
      setSaveMessage('Đã lưu tiện nghi thành công!');
    } catch (error) {
      console.error('Error saving facilities:', error);
      setSaveMessage('Lỗi khi lưu tiện nghi!');
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveMessage(''), 3000);
    }
  };

  const handleAddFacility = () => {
    if (!newFacility.name.trim()) return;
    
    const facility: Facility = {
      id: Date.now(),
      name: newFacility.name,
      icon: newFacility.icon || '✨',
      category: newFacility.category,
      isActive: true,
    };
    
    setFacilities(prev => [...prev, facility]);
    setNewFacility({ name: '', icon: '', category: 'general' });
    setShowAddModal(false);
  };

  const handleDeleteFacility = (id: number) => {
    if (confirm('Bạn có chắc muốn xóa tiện nghi này?')) {
      setFacilities(prev => prev.filter(f => f.id !== id));
    }
  };

  const filteredFacilities = selectedCategory === 'all' 
    ? facilities 
    : facilities.filter(f => f.category === selectedCategory);

  const activeFacilitiesCount = facilities.filter(f => f.isActive).length;

  const getCategoryName = (categoryId: string) => {
    return facilityCategories.find(c => c.id === categoryId)?.name || categoryId;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý Tiện nghi</h1>
          <p className="text-gray-600 mt-1">Cấu hình các tiện nghi có tại khách sạn của bạn</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Thêm tiện nghi
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            {isSaving ? (
              <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
            Lưu thay đổi
          </button>
        </div>
      </div>

      {/* Success Message */}
      {saveMessage && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          {saveMessage}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-blue-600">{facilities.length}</div>
          <div className="text-sm text-gray-600">Tổng tiện nghi</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-green-600">{activeFacilitiesCount}</div>
          <div className="text-sm text-gray-600">Đang kích hoạt</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-gray-600">{facilities.length - activeFacilitiesCount}</div>
          <div className="text-sm text-gray-600">Đang tắt</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-purple-600">{facilityCategories.length}</div>
          <div className="text-sm text-gray-600">Danh mục</div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Tất cả ({facilities.length})
          </button>
          {facilityCategories.map(category => {
            const count = facilities.filter(f => f.category === category.id).length;
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2 ${
                  selectedCategory === category.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span>{category.icon}</span>
                <span>{category.name} ({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Facilities Grid */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="p-4 border-b bg-gray-50">
          <h3 className="font-semibold text-gray-900">
            {selectedCategory === 'all' ? 'Tất cả tiện nghi' : getCategoryName(selectedCategory)}
          </h3>
          <p className="text-sm text-gray-500 mt-1">Nhấn vào tiện nghi để bật/tắt hiển thị trên trang khách sạn</p>
        </div>

        <div className="p-4">
          {filteredFacilities.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">📦</div>
              <h3 className="text-lg font-medium text-gray-900">Không có tiện nghi nào</h3>
              <p className="text-gray-500 mt-1">Thêm tiện nghi mới cho danh mục này</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredFacilities.map(facility => (
                <div
                  key={facility.id}
                  className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    facility.isActive
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 bg-gray-50 opacity-60'
                  }`}
                  onClick={() => toggleFacility(facility.id)}
                >
                  {/* Active indicator */}
                  <div className={`absolute top-2 right-2 w-3 h-3 rounded-full ${
                    facility.isActive ? 'bg-green-500' : 'bg-gray-300'
                  }`} />
                  
                  {/* Delete button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteFacility(facility.id);
                    }}
                    className="absolute top-2 left-2 w-6 h-6 rounded-full bg-red-100 text-red-600 hover:bg-red-200 flex items-center justify-center opacity-0 group-hover:opacity-100 hover:opacity-100 transition-opacity"
                    title="Xóa tiện nghi"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>

                  <div className="text-center">
                    <div className="text-3xl mb-2">{facility.icon}</div>
                    <div className="font-medium text-gray-900 text-sm">{facility.name}</div>
                    <div className="text-xs text-gray-500 mt-1">{getCategoryName(facility.category)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="bg-gray-50 rounded-lg p-4 flex flex-wrap gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-green-500"></div>
          <span>Đang kích hoạt - Hiển thị trên trang khách sạn</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-gray-300"></div>
          <span>Đã tắt - Không hiển thị</span>
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Thêm tiện nghi mới</h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên tiện nghi *</label>
                <input
                  type="text"
                  value={newFacility.name}
                  onChange={(e) => setNewFacility({ ...newFacility, name: e.target.value })}
                  placeholder="Ví dụ: Máy lạnh, WiFi, Bể bơi..."
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Icon (emoji)</label>
                <input
                  type="text"
                  value={newFacility.icon}
                  onChange={(e) => setNewFacility({ ...newFacility, icon: e.target.value })}
                  placeholder="Ví dụ: 🏊 ❄️ 📶"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">Để trống sẽ sử dụng icon mặc định ✨</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục</label>
                <select
                  value={newFacility.category}
                  onChange={(e) => setNewFacility({ ...newFacility, category: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {facilityCategories.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.icon} {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="p-6 border-t bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-100"
              >
                Hủy
              </button>
              <button
                onClick={handleAddFacility}
                disabled={!newFacility.name.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                Thêm tiện nghi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
