'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { userProfileApi } from '@/lib/api/services';
import type { User } from '@/types';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'customer' | 'hotel_manager' | 'admin'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await userProfileApi.getAllUsers();
      setUsers(data);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  // Note: This page only displays users, no edit/delete functionality
  // const handleUpdateRole = async (userId: number, newRole: User['role']) => {
  //   // Implementation for updating user role if needed
  // };

  // const handleDeleteUser = async () => {
  //   // Implementation for deleting user if needed
  // };

  const filteredUsers = users.filter(u => {
    const matchesFilter = filter === 'all' || u.role === filter;
    const matchesSearch = !searchQuery ||
      (u.name?.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (u.email?.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const getRoleBadge = (role: string) => {
    const styles: Record<string, string> = {
      admin: 'bg-red-100 text-red-800',
      hotel_manager: 'bg-blue-100 text-blue-800',
      customer: 'bg-green-100 text-green-800',
    };
    const labels: Record<string, string> = {
      admin: 'Admin',
      hotel_manager: 'Hotel Manager',
      customer: 'Customer',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[role] || 'bg-gray-100 text-gray-800'}`}>
        {labels[role] || role}
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
                  <td className="py-3 px-4 text-gray-600">{user.email || 'N/A'}</td>
                  <td className="py-3 px-4 text-gray-600">{user.phone_number || 'N/A'}</td>
                  <td className="py-3 px-4">{getRoleBadge(user.role || 'customer')}</td>
                  <td className="py-3 px-4 text-gray-600 text-sm">
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US') : 'N/A'}
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

      {/* No modals needed for view-only page */}
    </div>
  );
}
