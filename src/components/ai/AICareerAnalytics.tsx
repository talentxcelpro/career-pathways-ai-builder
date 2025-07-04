import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  TrendingUp, 
  Target, 
  Zap,
  BarChart3,
  Users,
  Clock,
  Award,
  ArrowRight,
  Lightbulb,
  Calendar,
  MapPin,
  DollarSign
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

interface CareerPrediction {
  role: string;
  probability: number;
  timeframe: string;
  salaryRange: string;
  requiredSkills: string[];
  marketDemand: 'high' | 'medium' | 'low';
}

interface SkillGap {
  skill: string;
  currentLevel: number;
  requiredLevel: number;
  priority: 'high' | 'medium' | 'low';
  learningTime: string;
}

interface NetworkInsight {
  type: 'connection_opportunity' | 'skill_endorsement' | 'job_referral';
  title: string;
  description: string;
  actionable: boolean;
  priority: number;
}

export const AICareerAnalytics: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'predictions' | 'skills' | 'network'>('predictions');

  const { data: currentUser } = useQuery({
    queryKey: ['current-user-analytics'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      return { ...user, profile };
    }
  });

  // Mock data - in real implementation, this would come from AI analysis
  const careerPredictions: CareerPrediction[] = [
    {
      role: 'Senior Frontend Developer',
      probability: 85,
      timeframe: '6-12 months',
      salaryRange: '₹8-15 LPA',
      requiredSkills: ['React', 'TypeScript', 'Node.js'],
      marketDemand: 'high'
    },
    {
      role: 'Full Stack Developer',
      probability: 72,
      timeframe: '12-18 months',
      salaryRange: '₹10-18 LPA',
      requiredSkills: ['React', 'Node.js', 'MongoDB', 'AWS'],
      marketDemand: 'high'
    },
    {
      role: 'Tech Lead',
      probability: 58,
      timeframe: '18-24 months',
      salaryRange: '₹15-25 LPA',
      requiredSkills: ['Leadership', 'System Design', 'Mentoring'],
      marketDemand: 'medium'
    }
  ];

  const skillGaps: SkillGap[] = [
    {
      skill: 'TypeScript',
      currentLevel: 60,
      requiredLevel: 85,
      priority: 'high',
      learningTime: '2-3 months'
    },
    {
      skill: 'System Design',
      currentLevel: 30,
      requiredLevel: 75,
      priority: 'high',
      learningTime: '4-6 months'
    },
    {
      skill: 'AWS',
      currentLevel: 20,
      requiredLevel: 70,
      priority: 'medium',
      learningTime: '3-4 months'
    }
  ];

  const networkInsights: NetworkInsight[] = [
    {
      type: 'connection_opportunity',
      title: 'Connect with 5 Senior Developers',
      description: 'These connections could provide mentorship opportunities',
      actionable: true,
      priority: 90
    },
    {
      type: 'skill_endorsement',
      title: 'Get 3 React endorsements',
      description: 'Strengthen your React credibility on your profile',
      actionable: true,
      priority: 75
    },
    {
      type: 'job_referral',
      title: '2 potential job referrals available',
      description: 'Your network can refer you to open positions',
      actionable: true,
      priority: 95
    }
  ];

  const getDemandColor = (demand: string) => {
    switch (demand) {
      case 'high': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!currentUser) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">AI Career Analytics</h3>
          <p className="text-gray-600 mb-4">
            Login to get personalized AI-powered career insights
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Brain className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-purple-900">AI Career Analytics</h2>
              <p className="text-sm text-purple-700">Powered by advanced machine learning</p>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-white rounded-lg">
              <div className="text-2xl font-bold text-green-600">85%</div>
              <div className="text-xs text-gray-600">Career Fit Score</div>
            </div>
            <div className="text-center p-3 bg-white rounded-lg">
              <div className="text-2xl font-bold text-blue-600">12</div>
              <div className="text-xs text-gray-600">Growth Opportunities</div>
            </div>
            <div className="text-center p-3 bg-white rounded-lg">
              <div className="text-2xl font-bold text-orange-600">6mo</div>
              <div className="text-xs text-gray-600">Next Milestone</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex gap-2">
        <Button
          variant={activeTab === 'predictions' ? 'default' : 'outline'}
          onClick={() => setActiveTab('predictions')}
          className="flex items-center gap-2"
        >
          <TrendingUp className="h-4 w-4" />
          Career Predictions
        </Button>
        <Button
          variant={activeTab === 'skills' ? 'default' : 'outline'}
          onClick={() => setActiveTab('skills')}
          className="flex items-center gap-2"
        >
          <Target className="h-4 w-4" />
          Skill Gaps
        </Button>
        <Button
          variant={activeTab === 'network' ? 'default' : 'outline'}
          onClick={() => setActiveTab('network')}
          className="flex items-center gap-2"
        >
          <Users className="h-4 w-4" />
          Network Insights
        </Button>
      </div>

      {/* Career Predictions */}
      {activeTab === 'predictions' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              AI Career Predictions
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Based on your skills, experience, and market trends
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {careerPredictions.map((prediction, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-1">{prediction.role}</h4>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {prediction.timeframe}
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          {prediction.salaryRange}
                        </div>
                        <Badge className={getDemandColor(prediction.marketDemand)}>
                          {prediction.marketDemand} demand
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-600">{prediction.probability}%</div>
                      <div className="text-xs text-gray-500">Match Score</div>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <Progress value={prediction.probability} className="h-2" />
                  </div>
                  
                  <div className="flex flex-wrap gap-1 mb-3">
                    {prediction.requiredSkills.map((skill) => (
                      <Badge key={skill} variant="outline" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                  
                  <Button size="sm" className="w-full">
                    <ArrowRight className="h-4 w-4 mr-2" />
                    View Career Path
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Skill Gaps */}
      {activeTab === 'skills' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-orange-600" />
              Smart Skill Gap Analysis
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              AI-identified skills to focus on for your career growth
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {skillGaps.map((gap, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-gray-900">{gap.skill}</h4>
                        <Badge className={getPriorityColor(gap.priority)}>
                          {gap.priority} priority
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600 mb-2">
                        Learning time: {gap.learningTime}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-3">
                    <div className="flex items-center justify-between text-sm">
                      <span>Current Level</span>
                      <span>{gap.currentLevel}%</span>
                    </div>
                    <Progress value={gap.currentLevel} className="h-2" />
                    
                    <div className="flex items-center justify-between text-sm">
                      <span>Required Level</span>
                      <span>{gap.requiredLevel}%</span>
                    </div>
                    <Progress value={gap.requiredLevel} className="h-2" />
                  </div>
                  
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1">
                      <Lightbulb className="h-4 w-4 mr-2" />
                      Find Courses
                    </Button>
                    <Button size="sm" variant="outline">
                      <Users className="h-4 w-4 mr-2" />
                      Find Mentors
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Network Insights */}
      {activeTab === 'network' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-green-600" />
              AI Network Insights
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Strategic networking recommendations powered by AI
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {networkInsights.map((insight, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-1">{insight.title}</h4>
                      <p className="text-sm text-gray-600 mb-2">{insight.description}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-600">{insight.priority}%</div>
                      <div className="text-xs text-gray-500">Impact Score</div>
                    </div>
                  </div>
                  
                  {insight.actionable && (
                    <Button size="sm" className="w-full">
                      <Zap className="h-4 w-4 mr-2" />
                      Take Action
                    </Button>
                  )}
                </div>
              ))}
            </div>
            
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h5 className="font-medium text-gray-900 mb-2">Network Health Score</h5>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Progress value={78} className="h-3" />
                </div>
                <div className="text-lg font-bold text-blue-600">78%</div>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Your network is growing well. Focus on quality connections in your target industry.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};