
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { AdminRole, AdminPermissions, ROLE_PERMISSIONS } from '@/types/admin';

export const useAdminPermissions = () => {
  const { user } = useAuth();
  const [adminRole, setAdminRole] = useState<AdminRole>('moderator');
  const [permissions, setPermissions] = useState<AdminPermissions>(ROLE_PERMISSIONS.moderator);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAdminRole = async () => {
      if (!user?.id) {
        setAdminRole('moderator');
        setPermissions(ROLE_PERMISSIONS.moderator);
        setIsLoading(false);
        return;
      }

      try {
        // Enhanced role fetch with multiple checks
        const { data, error } = await supabase.rpc('get_user_app_role', {
          _user_id: user.id
        });

        // Enhanced role mapping - define first for both RPC and fallback
        const roleMapping: Record<string, AdminRole> = {
          'super_admin': 'super_admin',
          'admin': 'content_admin',
          'moderator': 'moderator',
          'employer': 'job_admin'
        };

        if (error) {
          console.error('Error fetching user role:', error);
          // Try direct role check as fallback
          const { data: roleData, error: roleError } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', user.id)
            .eq('is_active', true)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();
          
          if (!roleError && roleData) {
            const mappedRole = roleMapping[roleData.role] || 'moderator';
            setAdminRole(mappedRole);
            setPermissions(ROLE_PERMISSIONS[mappedRole]);
            return;
          }
          
          setAdminRole('moderator');
          setPermissions(ROLE_PERMISSIONS.moderator);
          return;
        }
        
        let mappedRole = roleMapping[data];
        
        // If no direct mapping, try to map the actual role value
        if (!mappedRole && data) {
          // Handle cases where the function returns the actual enum value
          if (data === 'super_admin' || data === 'admin' || data === 'moderator' || data === 'employer') {
            mappedRole = roleMapping[data] || 'moderator';
          }
        }
        
        if (!mappedRole) {
          console.warn('Unknown role detected:', data, 'using moderator as fallback');
          setAdminRole('moderator');
          setPermissions(ROLE_PERMISSIONS.moderator);
          return;
        }
        
        console.log('Admin role resolved:', mappedRole, 'from data:', data);
        setAdminRole(mappedRole);
        setPermissions(ROLE_PERMISSIONS[mappedRole]);

      } catch (error) {
        console.error('Error in fetchAdminRole:', error);
        setAdminRole('moderator');
        setPermissions(ROLE_PERMISSIONS.moderator);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdminRole();
  }, [user?.id]);

  const hasPermission = (permission: keyof AdminPermissions): boolean => {
    if (!user) return false;
    return permissions[permission];
  };

  const isAdmin = adminRole === 'super_admin' || adminRole === 'content_admin';

  return {
    adminRole,
    permissions,
    hasPermission,
    isAdmin,
    isLoading
  };
};
