import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useSecurityLogs = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [logType, setLogType] = useState('all');

  const { data: securityStats } = useQuery({
    queryKey: ['security-stats'],
    queryFn: async () => {
      const [
        { count: totalLogins },
        { count: failedLogins },
        { count: suspiciousActivity },
        { count: blockedIPs }
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('provider', 'failed'),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('provider', 'suspicious'),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('provider', 'blocked')
      ]);

      return {
        totalLogins: totalLogins || 0,
        failedLogins: failedLogins || 0,
        suspiciousActivity: suspiciousActivity || 0,
        blockedIPs: blockedIPs || 0
      };
    }
  });

  const { data: recentLogins } = useQuery({
    queryKey: ['recent-logins', searchTerm],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, last_login_at, login_count, provider')
        .order('last_login_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data || [];
    }
  });

  const { data: profileViews } = useQuery({
    queryKey: ['profile-views'],
    queryFn: async () => {
      return [];
    }
  });

  return {
    searchTerm,
    setSearchTerm,
    logType,
    setLogType,
    securityStats,
    recentLogins,
    profileViews
  };
};