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

  // Safe fallback: user_activities was dropped from production schema
  const { data = [], isLoading = false, error = null, refetch = async () => {} } = useQuery({
    queryKey: ['user-activities', userId, limit],
    queryFn: async () => {
      return [] as UserActivity[];
    },
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (data) {
      setActivities(data);
    }
  }, [data]);

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