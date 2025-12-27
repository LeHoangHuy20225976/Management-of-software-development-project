'use client';

import { useState } from 'react';

interface SystemSettings {
  siteName: string;
  siteDescription: string;
  supportEmail: string;
  supportPhone: string;
  currency: string;
  timezone: string;
  maintenanceMode: boolean;
  allowRegistration: boolean;
  requireEmailVerification: boolean;
  maxBookingDays: number;
  minBookingHours: number;
  cancellationHours: number;
  commissionRate: number;
  vnpayEnabled: boolean;
  momoEnabled: boolean;
  bankTransferEnabled: boolean;
  cashEnabled: boolean;
}

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<'general' | 'booking' | 'payment' | 'email' | 'security'>('general');
  const [settings, setSettings] = useState<SystemSettings>({
    siteName: 'Hotel Booking System',
    siteDescription: 'Hệ thống đặt phòng khách sạn trực tuyến',
    supportEmail: 'support@hotelbooking.vn',
    supportPhone: '1900 1234',
    currency: 'VND',
    timezone: 'Asia/Ho_Chi_Minh',
    maintenanceMode: false,
    allowRegistration: true,
    requireEmailVerification: true,
    maxBookingDays: 365,
    minBookingHours: 24,
    cancellationHours: 24,
    commissionRate: 10,
    vnpayEnabled: true,
    momoEnabled: true,
    bankTransferEnabled: true,
    cashEnabled: true,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage('');
    
    // Mock save - in real app would call API
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Save to localStorage for persistence in mock mode
    localStorage.setItem('adminSettings', JSON.stringify(settings));
    
    setSaveMessage('Cài đặt đã được lưu thành công!');
    setIsSaving(false);
    
    setTimeout(() => setSaveMessage(''), 3000);
  };

  const tabs = [
    { id: 'general', label: 'Cài đặt chung', icon: '⚙️' },
    { id: 'booking', label: 'Đặt phòng', icon: '📅' },
    { id: 'payment', label: 'Thanh toán', icon: '💳' },
    { id: 'email', label: 'Email', icon: '📧' },
    { id: 'security', label: 'Bảo mật', icon: '🔒' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-black">Cài đặt Hệ thống</h1>
        <p className="text-black mt-1">Quản lý cấu hình và cài đặt của hệ thống</p>
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

      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        {/* Tabs */}
        <div className="border-b">
          <nav className="flex overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600 bg-blue-50'
                    : 'border-transparent text-black hover:text-black hover:bg-gray-50 font-medium'
                }`}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* General Settings */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-black">Cài đặt chung</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-black mb-1">Tên website</label>
                  <input
                    type="text"
                    value={settings.siteName}
                    onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-black mb-1">Email hỗ trợ</label>
                  <input
                    type="email"
                    value={settings.supportEmail}
                    onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-1">Số điện thoại hỗ trợ</label>
                  <input
                    type="text"
                    value={settings.supportPhone}
                    onChange={(e) => setSettings({ ...settings, supportPhone: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-1">Múi giờ</label>
                  <select
                    value={settings.timezone}
                    onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                  >
                    <option value="Asia/Ho_Chi_Minh">Việt Nam (UTC+7)</option>
                    <option value="Asia/Bangkok">Thái Lan (UTC+7)</option>
                    <option value="Asia/Singapore">Singapore (UTC+8)</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-black mb-1">Mô tả website</label>
                  <textarea
                    value={settings.siteDescription}
                    onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.maintenanceMode}
                      onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                      className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <span className="font-medium text-black">Chế độ bảo trì</span>
                      <p className="text-sm text-black">Tắt website cho người dùng thông thường để bảo trì</p>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Booking Settings */}
          {activeTab === 'booking' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-black">Cài đặt đặt phòng</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-black mb-1">Số ngày đặt trước tối đa</label>
                  <input
                    type="number"
                    value={settings.maxBookingDays}
                    onChange={(e) => setSettings({ ...settings, maxBookingDays: Number(e.target.value) })}
                    min="1"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                  />
                  <p className="text-sm text-black mt-1">Khách có thể đặt phòng trước tối đa bao nhiêu ngày</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-1">Thời gian đặt tối thiểu (giờ)</label>
                  <input
                    type="number"
                    value={settings.minBookingHours}
                    onChange={(e) => setSettings({ ...settings, minBookingHours: Number(e.target.value) })}
                    min="0"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                  />
                  <p className="text-sm text-black mt-1">Số giờ tối thiểu trước khi check-in để đặt phòng</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-1">Thời gian hủy miễn phí (giờ)</label>
                  <input
                    type="number"
                    value={settings.cancellationHours}
                    onChange={(e) => setSettings({ ...settings, cancellationHours: Number(e.target.value) })}
                    min="0"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                  />
                  <p className="text-sm text-black mt-1">Số giờ trước check-in cho phép hủy miễn phí</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-1">Tỷ lệ hoa hồng (%)</label>
                  <input
                    type="number"
                    value={settings.commissionRate}
                    onChange={(e) => setSettings({ ...settings, commissionRate: Number(e.target.value) })}
                    min="0"
                    max="100"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                  />
                  <p className="text-sm text-black mt-1">Phần trăm hoa hồng từ mỗi booking</p>
                </div>
              </div>
            </div>
          )}

          {/* Payment Settings */}
          {activeTab === 'payment' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-black">Cài đặt thanh toán</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-black mb-1">Đơn vị tiền tệ</label>
                  <select
                    value={settings.currency}
                    onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                  >
                    <option value="VND">VND - Việt Nam Đồng</option>
                    <option value="USD">USD - US Dollar</option>
                  </select>
                </div>
              </div>

              <div className="border-t pt-6">
                <h4 className="font-medium text-black mb-4">Phương thức thanh toán</h4>
                <div className="space-y-4">
                  <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={settings.vnpayEnabled}
                      onChange={(e) => setSettings({ ...settings, vnpayEnabled: e.target.checked })}
                      className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <span className="font-medium text-black">VNPay</span>
                      <p className="text-sm text-black">Thanh toán qua cổng VNPay</p>
                    </div>
                    <img src="https://vnpay.vn/s1/statics.vnpay.vn/2023/9/06ncktiwd6dc1694418196384.png" alt="VNPay" className="h-8" />
                  </label>

                  <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={settings.momoEnabled}
                      onChange={(e) => setSettings({ ...settings, momoEnabled: e.target.checked })}
                      className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <span className="font-medium text-black">MoMo</span>
                      <p className="text-sm text-black">Thanh toán qua ví MoMo</p>
                    </div>
                    <div className="w-8 h-8 bg-pink-500 rounded-lg flex items-center justify-center text-white font-bold">M</div>
                  </label>

                  <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={settings.bankTransferEnabled}
                      onChange={(e) => setSettings({ ...settings, bankTransferEnabled: e.target.checked })}
                      className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <span className="font-medium text-black">Chuyển khoản ngân hàng</span>
                      <p className="text-sm text-black">Chuyển khoản trực tiếp qua ngân hàng</p>
                    </div>
                    <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white">🏦</div>
                  </label>

                  <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={settings.cashEnabled}
                      onChange={(e) => setSettings({ ...settings, cashEnabled: e.target.checked })}
                      className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <span className="font-medium text-black">Tiền mặt</span>
                      <p className="text-sm text-black">Thanh toán tiền mặt khi check-in</p>
                    </div>
                    <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center text-white">💵</div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Email Settings */}
          {activeTab === 'email' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-black">Cài đặt Email</h3>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-yellow-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h4 className="font-medium text-yellow-800">Thông tin</h4>
                    <p className="text-sm text-yellow-700 mt-1">
                      Cài đặt SMTP và email template được quản lý trong file environment. 
                      Liên hệ đội ngũ kỹ thuật để thay đổi cấu hình email server.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium text-black">Các loại email tự động</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-green-500">✓</span>
                      <span className="font-medium">Email xác nhận đặt phòng</span>
                    </div>
                    <p className="text-sm text-black">Gửi khi khách hoàn tất đặt phòng</p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-green-500">✓</span>
                      <span className="font-medium">Email hủy đặt phòng</span>
                    </div>
                    <p className="text-sm text-black">Gửi khi booking bị hủy</p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-green-500">✓</span>
                      <span className="font-medium">Email thanh toán thành công</span>
                    </div>
                    <p className="text-sm text-black">Gửi khi thanh toán hoàn tất</p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-green-500">✓</span>
                      <span className="font-medium">Email chào mừng</span>
                    </div>
                    <p className="text-sm text-black">Gửi khi đăng ký tài khoản mới</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Security Settings */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-black">Cài đặt bảo mật</h3>
              
              <div className="space-y-4">
                <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={settings.allowRegistration}
                    onChange={(e) => setSettings({ ...settings, allowRegistration: e.target.checked })}
                    className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <span className="font-medium text-black">Cho phép đăng ký</span>
                    <p className="text-sm text-black">Cho phép người dùng mới đăng ký tài khoản</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={settings.requireEmailVerification}
                    onChange={(e) => setSettings({ ...settings, requireEmailVerification: e.target.checked })}
                    className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <span className="font-medium text-black">Yêu cầu xác thực email</span>
                    <p className="text-sm text-black">Người dùng phải xác thực email trước khi sử dụng tài khoản</p>
                  </div>
                </label>
              </div>

              <div className="border-t pt-6">
                <h4 className="font-medium text-black mb-4">Hành động nguy hiểm</h4>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm text-red-700 mb-4">
                    Các hành động bên dưới có thể ảnh hưởng đến dữ liệu và hoạt động của hệ thống. Hãy cẩn thận!
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <button className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 text-sm font-medium">
                      Xóa cache hệ thống
                    </button>
                    <button className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 text-sm font-medium">
                      Reset sessions
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Save Button */}
        <div className="border-t px-6 py-4 bg-gray-50 flex justify-end">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            {isSaving ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Đang lưu...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Lưu cài đặt
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
