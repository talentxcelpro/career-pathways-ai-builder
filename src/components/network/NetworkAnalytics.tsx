import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  Eye, 
  Heart, 
  Share2, 
  MessageCircle,
  Users,
  Award,
  BarChart3,
  LineChart,
  Calendar,
  Target,
  Star,
  BookOpen,
  Zap,
  Brain,
  ArrowUp,
  ArrowDown,
  Activity
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

interface AnalyticsData {
  profileViews: number;
  profileShares: number;
  endorsements: number;
  skillInterests: string[];
  articleViews: number;
  articleLikes: number;
  articleBookmarks: number;
  articleComments: number;
  careerProgress: {
    currentLevel: string;
    skillsGained: number;
    connectionsGrown: number;
    articlesPublished: number;
  };
  skillTrends: Array<{
    skill: string;
    demand: number;
    growth: number;
    trend: 'up' | 'down' | 'stable';
  }>;
}

export const NetworkAnalytics = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  const { data: currentUser } = useQuery({
    queryKey: ['current-user-analytics'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    }
  });

  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ['network-analytics', currentUser?.id, selectedPeriod],
    queryFn: async (): Promise<AnalyticsData> => {
      if (!currentUser?.id) throw new Error('User not authenticated');

      // Mock data - in real app, you'd fetch from analytics tables
      return {
        profileViews: 1247,
        profileShares: 23,
        endorsements: 45,
        skillInterests: ['React', 'TypeScript', 'Node.js', 'Machine Learning', 'Product Management'],
        articleViews: 3420,
        articleLikes: 187,
        articleBookmarks: 92,
        articleComments: 34,
        careerProgress: {
          currentLevel: 'Senior Professional',
          skillsGained: 8,
          connectionsGrown: 156,
          articlesPublished: 12
        },
        skillTrends: [
          { skill: 'AI/Machine Learning', demand: 95, growth: 23, trend: 'up' },
          { skill: 'React/Frontend', demand: 88, growth: 12, trend: 'up' },
          { skill: 'Data Science', demand: 92, growth: 18, trend: 'up' },
          { skill: 'Product Management', demand: 85, growth: 8, trend: 'stable' },
          { skill: 'DevOps', demand: 78, growth: -3, trend: 'down' },
          { skill: 'Mobile Development', demand: 72, growth: 5, trend: 'stable' }
        ]
      };
    },
    enabled: !!currentUser?.id
  });

  const periodLabels = {
    '7d': 'Last 7 days',
    '30d': 'Last 30 days', 
    '90d': 'Last 3 months',
    '1y': 'Last year'
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-muted rounded w-1/4"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="h-4 bg-muted rounded"></div>
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!analyticsData) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Analytics Dashboard</h2>
          <p className="text-muted-foreground">
            Track your growth, insights, and influence within the community.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {Object.entries(periodLabels).map(([key, label]) => (
            <Button
              key={key}
              variant={selectedPeriod === key ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedPeriod(key as any)}
            >
              {label}
            </Button>
          ))}
        </div>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Profile Analytics
          </TabsTrigger>
          <TabsTrigger value="articles" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Article Engagement
          </TabsTrigger>
          <TabsTrigger value="career" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Career Progress
          </TabsTrigger>
          <TabsTrigger value="skills" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Skill Trends
          </TabsTrigger>
        </TabsList>

        {/* Profile Analytics */}
        <TabsContent value="profile" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Profile Views</p>
                    <p className="text-2xl font-bold">{analyticsData.profileViews.toLocaleString()}</p>
                  </div>
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Eye className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
                <div className="flex items-center gap-1 mt-2">
                  <ArrowUp className="h-3 w-3 text-green-500" />
                  <span className="text-xs text-green-500">+12% vs last period</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Profile Shares</p>
                    <p className="text-2xl font-bold">{analyticsData.profileShares}</p>
                  </div>
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Share2 className="h-5 w-5 text-green-600" />
                  </div>
                </div>
                <div className="flex items-center gap-1 mt-2">
                  <ArrowUp className="h-3 w-3 text-green-500" />
                  <span className="text-xs text-green-500">+8% vs last period</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Endorsements</p>
                    <p className="text-2xl font-bold">{analyticsData.endorsements}</p>
                  </div>
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Award className="h-5 w-5 text-purple-600" />
                  </div>
                </div>
                <div className="flex items-center gap-1 mt-2">
                  <ArrowUp className="h-3 w-3 text-green-500" />
                  <span className="text-xs text-green-500">+15% vs last period</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Skill Interests</p>
                    <p className="text-2xl font-bold">{analyticsData.skillInterests.length}</p>
                  </div>
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Star className="h-5 w-5 text-orange-600" />
                  </div>
                </div>
                <div className="flex items-center gap-1 mt-2">
                  <Activity className="h-3 w-3 text-blue-500" />
                  <span className="text-xs text-blue-500">Top skills tracked</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Top Skill Interests
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {analyticsData.skillInterests.map((skill, index) => (
                  <Badge key={skill} variant="secondary" className="text-sm">
                    {skill}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Article Engagement */}
        <TabsContent value="articles" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Article Views</p>
                    <p className="text-2xl font-bold">{analyticsData.articleViews.toLocaleString()}</p>
                  </div>
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Eye className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
                <div className="flex items-center gap-1 mt-2">
                  <ArrowUp className="h-3 w-3 text-green-500" />
                  <span className="text-xs text-green-500">+25% vs last period</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Likes</p>
                    <p className="text-2xl font-bold">{analyticsData.articleLikes}</p>
                  </div>
                  <div className="p-2 bg-red-100 rounded-lg">
                    <Heart className="h-5 w-5 text-red-600" />
                  </div>
                </div>
                <div className="flex items-center gap-1 mt-2">
                  <ArrowUp className="h-3 w-3 text-green-500" />
                  <span className="text-xs text-green-500">+18% vs last period</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Bookmarks</p>
                    <p className="text-2xl font-bold">{analyticsData.articleBookmarks}</p>
                  </div>
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <BookOpen className="h-5 w-5 text-yellow-600" />
                  </div>
                </div>
                <div className="flex items-center gap-1 mt-2">
                  <ArrowUp className="h-3 w-3 text-green-500" />
                  <span className="text-xs text-green-500">+22% vs last period</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Comments</p>
                    <p className="text-2xl font-bold">{analyticsData.articleComments}</p>
                  </div>
                  <div className="p-2 bg-green-100 rounded-lg">
                    <MessageCircle className="h-5 w-5 text-green-600" />
                  </div>
                </div>
                <div className="flex items-center gap-1 mt-2">
                  <ArrowUp className="h-3 w-3 text-green-500" />
                  <span className="text-xs text-green-500">+31% vs last period</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LineChart className="h-5 w-5" />
                Engagement Over Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-muted/20 rounded-lg">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">Interactive chart showing engagement trends</p>
                  <p className="text-sm text-muted-foreground">Views, likes, bookmarks, and comments over time</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Career Progress */}
        <TabsContent value="career" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Career Progress Tracker
              </CardTitle>
              <p className="text-muted-foreground">Compare your growth vs. similar professionals</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 bg-muted/20 rounded-lg">
                  <p className="text-sm text-muted-foreground">Current Level</p>
                  <p className="text-lg font-semibold">{analyticsData.careerProgress.currentLevel}</p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Skills Gained</p>
                  <p className="text-lg font-semibold text-blue-600">+{analyticsData.careerProgress.skillsGained}</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Connections</p>
                  <p className="text-lg font-semibold text-green-600">+{analyticsData.careerProgress.connectionsGrown}</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Articles Published</p>
                  <p className="text-lg font-semibold text-purple-600">{analyticsData.careerProgress.articlesPublished}</p>
                </div>
              </div>

              <div className="h-64 flex items-center justify-center bg-muted/20 rounded-lg">
                <div className="text-center">
                  <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">Career progression visualization</p>
                  <p className="text-sm text-muted-foreground">Track your growth compared to industry benchmarks</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Skill Trends */}
        <TabsContent value="skills" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Skill Demand Trends
              </CardTitle>
              <p className="text-muted-foreground">Real-time market insights powered by TalentXcel AI</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.skillTrends.map((skill, index) => (
                  <div key={skill.skill} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/20 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-8 bg-gradient-to-t from-primary/20 to-primary rounded" style={{ height: `${skill.demand}%` }}></div>
                      <div>
                        <p className="font-medium">{skill.skill}</p>
                        <p className="text-sm text-muted-foreground">Market demand: {skill.demand}%</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={skill.trend === 'up' ? 'default' : skill.trend === 'down' ? 'destructive' : 'secondary'}
                        className="flex items-center gap-1"
                      >
                        {skill.trend === 'up' ? <ArrowUp className="h-3 w-3" /> : 
                         skill.trend === 'down' ? <ArrowDown className="h-3 w-3" /> : 
                         <Activity className="h-3 w-3" />}
                        {skill.growth > 0 ? '+' : ''}{skill.growth}%
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                AI-Powered Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gradient-to-r from-primary/10 to-secondary/10 p-4 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-primary/20 rounded-lg">
                    <Brain className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">TalentXcel AI Recommendation</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Based on your profile and industry trends, we recommend focusing on AI/Machine Learning skills. 
                      This field shows 95% market demand with 23% growth, making it an excellent investment for your career.
                    </p>
                    <Button size="sm" variant="outline">
                      Explore Learning Paths
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};