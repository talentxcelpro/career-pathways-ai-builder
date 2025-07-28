import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface UserActivity {
  id: string;
  user_id: string;
  activity_type: string;
  activity_title: string;
  activity_description: string | null;
  metadata: Record<string, any>;
  related_entity_type: string | null;
  related_entity_id: string | null;
  is_public: boolean;
  created_at: string;
  profiles?: {
    full_name: string | null;
    username: string | null;
    profile_photo_url: string | null;
  } | null;
}

export const useUserActivities = (userId: string, limit: number = 20) => {
  const [activities, setActivities] = useState<UserActivity[]>([]);

  // Fetch initial activities
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['user-activities', userId, limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_activities')
        .select(`
          *,
          profiles (
            full_name,
            username,
            profile_photo_url
          )
        `)
        .eq('user_id', userId)
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      
      // Transform the data to match our interface
      const transformedData = (data || []).map(item => ({
        ...item,
        metadata: item.metadata as Record<string, any>,
        profiles: (item.profiles as any) || null
      })) as UserActivity[];
      
      return transformedData;
    },
    staleTime: 30 * 1000, // 30 seconds
  });

  // Set initial data
  useEffect(() => {
    if (data) {
      setActivities(data);
    }
  }, [data]);

  // Set up real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('user-activities-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'user_activities',
          filter: `user_id=eq.${userId}`,
        },
        async (payload) => {
          // Fetch the full activity with profile data
          const { data: newActivity } = await supabase
            .from('user_activities')
            .select(`
              *,
              profiles (
                full_name,
                username,
                profile_photo_url
              )
            `)
            .eq('id', payload.new.id)
            .single();

          if (newActivity && newActivity.is_public) {
            const transformedActivity = {
              ...newActivity,
              metadata: newActivity.metadata as Record<string, any>,
              profiles: (newActivity.profiles as any) || null
            } as UserActivity;
            
            setActivities(prev => [transformedActivity, ...prev.slice(0, limit - 1)]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, limit]);

  return {
    activities,
    isLoading,
    error,
    refetch
  };
};

// Hook for getting activity icon and color
export const useActivityIcon = (activityType: string) => {
  const getActivityConfig = (type: string) => {
    switch (type) {
      case 'profile_updated':
        return { icon: 'User', color: 'text-blue-500', bgColor: 'bg-blue-50' };
      case 'post_created':
        return { icon: 'FileText', color: 'text-green-500', bgColor: 'bg-green-50' };
      case 'post_liked':
        return { icon: 'Heart', color: 'text-red-500', bgColor: 'bg-red-50' };
      case 'post_commented':
        return { icon: 'MessageCircle', color: 'text-purple-500', bgColor: 'bg-purple-50' };
      case 'connection_made':
        return { icon: 'Users', color: 'text-indigo-500', bgColor: 'bg-indigo-50' };
      case 'connection_requested':
        return { icon: 'UserPlus', color: 'text-orange-500', bgColor: 'bg-orange-50' };
      case 'job_applied':
        return { icon: 'Briefcase', color: 'text-emerald-500', bgColor: 'bg-emerald-50' };
      case 'course_enrolled':
        return { icon: 'GraduationCap', color: 'text-violet-500', bgColor: 'bg-violet-50' };
      case 'skill_added':
        return { icon: 'Star', color: 'text-yellow-500', bgColor: 'bg-yellow-50' };
      case 'resume_updated':
        return { icon: 'FileText', color: 'text-cyan-500', bgColor: 'bg-cyan-50' };
      case 'profile_viewed':
        return { icon: 'Eye', color: 'text-gray-500', bgColor: 'bg-gray-50' };
      default:
        return { icon: 'Activity', color: 'text-gray-500', bgColor: 'bg-gray-50' };
    }
  };

  return getActivityConfig(activityType);
};