
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { AdminRole, AdminPermissions, ROLE_PERMISSIONS } from '@/types/admin';
import { logSecurityEvent } from '@/utils/secureSupabaseClient';

export const useAdminPermissions = () => {
  const { user } = useAuth();
  const [adminRole, setAdminRole] = useState<AdminRole>('moderator');
  const [permissions, setPermissions] = useState<AdminPermissions>(ROLE_PERMISSIONS.moderator);
  const [isLoading, setIsLoading] = useState(true);
  const [lastRoleCheck, setLastRoleCheck] = useState<string | null>(null);

  useEffect(() => {
    const fetchAdminRole = async () => {
      if (!user) {
        setAdminRole('moderator');
        setPermissions(ROLE_PERMISSIONS.moderator);
        setIsLoading(false);
        return;
      }

      try {
        // Prevent role escalation by validating the request
        const currentRoleCheck = `${user.id}-${Date.now()}`;
        setLastRoleCheck(currentRoleCheck);

        // Log role check attempt
        await logSecurityEvent(
          'role_check_attempted',
          'User role verification attempted',
          {
            userId: user.id,
            checkId: currentRoleCheck
          }
        );

        // Fetch user role from database using secure function
        const { data, error } = await supabase.rpc('get_user_app_role', {
          _user_id: user.id
        });

        // Check if this is still the latest role check (prevent race conditions)
        if (lastRoleCheck !== currentRoleCheck) {
          console.warn('Role check superseded by newer request');
          return;
        }

        if (error) {
          console.error('Error fetching user role:', error);
          
          // Log security event for role fetch failure
          await logSecurityEvent(
            'role_fetch_failed',
            'Failed to fetch user role from database',
            {
              userId: user.id,
              error: error.message,
              severity: 'high'
            }
          );
          
          // Default to minimal permissions on error
          setAdminRole('moderator');
          setPermissions(ROLE_PERMISSIONS.moderator);
        } else {
          // Validate the returned role is legitimate
          const validRoles = ['super_admin', 'admin', 'moderator', 'employer', 'user'];
          if (!validRoles.includes(data)) {
            console.error('Invalid role returned:', data);
            
            await logSecurityEvent(
              'invalid_role_detected',
              'Invalid role returned from database',
              {
                userId: user.id,
                invalidRole: data,
                severity: 'critical'
              }
            );
            
            setAdminRole('moderator');
            setPermissions(ROLE_PERMISSIONS.moderator);
            return;
          }

          // Map app_role to AdminRole with strict validation
          const roleMapping: Record<string, AdminRole> = {
            'super_admin': 'super_admin',
            'admin': 'content_admin',
            'moderator': 'moderator',
            'employer': 'job_admin',
            'user': 'moderator'
          };
          
          const mappedRole = roleMapping[data] || 'moderator';
          
          // Log successful role assignment
          await logSecurityEvent(
            'role_assigned',
            'User role successfully assigned',
            {
              userId: user.id,
              assignedRole: mappedRole,
              originalRole: data
            }
          );
          
          setAdminRole(mappedRole);
          setPermissions(ROLE_PERMISSIONS[mappedRole]);
        }
      } catch (error) {
        console.error('Error in fetchAdminRole:', error);
        
        // Log critical security event
        await logSecurityEvent(
          'role_system_error',
          'Critical error in role assignment system',
          {
            userId: user.id,
            error: error instanceof Error ? error.message : 'Unknown error',
            severity: 'critical'
          }
        );
        
        // Default to minimal permissions on any error
        setAdminRole('moderator');
        setPermissions(ROLE_PERMISSIONS.moderator);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdminRole();
  }, [user, lastRoleCheck]);

  const hasPermission = (permission: keyof AdminPermissions): boolean => {
    // Additional security check - verify user is authenticated
    if (!user) {
      return false;
    }
    
    return permissions[permission];
  };

  const isAdmin = adminRole === 'super_admin' || adminRole === 'content_admin';

  // Enhanced permission checking with security logging
  const checkPermissionSecurely = async (permission: keyof AdminPermissions): Promise<boolean> => {
    if (!user) {
      await logSecurityEvent(
        'unauthorized_permission_check',
        'Permission check attempted without authentication',
        {
          permission,
          severity: 'high'
        }
      );
      return false;
    }

    const hasAccess = permissions[permission];
    
    // Log permission checks for audit purposes
    await logSecurityEvent(
      'permission_checked',
      `Permission ${permission} checked for user`,
      {
        userId: user.id,
        permission,
        granted: hasAccess,
        role: adminRole
      }
    );

    return hasAccess;
  };

  return {
    adminRole,
    permissions,
    hasPermission,
    checkPermissionSecurely,
    isAdmin,
    isLoading
  };
};
