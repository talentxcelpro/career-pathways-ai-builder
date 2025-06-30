
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
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

      // For now, we'll determine role based on email
      // In a real app, this would come from the database
      let role: AdminRole = 'moderator';
      
      if (user.email === 'talentxcelpro@gmail.com') {
        role = 'super_admin';
      } else if (user.email?.includes('admin')) {
        role = 'content_admin';
      } else if (user.email?.includes('job')) {
        role = 'job_admin';
      } else if (user.email?.includes('support')) {
        role = 'support_admin';
      }

      setAdminRole(role);
      setPermissions(ROLE_PERMISSIONS[role]);
      setIsLoading(false);
    };

    fetchAdminRole();
  }, [user]);

  const hasPermission = (permission: keyof AdminPermissions): boolean => {
    return permissions[permission];
  };

  const isAdmin = user?.email === 'talentxcelpro@gmail.com';

  return {
    adminRole,
    permissions,
    hasPermission,
    isAdmin,
    isLoading
  };
};
