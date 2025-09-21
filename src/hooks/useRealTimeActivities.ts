import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface RealTimeActivity {
  id: string;
  user_id: string;
  activity_type: string;
  activity_description: string;
  activity_data: any;
  impact_score: number;
  is_visible: boolean;
  created_at: string;
}

export const useRealTimeActivities = () => {
  const [activities, setActivities] = useState<RealTimeActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchActivities();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('real_time_activities')
      .on(
        'postgres_changes',
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'real_time_activities' 
        },
        (payload) => {
          const newActivity = payload.new as RealTimeActivity;
          setActivities(prev => [newActivity, ...prev.slice(0, 49)]); // Keep latest 50
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchActivities = async () => {
    try {
      const { data, error } = await supabase
        .from('real_time_activities')
        .select('*')
        .eq('is_visible', true)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setActivities(data || []);
    } catch (error) {
      console.error('Error fetching activities:', error);
      toast({
        title: "Error",
        description: "Failed to fetch real-time activities",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const logActivity = async (activityData: Partial<RealTimeActivity>) => {
    try {
      const { data, error } = await supabase
        .from('real_time_activities')
        .insert([activityData])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error logging activity:', error);
      throw error;
    }
  };

  return {
    activities,
    loading,
    fetchActivities,
    logActivity
  };
};