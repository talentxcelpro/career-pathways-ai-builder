import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useSecurityManagement = () => {
  const queryClient = useQueryClient();
  const [selectedAlert, setSelectedAlert] = useState<any>(null);

  // Security Statistics
  const { data: securityStats, isLoading: statsLoading } = useQuery({
    queryKey: ['security-stats'],
    queryFn: async () => {
      const [
        { count: totalEvents },
        { count: failedLogins },
        { count: blockedIPs },
        { count: suspendedAccounts },
        { count: activeSessions },
        { count: pendingAlerts }
      ] = await Promise.all([
        supabase.from('security_events').select('*', { count: 'exact', head: true }),
        supabase.from('failed_login_attempts').select('*', { count: 'exact', head: true }),
        supabase.from('ip_blocklist').select('*', { count: 'exact', head: true }),
        supabase.from('user_security_settings').select('*', { count: 'exact', head: true }).neq('account_status', 'active'),
        supabase.from('user_sessions').select('*', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('security_alerts').select('*', { count: 'exact', head: true }).eq('is_acknowledged', false)
      ]);

      return {
        totalEvents: totalEvents || 0,
        failedLogins: failedLogins || 0,
        blockedIPs: blockedIPs || 0,
        suspendedAccounts: suspendedAccounts || 0,
        activeSessions: activeSessions || 0,
        pendingAlerts: pendingAlerts || 0
      };
    }
  });

  // Security Events
  const { data: securityEvents, isLoading: eventsLoading } = useQuery({
    queryKey: ['security-events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('security_events')
        .select(`
          *,
          profiles (
            full_name,
            email
          )
        `)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      return data || [];
    }
  });

  // Security Alerts
  const { data: securityAlerts, isLoading: alertsLoading } = useQuery({
    queryKey: ['security-alerts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('security_alerts')
        .select(`
          *,
          profiles (
            full_name,
            email
          )
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data || [];
    }
  });

  // Failed Login Attempts
  const { data: failedLogins, isLoading: failedLoginsLoading } = useQuery({
    queryKey: ['failed-login-attempts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('failed_login_attempts')
        .select('*')
        .order('last_attempt_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data || [];
    }
  });

  // IP Blocklist
  const { data: blockedIPs, isLoading: blockedIPsLoading } = useQuery({
    queryKey: ['blocked-ips'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ip_blocklist')
        .select(`
          *,
          profiles (
            full_name,
            email
          )
        `)
        .order('blocked_at', { ascending: false });

      if (error) throw error;
      return data || [];
    }
  });

  // User Sessions
  const { data: userSessions, isLoading: sessionsLoading } = useQuery({
    queryKey: ['user-sessions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_sessions')
        .select(`
          *,
          profiles (
            full_name,
            email
          )
        `)
        .eq('is_active', true)
        .order('last_activity_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      return data || [];
    }
  });

  // Suspend Account
  const suspendAccountMutation = useMutation({
    mutationFn: async ({ userId, reason, durationHours }: { userId: string, reason: string, durationHours?: number }) => {
      const { error } = await supabase.rpc('suspend_user_account', {
        p_user_id: userId,
        p_reason: reason,
        p_duration_hours: durationHours
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['security-stats'] });
      queryClient.invalidateQueries({ queryKey: ['security-events'] });
      queryClient.invalidateQueries({ queryKey: ['security-alerts'] });
      toast.success('Account suspended successfully');
    },
    onError: (error) => {
      console.error('Error suspending account:', error);
      toast.error('Failed to suspend account');
    }
  });

  // Reactivate Account
  const reactivateAccountMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from('user_security_settings')
        .upsert({
          user_id: userId,
          account_status: 'active',
          lockout_until: null,
          failed_login_count: 0
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['security-stats'] });
      queryClient.invalidateQueries({ queryKey: ['security-events'] });
      toast.success('Account reactivated successfully');
    },
    onError: (error) => {
      console.error('Error reactivating account:', error);
      toast.error('Failed to reactivate account');
    }
  });

  // Block IP Address
  const blockIPMutation = useMutation({
    mutationFn: async ({ ipAddress, reason, isPermanent, expiresAt }: { 
      ipAddress: string, 
      reason: string, 
      isPermanent: boolean, 
      expiresAt?: string 
    }) => {
      const { error } = await supabase
        .from('ip_blocklist')
        .insert({
          ip_address: ipAddress,
          reason,
          is_permanent: isPermanent,
          expires_at: expiresAt,
          block_type: 'manual'
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blocked-ips'] });
      queryClient.invalidateQueries({ queryKey: ['security-stats'] });
      toast.success('IP address blocked successfully');
    },
    onError: (error) => {
      console.error('Error blocking IP:', error);
      toast.error('Failed to block IP address');
    }
  });

  // Unblock IP Address
  const unblockIPMutation = useMutation({
    mutationFn: async (ipBlockId: string) => {
      const { error } = await supabase
        .from('ip_blocklist')
        .delete()
        .eq('id', ipBlockId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blocked-ips'] });
      queryClient.invalidateQueries({ queryKey: ['security-stats'] });
      toast.success('IP address unblocked successfully');
    },
    onError: (error) => {
      console.error('Error unblocking IP:', error);
      toast.error('Failed to unblock IP address');
    }
  });

  // Acknowledge Alert
  const acknowledgeAlertMutation = useMutation({
    mutationFn: async (alertId: string) => {
      const { error } = await supabase
        .from('security_alerts')
        .update({
          is_acknowledged: true,
          acknowledged_at: new Date().toISOString()
        })
        .eq('id', alertId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['security-alerts'] });
      queryClient.invalidateQueries({ queryKey: ['security-stats'] });
      toast.success('Alert acknowledged');
    },
    onError: (error) => {
      console.error('Error acknowledging alert:', error);
      toast.error('Failed to acknowledge alert');
    }
  });

  // Terminate Session
  const terminateSessionMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      const { error } = await supabase
        .from('user_sessions')
        .update({ is_active: false })
        .eq('id', sessionId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-sessions'] });
      queryClient.invalidateQueries({ queryKey: ['security-stats'] });
      toast.success('Session terminated successfully');
    },
    onError: (error) => {
      console.error('Error terminating session:', error);
      toast.error('Failed to terminate session');
    }
  });

  return {
    // Data
    securityStats,
    securityEvents,
    securityAlerts,
    failedLogins,
    blockedIPs,
    userSessions,
    
    // Loading states
    statsLoading,
    eventsLoading,
    alertsLoading,
    failedLoginsLoading,
    blockedIPsLoading,
    sessionsLoading,
    
    // Actions
    suspendAccount: suspendAccountMutation.mutate,
    reactivateAccount: reactivateAccountMutation.mutate,
    blockIP: blockIPMutation.mutate,
    unblockIP: unblockIPMutation.mutate,
    acknowledgeAlert: acknowledgeAlertMutation.mutate,
    terminateSession: terminateSessionMutation.mutate,
    
    // Loading states for actions
    suspendingAccount: suspendAccountMutation.isPending,
    reactivatingAccount: reactivateAccountMutation.isPending,
    blockingIP: blockIPMutation.isPending,
    unblockingIP: unblockIPMutation.isPending,
    acknowledgingAlert: acknowledgeAlertMutation.isPending,
    terminatingSession: terminateSessionMutation.isPending,
    
    // UI State
    selectedAlert,
    setSelectedAlert
  };
};