import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Shield, UserPlus, UserMinus, Eye, Search, Plus } from "lucide-react";
import { useAdminRoles, AppRole } from '@/hooks/useAdminRoles';
import { formatDistanceToNow } from 'date-fns';

const getRoleBadgeVariant = (role: AppRole) => {
  switch (role) {
    case 'super_admin':
      return 'destructive';
    case 'admin':
      return 'default';
    case 'moderator':
      return 'secondary';
    case 'employer':
      return 'outline';
    default:
      return 'outline';
  }
};

const getRoleDisplayName = (role: AppRole) => {
  switch (role) {
    case 'super_admin':
      return 'Super Admin';
    case 'admin':
      return 'Admin';
    case 'moderator':
      return 'Moderator';
    case 'employer':
      return 'Employer';
    case 'user':
      return 'User';
    default:
      return role;
  }
};

export const AdminRolesManagement = () => {
  const {
    adminUsers,
    allUsers,
    activityLogs,
    currentUserRole,
    loadingAdminUsers,
    loadingAllUsers,
    loadingLogs,
    assignRole,
    revokeRole,
    isAssigningRole,
    isRevokingRole
  } = useAdminRoles();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<AppRole>('admin');
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [roleNotes, setRoleNotes] = useState('');
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);

  const canManageRole = (targetRole: AppRole) => {
    if (currentUserRole === 'super_admin') return true;
    if (currentUserRole === 'admin' && targetRole !== 'super_admin') return true;
    return false;
  };

  const handleAssignRole = () => {
    if (!selectedUser || !selectedRole) return;

    assignRole({
      userId: selectedUser,
      role: selectedRole,
      notes: roleNotes
    });

    setSelectedUser('');
    setRoleNotes('');
    setIsAssignDialogOpen(false);
  };

  const handleRevokeRole = (roleId: string, userId: string, role: AppRole) => {
    if (!canManageRole(role)) return;
    revokeRole({ roleId, userId, role });
  };

  const filteredUsers = allUsers?.filter(user =>
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loadingAdminUsers) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-300 rounded w-1/3"></div>
          <div className="h-96 bg-gray-300 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Role Management</h1>
          <p className="text-gray-600">Manage admin users, roles, and permissions</p>
        </div>
        
        {canManageRole('admin') && (
          <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Assign Role
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Assign Admin Role</DialogTitle>
                <DialogDescription>
                  Assign an administrative role to a user
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="user">Select User</Label>
                  <Select value={selectedUser} onValueChange={setSelectedUser}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a user" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredUsers?.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.full_name || user.email} - {getRoleDisplayName(user.primary_role)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="role">Role</Label>
                  <Select value={selectedRole} onValueChange={(value) => setSelectedRole(value as AppRole)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {currentUserRole === 'super_admin' && (
                        <SelectItem value="admin">Admin</SelectItem>
                      )}
                      {canManageRole('moderator') && (
                        <SelectItem value="moderator">Moderator</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Textarea
                    value={roleNotes}
                    onChange={(e) => setRoleNotes(e.target.value)}
                    placeholder="Add any notes about this role assignment..."
                  />
                </div>
                
                <Button 
                  onClick={handleAssignRole} 
                  disabled={!selectedUser || isAssigningRole}
                  className="w-full"
                >
                  {isAssigningRole ? 'Assigning...' : 'Assign Role'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Admin Users Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Admin Users
          </CardTitle>
          <CardDescription>
            Users with administrative privileges
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Primary Role</TableHead>
                <TableHead>All Roles</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {adminUsers?.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    {user.full_name || 'No name'}
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={getRoleBadgeVariant(user.primary_role)}>
                      {getRoleDisplayName(user.primary_role)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1 flex-wrap">
                      {user.user_roles
                        ?.filter(role => role.is_active)
                        .map((role) => (
                        <Badge 
                          key={role.id} 
                          variant={getRoleBadgeVariant(role.role)}
                          className="text-xs"
                        >
                          {getRoleDisplayName(role.role)}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    {user.last_login_at 
                      ? formatDistanceToNow(new Date(user.last_login_at), { addSuffix: true })
                      : 'Never'
                    }
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {user.user_roles
                        ?.filter(role => role.is_active && canManageRole(role.role))
                        .map((role) => (
                        <Button
                          key={role.id}
                          variant="outline"
                          size="sm"
                          onClick={() => handleRevokeRole(role.id, user.id, role.role)}
                          disabled={isRevokingRole}
                        >
                          <UserMinus className="h-3 w-3 mr-1" />
                          Revoke {getRoleDisplayName(role.role)}
                        </Button>
                      ))}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Activity Logs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Recent Activity
          </CardTitle>
          <CardDescription>
            Admin actions and role changes
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingLogs ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-200 rounded animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {activityLogs?.map((log) => (
                <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">
                      {log.admin_profile?.full_name || log.admin_profile?.email || 'Unknown Admin'}
                    </p>
                    <p className="text-sm text-gray-600">
                      {log.action_type.replace('_', ' ').toLowerCase()} 
                      {log.target_profile && ` for ${log.target_profile.full_name || log.target_profile.email}`}
                      {log.details?.role && ` (${getRoleDisplayName(log.details.role)})`}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">
                      {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};