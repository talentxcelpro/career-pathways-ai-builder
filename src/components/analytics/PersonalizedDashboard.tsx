import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from '@/integrations/supabase/client';
import {
  TrendingUp,
  Eye,
  Clock,
  Heart,
  Share2,
  Bookmark,
  Users,
  BarChart3,
  Brain,
  Sparkles,
  Target,
  Calendar
} from 'lucide-react';

interface UserAnalytics {
  articles_read: number;
  reading_time_minutes: number;
  articles_saved: number;
  articles_shared: number;
  favorite_categories: string[];
  reading_streak: number;
  engagement_score: number;
  weekly_activity: number[];
}

interface ContentRecommendation {
  id: string;
  title: string;
  reason: string;
  confidence: number;
  category: string;
  reading_time: number;
}

export const PersonalizedDashboard: React.FC = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<UserAnalytics | null>(null);
  const [recommendations, setRecommendations] = useState<ContentRecommendation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadUserAnalytics();
      loadPersonalizedRecommendations();
    }
  }, [user]);

  const loadUserAnalytics = async () => {
    try {
      // Mock analytics data - in production, this would come from your analytics service
      const mockAnalytics: UserAnalytics = {
        articles_read: 42,
        reading_time_minutes: 127,
        articles_saved: 18,
        articles_shared: 7,
        favorite_categories: ['Technology', 'Career Development', 'Business'],
        reading_streak: 5,
        engagement_score: 78,
        weekly_activity: [12, 8, 15, 22, 18, 9, 14]
      };

      setAnalytics(mockAnalytics);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    }
  };

  const loadPersonalizedRecommendations = async () => {
    try {
      // AI-powered recommendations based on user behavior
      const mockRecommendations: ContentRecommendation[] = [
        {
          id: '1',
          title: 'The Future of Remote Work: AI and Virtual Collaboration',
          reason: 'Based on your interest in Technology and Career Development',
          confidence: 92,
          category: 'Technology',
          reading_time: 8
        },
        {
          id: '2',
          title: 'Leadership Skills for the Digital Age',
          reason: 'Trending in your professional network',
          confidence: 87,
          category: 'Leadership',
          reading_time: 6
        },
        {
          id: '3',
          title: 'Blockchain in Business: Real-World Applications',
          reason: 'Similar to articles you\'ve recently saved',
          confidence: 79,
          category: 'Business',
          reading_time: 12
        }
      ];

      setRecommendations(mockRecommendations);
    } catch (error) {
      console.error('Failed to load recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="space-y-3">
                <div className="h-4 bg-muted rounded animate-pulse" />
                <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
                <div className="h-4 bg-muted rounded animate-pulse w-1/2" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!analytics) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <Brain className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            Start reading articles to see personalized insights!
          </p>
        </CardContent>
      </Card>
    );
  }

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const maxActivity = Math.max(...analytics.weekly_activity);

  return (
    <div className="space-y-6">
      {/* Reading Statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 dark:text-blue-400">Articles Read</p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{analytics.articles_read}</p>
              </div>
              <Eye className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/50 dark:to-green-900/50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 dark:text-green-400">Reading Time</p>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">{analytics.reading_time_minutes}m</p>
              </div>
              <Clock className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/50 dark:to-orange-900/50 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-600 dark:text-orange-400">Articles Saved</p>
                <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">{analytics.articles_saved}</p>
              </div>
              <Bookmark className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/50 dark:to-purple-900/50 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 dark:text-purple-400">Reading Streak</p>
                <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">{analytics.reading_streak} days</p>
              </div>
              <Calendar className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Engagement Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Engagement Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Overall Engagement</span>
              <span className="font-semibold">{analytics.engagement_score}/100</span>
            </div>
            <Progress value={analytics.engagement_score} className="h-3" />
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-lg font-semibold text-blue-600">{analytics.articles_read}</div>
                <div className="text-xs text-muted-foreground">Articles Read</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-green-600">{analytics.articles_saved}</div>
                <div className="text-xs text-muted-foreground">Articles Saved</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-orange-600">{analytics.articles_shared}</div>
                <div className="text-xs text-muted-foreground">Articles Shared</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            Weekly Reading Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end justify-between h-32 gap-2">
            {analytics.weekly_activity.map((activity, index) => (
              <div key={index} className="flex flex-col items-center flex-1">
                <div 
                  className="bg-primary rounded-t-sm w-full min-h-[4px] transition-all duration-300 hover:bg-primary/80"
                  style={{ 
                    height: `${(activity / maxActivity) * 100}%`,
                    minHeight: activity > 0 ? '8px' : '4px'
                  }}
                />
                <span className="text-xs text-muted-foreground mt-2">{weekDays[index]}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Favorite Categories */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-primary" />
            Your Favorite Topics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {analytics.favorite_categories.map((category, index) => (
              <Badge key={index} variant="secondary" className="bg-primary/10 text-primary">
                {category}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* AI Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Recommended For You
            <Badge variant="secondary" className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800">
              AI Powered
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recommendations.map((rec) => (
              <div key={rec.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold line-clamp-2 flex-1">{rec.title}</h4>
                  <div className="flex items-center gap-2 ml-4">
                    <Badge variant="outline" className="text-xs">
                      {rec.category}
                    </Badge>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {rec.reading_time}m
                    </div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{rec.reason}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Brain className="w-4 h-4 text-purple-500" />
                    <span className="text-sm text-muted-foreground">
                      {rec.confidence}% match
                    </span>
                    <Progress value={rec.confidence} className="h-2 w-20" />
                  </div>
                  <Button size="sm" variant="outline">
                    Read Article
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};