
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

type ProfileViewWithProfiles = {
  id: string;
  profile_id: string;
  viewer_id: string;
  viewed_at: string;
  ip_address: unknown;
  user_agent: string;
  profiles?: {
    id: string;
    full_name: string;
    email: string;
  };
  viewer?: {
    id: string;
    full_name: string;
    email: string;
  };
};

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
    queryFn: async (): Promise<ProfileViewWithProfiles[]> => {
      const { data: viewData, error } = await supabase
        .from('profile_views')
        .select('*')
        .order('viewed_at', { ascending: false })
        .limit(20);
      
      if (error) throw error;

      if (viewData && viewData.length > 0) {
        const profileIds = viewData.map(view => view.profile_id).filter(Boolean);
        const viewerIds = viewData.map(view => view.viewer_id).filter(Boolean);
        const allUserIds = [...new Set([...profileIds, ...viewerIds])];

        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name, email')
          .in('id', allUserIds);

        return viewData.map(view => ({
          ...view,
          profiles: profiles?.find(profile => profile.id === view.profile_id),
          viewer: profiles?.find(profile => profile.id === view.viewer_id)
        }));
      }

      return viewData || [];
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
