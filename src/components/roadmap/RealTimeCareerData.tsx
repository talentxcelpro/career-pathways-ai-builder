import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Brain, TrendingUp, Target, Star, Users, Clock, Zap, Trophy, ChevronRight, Eye, Briefcase } from 'lucide-react';

interface CareerGoal {
  id: string;
  target_role: string;
  current_position: string;
  timeline_months: number;
  skills_needed: string[];
  progress_notes: string;
  created_at: string;
  milestones: any;
}

interface UserProfile {
  id: string;
  full_name: string;
  title: string;
  about: string;
  location: string;
  linkedin_url: string;
  profile_picture_url: string;
  profile_views_count: number;
  skills: string[];
  experience_years: number;
  created_at: string;
}

interface CareerRecommendation {
  id: string;
  title: string;
  description: string;
  recommendation_type: string;
  confidence_score: number;
  priority: number;
  metadata: any;
}

interface UserScore {
  career_readiness_score: number;
  profile_completion_score: number;
  last_updated: string;
}

export const RealTimeCareerData: React.FC = () => {
  const [realTimeUpdates, setRealTimeUpdates] = useState<string[]>([]);

  // Fetch user profile
  const { data: userProfile } = useQuery({
    queryKey: ['user_profile'],
    queryFn: async (): Promise<UserProfile | null> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      return data as UserProfile;
    }
  });

  // Fetch career goals with real-time updates
  const { data: careerGoals = [], refetch: refetchGoals } = useQuery({
    queryKey: ['realtime_career_goals'],
    queryFn: async (): Promise<CareerGoal[]> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('career_goals')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (error) throw error;
      return data as CareerGoal[];
    }
  });

  // Fetch AI career recommendations
  const { data: recommendations = [] } = useQuery({
    queryKey: ['career_recommendations'],
    queryFn: async (): Promise<CareerRecommendation[]> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('ai_career_recommendations')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_dismissed', false)
        .order('priority', { ascending: false })
        .limit(3);
      
      if (error) throw error;
      return data as CareerRecommendation[];
    }
  });

  // Fetch user scores
  const { data: userScores } = useQuery({
    queryKey: ['user_scores'],
    queryFn: async (): Promise<UserScore | null> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('user_scores')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data as UserScore;
    }
  });

  // Set up real-time subscriptions
  useEffect(() => {
    const channel = supabase
      .channel('career-data-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'career_goals'
        },
        (payload: any) => {
          console.log('Career goals changed:', payload);
          const goalTitle = (payload.new as any)?.target_role || (payload.old as any)?.target_role || 'Goal';
          setRealTimeUpdates(prev => [`🎯 Career goal ${payload.eventType}: ${goalTitle}`, ...prev.slice(0, 4)]);
          refetchGoals();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ai_career_recommendations'
        },
        (payload: any) => {
          console.log('Recommendations changed:', payload);
          const recTitle = (payload.new as any)?.title || (payload.old as any)?.title || 'Recommendation';
          setRealTimeUpdates(prev => [`🤖 New AI recommendation: ${recTitle}`, ...prev.slice(0, 4)]);
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles'
        },
        (payload: any) => {
          console.log('Profile changed:', payload);
          setRealTimeUpdates(prev => [`👤 Profile updated: Enhanced personalization`, ...prev.slice(0, 4)]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetchGoals]);

  // Calculate dynamic personalization metrics
  const personalizationMetrics = React.useMemo(() => {
    if (!userProfile) return { profileMatch: 0, aiConfidence: 0, successProbability: 0, timeToGoal: 'N/A' };

    // Profile completeness calculation
    let completeness = 0;
    if (userProfile.full_name) completeness += 15;
    if (userProfile.title) completeness += 15;
    if (userProfile.about) completeness += 20;
    if (userProfile.profile_picture_url) completeness += 10;
    if (userProfile.linkedin_url) completeness += 10;
    if (userProfile.location) completeness += 10;
    if (userProfile.skills?.length > 0) completeness += 20;

    // AI confidence based on goals and recommendations
    const aiConfidence = Math.min(
      85 + (careerGoals.length * 5) + (recommendations.length * 3),
      98
    );

    // Success probability based on profile strength and activity
    const successProbability = Math.min(
      completeness + (careerGoals.length * 8) + (userProfile.profile_views_count || 0) / 10,
      95
    );

    // Estimated time to goal
    const avgTimeline = careerGoals.length > 0 
      ? Math.round(careerGoals.reduce((sum, goal) => sum + goal.timeline_months, 0) / careerGoals.length)
      : 18;

    return {
      profileMatch: completeness,
      aiConfidence: Math.round(aiConfidence),
      successProbability: Math.round(successProbability),
      timeToGoal: `${avgTimeline}mo`
    };
  }, [userProfile, careerGoals, recommendations]);

  if (!userProfile) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto animate-pulse">
            <Brain className="h-6 w-6 text-white" />
          </div>
          <p className="text-sm text-muted-foreground">Loading your personalized career intelligence...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Apple-inspired Profile Overview */}
      <Card className="border-0 shadow-apple-medium bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 backdrop-blur-apple rounded-apple">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-apple-lg flex items-center justify-center shadow-apple-light">
                  {userProfile.profile_picture_url ? (
                    <img 
                      src={userProfile.profile_picture_url} 
                      alt="Profile" 
                      className="w-full h-full rounded-apple-lg object-cover"
                    />
                  ) : (
                    <Users className="h-6 w-6 text-white" />
                  )}
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-text-primary">
                  Welcome back, {userProfile.full_name?.split(' ')[0] || 'Career Professional'}
                </CardTitle>
                <p className="text-sm text-text-secondary">
                  {userProfile.title || 'Building your career journey'} • {userProfile.location || 'Global'}
                </p>
              </div>
            </div>
            <Badge className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0 px-3 py-1 shadow-apple-light">
              <Brain className="h-3 w-3 mr-1" />
              AI Active
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-white/60 backdrop-blur-sm rounded-apple-lg shadow-apple-subtle">
              <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {personalizationMetrics.profileMatch}%
              </div>
              <div className="text-xs text-text-secondary">Profile Match</div>
              <Progress value={personalizationMetrics.profileMatch} className="h-1.5 mt-2" />
            </div>
            <div className="text-center p-3 bg-white/60 backdrop-blur-sm rounded-apple-lg shadow-apple-subtle">
              <div className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                {personalizationMetrics.aiConfidence}%
              </div>
              <div className="text-xs text-text-secondary">AI Confidence</div>
              <Progress value={personalizationMetrics.aiConfidence} className="h-1.5 mt-2" />
            </div>
            <div className="text-center p-3 bg-white/60 backdrop-blur-sm rounded-apple-lg shadow-apple-subtle">
              <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {personalizationMetrics.timeToGoal}
              </div>
              <div className="text-xs text-text-secondary">Est. Timeline</div>
            </div>
            <div className="text-center p-3 bg-white/60 backdrop-blur-sm rounded-apple-lg shadow-apple-subtle">
              <div className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                {userProfile.profile_views_count || 0}
              </div>
              <div className="text-xs text-text-secondary">Profile Views</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dynamic Career Goals based on user data */}
      <Card className="border-0 shadow-apple-medium bg-white/95 backdrop-blur-apple rounded-apple">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-bold text-text-primary flex items-center gap-2">
            <Target className="h-5 w-5 text-purple-600" />
            Your Career Goals
            <Badge className="bg-purple-100 text-purple-700 text-xs ml-auto">
              {careerGoals.length} Active
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {careerGoals.length > 0 ? (
            <div className="space-y-3">
              {careerGoals.map((goal, index) => (
                <div key={goal.id} className="group p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-apple-lg border border-purple-100 hover:shadow-apple-medium transition-all duration-300">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-sm text-text-primary group-hover:text-purple-700 transition-colors">
                      {goal.target_role}
                    </h4>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-purple-100 text-purple-700 text-xs">
                        {Math.round((98 - index * 5))}% match
                      </Badge>
                      <ChevronRight className="h-4 w-4 text-text-secondary group-hover:text-purple-600 transition-colors" />
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-text-secondary mb-2">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {goal.timeline_months} months
                    </div>
                    <div className="flex items-center gap-1">
                      <Zap className="h-3 w-3" />
                      {goal.skills_needed?.length || 0} skills
                    </div>
                    <div className="flex items-center gap-1">
                      <Briefcase className="h-3 w-3" />
                      From {goal.current_position}
                    </div>
                  </div>
                  {goal.skills_needed && goal.skills_needed.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {goal.skills_needed.slice(0, 3).map((skill, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs bg-white/80">
                          {skill}
                        </Badge>
                      ))}
                      {goal.skills_needed.length > 3 && (
                        <Badge variant="outline" className="text-xs bg-white/80">
                          +{goal.skills_needed.length - 3} more
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Target className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-text-secondary mb-4">No career goals set yet</p>
              <button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-apple-lg text-sm font-medium shadow-apple-light hover:shadow-apple-medium transition-all">
                Create Your First Goal
              </button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Recommendations based on user profile */}
      {recommendations.length > 0 && (
        <Card className="border-0 shadow-apple-medium bg-gradient-to-br from-blue-50 to-indigo-50 rounded-apple">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-bold text-text-primary flex items-center gap-2">
              <Brain className="h-5 w-5 text-blue-600" />
              AI Recommendations for {userProfile.full_name?.split(' ')[0]}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recommendations.map((rec) => (
                <div key={rec.id} className="p-4 bg-white/80 backdrop-blur-sm rounded-apple-lg border border-blue-100 hover:shadow-apple-medium transition-all duration-300">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-sm text-text-primary">{rec.title}</h4>
                    <Badge className="bg-blue-100 text-blue-700 text-xs">
                      {Math.round(rec.confidence_score || 85)}% confidence
                    </Badge>
                  </div>
                  <p className="text-xs text-text-secondary mb-3">{rec.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Trophy className="h-3 w-3 text-yellow-500" />
                      <span className="text-xs text-text-secondary capitalize">{rec.recommendation_type}</span>
                    </div>
                    <button className="text-xs text-blue-600 hover:text-blue-700 font-medium">
                      View Details →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Real-time Updates Feed */}
      {realTimeUpdates.length > 0 && (
        <Card className="border-0 shadow-apple-medium bg-white/95 backdrop-blur-apple rounded-apple">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-bold text-text-primary flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Live Activity
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse ml-1"></div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {realTimeUpdates.map((update, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-apple-lg animate-fade-in">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-green-800 flex-1">{update}</span>
                  <span className="text-xs text-green-600">Just now</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Career Readiness Score */}
      {userScores && (
        <Card className="border-0 shadow-apple-medium bg-gradient-to-br from-yellow-50 to-orange-50 rounded-apple">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-bold text-text-primary flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-600" />
              Career Readiness Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-3xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                  {userScores.career_readiness_score}/100
                </div>
                <p className="text-sm text-text-secondary">
                  Based on your profile completeness and activity
                </p>
              </div>
              <div className="w-16 h-16 relative">
                <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-gray-200"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <path
                    className="text-yellow-500"
                    strokeDasharray={`${userScores.career_readiness_score}, 100`}
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Star className="h-6 w-6 text-yellow-500" />
                </div>
              </div>
            </div>
            <Progress value={userScores.career_readiness_score} className="h-3" />
          </CardContent>
        </Card>
      )}
    </div>
  );
};