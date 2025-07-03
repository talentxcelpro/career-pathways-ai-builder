import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type AppRole = 'super_admin' | 'admin' | 'moderator' | 'employer' | 'user';

export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  assigned_by: string | null;
  assigned_at: string;
  is_active: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface AdminUser {
  id: string;
  full_name: string | null;
  email: string | null;
  primary_role: AppRole;
  user_roles: UserRole[];
  created_at: string;
  last_login_at: string | null;
}

export interface ActivityLog {
  id: string;
  admin_user_id: string;
  action_type: string;
  target_user_id: string | null;
  details: any;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  admin_profile?: {
    full_name: string | null;
    email: string | null;
  };
  target_profile?: {
    full_name: string | null;
    email: string | null;
  };
}

export const useAdminRoles = () => {
  const queryClient = useQueryClient();

  // Get all admin users
  const { data: adminUsers, isLoading: loadingAdminUsers } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          email,
          primary_role,
          created_at,
          last_login_at
        `)
        .in('primary_role', ['super_admin', 'admin', 'moderator'])
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get user roles separately
      const userIds = data?.map(u => u.id) || [];
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('*')
        .in('user_id', userIds);

      if (rolesError) throw rolesError;

      // Combine data
      const combinedData = data?.map(user => ({
        ...user,
        user_roles: roles?.filter(role => role.user_id === user.id) || []
      }));

      return combinedData as AdminUser[];
    }
  });

  // Get all users for role assignment
  const { data: allUsers, isLoading: loadingAllUsers } = useQuery({
    queryKey: ['all-users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          email,
          primary_role,
          created_at
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get user roles separately
      const userIds = data?.map(u => u.id) || [];
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('*')
        .in('user_id', userIds);

      if (rolesError) throw rolesError;

      // Combine data
      const combinedData = data?.map(user => ({
        ...user,
        user_roles: roles?.filter(role => role.user_id === user.id) || []
      }));

      return combinedData;
    }
  });

  // Assign role to user
  const assignRoleMutation = useMutation({
    mutationFn: async ({ 
      userId, 
      role, 
      notes 
    }: { 
      userId: string; 
      role: AppRole; 
      notes?: string; 
    }) => {
      const { error } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role,
          assigned_by: (await supabase.auth.getUser()).data.user?.id,
          notes
        });

      if (error) throw error;

      // Log the activity
      await supabase
        .from('admin_activity_log')
        .insert({
          admin_user_id: (await supabase.auth.getUser()).data.user?.id!,
          action_type: 'ROLE_ASSIGNED',
          target_user_id: userId,
          details: { role, notes }
        });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['all-users'] });
      queryClient.invalidateQueries({ queryKey: ['activity-logs'] });
      toast.success('Role assigned successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to assign role');
    }
  });

  // Revoke role from user
  const revokeRoleMutation = useMutation({
    mutationFn: async ({ roleId, userId, role }: { roleId: string; userId: string; role: AppRole; }) => {
      const { error } = await supabase
        .from('user_roles')
        .update({ is_active: false })
        .eq('id', roleId);

      if (error) throw error;

      // Log the activity
      await supabase
        .from('admin_activity_log')
        .insert({
          admin_user_id: (await supabase.auth.getUser()).data.user?.id!,
          action_type: 'ROLE_REVOKED',
          target_user_id: userId,
          details: { role }
        });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['all-users'] });
      queryClient.invalidateQueries({ queryKey: ['activity-logs'] });
      toast.success('Role revoked successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to revoke role');
    }
  });

  // Get activity logs
  const { data: activityLogs, isLoading: loadingLogs } = useQuery({
    queryKey: ['activity-logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_activity_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      // Get admin and target profiles separately
      const adminIds = data?.map(log => log.admin_user_id) || [];
      const targetIds = data?.filter(log => log.target_user_id).map(log => log.target_user_id!) || [];
      const allUserIds = [...adminIds, ...targetIds];

      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .in('id', allUserIds);

      if (profilesError) throw profilesError;

      // Combine data
      const combinedData = data?.map(log => ({
        ...log,
        admin_profile: profiles?.find(p => p.id === log.admin_user_id),
        target_profile: log.target_user_id ? profiles?.find(p => p.id === log.target_user_id) : null
      }));

      return combinedData as ActivityLog[];
    }
  });

  // Check current user permissions
  const { data: currentUserRole } = useQuery({
    queryKey: ['current-user-role'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .rpc('get_user_app_role', { _user_id: user.id });

      if (error) throw error;
      return data as AppRole | null;
    }
  });

  return {
    adminUsers,
    allUsers,
    activityLogs,
    currentUserRole,
    loadingAdminUsers,
    loadingAllUsers,
    loadingLogs,
    assignRole: assignRoleMutation.mutate,
    revokeRole: revokeRoleMutation.mutate,
    isAssigningRole: assignRoleMutation.isPending,
    isRevokingRole: revokeRoleMutation.isPending
  };
};