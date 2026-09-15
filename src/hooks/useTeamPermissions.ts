import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { PermissionRequest, ActivityLog } from '@/types/team';

export const useTeamPermissions = (companyId?: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Get user's role and permissions in the company
  const { data: roleData, isLoading: roleLoading } = useQuery({
    queryKey: ['team-role', user?.id, companyId],
    queryFn: async () => {
      if (!user?.id || !companyId) return null;

      const { data: teamMember, error } = await supabase
        .from('company_team_members')
        .select('role, company_id, permissions')
        .eq('user_id', user.id)
        .eq('company_id', companyId)
        .eq('is_active', true)
        .single();

      if (error) throw error;
      return teamMember;
    },
    enabled: !!user?.id && !!companyId,
  });

  // Get role-based permissions
  const { data: permissions } = useQuery({
    queryKey: ['role-permissions', roleData?.role],
    queryFn: async () => {
      if (!roleData?.role) return [];

      const { data, error } = await supabase
        .from('role_permissions')
        .select('*')
        .eq('role', roleData.role);

      if (error) throw error;
      return data;
    },
    enabled: !!roleData?.role,
  });

  // Check specific permission
  const hasPermission = (permissionType: string): boolean => {
    const userRole = (roleData?.role || 'member').toLowerCase();

    // 1. Owners and Admins have full access to all employer features
    if (userRole === 'owner' || userRole === 'admin' || userRole === 'superadmin') {
      return true;
    }

    // 2. Check direct custom permissions in company_team_members
    if (Array.isArray((roleData as any)?.permissions) && (roleData as any).permissions.includes(permissionType)) {
      return true;
    }

    // 3. Check role_permissions table if available
    if (permissions && permissions.length > 0) {
      const permission = permissions.find(p => p.permission_type === permissionType);
      if (permission?.is_allowed) return true;
      
      const permissionHierarchies: Record<string, string[]> = {
        'access_crm_basic': ['access_crm_full'],
        'manage_jobs_basic': ['manage_jobs', 'manage_jobs_full'],
        'view_analytics_basic': ['view_analytics', 'view_analytics_full'],
      };
      
      const higherPermissions = permissionHierarchies[permissionType];
      if (higherPermissions) {
        const hasHigher = higherPermissions.some(higherPerm => 
          permissions.find(p => p.permission_type === higherPerm)?.is_allowed
        );
        if (hasHigher) return true;
      }
    }

    // 4. Default fallback permissions by role (when role_permissions table is unseeded)
    const DEFAULT_ROLE_PERMISSIONS: Record<string, string[]> = {
      owner: [
        'manage_jobs', 'manage_jobs_full', 'manage_jobs_basic',
        'access_crm_basic', 'access_crm_full',
        'manage_company', 'view_analytics', 'view_analytics_full', 'view_analytics_basic',
        'approve_permissions', 'manage_team'
      ],
      admin: [
        'manage_jobs', 'manage_jobs_full', 'manage_jobs_basic',
        'access_crm_basic', 'access_crm_full',
        'manage_company', 'view_analytics', 'view_analytics_full', 'view_analytics_basic',
        'approve_permissions', 'manage_team'
      ],
      recruiter: [
        'manage_jobs', 'manage_jobs_basic',
        'access_crm_basic', 'access_crm_full',
        'view_analytics', 'view_analytics_basic'
      ],
      member: [
        'manage_jobs', 'manage_jobs_basic',
        'access_crm_basic', 'access_crm_full',
        'manage_company', 'view_analytics', 'view_analytics_basic'
      ]
    };

    const allowedDefaults = DEFAULT_ROLE_PERMISSIONS[userRole] || DEFAULT_ROLE_PERMISSIONS.member;
    return allowedDefaults.includes(permissionType);
  };

  // Check if permission requires approval
  const requiresApproval = (permissionType: string): boolean => {
    if (!permissions || !roleData) return false;
    
    const permission = permissions.find(p => p.permission_type === permissionType);
    return permission?.requires_approval || false;
  };

  // Log current state for debugging
  React.useEffect(() => {
    if (roleData && permissions) {
      console.log('Role Data:', roleData);
      console.log('Permissions:', permissions);
    }
  }, [roleData, permissions]);

  // Create permission request
  const requestPermission = useMutation({
    mutationFn: async ({ 
      permissionType, 
      reason, 
      resourceId 
    }: { 
      permissionType: string; 
      reason: string; 
      resourceId?: string 
    }) => {
      if (!companyId) throw new Error('Company ID required');

      const { data, error } = await supabase.rpc('create_permission_request', {
        _company_id: companyId,
        _permission_type: permissionType,
        _reason: reason,
        _resource_id: resourceId || null,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permission-requests', companyId] });
    },
  });

  // Get permission requests for the company (owners/admins only)
  const { data: permissionRequests } = useQuery({
    queryKey: ['permission-requests', companyId],
    queryFn: async () => {
      if (!companyId || !hasPermission('approve_permissions')) return [];

      const { data: requests, error } = await supabase
        .from('permission_requests')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get user profiles for requesters and approvers
      const userIds = [...new Set([
        ...requests.map(r => r.requester_id),
        ...requests.map(r => r.approved_by).filter(Boolean)
      ])];

      if (userIds.length === 0) return requests;

      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .in('id', userIds);

      // Map profiles to requests
      return requests.map(request => ({
        ...request,
        requester: profiles?.find(p => p.id === request.requester_id),
        approver: request.approved_by ? profiles?.find(p => p.id === request.approved_by) : null
      })) as PermissionRequest[];
    },
    enabled: !!companyId && hasPermission('approve_permissions'),
  });

  // Approve/reject permission request
  const handlePermissionRequest = useMutation({
    mutationFn: async ({ 
      requestId, 
      action, 
      reason 
    }: { 
      requestId: string; 
      action: 'approved' | 'rejected'; 
      reason?: string 
    }) => {
      const { error } = await supabase
        .from('permission_requests')
        .update({
          status: action,
          approved_by: user?.id,
          responded_at: new Date().toISOString(),
          ...(reason && { reason }),
        })
        .eq('id', requestId);

      if (error) throw error;

      // Log the activity
      if (companyId) {
        await supabase.rpc('log_team_activity', {
          _company_id: companyId,
          _user_id: user?.id,
          _action_type: `permission_${action}`,
          _resource_type: 'permission_request',
          _resource_id: requestId,
          _details: { reason },
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permission-requests', companyId] });
    },
  });

  return {
    role: roleData?.role,
    companyId: roleData?.company_id,
    permissions,
    hasPermission,
    requiresApproval,
    requestPermission,
    permissionRequests,
    handlePermissionRequest,
    isLoading: roleLoading,
  };
};

export const useActivityLogs = (companyId?: string) => {
  const { user } = useAuth();

  const { data: activityLogs, isLoading } = useQuery({
    queryKey: ['activity-logs', companyId],
    queryFn: async () => {
      if (!companyId) return [];

      const { data: logs, error } = await supabase
        .from('team_activity_logs')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      // Get user profiles
      const userIds = [...new Set(logs.map(log => log.user_id))];
      
      if (userIds.length === 0) return logs;

      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .in('id', userIds);

      // Map profiles to logs
      return logs.map(log => ({
        ...log,
        user: profiles?.find(p => p.id === log.user_id)
      })) as ActivityLog[];
    },
    enabled: !!companyId,
  });

  return {
    activityLogs,
    isLoading,
  };
};