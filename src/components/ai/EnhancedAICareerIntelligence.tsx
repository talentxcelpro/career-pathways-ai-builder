import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  Target, 
  TrendingUp, 
  Zap, 
  Lightbulb, 
  BookOpen, 
  Users, 
  Award,
  ArrowRight,
  Sparkles,
  AlertCircle,
  CheckCircle,
  Clock,
  Star
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CareerInsight {
  id: string;
  type: 'skill_gap' | 'market_trend' | 'career_opportunity' | 'salary_insight' | 'networking_tip';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  confidence: number;
  actionable: boolean;
  expires_at?: string;
}

interface AIRecommendation {
  id: string;
  title: string;
  description: string;
  type: 'job_match' | 'skill_development' | 'networking' | 'certification';
  confidence_score: number;
  priority: number;
  metadata: any;
}

export function EnhancedAICareerIntelligence() {
  const { user } = useAuth();
  const [insights, setInsights] = useState<CareerInsight[]>([]);
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [careerScore, setCareerScore] = useState(0);
  const [marketTrends, setMarketTrends] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      loadCareerIntelligence();
    }
  }, [user]);

  const loadCareerIntelligence = async () => {
    setIsLoading(true);
    try {
      // Load AI career insights
      const { data: insightsData } = await supabase
        .from('ai_career_insights')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(10);

      // Load AI recommendations  
      const { data: recommendationsData } = await supabase
        .from('ai_career_recommendations')
        .select('*')
        .eq('user_id', user?.id)
        .eq('is_dismissed', false)
        .order('priority', { ascending: false })
        .limit(8);

      if (insightsData) {
        setInsights(insightsData.map(formatInsight));
      }

      if (recommendationsData) {
        setRecommendations(recommendationsData);
      }

      // Generate dynamic career score
      setCareerScore(calculateCareerScore(insightsData, recommendationsData));
      
      // Load market trends
      await loadMarketTrends();

    } catch (error) {
      console.error('Error loading career intelligence:', error);
      toast.error('Failed to load career insights');
    } finally {
      setIsLoading(false);
    }
  };

  const formatInsight = (insight: any): CareerInsight => ({
    id: insight.id,
    type: insight.insight_type,
    title: insight.data?.title || 'Career Insight',
    description: insight.data?.description || 'AI-generated insight for your career',
    priority: insight.data?.priority || 'medium',
    confidence: insight.confidence_level === 'high' ? 90 : insight.confidence_level === 'medium' ? 70 : 50,
    actionable: insight.data?.actionable || true,
    expires_at: insight.data?.expires_at
  });

  const calculateCareerScore = (insights: any[], recommendations: any[]) => {
    const baseScore = 65;
    const insightBonus = insights?.length * 2;
    const recommendationBonus = recommendations?.length * 3;
    return Math.min(100, baseScore + insightBonus + recommendationBonus);
  };

  const loadMarketTrends = async () => {
    // Simulate market trends data
    setMarketTrends([
      { skill: 'AI/Machine Learning', demand: 95, growth: '+25%' },
      { skill: 'Cloud Computing', demand: 88, growth: '+18%' },
      { skill: 'Data Analysis', demand: 82, growth: '+15%' },
      { skill: 'Cybersecurity', demand: 90, growth: '+22%' }
    ]);
  };

  const generateNewInsights = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-career-insights', {
        body: { userId: user?.id, action: 'generate_insights' }
      });

      if (error) throw error;
      
      toast.success('New insights generated!');
      await loadCareerIntelligence();
    } catch (error) {
      console.error('Error generating insights:', error);
      toast.error('Failed to generate new insights');
    } finally {
      setIsLoading(false);
    }
  };

  const dismissRecommendation = async (id: string) => {
    try {
      await supabase
        .from('ai_career_recommendations')
        .update({ is_dismissed: true })
        .eq('id', id);
      
      setRecommendations(prev => prev.filter(r => r.id !== id));
      toast.success('Recommendation dismissed');
    } catch (error) {
      console.error('Error dismissing recommendation:', error);
      toast.error('Failed to dismiss recommendation');
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'skill_gap': return Target;
      case 'market_trend': return TrendingUp;
      case 'career_opportunity': return Lightbulb;
      case 'salary_insight': return Award;
      case 'networking_tip': return Users;
      default: return Brain;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-48 bg-muted rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            AI Career Intelligence
          </h1>
          <p className="text-muted-foreground mt-2">
            Personalized insights powered by advanced AI to accelerate your career
          </p>
        </div>
        <Button onClick={generateNewInsights} disabled={isLoading} className="gap-2">
          <Sparkles className="w-4 h-4" />
          Generate New Insights
        </Button>
      </div>

      {/* Career Intelligence Score */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <Brain className="w-6 h-6" />
            Career Intelligence Score
          </CardTitle>
          <CardDescription>
            Your overall career readiness and market positioning
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Overall Score</span>
                <span className="text-3xl font-bold text-blue-700">{careerScore}/100</span>
              </div>
              <Progress value={careerScore} className="h-3 mb-4" />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="text-center">
                  <div className="font-semibold text-green-600">Profile</div>
                  <div className="text-muted-foreground">92%</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-blue-600">Skills</div>
                  <div className="text-muted-foreground">78%</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-purple-600">Network</div>
                  <div className="text-muted-foreground">65%</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-orange-600">Market</div>
                  <div className="text-muted-foreground">84%</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI Insights */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-yellow-500" />
                AI Career Insights
              </CardTitle>
              <CardDescription>
                Personalized insights based on your profile and market data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {insights.slice(0, 5).map((insight) => {
                  const Icon = getInsightIcon(insight.type);
                  return (
                    <div key={insight.id} className="p-4 rounded-lg border bg-card/50">
                      <div className="flex items-start gap-3">
                        <div className="bg-primary/10 p-2 rounded-full">
                          <Icon className="w-4 h-4 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-sm">{insight.title}</h4>
                            <Badge className={getPriorityColor(insight.priority)}>
                              {insight.priority}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mb-2">
                            {insight.description}
                          </p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">Confidence:</span>
                              <Progress value={insight.confidence} className="h-1 w-16" />
                              <span className="text-xs font-medium">{insight.confidence}%</span>
                            </div>
                            {insight.actionable && (
                              <Button variant="ghost" size="sm" className="h-6 text-xs">
                                <ArrowRight className="w-3 h-3 ml-1" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Market Trends */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-500" />
                Market Trends
              </CardTitle>
              <CardDescription>
                Skills in high demand in your industry
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {marketTrends.map((trend, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium text-sm">{trend.skill}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <Progress value={trend.demand} className="h-1.5 w-20" />
                        <span className="text-xs text-muted-foreground">{trend.demand}% demand</span>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800">
                      {trend.growth}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI Recommendations */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-purple-500" />
                AI Recommendations
              </CardTitle>
              <CardDescription>
                Actionable steps to advance your career
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recommendations.map((rec) => (
                  <div key={rec.id} className="p-4 rounded-lg border bg-card/50">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-sm">{rec.title}</h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => dismissRecommendation(rec.id)}
                        className="h-6 w-6 p-0"
                      >
                        ✕
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">
                      {rec.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Star className="w-3 h-3 text-yellow-500" />
                        <span className="text-xs">Confidence: {rec.confidence_score}%</span>
                      </div>
                      <Button variant="outline" size="sm" className="h-7 text-xs">
                        Take Action
                        <ArrowRight className="w-3 h-3 ml-1" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-500" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Analyze Resume with AI
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Users className="w-4 h-4 mr-2" />
                  Find Strategic Connections
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Award className="w-4 h-4 mr-2" />
                  Get Skill Recommendations
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Salary Benchmarking
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}