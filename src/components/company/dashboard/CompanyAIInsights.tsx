import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  Lightbulb, 
  TrendingUp, 
  Target, 
  Zap, 
  Award, 
  AlertTriangle,
  CheckCircle,
  Clock,
  X,
  ArrowRight,
  Sparkles
} from 'lucide-react';

interface CompanyAIInsightsProps {
  company: any;
  metrics: any;
  userRole: string;
}

export const CompanyAIInsights: React.FC<CompanyAIInsightsProps> = ({ company, metrics, userRole }) => {
  const [dismissedInsights, setDismissedInsights] = useState<string[]>([]);

  // Get AI insights
  const { data: aiInsights, isLoading } = useQuery({
    queryKey: ['company-ai-insights', company?.id],
    queryFn: async () => {
      if (!company) return [];

      const { data, error } = await supabase
        .from('company_ai_insights')
        .select('*')
        .eq('company_id', company.id)
        .eq('status', 'active')
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!company
  });

  const handleDismissInsight = async (insightId: string) => {
    try {
      await supabase
        .from('company_ai_insights')
        .update({ status: 'dismissed' })
        .eq('id', insightId);
      
      setDismissedInsights([...dismissedInsights, insightId]);
    } catch (error) {
      console.error('Error dismissing insight:', error);
    }
  };

  const handleImplementInsight = async (insightId: string) => {
    try {
      await supabase
        .from('company_ai_insights')
        .update({ status: 'implemented' })
        .eq('id', insightId);
    } catch (error) {
      console.error('Error marking insight as implemented:', error);
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'content_optimization': return <Lightbulb className="h-5 w-5" />;
      case 'timing_recommendation': return <Clock className="h-5 w-5" />;
      case 'engagement_boost': return <TrendingUp className="h-5 w-5" />;
      case 'hiring_insight': return <Target className="h-5 w-5" />;
      case 'performance_summary': return <Award className="h-5 w-5" />;
      default: return <Brain className="h-5 w-5" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <AlertTriangle className="h-4 w-4" />;
      case 'medium': return <Clock className="h-4 w-4" />;
      case 'low': return <CheckCircle className="h-4 w-4" />;
      default: return <Brain className="h-4 w-4" />;
    }
  };

  // Mock AI insights if none exist in database
  const mockInsights = [
    {
      id: 'mock-1',
      insight_type: 'content_optimization',
      title: 'Optimize Your Post Timing',
      description: 'Your posts get 45% more engagement when posted between 2-4 PM on weekdays. Consider scheduling your content during these peak hours.',
      recommendations: [
        'Schedule posts for 2-4 PM IST on weekdays',
        'Use scheduling tools to maintain consistency',
        'Monitor engagement rates for different time slots'
      ],
      confidence_score: 0.87,
      priority: 'high'
    },
    {
      id: 'mock-2',
      insight_type: 'hiring_insight',
      title: 'Improve Job Description Quality',
      description: 'Your job postings with detailed skill requirements receive 35% more qualified applications. Consider adding more specific technical requirements.',
      recommendations: [
        'Add specific technical skills and experience levels',
        'Include clear role expectations and responsibilities',
        'Mention growth opportunities and learning paths'
      ],
      confidence_score: 0.92,
      priority: 'medium'
    },
    {
      id: 'mock-3',
      insight_type: 'engagement_boost',
      title: 'Leverage Video Content',
      description: 'Companies in your industry see 3x more engagement with video content. Consider incorporating videos in your posts.',
      recommendations: [
        'Create behind-the-scenes company videos',
        'Share employee testimonials and success stories',
        'Post product demos and tutorials'
      ],
      confidence_score: 0.78,
      priority: 'medium'
    },
    {
      id: 'mock-4',
      insight_type: 'performance_summary',
      title: 'Strong Growth Trajectory',
      description: 'Your company metrics show consistent growth. You\'re outperforming 73% of companies in your industry segment.',
      recommendations: [
        'Continue current content strategy',
        'Expand to new platforms for broader reach',
        'Consider thought leadership content'
      ],
      confidence_score: 0.95,
      priority: 'low'
    }
  ];

  const displayInsights = aiInsights && aiInsights.length > 0 ? aiInsights : mockInsights;
  const filteredInsights = displayInsights.filter(insight => !dismissedInsights.includes(insight.id));

  return (
    <div className="space-y-6">
      {/* AI Insights Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">AI-Powered Insights</h3>
          <p className="text-gray-600">Smart recommendations to enhance your company performance</p>
        </div>
        <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
          <Sparkles className="h-4 w-4 mr-2" />
          Generate New Insights
        </Button>
      </div>

      {/* AI Performance Overview */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-purple-600" />
            AI Performance Dashboard
          </CardTitle>
          <CardDescription>Your company's AI-enhanced analytics overview</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-full p-4 w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                <Target className="h-8 w-8 text-white" />
              </div>
              <h4 className="font-semibold text-purple-900">Optimization Score</h4>
              <p className="text-2xl font-bold text-purple-600">87%</p>
              <Progress value={87} className="mt-2" />
            </div>
            
            <div className="text-center">
              <div className="bg-gradient-to-r from-green-500 to-blue-500 rounded-full p-4 w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                <TrendingUp className="h-8 w-8 text-white" />
              </div>
              <h4 className="font-semibold text-green-900">Growth Potential</h4>
              <p className="text-2xl font-bold text-green-600">+24%</p>
              <Progress value={75} className="mt-2" />
            </div>
            
            <div className="text-center">
              <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full p-4 w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                <Zap className="h-8 w-8 text-white" />
              </div>
              <h4 className="font-semibold text-yellow-900">AI Confidence</h4>
              <p className="text-2xl font-bold text-yellow-600">92%</p>
              <Progress value={92} className="mt-2" />
            </div>
            
            <div className="text-center">
              <div className="bg-gradient-to-r from-pink-500 to-purple-500 rounded-full p-4 w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                <Award className="h-8 w-8 text-white" />
              </div>
              <h4 className="font-semibold text-pink-900">Industry Rank</h4>
              <p className="text-2xl font-bold text-pink-600">Top 15%</p>
              <Progress value={85} className="mt-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Insights List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-32 bg-gray-200 rounded-lg"></div>
              </div>
            ))}
          </div>
        ) : filteredInsights.length > 0 ? (
          filteredInsights.map((insight) => (
            <Card key={insight.id} className="hover:shadow-lg transition-shadow border-l-4 border-l-purple-500">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      {getInsightIcon(insight.insight_type)}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{insight.title}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={getPriorityColor(insight.priority)}>
                          {getPriorityIcon(insight.priority)}
                          <span className="ml-1">{insight.priority?.toUpperCase()}</span>
                        </Badge>
                        <Badge variant="outline">
                          {Math.round((insight.confidence_score || 0.8) * 100)}% confidence
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDismissInsight(insight.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-4">{insight.description}</p>
                
                {insight.recommendations && Array.isArray(insight.recommendations) && insight.recommendations.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Recommended Actions:</h4>
                    <ul className="space-y-2">
                      {(insight.recommendations as string[]).map((rec: string, index: number) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                          <ArrowRight className="h-4 w-4 mt-0.5 text-purple-600 flex-shrink-0" />
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                <div className="flex gap-3">
                  <Button 
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                    onClick={() => handleImplementInsight(insight.id)}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Implement
                  </Button>
                  <Button variant="outline">
                    Learn More
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <Brain className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">AI Analysis in Progress</h3>
              <p className="text-gray-600 mb-4">
                Our AI is analyzing your company data to generate personalized insights
              </p>
              <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Insights Now
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* AI Features Preview */}
      <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-indigo-600" />
            Advanced AI Features
          </CardTitle>
          <CardDescription>Unlock the full potential of AI for your company</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-white rounded-lg border">
              <h4 className="font-semibold text-indigo-900 mb-2">Smart Content Generation</h4>
              <p className="text-sm text-gray-600 mb-3">
                AI-powered content suggestions for posts, job descriptions, and announcements
              </p>
              <Badge className="bg-indigo-100 text-indigo-800">Coming Soon</Badge>
            </div>
            
            <div className="p-4 bg-white rounded-lg border">
              <h4 className="font-semibold text-purple-900 mb-2">Predictive Analytics</h4>
              <p className="text-sm text-gray-600 mb-3">
                Forecast hiring needs, engagement trends, and optimal posting schedules
              </p>
              <Badge className="bg-purple-100 text-purple-800">Coming Soon</Badge>
            </div>
            
            <div className="p-4 bg-white rounded-lg border">
              <h4 className="font-semibold text-green-900 mb-2">Auto Candidate Screening</h4>
              <p className="text-sm text-gray-600 mb-3">
                Intelligent candidate ranking and automated preliminary screening
              </p>
              <Badge className="bg-green-100 text-green-800">Coming Soon</Badge>
            </div>
            
            <div className="p-4 bg-white rounded-lg border">
              <h4 className="font-semibold text-orange-900 mb-2">Competitive Intelligence</h4>
              <p className="text-sm text-gray-600 mb-3">
                AI-driven insights into industry trends and competitor analysis
              </p>
              <Badge className="bg-orange-100 text-orange-800">Coming Soon</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};