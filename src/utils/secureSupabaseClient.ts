import { supabase } from '@/integrations/supabase/client';

/**
 * Secure Supabase utilities that prevent exposure of sensitive operations
 * and ensure proper authentication
 */

// Secure function to call edge functions with proper error handling
export const callSecureEdgeFunction = async (
  functionName: string,
  payload: any = {},
  requireAuth: boolean = true
) => {
  try {
    if (requireAuth) {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Authentication required');
      }
    }

    const { data, error } = await supabase.functions.invoke(functionName, {
      body: payload
    });

    if (error) {
      console.error(`Edge function ${functionName} error:`, error);
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.error(`Secure edge function call failed for ${functionName}:`, error);
    return { data: null, error };
  }
};

// Secure function to perform admin operations with role validation
export const callAdminFunction = async (
  functionName: string,
  payload: any = {},
  requiredRole: 'super_admin' | 'admin' | 'moderator' = 'admin'
) => {
  try {
    // Check authentication first
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('Authentication required for admin operations');
    }

    // Validate admin role
    const { data: hasPermission, error: roleError } = await supabase.rpc('validate_admin_operation', {
      _required_role: requiredRole
    });

    if (roleError || !hasPermission) {
      throw new Error('Insufficient permissions for this operation');
    }

    // Call the function securely
    return await callSecureEdgeFunction(functionName, payload, true);
  } catch (error) {
    console.error(`Admin function call failed for ${functionName}:`, error);
    return { data: null, error };
  }
};

// Secure role assignment function
export const assignUserRole = async (
  targetUserId: string,
  newRole: 'super_admin' | 'admin' | 'moderator' | 'employer' | 'user' | 'ai_bot',
  reason: string = 'Role assignment'
) => {
  try {
    const { data, error } = await supabase.rpc('assign_user_role_secure', {
      _target_user_id: targetUserId,
      _new_role: newRole,
      _reason: reason
    });

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Role assignment failed:', error);
    throw error;
  }
};

// Secure security event logging
export const logSecurityEvent = async (
  eventType: string,
  description: string,
  metadata: any = {}
) => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return; // Don't log events for unauthenticated users
    }

    const { data, error } = await supabase.rpc('log_security_event_secure', {
      p_user_id: session.user.id,
      p_event_type: eventType,
      p_description: description,
      p_ip_address: null, // Will be captured server-side
      p_user_agent: navigator.userAgent,
      p_metadata: metadata
    });

    if (error) {
      console.error('Failed to log security event:', error);
    }

    return data;
  } catch (error) {
    console.error('Security event logging failed:', error);
  }
};

// Validate current user has specific permission
export const validateUserPermission = async (requiredRole: 'super_admin' | 'admin' | 'moderator' | 'employer' | 'user' | 'ai_bot' = 'admin') => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return false;
    }

    const { data, error } = await supabase.rpc('validate_admin_operation', {
      _required_role: requiredRole
    });

    return !error && data === true;
  } catch (error) {
    console.error('Permission validation failed:', error);
    return false;
  }
};