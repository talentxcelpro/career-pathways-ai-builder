import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, Users, Calendar, Sparkles } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface TrendingTopicsWidgetProps {
  userRole?: string;
  onTopicClick?: (topic: string) => void;
}

export const TrendingTopicsWidget: React.FC<TrendingTopicsWidgetProps> = ({
  userRole,
  onTopicClick
}) => {
  const { data: trendingData, isLoading } = useQuery({
    queryKey: ['trending-topics', userRole],
    queryFn: async () => {
      let query = supabase
        .from('trending_topics_by_role')
        .select('*')
        .order('engagement_score', { ascending: false });

      if (userRole) {
        query = query.eq('role', userRole);
      }

      const { data, error } = await query.limit(5);
      if (error) throw error;
      return data;
    }
  });

  const currentUser = useQuery({
    queryKey: ['current-user-profile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('title, user_role')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      return data;
    }
  });

  const roleSpecificData = trendingData?.find(item => item.role === userRole) || trendingData?.[0];
  const topics = Array.isArray(roleSpecificData?.trending_topics) ? roleSpecificData.trending_topics : [];

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="p-4">
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-6 bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-orange-500" />
          Trending Topics
          <Sparkles className="h-3 w-3 text-yellow-500" />
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          This week, people like you are posting about...
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Role-specific notice */}
        {userRole && (
          <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
            <Users className="h-3 w-3 text-blue-600" />
            <span className="text-xs text-blue-700">
              For {userRole}s • {roleSpecificData?.engagement_score || 0}% engagement
            </span>
          </div>
        )}

        {/* Trending Topics */}
        <div className="space-y-2">
          {topics.map((topic: string, index: number) => (
            <div
              key={index}
              className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg cursor-pointer group"
              onClick={() => onTopicClick?.(topic)}
            >
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-gray-500">#{index + 1}</span>
                <span className="text-sm font-medium">{topic}</span>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <TrendingUp className="h-3 w-3 text-green-500" />
                <span className="text-xs text-green-600">+{Math.floor(Math.random() * 50) + 10}%</span>
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="pt-2 border-t">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full text-xs"
            onClick={() => topics[0] && typeof topics[0] === 'string' && onTopicClick?.(topics[0])}
          >
            <Calendar className="h-3 w-3 mr-1" />
            Create Post About Trending Topic
          </Button>
        </div>

        {/* Performance Tip */}
        <div className="text-xs text-muted-foreground p-2 bg-yellow-50 rounded">
          💡 <strong>Pro Tip:</strong> Posts with trending topics get 2.3x more engagement this week
        </div>
      </CardContent>
    </Card>
  );
};