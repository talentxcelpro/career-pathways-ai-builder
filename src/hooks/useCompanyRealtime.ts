import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useRealtimeSubscriptions } from './useRealtimeData';

interface CompanyRealtimeData {
  metrics: any;
  posts: any[];
  applications: any[];
  follows: any[];
  isConnected: boolean;
}

export function useCompanyRealtime(companyId: string): CompanyRealtimeData {
  const [realtimeData, setRealtimeData] = useState<CompanyRealtimeData>({
    metrics: null,
    posts: [],
    applications: [],
    follows: [],
    isConnected: false
  });

  // Real-time subscriptions
  const { isConnected } = useRealtimeSubscriptions([
    {
      table: 'company_realtime_metrics',
      event: '*',
      filter: `company_id=eq.${companyId}`,
      callback: (payload) => {
        console.log('Real-time metrics update:', payload);
        if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
          setRealtimeData(prev => ({
            ...prev,
            metrics: payload.new
          }));
        }
      }
    },
    {
      table: 'company_posts',
      event: '*',
      filter: `company_id=eq.${companyId}`,
      callback: (payload) => {
        console.log('Real-time posts update:', payload);
        setRealtimeData(prev => {
          let updatedPosts = [...prev.posts];
          
          if (payload.eventType === 'INSERT') {
            updatedPosts.unshift(payload.new);
          } else if (payload.eventType === 'UPDATE') {
            const index = updatedPosts.findIndex(p => p.id === payload.new.id);
            if (index >= 0) {
              updatedPosts[index] = payload.new;
            }
          } else if (payload.eventType === 'DELETE') {
            updatedPosts = updatedPosts.filter(p => p.id !== payload.old.id);
          }
          
          return { ...prev, posts: updatedPosts };
        });
      }
    },
    {
      table: 'job_applications',
      event: '*',
      callback: (payload) => {
        console.log('Real-time applications update:', payload);
        setRealtimeData(prev => {
          let updatedApplications = [...prev.applications];
          
          if (payload.eventType === 'INSERT') {
            updatedApplications.unshift(payload.new);
          } else if (payload.eventType === 'UPDATE') {
            const index = updatedApplications.findIndex(a => a.id === payload.new.id);
            if (index >= 0) {
              updatedApplications[index] = payload.new;
            }
          }
          
          return { ...prev, applications: updatedApplications };
        });
      }
    },
    {
      table: 'company_follows',
      event: '*',
      filter: `company_id=eq.${companyId}`,
      callback: (payload) => {
        console.log('Real-time follows update:', payload);
        setRealtimeData(prev => {
          let updatedFollows = [...prev.follows];
          
          if (payload.eventType === 'INSERT') {
            updatedFollows.push(payload.new);
          } else if (payload.eventType === 'DELETE') {
            updatedFollows = updatedFollows.filter(f => f.id !== payload.old.id);
          }
          
          return { ...prev, follows: updatedFollows };
        });
      }
    }
  ]);

  // Initial data fetch
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [metricsRes, postsRes, applicationsRes, followsRes] = await Promise.all([
          supabase
            .from('company_realtime_metrics')
            .select('*')
            .eq('company_id', companyId)
            .order('timestamp', { ascending: false })
            .limit(1),
          supabase
            .from('company_posts')
            .select('*')
            .eq('company_id', companyId)
            .order('created_at', { ascending: false })
            .limit(10),
          supabase
            .from('job_applications')
            .select(`
              *,
              jobs!inner(company_id)
            `)
            .eq('jobs.company_id', companyId)
            .order('created_at', { ascending: false })
            .limit(20),
          supabase
            .from('company_follows')
            .select('*')
            .eq('company_id', companyId)
        ]);

        setRealtimeData({
          metrics: metricsRes.data?.[0] || null,
          posts: postsRes.data || [],
          applications: applicationsRes.data || [],
          follows: followsRes.data || [],
          isConnected
        });
      } catch (error) {
        console.error('Error fetching initial company data:', error);
      }
    };

    if (companyId) {
      fetchInitialData();
    }
  }, [companyId, isConnected]);

  return {
    ...realtimeData,
    isConnected
  };
}