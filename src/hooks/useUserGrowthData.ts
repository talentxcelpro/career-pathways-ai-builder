
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useUserGrowthData = () => {
  return useQuery({
    queryKey: ['user-growth'],
    queryFn: async () => {
      const { data } = await supabase
        .from('profiles')
        .select('created_at')
        .order('created_at', { ascending: false })
        .limit(100);

      // Group by month for the last 6 months
      const monthlyData = data?.reduce((acc: any, profile) => {
        const month = new Date(profile.created_at).toLocaleDateString('en-US', { month: 'short' });
        acc[month] = (acc[month] || 0) + 1;
        return acc;
      }, {});

      return Object.entries(monthlyData || {}).map(([name, signups]) => ({
        name,
        signups
      })).slice(0, 6);
    }
  });
};
