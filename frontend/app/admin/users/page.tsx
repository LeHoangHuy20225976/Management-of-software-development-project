'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { adminApi, AdminUser } from '@/lib/api/services';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'customer' | 'hotel_manager' | 'admin'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal states
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await adminApi.getAllUsers();
      setUsers(data);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRole = async (userId: number, newRole: AdminUser['role']) => {
    setProcessing(true);
    try {
      await adminApi.updateUserRole(String(userId), newRole);
      setUsers(users.map(u => u.user_id === userId ? { ...u, role: newRole } : u));
      alert('Cập nhật vai trò thành công!');
    } catch (error) {
      console.error('Error updating role:', error);
      alert('Lỗi khi cập nhật vai trò');
    } finally {
      setProcessing(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    setProcessing(true);
    try {
      await adminApi.deleteUser(String(selectedUser.user_id));
      setUsers(users.filter(u => u.user_id !== selectedUser.user_id));
      setShowDeleteModal(false);
      setSelectedUser(null);
      alert('Xóa người dùng thành công!');
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Lỗi khi xóa người dùng');
    } finally {
      setProcessing(false);
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesFilter = filter === 'all' || u.role === filter;
    const matchesSearch = !searchQuery || 
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getRoleBadge = (role: AdminUser['role']) => {
    const styles: Record<AdminUser['role'], string> = {
      admin: 'bg-red-100 text-red-800',
      hotel_manager: 'bg-blue-100 text-blue-800',
      customer: 'bg-green-100 text-green-800',
    };
    const labels: Record<AdminUser['role'], string> = {
      admin: 'Admin',
      hotel_manager: 'Hotel Manager',
      customer: 'Khách hàng',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[role]}`}>
        {labels[role]}
      </span>
    );
  };

  const getStatusBadge = (status: AdminUser['status']) => {
    const styles: Record<AdminUser['status'], string> = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      banned: 'bg-red-100 text-red-800',
    };
    const labels: Record<AdminUser['status'], string> = {
      active: 'Hoạt động',
      inactive: 'Không hoạt động',
      banned: 'Đã khóa',
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
        <h1 className="text-3xl font-bold text-gray-900">👥 Quản lý người dùng</h1>
        <div className="text-gray-600">
          Tổng: <strong>{users.length}</strong> người dùng
        </div>
      </div>

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
            <div className="text-sm text-gray-600">Hotel Manager</div>
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
              placeholder="🔍 Tìm kiếm theo tên hoặc email..."
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
              Tất cả
            </Button>
            <Button
              variant={filter === 'customer' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setFilter('customer')}
            >
              Khách hàng
            </Button>
            <Button
              variant={filter === 'hotel_manager' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setFilter('hotel_manager')}
            >
              Hotel Manager
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
                <th className="text-left py-3 px-4 font-medium text-gray-600">Tên</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Email</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">SĐT</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Vai trò</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Trạng thái</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Ngày tạo</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.user_id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-gray-900">#{user.user_id}</td>
                  <td className="py-3 px-4">
                    <div className="font-medium text-gray-900">{user.name}</div>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{user.email}</td>
                  <td className="py-3 px-4 text-gray-600">{user.phone || '-'}</td>
                  <td className="py-3 px-4">{getRoleBadge(user.role)}</td>
                  <td className="py-3 px-4">{getStatusBadge(user.status)}</td>
                  <td className="py-3 px-4 text-gray-600 text-sm">
                    {new Date(user.created_at).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <select
                        className="text-xs border rounded px-2 py-1"
                        value={user.role}
                        onChange={(e) => handleUpdateRole(user.user_id, e.target.value as AdminUser['role'])}
                        disabled={processing}
                      >
                        <option value="customer">Khách hàng</option>
                        <option value="hotel_manager">Hotel Manager</option>
                        <option value="admin">Admin</option>
                      </select>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => {
                          setSelectedUser(user);
                          setShowDeleteModal(true);
                        }}
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
            <p className="text-gray-600">Không tìm thấy người dùng nào</p>
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
    </div>
  );
}
