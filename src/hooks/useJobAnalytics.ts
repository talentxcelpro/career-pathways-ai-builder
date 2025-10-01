import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { subDays, format } from 'date-fns';

export interface JobApplicationAnalytics {
  total: number;
  pending: number;
  inReview: number;
  interviewed: number;
  offered: number;
  rejected: number;
  responseRate: number;
  averageResponseTime: number;
  interviewRate: number;
}

export const useJobAnalytics = (dateRange: number = 90) => {
  const { user } = useAuth();

  // Fetch application analytics
  const { data: applicationAnalytics, isLoading } = useQuery({
    queryKey: ['job-analytics-applications', user?.id, dateRange],
    queryFn: async () => {
      if (!user) return null;

      const startDate = subDays(new Date(), dateRange);

      const { data: applications } = await supabase
        .from('job_applications')
        .select('*')
        .eq('user_id', user.id)
        .gte('applied_at', startDate.toISOString());

      if (!applications) {
        return {
          total: 0,
          pending: 0,
          inReview: 0,
          interviewed: 0,
          offered: 0,
          rejected: 0,
          responseRate: 0,
          averageResponseTime: 0,
          interviewRate: 0
        };
      }

      const total = applications.length;
      const pending = applications.filter(app => app.status === 'applied').length;
      const inReview = applications.filter(app => app.status === 'reviewing').length;
      const interviewed = applications.filter(app => app.status === 'interview').length;
      const offered = applications.filter(app => app.status === 'offered').length;
      const rejected = applications.filter(app => app.status === 'rejected').length;

      const responded = inReview + interviewed + offered + rejected;
      const responseRate = total > 0 ? (responded / total) * 100 : 0;
      const interviewRate = total > 0 ? (interviewed / total) * 100 : 0;

      // Calculate average response time
      const responseTimes = applications
        .filter(app => app.status !== 'applied')
        .map(app => {
          const applied = new Date(app.applied_at);
          const updated = new Date(app.updated_at || app.applied_at);
          return (updated.getTime() - applied.getTime()) / (1000 * 60 * 60 * 24); // days
        });

      const averageResponseTime = responseTimes.length > 0
        ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length
        : 0;

      return {
        total,
        pending,
        inReview,
        interviewed,
        offered,
        rejected,
        responseRate,
        averageResponseTime,
        interviewRate
      } as JobApplicationAnalytics;
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000
  });

  return {
    applicationAnalytics,
    timeline: [],
    topCompanies: [],
    skillDemand: [],
    isLoading
  };
};
