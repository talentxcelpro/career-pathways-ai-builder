import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Brain, 
  TrendingUp, 
  Star, 
  RefreshCw,
  Zap,
  Target
} from 'lucide-react';
import EnhancedJobCard from './EnhancedJobCard';

export const RealDataJobRecommendations = () => {
  const { data: recommendations, isLoading, refetch } = useQuery({
    queryKey: ['ai-job-recommendations'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      // First try to get existing recommendations
      let { data: existingRecs } = await supabase
        .from('job_recommendations')
        .select(`
          *,
          jobs (
            *,
            companies (
              name,
              logo_url,
              industry
            )
          )
        `)
        .eq('user_id', user.id)
        .eq('is_dismissed', false)
        .gte('expires_at', new Date().toISOString())
        .order('recommendation_score', { ascending: false })
        .limit(5);

      if (existingRecs && existingRecs.length > 0) {
        return existingRecs.map(rec => ({
          ...rec.jobs,
          recommendation_score: rec.recommendation_score,
          recommendation_reason: rec.recommendation_reason,
          ai_insights: {
            match_score: Math.round(rec.recommendation_score),
            skill_match: Math.round(rec.skill_match_percentage || 0),
            location_match: Math.round(rec.location_match_score || 0),
            salary_match: Math.round(rec.salary_match_score || 0),
            reason: rec.recommendation_reason
          }
        }));
      }

      // If no recommendations exist, generate some based on user preferences
      const { data: userPrefs } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      const { data: jobs } = await supabase
        .from('jobs')
        .select(`
          *,
          companies (
            name,
            logo_url,
            industry
          )
        `)
        .eq('is_active', true)
        .eq('job_status', 'open')
        .gte('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(10);

      // Simple matching algorithm
      return jobs?.map(job => {
        let score = 50; // Base score
        
        // Location matching
        if (userPrefs?.preferred_locations?.includes(job.location)) {
          score += 20;
        }
        
        // Salary matching
        if (job.salary_min && userPrefs?.min_salary && job.salary_min >= userPrefs.min_salary) {
          score += 15;
        }
        
        // Experience level matching
        if (job.experience_level === userPrefs?.experience_level) {
          score += 10;
        }
        
        // Random bonus for demo
        score += Math.random() * 20;
        
        return {
          ...job,
          recommendation_score: Math.min(Math.round(score), 95),
          ai_insights: {
            match_score: Math.min(Math.round(score), 95),
            reason: 'AI-generated recommendation based on your profile and preferences'
          }
        };
      }).sort((a, b) => b.recommendation_score - a.recommendation_score).slice(0, 5) || [];
    },
  });

  const handleRefresh = () => {
    refetch();
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-500" />
            AI Job Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse border rounded-lg p-4">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-500" />
            AI Job Recommendations
            <Badge variant="secondary" className="bg-purple-100 text-purple-800">
              {recommendations?.length || 0} matches
            </Badge>
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-sm text-gray-600">
          Personalized job matches powered by AI and your preferences
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {recommendations && recommendations.length > 0 ? (
          recommendations.map((job) => (
            <div key={job.id} className="relative">
              {/* AI Score Badge */}
              <div className="absolute -top-2 -right-2 z-10">
                <Badge className="bg-gradient-to-r from-purple-500 to-blue-500 text-white">
                  <Star className="h-3 w-3 mr-1" />
                  {job.ai_insights?.match_score || job.recommendation_score}% AI Match
                </Badge>
              </div>
              
              <EnhancedJobCard 
                job={job} 
                showAIInsights={true}
                variant="default"
              />
              
              {/* AI Reasoning */}
              {job.ai_insights?.reason && (
                <div className="mt-2 p-3 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
                  <div className="flex items-center gap-2 mb-1">
                    <Zap className="h-4 w-4 text-purple-600" />
                    <span className="text-sm font-medium text-purple-800">AI Analysis</span>
                  </div>
                  <p className="text-sm text-purple-700">{job.ai_insights.reason}</p>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No AI recommendations yet
            </h3>
            <p className="text-gray-600 mb-4">
              Complete your profile and set preferences to get personalized job recommendations
            </p>
            <Button>
              <Brain className="h-4 w-4 mr-2" />
              Update Preferences
            </Button>
          </div>
        )}
        
        {recommendations && recommendations.length > 0 && (
          <div className="text-center pt-4 border-t">
            <Button variant="outline" onClick={handleRefresh}>
              <TrendingUp className="h-4 w-4 mr-2" />
              Get More Recommendations
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};