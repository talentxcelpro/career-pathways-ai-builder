import { supabase } from '@/integrations/supabase/client';

export const aiDataService = {
  // Real AI career insights
  getCareerInsights: async (userId: string) => {
    try {
      const { data: insights } = await supabase
        .from('ai_career_insights')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);

      return insights || [];
    } catch (error) {
      console.error('Error fetching career insights:', error);
      return [];
    }
  },

  // Real AI job matches
  getJobMatches: async (userId: string) => {
    try {
      const { data: matches } = await supabase
        .from('ai_job_matches')
        .select(`
          *,
          jobs:job_id (
            title,
            company_id,
            location,
            salary_min,
            salary_max,
            companies (
              name,
              logo_url
            )
          )
        `)
        .eq('user_id', userId)
        .order('match_score', { ascending: false })
        .limit(20);

      return matches || [];
    } catch (error) {
      console.error('Error fetching job matches:', error);
      return [];
    }
  },

  // Real AI career recommendations
  getCareerRecommendations: async (userId: string) => {
    try {
      const { data: recommendations } = await supabase
        .from('ai_career_recommendations')
        .select('*')
        .eq('user_id', userId)
        .eq('is_dismissed', false)
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(10);

      return recommendations || [];
    } catch (error) {
      console.error('Error fetching career recommendations:', error);
      return [];
    }
  },

  // Real AI resume analysis
  getResumeAnalysis: async (userId: string, resumeId?: string) => {
    try {
      let query = supabase
        .from('ai_resume_analysis')
        .select('*')
        .eq('user_id', userId);

      if (resumeId) {
        query = query.eq('resume_id', resumeId);
      }

      const { data: analysis } = await query
        .order('created_at', { ascending: false })
        .limit(1);

      return analysis?.[0] || null;
    } catch (error) {
      console.error('Error fetching resume analysis:', error);
      return null;
    }
  },

  // Real AI usage statistics
  getAIUsageStats: async (userId: string) => {
    try {
      const { data: usageStats } = await supabase
        .from('ai_usage_logs')
        .select('feature_type, request_type, success, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(100);

      // Process stats to get insights
      const totalRequests = usageStats?.length || 0;
      const successfulRequests = usageStats?.filter(log => log.success)?.length || 0;
      const failedRequests = totalRequests - successfulRequests;
      
      const featureUsage = usageStats?.reduce((acc, log) => {
        acc[log.feature_type] = (acc[log.feature_type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      return {
        totalRequests,
        successfulRequests,
        failedRequests,
        successRate: totalRequests > 0 ? (successfulRequests / totalRequests) * 100 : 0,
        featureUsage,
      };
    } catch (error) {
      console.error('Error fetching AI usage stats:', error);
      return {
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        successRate: 0,
        featureUsage: {},
      };
    }
  },

  // Real AI feature status
  getAIFeatureStatus: async () => {
    try {
      const { data: features } = await supabase
        .from('ai_features_status')
        .select('*')
        .eq('enabled', true)
        .order('module_name', { ascending: true });

      return features || [];
    } catch (error) {
      console.error('Error fetching AI feature status:', error);
      return [];
    }
  },
};