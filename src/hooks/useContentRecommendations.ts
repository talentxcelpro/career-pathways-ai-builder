import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface RecommendedContent {
  id: string;
  type: 'post' | 'job' | 'profile' | 'reel' | 'learning';
  score: number;
  reason: string;
  content: any;
}

export const useContentRecommendations = (limit: number = 10) => {
  const { user } = useAuth();

  // Fetch user interests and interactions
  const { data: userProfile } = useQuery({
    queryKey: ['user-profile', user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase
        .from('profiles')
        .select('skills, interests, industry')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!user
  });

  // Fetch recent interactions
  const { data: interactions } = useQuery({
    queryKey: ['user-interactions', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('user_activities')
        .select('activity_type, activity_data')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      return data;
    },
    enabled: !!user
  });

  // Generate recommendations based on user profile and behavior
  const { data: recommendations = [], isLoading } = useQuery({
    queryKey: ['recommendations', user?.id, userProfile, interactions],
    queryFn: async () => {
      if (!user || !userProfile) return [];

      const recs: RecommendedContent[] = [];

      // Recommend posts based on skills/interests
      if (userProfile.skills?.length > 0) {
        const { data: posts } = await supabase
          .from('posts')
          .select('*')
          .contains('tags', userProfile.skills.slice(0, 3))
          .eq('visibility', 'public')
          .eq('is_deleted', false)
          .order('created_at', { ascending: false })
          .limit(5);

        if (posts) {
          recs.push(...posts.map(post => ({
            id: post.id,
            type: 'post' as const,
            score: 0.85,
            reason: `Matches your skills: ${userProfile.skills.slice(0, 2).join(', ')}`,
            content: post
          })));
        }
      }

      // Recommend jobs based on skills
      const { data: jobs } = await supabase
        .from('jobs')
        .select('*')
        .contains('required_skills', userProfile.skills?.slice(0, 2) || [])
        .eq('status', 'active')
        .order('posted_date', { ascending: false })
        .limit(3);

      if (jobs) {
        recs.push(...jobs.map(job => ({
          id: job.id,
          type: 'job' as const,
          score: 0.9,
          reason: 'Matches your skill set',
          content: job
        })));
      }

      // Recommend profiles to follow
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .neq('id', user.id)
        .or(`industry.eq.${userProfile.industry},skills.cs.{${userProfile.skills?.join(',') || ''}}`)
        .limit(3);

      if (profiles) {
        recs.push(...profiles.map(profile => ({
          id: profile.id,
          type: 'profile' as const,
          score: 0.75,
          reason: 'Similar professional background',
          content: profile
        })));
      }

      // Sort by score and return top recommendations
      return recs
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);
    },
    enabled: !!user && !!userProfile,
    staleTime: 5 * 60 * 1000 // 5 minutes
  });

  // Get recommendations by type
  const getByType = (type: RecommendedContent['type']) => {
    return recommendations.filter(rec => rec.type === type);
  };

  // Get top recommendation
  const getTopRecommendation = () => {
    return recommendations[0] || null;
  };

  return {
    recommendations,
    isLoading,
    getByType,
    getTopRecommendation,
    postRecommendations: getByType('post'),
    jobRecommendations: getByType('job'),
    profileRecommendations: getByType('profile')
  };
};
