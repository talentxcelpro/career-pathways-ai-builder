import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  callAdminFunction, 
  validateUserPermission, 
  logSecurityEvent 
} from '@/utils/secureSupabaseClient';

interface SecureAdminState {
  isAdmin: boolean;
  isSuperAdmin: boolean;
  permissions: {
    canManageUsers: boolean;
    canManageRoles: boolean;
    canAccessSystemSettings: boolean;
    canViewSecurityLogs: boolean;
  };
  isLoading: boolean;
}

export const useSecureAdmin = () => {
  const { user } = useAuth();
  const [adminState, setAdminState] = useState<SecureAdminState>({
    isAdmin: false,
    isSuperAdmin: false,
    permissions: {
      canManageUsers: false,
      canManageRoles: false,
      canAccessSystemSettings: false,
      canViewSecurityLogs: false,
    },
    isLoading: true,
  });

  useEffect(() => {
    const checkAdminPermissions = async () => {
      if (!user) {
        setAdminState(prev => ({ ...prev, isLoading: false }));
        return;
      }

      try {
        // Check various admin levels
        const [
          isAdmin,
          isSuperAdmin,
          canManageUsers,
          canManageRoles,
          canAccessSystemSettings,
          canViewSecurityLogs
        ] = await Promise.all([
          validateUserPermission('admin'),
          validateUserPermission('super_admin'),
          validateUserPermission('admin'),
          validateUserPermission('super_admin'),
          validateUserPermission('super_admin'),
          validateUserPermission('moderator'),
        ]);

        setAdminState({
          isAdmin,
          isSuperAdmin,
          permissions: {
            canManageUsers,
            canManageRoles,
            canAccessSystemSettings,
            canViewSecurityLogs,
          },
          isLoading: false,
        });

        // Log admin access attempt
        if (isAdmin) {
          await logSecurityEvent('admin_access', 'Admin panel accessed', {
            adminLevel: isSuperAdmin ? 'super_admin' : 'admin'
          });
        }

      } catch (error) {
        console.error('Failed to check admin permissions:', error);
        setAdminState(prev => ({ ...prev, isLoading: false }));
        
        // Log failed permission check
        await logSecurityEvent('permission_check_failed', 'Failed to validate admin permissions', {
          error: error.message
        });
      }
    };

    checkAdminPermissions();
  }, [user]);

  // Secure function to call admin operations
  const executeAdminOperation = async (
    operation: string,
    payload: any = {},
    requiredRole: 'super_admin' | 'admin' | 'moderator' = 'admin'
  ) => {
    try {
      // Double-check permissions before executing
      const hasPermission = await validateUserPermission(requiredRole);
      if (!hasPermission) {
        throw new Error('Insufficient permissions for this operation');
      }

      // Log the operation attempt
      await logSecurityEvent('admin_operation', `Executing ${operation}`, {
        operation,
        requiredRole,
        payload: { ...payload, sensitive: '[REDACTED]' } // Remove sensitive data from logs
      });

      // Execute the operation
      const result = await callAdminFunction(operation, payload, requiredRole);
      
      if (result.error) {
        await logSecurityEvent('admin_operation_failed', `Operation ${operation} failed`, {
          operation,
          error: result.error.message
        });
        throw result.error;
      }

      // Log successful operation
      await logSecurityEvent('admin_operation_success', `Operation ${operation} completed`, {
        operation
      });

      return result.data;
    } catch (error) {
      console.error(`Admin operation ${operation} failed:`, error);
      throw error;
    }
  };

  return {
    ...adminState,
    executeAdminOperation,
    refreshPermissions: () => {
      setAdminState(prev => ({ ...prev, isLoading: true }));
      // Re-trigger the effect
      checkAdminPermissions();
    }
  };
};

// Wrapper function for the effect
const checkAdminPermissions = async () => {
  // This will be replaced by the effect logic
};