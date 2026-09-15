
import React, { useState } from 'react';
import { UnifiedAdminLayout } from '@/components/admin/UnifiedAdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Shield, 
  Search, 
  Plus, 
  Edit, 
  Trash2,
  Eye,
  UserPlus,
  Activity
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AddAdminDialog } from '@/components/admin/dialogs/AddAdminDialog';
import { isSuperAdminPhone } from '@/lib/admin/superAdminPolicy';

const AdminManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: adminUsers } = useQuery({
    queryKey: ['admin-users', searchTerm],
    queryFn: async () => {
      // Get admin user IDs from user_roles table
      const { data: adminRoles } = await supabase
        .from('user_roles')
        .select('user_id')
        .in('role', ['super_admin', 'admin', 'moderator'])
        .eq('is_active', true);

      if (!adminRoles || adminRoles.length === 0) {
        return [];
      }

      const adminUserIds = adminRoles.map(role => role.user_id);

      let query = supabase
        .from('profiles')
        .select('*')
        .in('id', adminUserIds)
        .order('created_at', { ascending: false });

      if (searchTerm) {
        query = query.or(`full_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
  });

  const { data: adminStats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      // Get admin counts from user_roles table
      const [
        { count: totalAdmins },
        { count: superAdmins }
      ] = await Promise.all([
        supabase.from('user_roles').select('*', { count: 'exact', head: true }).in('role', ['super_admin', 'admin', 'moderator']).eq('is_active', true),
        supabase.from('user_roles').select('*', { count: 'exact', head: true }).eq('role', 'super_admin').eq('is_active', true)
      ]);

      // Get admin user IDs for activity checks
      const { data: adminRoles } = await supabase
        .from('user_roles')
        .select('user_id')
        .in('role', ['super_admin', 'admin', 'moderator'])
        .eq('is_active', true);

      const adminUserIds = adminRoles?.map(role => role.user_id) || [];

      const [
        { count: activeAdmins },
        { count: recentLogins }
      ] = await Promise.all([
        adminUserIds.length > 0 ? supabase.from('profiles').select('*', { count: 'exact', head: true }).in('id', adminUserIds).gt('last_login_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()) : Promise.resolve({ count: 0 }),
        adminUserIds.length > 0 ? supabase.from('profiles').select('*', { count: 'exact', head: true }).in('id', adminUserIds).gt('last_login_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) : Promise.resolve({ count: 0 })
      ]);

      return {
        totalAdmins: totalAdmins || 0,
        activeAdmins: activeAdmins || 0,
        recentLogins: recentLogins || 0,
        superAdmins: superAdmins || 0
      };
    }
  });

  const filteredAdmins = adminUsers || [];

  const statsCards = [
    { label: 'Super Admins', value: adminStats?.superAdmins || 0, icon: Shield, color: 'text-red-600' },
    { label: 'Total Admins', value: adminStats?.totalAdmins || 0, icon: UserPlus, color: 'text-blue-600' },
    { label: 'Active (7 days)', value: adminStats?.activeAdmins || 0, icon: Activity, color: 'text-green-600' },
    { label: 'Recent Logins (24h)', value: adminStats?.recentLogins || 0, icon: Eye, color: 'text-purple-600' }
  ];

  return (
    <UnifiedAdminLayout 
      title="Admin Management" 
      description="Manage admin users, roles, and permissions"
    >
      <div className="space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {statsCards.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <stat.icon className={`h-8 w-8 ${stat.color}`} />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search admins by name, email, or role..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline">Filter</Button>
              <Button variant="outline">Export</Button>
              <AddAdminDialog onAdminAdded={() => window.location.reload()} />
            </div>
          </CardContent>
        </Card>

        {/* Admins Table */}
        <Card>
          <CardHeader>
            <CardTitle>Admin Users ({filteredAdmins.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Admin</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead>Login Count</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAdmins.map((admin) => (
                  <TableRow key={admin.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>
                            {admin.full_name?.charAt(0) || 'A'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{admin.full_name || 'Unknown Admin'}</p>
                          <p className="text-sm text-gray-600">{admin.email} {admin.phone && `• ${admin.phone}`}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {isSuperAdminPhone(admin.phone) ? (
                        <Badge className="bg-red-600 text-white font-mono text-[11px] font-bold">
                          👑 ROOT SUPER ADMIN
                        </Badge>
                      ) : (
                        <Badge className="bg-blue-100 text-blue-800 font-mono text-[11px] font-semibold">
                          🛡️ SCOPED ADMIN
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={admin.profile_completed ? 'default' : 'secondary'}>
                        {admin.profile_completed ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600">
                        {admin.last_login_at 
                          ? new Date(admin.last_login_at).toLocaleDateString()
                          : 'Never'
                        }
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{admin.login_count || 0} times</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" title="View details">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" title="Edit admin scope">
                          <Edit className="h-4 w-4" />
                        </Button>
                        {!isSuperAdminPhone(admin.phone) && (
                          <Button variant="outline" size="sm" className="text-red-600" title="Revoke admin privileges">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Admin Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredAdmins.slice(0, 5).map((admin, index) => (
                <div key={admin.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">
                      {admin.full_name || 'Admin'} logged in {admin.login_count || 0} times
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {admin.last_login_at 
                      ? new Date(admin.last_login_at).toLocaleDateString()
                      : 'No recent activity'
                    }
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </UnifiedAdminLayout>
  );
};

export default AdminManagement;
