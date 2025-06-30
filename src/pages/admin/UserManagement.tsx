
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { 
  Users, 
  Search, 
  Filter, 
  Download,
  Eye,
  Ban,
  CheckCircle,
  Mail,
  Calendar,
  MapPin
} from 'lucide-react';
import { UnifiedAdminLayout } from '@/components/admin/UnifiedAdminLayout';
import { ExportButton } from '@/components/admin/ExportButton';

const UserManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const queryClient = useQueryClient();

  const { data: users, isLoading } = useQuery({
    queryKey: ['admin-users', searchTerm, roleFilter, statusFilter],
    queryFn: async () => {
      let query = supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (searchTerm) {
        query = query.or(`full_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`);
      }

      if (roleFilter !== 'all') {
        // Cast the roleFilter to the proper enum type
        const validRoles = ['job_seeker', 'employer', 'admin'] as const;
        if (validRoles.includes(roleFilter as any)) {
          query = query.eq('user_role', roleFilter as 'job_seeker' | 'employer' | 'admin');
        }
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
  });

  const { data: userStats } = useQuery({
    queryKey: ['user-stats'],
    queryFn: async () => {
      const [
        { count: totalUsers },
        { count: activeUsers },
        { count: employers },
        { count: candidates }
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).not('last_login_at', 'is', null),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('is_employer', true),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('user_role', 'job_seeker')
      ]);

      return {
        totalUsers: totalUsers || 0,
        activeUsers: activeUsers || 0,
        employers: employers || 0,
        candidates: candidates || 0
      };
    }
  });

  // Remove the updateUserStatus mutation since is_active doesn't exist on profiles table
  // Instead we'll show a simple message for now
  const handleUserAction = (userId: string, action: string) => {
    toast.info(`${action} action would be implemented here for user ${userId}`);
  };

  const filteredUsers = users?.filter(user => {
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && user.last_login_at) ||
      (statusFilter === 'inactive' && !user.last_login_at);
    
    return matchesStatus;
  }) || [];

  const getUserStatusColor = (user: any) => {
    if (user.last_login_at) {
      const lastLogin = new Date(user.last_login_at);
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      return lastLogin > thirtyDaysAgo ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800';
    }
    return 'bg-gray-100 text-gray-800';
  };

  const getUserStatusText = (user: any) => {
    if (user.last_login_at) {
      const lastLogin = new Date(user.last_login_at);
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      return lastLogin > thirtyDaysAgo ? 'Active' : 'Inactive';
    }
    return 'Never logged in';
  };

  return (
    <UnifiedAdminLayout 
      title="User Management" 
      description="Manage and moderate all platform users"
    >
      <div className="space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">{userStats?.totalUsers?.toLocaleString() || '0'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Active Users</p>
                  <p className="text-2xl font-bold text-gray-900">{userStats?.activeUsers?.toLocaleString() || '0'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-purple-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Employers</p>
                  <p className="text-2xl font-bold text-gray-900">{userStats?.employers?.toLocaleString() || '0'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-orange-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Job Seekers</p>
                  <p className="text-2xl font-bold text-gray-900">{userStats?.candidates?.toLocaleString() || '0'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">All Roles</option>
                <option value="job_seeker">Job Seekers</option>
                <option value="employer">Employers</option>
                <option value="admin">Admins</option>
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <ExportButton 
                data={filteredUsers} 
                filename="users-export" 
                format="csv"
              />
            </div>
          </CardContent>
        </Card>

        {/* Users List */}
        <Card>
          <CardHeader>
            <CardTitle>Users ({filteredUsers.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredUsers.map((user) => (
                  <div key={user.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                          {user.full_name?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{user.full_name || 'No Name'}</h3>
                            <Badge className={getUserStatusColor(user)}>
                              {getUserStatusText(user)}
                            </Badge>
                            {user.is_employer && (
                              <Badge variant="outline" className="bg-purple-50 text-purple-700">
                                Employer
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                            <div className="flex items-center gap-1">
                              <Mail className="h-4 w-4" />
                              {user.email}
                            </div>
                            {user.location && (
                              <div className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                {user.location}
                              </div>
                            )}
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              Joined {new Date(user.created_at).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          View Profile
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleUserAction(user.id, 'Suspend')}
                        >
                          <Ban className="h-4 w-4 mr-2" />
                          Suspend
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </UnifiedAdminLayout>
  );
};

export default UserManagement;
