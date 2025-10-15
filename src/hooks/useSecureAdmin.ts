import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

/**
 * Secure admin hook with server-side validation
 * Never relies on client-side state for authorization
 * All admin operations must be validated server-side via RLS or SECURITY DEFINER functions
 */
export const useSecureAdmin = () => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [lastValidated, setLastValidated] = useState<Date | null>(null);
  
  useEffect(() => {
    const validateAdminStatus = async () => {
      if (!user?.id) {
        setIsAdmin(false);
        setIsSuperAdmin(false);
        setIsLoading(false);
        setLastValidated(null);
        return;
      }

      try {
        // Server-side validation via secure RPC
        const { data: isAdminResult, error: adminError } = await supabase.rpc('is_current_user_admin');
        
        if (adminError) {
          console.error('Admin validation error:', adminError);
          setIsAdmin(false);
          setIsSuperAdmin(false);
          setLastValidated(null);
          return;
        }

        setIsAdmin(isAdminResult || false);

        // Check for super admin specifically
        if (isAdminResult) {
          const { data: roleData, error: roleError } = await supabase.rpc('get_user_app_role', {
            _user_id: user.id
          });
          
          if (!roleError && roleData === 'super_admin') {
            setIsSuperAdmin(true);
          }
        }

        setLastValidated(new Date());

      } catch (error) {
        console.error('Error validating admin status:', error);
        setIsAdmin(false);
        setIsSuperAdmin(false);
        setLastValidated(null);
      } finally {
        setIsLoading(false);
      }
    };

    validateAdminStatus();
    
    // Re-validate every 5 minutes
    const interval = setInterval(validateAdminStatus, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [user?.id]);

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
