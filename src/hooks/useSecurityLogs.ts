
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
        supabase.from('profiles').select('*', { count: 'exact', head: true }).not('last_login_at', 'is', null),
        // Mock failed logins count as we don't have a table for this
        Promise.resolve({ count: 45 }),
        Promise.resolve({ count: 12 }),
        Promise.resolve({ count: 8 })
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
      let query = supabase
        .from('profiles')
        .select('id, full_name, email, last_login_at, login_count, provider')
        .not('last_login_at', 'is', null)
        .order('last_login_at', { ascending: false })
        .limit(50);

      if (searchTerm) {
        query = query.or(`full_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
  });

  const { data: profileViews } = useQuery({
    queryKey: ['profile-views'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profile_views')
        .select(`
          *,
          profiles!profile_views_profile_id_fkey(full_name, email),
          viewer:profiles!profile_views_viewer_id_fkey(full_name)
        `)
        .order('viewed_at', { ascending: false })
        .limit(20);
      
      if (error) throw error;
      return data;
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
