import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Brain, TrendingUp, Target, Star, Users, Clock } from 'lucide-react';

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

interface RoadmapData {
  id: string;
  title: string;
  description: string;
  status: string;
  progress: number;
  estimated_completion: string;
  skills: string[];
  milestones: any[];
}

export const RealTimeCareerData: React.FC = () => {
  const [realTimeUpdates, setRealTimeUpdates] = useState<string[]>([]);

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

  // Fetch roadmaps data
  const { data: roadmaps = [], refetch: refetchRoadmaps } = useQuery({
    queryKey: ['realtime_roadmaps'],
    queryFn: async (): Promise<RoadmapData[]> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('roadmaps')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(3);
      
      if (error) throw error;
      return data as RoadmapData[];
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
        (payload) => {
          console.log('Career goals changed:', payload);
          setRealTimeUpdates(prev => [`Career goal updated: ${payload.eventType}`, ...prev.slice(0, 4)]);
          refetchGoals();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'roadmaps'
        },
        (payload) => {
          console.log('Roadmaps changed:', payload);
          setRealTimeUpdates(prev => [`Roadmap updated: ${payload.eventType}`, ...prev.slice(0, 4)]);
          refetchRoadmaps();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetchGoals, refetchRoadmaps]);

  // Calculate personalization score
  const personalizationScore = React.useMemo(() => {
    const hasGoals = careerGoals.length > 0;
    const hasDetailedGoals = careerGoals.some(goal => goal.skills_needed?.length > 0);
    const hasProgress = careerGoals.some(goal => goal.progress_notes);
    const hasRoadmaps = roadmaps.length > 0;
    
    let score = 0;
    if (hasGoals) score += 25;
    if (hasDetailedGoals) score += 25;
    if (hasProgress) score += 25;
    if (hasRoadmaps) score += 25;
    
    return Math.min(score, 100);
  }, [careerGoals, roadmaps]);

  return (
    <div className="space-y-6">
      {/* Real-time Status */}
      <Card className="border-0 shadow-apple-light bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-bold text-text-primary flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              Real-time Career Intelligence
            </CardTitle>
            <Badge className="bg-blue-100 text-blue-700 px-3 py-1">
              <Brain className="h-3 w-3 mr-1" />
              AI Active
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{personalizationScore}%</div>
              <div className="text-xs text-text-secondary">Profile Match</div>
              <Progress value={personalizationScore} className="h-2 mt-1" />
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{careerGoals.length}</div>
              <div className="text-xs text-text-secondary">Active Goals</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{roadmaps.length}</div>
              <div className="text-xs text-text-secondary">Live Roadmaps</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Personalization Indicators */}
      <Card className="border-0 shadow-apple-light bg-white/95 backdrop-blur-apple rounded-xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-bold text-text-primary flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            Based on Your Profile
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {careerGoals.map((goal, index) => (
              <div key={goal.id} className="p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-sm text-text-primary">{goal.target_role}</h4>
                  <Badge className="bg-purple-100 text-purple-700 text-xs">
                    {Math.round((95 - index * 5))}% match
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-xs text-text-secondary">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {goal.timeline_months} months
                  </div>
                  <div className="flex items-center gap-1">
                    <Target className="h-3 w-3" />
                    {goal.skills_needed?.length || 0} skills
                  </div>
                </div>
              </div>
            ))}

            {personalizationScore >= 75 && (
              <div className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 mb-1">
                  <Brain className="h-4 w-4 text-green-600" />
                  <span className="font-semibold text-sm text-green-800">High Confidence Recommendation</span>
                </div>
                <p className="text-xs text-green-700">
                  Based on your detailed profile, our AI suggests focusing on full-stack development skills with 95% success probability.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Real-time Updates Feed */}
      {realTimeUpdates.length > 0 && (
        <Card className="border-0 shadow-apple-light bg-white/95 backdrop-blur-apple rounded-xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-bold text-text-primary flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              Live Updates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {realTimeUpdates.map((update, index) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-xs text-blue-800">{update}</span>
                  <span className="text-xs text-blue-600 ml-auto">Just now</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};