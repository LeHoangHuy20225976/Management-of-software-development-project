'use client';

import { hotelManagerApi } from '@/lib/api/services';
import { useEffect, useMemo, useState } from 'react';

interface Facility {
  id: number;
  name: string;
  icon: string;
  category: string;
  isActive: boolean;
}

export default function HotelManagerFacilitiesPage() {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [loading, setLoading] = useState(true);

  const [hotels, setHotels] = useState<Array<Record<string, unknown>>>([]);
  const [selectedHotelId, setSelectedHotelId] = useState<string>('');

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        const myHotels = await hotelManagerApi.getMyHotels();
        const normalized = (myHotels as unknown as Array<Record<string, unknown>>) ?? [];
        setHotels(normalized);
        const firstId = normalized.length
          ? String((normalized[0] as any).hotel_id ?? (normalized[0] as any).id)
          : '';
        setSelectedHotelId(firstId);
      } catch (error) {
        console.error('Error loading hotels:', error);
        alert('Lỗi khi tải danh sách khách sạn!');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  useEffect(() => {
    const loadFacilities = async () => {
      if (!selectedHotelId) {
        setFacilities([]);
        return;
      }

      try {
        setLoading(true);
        const serverFacilities = await hotelManagerApi.getFacilities(selectedHotelId);
        setFacilities(
          (serverFacilities ?? []).map((f) => ({
            ...f,
            icon: f.icon ?? '',
            category: f.category ?? 'general',
          }))
        );
      } catch (error) {
        console.error('Error loading facilities:', error);
        setFacilities([]);
      } finally {
        setLoading(false);
      }
    };

    loadFacilities();
  }, [selectedHotelId]);

  const activeFacilitiesCount = useMemo(
    () => facilities.filter((f) => f.isActive).length,
    [facilities],
  );

  const toggleFacility = (id: number) => {
    setFacilities((prev) => prev.map((f) => (f.id === id ? { ...f, isActive: !f.isActive } : f)));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (!selectedHotelId) {
        alert('Vui lòng chọn khách sạn!');
        return;
      }

      await hotelManagerApi.updateFacilities(selectedHotelId, facilities);
      setSaveMessage('Đã lưu tiện nghi thành công!');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      console.error('Error saving facilities:', error);
      alert('Đã có lỗi khi lưu tiện nghi!');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6 text-center text-gray-900">
          Đang tải...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý tiện nghi</h1>
          <p className="text-gray-600 mt-1">Cấu hình các tiện nghi cho khách sạn của bạn</p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          <div className="text-sm font-semibold text-gray-900">Khách sạn</div>
          <select
            value={selectedHotelId}
            onChange={(e) => setSelectedHotelId(e.target.value)}
            className="w-full md:w-[420px] px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0071c2] focus:border-[#0071c2] text-gray-900 disabled:bg-gray-100"
            disabled={hotels.length === 0 || isSaving}
          >
            {hotels.length === 0 ? (
              <option value="">Chưa có khách sạn</option>
            ) : (
              hotels.map((h) => (
                <option
                  key={String((h as any).hotel_id ?? (h as any).id)}
                  value={String((h as any).hotel_id ?? (h as any).id)}
                >
                  {String((h as any).name ?? 'Unnamed hotel')}
                </option>
              ))
            )}
          </select>
        </div>
      </div>

      {saveMessage && (
        <div className="bg-green-50 border border-green-200 text-green-800 rounded-lg p-3 text-sm">
          {saveMessage}
        </div>
      )}

      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="text-sm text-gray-700 mt-3">
          Đã bật: <span className="font-semibold">{activeFacilitiesCount}</span> tiện nghi
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {facilities.length === 0 ? (
          <div className="p-6 text-center text-gray-700">Không có tiện nghi</div>
        ) : (
          <div className="divide-y divide-gray-200">
            {facilities.map((f) => (
              <div key={f.id} className="p-4 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-gray-900 font-medium truncate">{f.name}</div>
                </div>

                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                    <input
                      type="checkbox"
                      checked={f.isActive}
                      onChange={() => toggleFacility(f.id)}
                      className="w-4 h-4 text-[#0071c2] rounded focus:ring-2 focus:ring-[#0071c2]"
                    />
                    Bật
                  </label>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
