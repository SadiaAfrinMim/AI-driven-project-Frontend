'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { fetchApi, api } from '@/lib/api';
import { toast } from 'sonner';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN' | 'MANAGER';
  profileImage?: string;
  bio?: string;
  createdAt: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Current user from cookie
  const Cookies = require('js-cookie');
  const currentUser = (() => {
    try {
      const u = Cookies.get('user');
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  })();
  const isAdmin = currentUser?.role === 'ADMIN';

  const fetchUsers = async () => {
    try {
      const data = await fetchApi(`${api.users}/all-users`);
      setUsers(Array.isArray(data.data) ? data.data : Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchUsers();
  }, []);

  // Show ALL users for admin (including ADMIN, MANAGER, USER)
  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // If current user is MANAGER, they should only view and not change roles
  // Backend already filters managers to only receive USER accounts
  

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`Are you sure you want to delete user "${userName}"?`)) return;

    try {
      await fetchApi(`${api.users}/${userId}`, {
        method: 'DELETE',
      });
      toast.success('User deleted successfully');
      fetchUsers();
    } catch (error) {
      console.error('Failed to delete user:', error);
      toast.error('Failed to delete user');
    }
  };

  const handleRoleChange = async (userId: string, newRole: string, userName?: string) => {
    try {
      await fetchApi(`${api.users}/update-role`, {
        method: 'PATCH',
        body: JSON.stringify({ userId, role: newRole }),
      });
      toast.success(`${userName || 'User'}'s role changed to ${newRole}`);
      fetchUsers();
    } catch (error) {
      console.error('Failed to update role:', error);
      toast.error('Failed to update role');
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-red-100 text-red-800';
      case 'MANAGER':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
  
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
  
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Manage Users</h1>
        <p className="text-muted-foreground mt-2">View all users and change roles (Admin only)</p>
      </div>

      {/* Search */}
      <div className="max-w-md">
        <div className="relative">
          <Search className="absolute left-4 top-4 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-11 h-12"
          />
        </div>
      </div>

      {/* Users Grid - Clean & Simple */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredUsers.length > 0 ? (
          filteredUsers.map((user) => (
            <div key={user.id} className="bg-white dark:bg-slate-900 border rounded-2xl p-6 hover:shadow-lg transition-all">
              <div className="flex items-start gap-4">
                {user.profileImage ? (
                  <img src={user.profileImage} alt={user.name} className="w-14 h-14 rounded-full object-cover ring-2 ring-offset-2 ring-gray-100" />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white text-2xl font-semibold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-lg">{user.name}</p>
                      <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                    </div>
                    {isAdmin ? (
                      <Select
                        value={user.role}
                        onValueChange={(newRole) => {
                          if (newRole) handleRoleChange(user.id, newRole);
                        }}
                      >
                        <SelectTrigger className="w-[110px] h-8">
                          <SelectValue>
                            <Badge className={getRoleBadgeColor(user.role)}>{user.role}</Badge>
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USER">USER</SelectItem>
                          <SelectItem value="MANAGER">MANAGER</SelectItem>
                          <SelectItem value="ADMIN">ADMIN</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <Badge className={getRoleBadgeColor(user.role)}>{user.role}</Badge>
                    )}
                  </div>

                  <div className="mt-4 pt-4 border-t text-xs text-muted-foreground">
                    Joined {new Date(user.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            No users found
          </div>
        )}
      </div>
    </div>
  );
}