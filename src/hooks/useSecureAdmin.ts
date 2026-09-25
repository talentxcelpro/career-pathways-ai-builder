import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

/**
 * Secure admin hook with server-side validation
 * Never relies on client-side state for authorization
 * All admin operations must be validated server-side via RLS or SECURITY DEFINER functions
 */
export const useSecureAdmin = () => {
  const { user } = useAuth();
  const { data: adminData, isLoading, error } = useQuery({
    queryKey: ['secure-admin-status', user?.id],
    queryFn: async () => {
      if (!user?.id) return { isAdmin: false, isSuperAdmin: false };

      // Server-side validation via secure RPC
      const { data: isAdminResult, error: adminError } = await supabase.rpc('is_current_user_admin');
      
      if (adminError) {
        console.error('Admin validation error:', adminError);
        return { isAdmin: false, isSuperAdmin: false };
      }

      let isSuperAdmin = false;
      // Check for super admin specifically
      if (isAdminResult) {
        const { data: roleData, error: roleError } = await supabase.rpc('get_user_app_role', {
          _user_id: user.id
        });
        
        if (!roleError && roleData === 'super_admin') {
          isSuperAdmin = true;
        }
      }

      return { isAdmin: isAdminResult || false, isSuperAdmin };
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const isAdmin = adminData?.isAdmin || false;
  const isSuperAdmin = adminData?.isSuperAdmin || false;
  const lastValidated = adminData ? new Date() : null;

  /**
   * Perform an admin action with server-side validation
   * All mutations should use this to ensure proper authorization
   */
  const performAdminAction = async <T,>(
    action: () => Promise<T>,
    actionName: string
  ): Promise<{ success: boolean; data?: T; error?: string }> => {
    if (!isAdmin) {
      return { success: false, error: 'Unauthorized: Admin access required' };
    }

    try {
      // Log the admin action (will be validated server-side)
      await supabase.rpc('audit_admin_action', {
        p_action_type: actionName,
        p_target_resource: 'system',
        p_details: {}
      });

      const data = await action();
      return { success: true, data };
    } catch (error: any) {
      console.error(`Admin action '${actionName}' failed:`, error);
      return { success: false, error: error.message || 'Action failed' };
    }
  };

  return {
    isAdmin,
    isSuperAdmin,
    isLoading,
    lastValidated,
    performAdminAction
  };
};
