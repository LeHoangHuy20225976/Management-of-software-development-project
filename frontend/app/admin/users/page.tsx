'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { adminApi, userProfileApi } from '@/lib/api/services';
import type { AdminUser, User } from '@/types';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'customer' | 'hotel_manager' | 'admin'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal states
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await adminApi.getAllUsers();
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRole = async (userId: number, newRole: AdminUser['role']) => {
    if (!newRole) return;
    setProcessing(true);
    setErrorMessage('');
    try {
      await adminApi.updateUserRole(String(userId), newRole);
      setUsers(users.map(u => u.user_id === userId ? { ...u, role: newRole } : u));
      setSuccessMessage(`Đã cập nhật vai trò thành công!`);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error updating role:', error);
      setErrorMessage('Lỗi khi cập nhật vai trò');
      setTimeout(() => setErrorMessage(''), 3000);
    } finally {
      setProcessing(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    setProcessing(true);
    setErrorMessage('');
    try {
      await adminApi.deleteUser(String(selectedUser.user_id));
      setUsers(users.filter(u => u.user_id !== selectedUser.user_id));
      setShowDeleteModal(false);
      setSelectedUser(null);
      setSuccessMessage('Đã xóa người dùng thành công!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error deleting user:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Lỗi khi xóa người dùng');
      setTimeout(() => setErrorMessage(''), 3000);
      setShowDeleteModal(false);
    } finally {
      setProcessing(false);
    }
  };

  const filteredUsers = (users || []).filter(u => {
    const matchesFilter = filter === 'all' || u.role === filter;
    const matchesSearch = !searchQuery || 
      u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getRoleBadge = (role: AdminUser['role']) => {
    const styles: Record<string, string> = {
      admin: 'bg-red-100 text-red-800',
      hotel_manager: 'bg-blue-100 text-blue-800',
      customer: 'bg-green-100 text-green-800',
    };
    const labels: Record<string, string> = {
      admin: '👑 Admin',
      hotel_manager: '🏨 Quản lý KS',
      customer: '👤 Khách hàng',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[role || 'customer']}`}>
        {labels[role || 'customer']}
      </span>
    );
  };

  const getStatusBadge = (user: AdminUser) => {
    // Determine status based on available data
    const isActive = user.updatedAt ? new Date(user.updatedAt).getTime() > Date.now() - 30 * 24 * 60 * 60 * 1000 : true;
    
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
        {isActive ? '✓ Hoạt động' : '○ Không hoạt động'}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Quản lý người dùng</h1>
        <Card>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">👥 User Management</h1>
        <div className="text-gray-600">
          Total: <strong>{users.length}</strong> users
        </div>
      </div>

      {/* Success/Error Messages */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center gap-2">
          <span className="text-xl">✓</span>
          <span>{successMessage}</span>
        </div>
      )}
      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-center gap-2">
          <span className="text-xl">⚠</span>
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900">{users.length}</div>
            <div className="text-sm text-gray-600">Tổng cộng</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">
              {users.filter(u => u.role === 'customer').length}
            </div>
            <div className="text-sm text-gray-600">Khách hàng</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">
              {users.filter(u => u.role === 'hotel_manager').length}
            </div>
            <div className="text-sm text-gray-600">Quản lý KS</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-red-600">
              {users.filter(u => u.role === 'admin').length}
            </div>
            <div className="text-sm text-gray-600">Admin</div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="🔍 Search by name or email..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={filter === 'all' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
            >
              All
            </Button>
            <Button
              variant={filter === 'customer' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setFilter('customer')}
            >
              Customer
            </Button>
            <Button
              variant={filter === 'hotel_manager' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setFilter('hotel_manager')}
            >
              🏨 Quản lý KS
            </Button>
            <Button
              variant={filter === 'admin' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setFilter('admin')}
            >
              Admin
            </Button>
          </div>
        </div>
      </Card>

      {/* Users Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-600">ID</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Name</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Email</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Phone</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Role</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Created Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.user_id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-gray-900">#{user.user_id}</td>
                  <td className="py-3 px-4">
                    <div className="font-medium text-gray-900">{user.name || 'N/A'}</div>
                  </td>
                  <td className="py-3 px-4 text-gray-900">{user.email}</td>
                  <td className="py-3 px-4 text-gray-900">{user.phone_number || '-'}</td>
                  <td className="py-3 px-4">{getRoleBadge(user.role)}</td>
                  <td className="py-3 px-4">{getStatusBadge(user)}</td>
                  <td className="py-3 px-4 text-gray-900 text-sm">
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : '-'}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedUser(user);
                          setShowDetailModal(true);
                        }}
                        title="Xem chi tiết"
                      >
                        👁️
                      </Button>
                      <select
                        style={{ color: 'black' }}
                        className="text-xs border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={user.role || 'customer'}
                        onChange={(e) => handleUpdateRole(user.user_id, e.target.value as AdminUser['role'])}
                        disabled={processing}
                      >
                        <option value="customer">👤 Khách hàng</option>
                        <option value="hotel_manager">🏨 Quản lý KS</option>
                        <option value="admin">👑 Admin</option>
                      </select>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => {
                          setSelectedUser(user);
                          setShowDeleteModal(true);
                        }}
                        title="Xóa người dùng"
                      >
                        🗑️
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">👤</div>
            <p className="text-gray-600">No users found</p>
          </div>
        )}
      </Card>

      {/* Delete Modal */}
      {showDeleteModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">⚠️ Xác nhận xóa</h2>
            <p className="text-gray-600 mb-4">
              Bạn có chắc muốn xóa người dùng <strong>{selectedUser.name}</strong> ({selectedUser.email})?
            </p>
            <p className="text-red-600 text-sm mb-6">
              Hành động này không thể hoàn tác!
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedUser(null);
                }}
                disabled={processing}
              >
                Hủy
              </Button>
              <Button
                variant="danger"
                onClick={handleDeleteUser}
                disabled={processing}
              >
                {processing ? 'Đang xóa...' : 'Xóa người dùng'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">📋 Chi tiết người dùng</h2>
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedUser(null);
                }}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-6" style={{ color: 'black' }}>
              {/* Basic Info */}
              <Card>
                <h3 className="font-semibold text-lg mb-4">Thông tin cơ bản</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-900">ID</label>
                    <p className="font-medium">#{selectedUser.user_id}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-900">Vai trò</label>
                    <p className="font-medium">{getRoleBadge(selectedUser.role)}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-900">Tên</label>
                    <p className="font-medium">{selectedUser.name || '-'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-900">Email</label>
                    <p className="font-medium">{selectedUser.email || '-'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-900">Số điện thoại</label>
                    <p className="font-medium">{selectedUser.phone_number || '-'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-900">Giới tính</label>
                    <p className="font-medium">
                      {selectedUser.gender === 'male' || selectedUser.gender === 'Nam' ? '👨 Nam' : 
                       selectedUser.gender === 'female' || selectedUser.gender === 'Nữ' ? '👩 Nữ' : 
                       selectedUser.gender || '-'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-900">Ngày sinh</label>
                    <p className="font-medium">
                      {selectedUser.date_of_birth ? new Date(selectedUser.date_of_birth).toLocaleDateString('vi-VN') : '-'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-900">Trạng thái</label>
                    <p className="font-medium">{getStatusBadge(selectedUser)}</p>
                  </div>
                </div>
              </Card>

              {/* Activity Stats */}
              <Card>
                <h3 className="font-semibold text-lg mb-4">Thống kê hoạt động</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-3xl font-bold text-blue-600">{selectedUser.bookingCount || 0}</div>
                    <div className="text-sm text-gray-600">Đặt phòng</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-3xl font-bold text-green-600">
                      {selectedUser.totalSpent ? `${(selectedUser.totalSpent / 1000000).toFixed(1)}M` : '0'}
                    </div>
                    <div className="text-sm text-gray-600">Chi tiêu (₫)</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-3xl font-bold text-purple-600">
                      {selectedUser.lastLogin ? new Date(selectedUser.lastLogin).toLocaleDateString('vi-VN', { month: 'short', day: 'numeric' }) : '-'}
                    </div>
                    <div className="text-sm text-gray-600">Đăng nhập cuối</div>
                  </div>
                </div>
              </Card>

              {/* Timestamps */}
              <Card>
                <h3 className="font-semibold text-lg mb-4">Thời gian</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-900">Ngày tạo</label>
                    <p className="font-medium">
                      {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleString('vi-VN') : '-'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-900">Cập nhật cuối</label>
                    <p className="font-medium">
                      {selectedUser.updatedAt ? new Date(selectedUser.updatedAt).toLocaleString('vi-VN') : '-'}
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            <div className="mt-6 flex justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedUser(null);
                }}
              >
                Đóng
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
