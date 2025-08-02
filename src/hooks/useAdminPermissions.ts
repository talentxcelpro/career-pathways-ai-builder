
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
        // Simplified role fetch without complex state tracking
        const { data, error } = await supabase.rpc('get_user_app_role', {
          _user_id: user.id
        });

        if (error) {
          console.error('Error fetching user role:', error);
          setAdminRole('moderator');
          setPermissions(ROLE_PERMISSIONS.moderator);
          return;
        }

        // Simple role mapping without complex validation
        const roleMapping: Record<string, AdminRole> = {
          'super_admin': 'super_admin',
          'admin': 'content_admin',
          'moderator': 'moderator',
          'employer': 'job_admin',
          'user': 'moderator'
        };
        
        const mappedRole = roleMapping[data] || 'moderator';
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
