import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useAuditLog, AUDIT_ACTIONS, RESOURCE_TYPES } from '@/hooks/useAuditLog';
import { toast } from 'sonner';
import { 
  Shield, 
  Users, 
  Activity,
  Settings,
  Lock,
  Key,
  Eye,
  AlertTriangle,
  CheckCircle,
  Clock,
  UserCheck,
  UserX,
  Edit,
  Trash2
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface UserPermission {
  id: string;
  user_id: string;
  permission: string;
  resource: string;
  granted_by: string;
  granted_at: string;
  expires_at: string | null;
  is_active: boolean;
}

interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
  level: 'read' | 'write' | 'admin' | 'super_admin';
}

/**
 * Phase 3: Advanced Permission Management System
 * Granular permission control with comprehensive audit logging
 */
export const PermissionManagement: React.FC = () => {
  const { user } = useAuth();
  const { logAction } = useAuditLog();
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [userPermissions, setUserPermissions] = useState<UserPermission[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [selectedPermission, setSelectedPermission] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchPermissions();
    fetchUserPermissions();
  }, []);

  const fetchPermissions = async () => {
    try {
      // Mock permissions - in real implementation, these would come from database
      const mockPermissions: Permission[] = [
        {
          id: '1',
          name: 'users.read',
          description: 'View user profiles and information',
          category: 'User Management',
          level: 'read',
        },
        {
          id: '2',
          name: 'users.write',
          description: 'Create and edit user profiles',
          category: 'User Management',
          level: 'write',
        },
        {
          id: '3',
          name: 'users.delete',
          description: 'Delete user accounts',
          category: 'User Management',
          level: 'admin',
        },
        {
          id: '4',
          name: 'roles.manage',
          description: 'Assign and modify user roles',
          category: 'Role Management',
          level: 'admin',
        },
        {
          id: '5',
          name: 'security.audit',
          description: 'Access security logs and audit trails',
          category: 'Security',
          level: 'admin',
        },
        {
          id: '6',
          name: 'system.config',
          description: 'Modify system configuration',
          category: 'System',
          level: 'super_admin',
        },
      ];

      setPermissions(mockPermissions);
    } catch (error) {
      console.error('Error fetching permissions:', error);
      toast.error('Failed to fetch permissions');
    }
  };

  const fetchUserPermissions = async () => {
    try {
      setLoading(true);

      // In real implementation, fetch from user_permissions table
      // For now, use mock data
      const mockUserPermissions: UserPermission[] = [
        {
          id: '1',
          user_id: user?.id || '',
          permission: 'users.read',
          resource: '*',
          granted_by: user?.id || '',
          granted_at: new Date().toISOString(),
          expires_at: null,
          is_active: true,
        },
      ];

      setUserPermissions(mockUserPermissions);
    } catch (error) {
      console.error('Error fetching user permissions:', error);
      toast.error('Failed to fetch user permissions');
    } finally {
      setLoading(false);
    }
  };

  const grantPermission = async (userId: string, permissionName: string) => {
    try {
      if (!user) {
        toast.error('Authentication required');
        return;
      }

      // Log the action before performing it
      await logAction(
        AUDIT_ACTIONS.PERMISSION_GRANTED,
        RESOURCE_TYPES.PERMISSION,
        permissionName,
        null,
        { user_id: userId, permission: permissionName }
      );

      // In real implementation, insert into user_permissions table
      const newPermission: UserPermission = {
        id: Date.now().toString(),
        user_id: userId,
        permission: permissionName,
        resource: '*',
        granted_by: user.id,
        granted_at: new Date().toISOString(),
        expires_at: null,
        is_active: true,
      };

      setUserPermissions(prev => [...prev, newPermission]);
      toast.success('Permission granted successfully');
      setDialogOpen(false);

    } catch (error) {
      console.error('Error granting permission:', error);
      toast.error('Failed to grant permission');
    }
  };

  const revokePermission = async (permissionId: string) => {
    try {
      const permission = userPermissions.find(p => p.id === permissionId);
      if (!permission) return;

      // Log the action
      await logAction(
        AUDIT_ACTIONS.PERMISSION_REVOKED,
        RESOURCE_TYPES.PERMISSION,
        permission.permission,
        { user_id: permission.user_id, permission: permission.permission },
        null
      );

      // In real implementation, update user_permissions table
      setUserPermissions(prev => 
        prev.map(p => 
          p.id === permissionId 
            ? { ...p, is_active: false }
            : p
        )
      );

      toast.success('Permission revoked successfully');
    } catch (error) {
      console.error('Error revoking permission:', error);
      toast.error('Failed to revoke permission');
    }
  };

  const getPermissionLevelBadge = (level: string) => {
    switch (level) {
      case 'super_admin':
        return <Badge variant="destructive">Super Admin</Badge>;
      case 'admin':
        return <Badge variant="default">Admin</Badge>;
      case 'write':
        return <Badge variant="secondary">Write</Badge>;
      case 'read':
        return <Badge variant="outline">Read</Badge>;
      default:
        return <Badge variant="secondary">{level}</Badge>;
    }
  };

  const getPermissionIcon = (category: string) => {
    switch (category) {
      case 'User Management':
        return <Users className="h-4 w-4" />;
      case 'Role Management':
        return <UserCheck className="h-4 w-4" />;
      case 'Security':
        return <Shield className="h-4 w-4" />;
      case 'System':
        return <Settings className="h-4 w-4" />;
      default:
        return <Key className="h-4 w-4" />;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
            <Key className="h-8 w-8 text-blue-600" />
            Permission Management
          </h1>
          <p className="text-muted-foreground">
            Phase 3: Granular permission control with comprehensive audit logging
          </p>
        </div>

        {/* Available Permissions */}
        <Card>
          <CardHeader>
            <CardTitle>Available Permissions</CardTitle>
            <CardDescription>
              System permissions organized by category and access level
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {permissions.map((permission) => (
                <Card key={permission.id} className="border">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getPermissionIcon(permission.category)}
                          <code className="text-sm font-mono">{permission.name}</code>
                        </div>
                        {getPermissionLevelBadge(permission.level)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {permission.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-xs">
                          {permission.category}
                        </Badge>
                        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="outline">
                              Grant
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Grant Permission</DialogTitle>
                              <DialogDescription>
                                Grant {permission.name} permission to a user
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <Label htmlFor="user">Select User</Label>
                                <Select value={selectedUser} onValueChange={setSelectedUser}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Choose a user" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value={user?.id || ''}>Current User</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="outline"
                                  onClick={() => setDialogOpen(false)}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  onClick={() => grantPermission(selectedUser, permission.name)}
                                  disabled={!selectedUser}
                                >
                                  Grant Permission
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* User Permissions */}
        <Card>
          <CardHeader>
            <CardTitle>User Permissions</CardTitle>
            <CardDescription>
              Currently granted permissions and their status
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center h-32">
                <div className="text-center space-y-4">
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-muted-foreground">Loading permissions...</p>
                </div>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Permission</TableHead>
                    <TableHead>Resource</TableHead>
                    <TableHead>Granted By</TableHead>
                    <TableHead>Granted At</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {userPermissions.map((permission) => (
                    <TableRow key={permission.id}>
                      <TableCell>
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                          {permission.user_id.slice(0, 8)}...
                        </code>
                      </TableCell>
                      <TableCell>
                        <code className="text-sm font-mono">{permission.permission}</code>
                      </TableCell>
                      <TableCell>{permission.resource}</TableCell>
                      <TableCell>
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                          {permission.granted_by.slice(0, 8)}...
                        </code>
                      </TableCell>
                      <TableCell>
                        {new Date(permission.granted_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {permission.is_active ? (
                          <Badge variant="success">Active</Badge>
                        ) : (
                          <Badge variant="secondary">Revoked</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {permission.is_active && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => revokePermission(permission.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Revoke
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Permission Categories Summary */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">User Management</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {permissions.filter(p => p.category === 'User Management').length}
              </div>
              <p className="text-xs text-muted-foreground">
                Permissions available
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Role Management</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {permissions.filter(p => p.category === 'Role Management').length}
              </div>
              <p className="text-xs text-muted-foreground">
                Permissions available
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Security</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {permissions.filter(p => p.category === 'Security').length}
              </div>
              <p className="text-xs text-muted-foreground">
                Permissions available
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">System</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {permissions.filter(p => p.category === 'System').length}
              </div>
              <p className="text-xs text-muted-foreground">
                Permissions available
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};