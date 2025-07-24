
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
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        // Fetch user role from database using secure function
        const { data, error } = await supabase.rpc('get_user_app_role', {
          _user_id: user.id
        });

        if (error) {
          console.error('Error fetching user role:', error);
          setAdminRole('moderator');
          setPermissions(ROLE_PERMISSIONS.moderator);
        } else {
          // Map app_role to AdminRole
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
        }
      } catch (error) {
        console.error('Error in fetchAdminRole:', error);
        setAdminRole('moderator');
        setPermissions(ROLE_PERMISSIONS.moderator);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdminRole();
  }, [user]);

  const hasPermission = (permission: keyof AdminPermissions): boolean => {
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
