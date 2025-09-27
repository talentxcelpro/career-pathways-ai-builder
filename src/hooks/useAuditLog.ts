import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AuditLogEntry {
  id: string;
  user_id: string;
  action_type: string;
  resource_type: string;
  resource_id: string | null;
  old_values: any;
  new_values: any;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

interface UseAuditLogReturn {
  logAction: (
    actionType: string,
    resourceType: string,
    resourceId?: string,
    oldValues?: any,
    newValues?: any
  ) => Promise<void>;
  fetchAuditLogs: (
    filters?: {
      userId?: string;
      actionType?: string;
      resourceType?: string;
      startDate?: string;
      endDate?: string;
    }
  ) => Promise<AuditLogEntry[]>;
  isLogging: boolean;
}

/**
 * Phase 3: Advanced Audit Logging Hook
 * Comprehensive audit trail for all security-critical operations
 */
export const useAuditLog = (): UseAuditLogReturn => {
  const [isLogging, setIsLogging] = useState(false);

  const logAction = useCallback(async (
    actionType: string,
    resourceType: string,
    resourceId?: string,
    oldValues?: any,
    newValues?: any
  ) => {
    try {
      setIsLogging(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.warn('Cannot log action: User not authenticated');
        return;
      }

      // Create audit log entry
      const auditEntry = {
        user_id: user.id,
        action_type: actionType,
        resource_type: resourceType,
        resource_id: resourceId || null,
        old_values: oldValues || null,
        new_values: newValues || null,
        ip_address: null, // Would be populated by server-side logging
        user_agent: navigator.userAgent,
        created_at: new Date().toISOString(),
      };

      // Store in database (would need an audit_logs table)
      const { error } = await supabase
        .from('admin_activity_log')
        .insert({
          admin_user_id: user.id,
          target_user_id: resourceType === 'user' ? resourceId : null,
          action_type: actionType,
          details: {
            resource_type: resourceType,
            resource_id: resourceId,
            old_values: oldValues,
            new_values: newValues,
            timestamp: new Date().toISOString(),
          },
          ip_address: null,
        });

      if (error) {
        console.error('Error logging audit action:', error);
        return;
      }

      // Also log as security event for critical actions
      if (['role_change', 'user_deletion', 'permission_grant', 'admin_action'].includes(actionType)) {
        await supabase
          .from('security_events')
          .insert({
            user_id: user.id,
            event_type: 'admin_action',
            description: `Admin performed ${actionType} on ${resourceType} ${resourceId || ''}`,
            metadata: {
              action_type: actionType,
              resource_type: resourceType,
              resource_id: resourceId,
              old_values: oldValues,
              new_values: newValues,
            },
          });
      }

    } catch (error) {
      console.error('Error in audit logging:', error);
    } finally {
      setIsLogging(false);
    }
  }, []);

  const fetchAuditLogs = useCallback(async (
    filters?: {
      userId?: string;
      actionType?: string;
      resourceType?: string;
      startDate?: string;
      endDate?: string;
    }
  ): Promise<AuditLogEntry[]> => {
    try {
      let query = supabase
        .from('admin_activity_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      // Apply filters
      if (filters?.userId) {
        query = query.eq('admin_user_id', filters.userId);
      }
      if (filters?.actionType) {
        query = query.eq('action_type', filters.actionType);
      }
      if (filters?.startDate) {
        query = query.gte('created_at', filters.startDate);
      }
      if (filters?.endDate) {
        query = query.lte('created_at', filters.endDate);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching audit logs:', error);
        return [];
      }

      // Transform admin activity log to audit log format
      return (data || []).map(log => ({
        id: log.id,
        user_id: log.admin_user_id,
        action_type: log.action_type,
        resource_type: log.details?.resource_type || 'unknown',
        resource_id: log.details?.resource_id || log.target_user_id,
        old_values: log.details?.old_values,
        new_values: log.details?.new_values,
        ip_address: log.ip_address,
        user_agent: log.details?.user_agent,
        created_at: log.created_at,
      }));

    } catch (error) {
      console.error('Error fetching audit logs:', error);
      return [];
    }
  }, []);

  return {
    logAction,
    fetchAuditLogs,
    isLogging,
  };
};

// Audit action types
export const AUDIT_ACTIONS = {
  // User management
  USER_CREATED: 'user_created',
  USER_UPDATED: 'user_updated',
  USER_DELETED: 'user_deleted',
  USER_ACTIVATED: 'user_activated',
  USER_DEACTIVATED: 'user_deactivated',
  
  // Role management
  ROLE_ASSIGNED: 'role_assigned',
  ROLE_REMOVED: 'role_removed',
  ROLE_UPDATED: 'role_updated',
  
  // Permission management
  PERMISSION_GRANTED: 'permission_granted',
  PERMISSION_REVOKED: 'permission_revoked',
  
  // Security actions
  SECURITY_SCAN: 'security_scan',
  PASSWORD_RESET: 'password_reset',
  ACCOUNT_LOCKED: 'account_locked',
  ACCOUNT_UNLOCKED: 'account_unlocked',
  
  // System actions
  SYSTEM_CONFIG_CHANGED: 'system_config_changed',
  DATA_EXPORT: 'data_export',
  DATA_IMPORT: 'data_import',
  
  // Authentication
  LOGIN_SUCCESSFUL: 'login_successful',
  LOGIN_FAILED: 'login_failed',
  LOGOUT: 'logout',
  SESSION_EXPIRED: 'session_expired',
} as const;

// Resource types
export const RESOURCE_TYPES = {
  USER: 'user',
  ROLE: 'role',
  PERMISSION: 'permission',
  SYSTEM: 'system',
  SESSION: 'session',
  DATA: 'data',
} as const;