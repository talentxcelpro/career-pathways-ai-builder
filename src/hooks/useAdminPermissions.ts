
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { AdminRole, AdminPermissions, ROLE_PERMISSIONS } from '@/types/admin';

export const useAdminPermissions = () => {
  const { user } = useAuth();
  // Security: Start with null role (fail closed)
  const [adminRole, setAdminRole] = useState<AdminRole | null>(null);
  const [permissions, setPermissions] = useState<AdminPermissions>({} as AdminPermissions);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAdminRole = async () => {
      if (!user?.id) {
        // Security: Fail closed - no role on unauthenticated
        setAdminRole(null as any);
        setPermissions({} as AdminPermissions);
        setIsLoading(false);
        return;
      }

      try {
        // Server-side role validation via secure RPC
        const { data, error } = await supabase.rpc('get_user_app_role', {
          _user_id: user.id
        });

        if (error) {
          console.error('Error fetching user role:', error);
          // Security: Fail closed on error - no access
          setAdminRole(null as any);
          setPermissions({} as AdminPermissions);
          setIsLoading(false);
          return;
        }

        // Secure role mapping - server-validated roles only
        const roleMapping: Record<string, AdminRole> = {
          'super_admin': 'super_admin',
          'admin': 'content_admin',
          'moderator': 'moderator',
          'employer': 'job_admin'
        };
        
        // Only assign explicitly defined roles, fail closed on unknown
        const mappedRole = roleMapping[data] || null;
        if (!mappedRole) {
          console.warn('Unknown or unauthorized role detected:', data);
          // Security: Fail closed - no access for unknown roles
          setAdminRole(null as any);
          setPermissions({} as AdminPermissions);
          setIsLoading(false);
          return;
        }
        
        setAdminRole(mappedRole);
        setPermissions(ROLE_PERMISSIONS[mappedRole]);

      } catch (error) {
        console.error('Error in fetchAdminRole:', error);
        // Security: Fail closed on exception
        setAdminRole(null as any);
        setPermissions({} as AdminPermissions);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdminRole();
  }, [user?.id]);

  const hasPermission = (permission: keyof AdminPermissions): boolean => {
    // Security: Require authenticated user and valid role
    if (!user || !adminRole) return false;
    return permissions[permission] === true;
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
