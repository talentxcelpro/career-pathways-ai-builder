import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  Lightbulb, 
  TrendingUp, 
  Target, 
  Zap,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  Sparkles,
  BarChart3,
  Users,
  BookOpen
} from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface AIInsightsSectionProps {
  userId?: string;
  careerData?: any;
  isOwner?: boolean;
}

export function AIInsightsSection({ 
  userId, 
  careerData, 
  isOwner = true 
}: AIInsightsSectionProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const navigate = useNavigate();

  // Sample AI insights - in real app, this would come from AI analysis
  const aiInsights = {
    careerStrengths: [
      {
        title: 'Technical Expertise',
        description: 'Strong foundation in software development with modern technologies',
        confidence: 92,
        impact: 'high'
      },
      {
        title: 'Continuous Learning',
        description: 'Demonstrates commitment to skill development and certifications',
        confidence: 88,
        impact: 'medium'
      },
      {
        title: 'Professional Network',
        description: 'Growing network of industry professionals and mentors',
        confidence: 75,
        impact: 'medium'
      }
    ],
    improvementAreas: [
      {
        title: 'Leadership Experience',
        description: 'Consider taking on team lead roles or project management',
        priority: 'high',
        action: 'Explore leadership opportunities'
      },
      {
        title: 'Industry Visibility',
        description: 'Increase presence through content creation and speaking',
        priority: 'medium',
        action: 'Start writing technical blogs'
      },
      {
        title: 'Certifications Gap',
        description: 'Cloud computing certifications would boost marketability',
        priority: 'medium',
        action: 'Pursue AWS or Azure certification'
      }
    ],
    careerRecommendations: [
      {
        title: 'Senior Developer Roles',
        match: 95,
        reason: 'Your technical skills align perfectly with senior developer requirements',
        action: () => navigate('/jobs?level=senior')
      },
      {
        title: 'Tech Lead Positions',
        match: 78,
        reason: 'With some leadership experience, you\'d be ideal for tech lead roles',
        action: () => navigate('/learning?category=leadership')
      },
      {
        title: 'Startup Opportunities',
        match: 85,
        reason: 'Your diverse skill set is valuable in fast-paced startup environments',
        action: () => navigate('/jobs?company_type=startup')
      }
    ],
    marketInsights: {
      industryTrends: [
        { trend: 'AI/ML Integration', relevance: 'High', growth: '+45%' },
        { trend: 'Cloud-Native Development', relevance: 'High', growth: '+38%' },
        { trend: 'DevOps Practices', relevance: 'Medium', growth: '+25%' },
        { trend: 'Cybersecurity', relevance: 'Medium', growth: '+42%' }
      ],
      salaryInsights: {
        currentRange: '$75K - $95K',
        potentialRange: '$95K - $120K',
        improvementActions: [
          'Complete cloud certifications',
          'Gain team leadership experience',
          'Build portfolio of complex projects'
        ]
      }
    }
  };

  const generateNewInsights = async () => {
    setIsGenerating(true);
    try {
      // Simulate AI insight generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success('New AI insights generated!');
    } catch (error) {
      toast.error('Failed to generate insights');
    } finally {
      setIsGenerating(false);
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-600 bg-green-100';
    if (confidence >= 70) return 'text-blue-600 bg-blue-100';
    return 'text-yellow-600 bg-yellow-100';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      {/* AI Insights Header */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-purple-800">
              <Brain className="w-5 h-5" />
              AI-Powered Career Insights
              <Sparkles className="w-4 h-4" />
            </CardTitle>
            {isOwner && (
              <Button 
                onClick={generateNewInsights}
                disabled={isGenerating}
                size="sm"
                className="bg-purple-600 hover:bg-purple-700"
              >
                {isGenerating ? (
                  <>
                    <Zap className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    Generate New Insights
                  </>
                )}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-purple-700">
            Personalized recommendations powered by AI analysis of your career data, 
            industry trends, and market insights.
          </p>
        </CardContent>
      </Card>

      {/* Career Strengths */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800">
            <CheckCircle className="w-5 h-5" />
            Your Career Strengths
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {aiInsights.careerStrengths.map((strength, index) => (
              <div key={index} className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-green-900">{strength.title}</h4>
                  <Badge className={getConfidenceColor(strength.confidence)}>
                    {strength.confidence}% confidence
                  </Badge>
                </div>
                <p className="text-green-700 text-sm mb-3">{strength.description}</p>
                <div className="flex items-center gap-2">
                  <Progress value={strength.confidence} className="flex-1 h-2" />
                  <Badge variant="outline" className="text-xs">
                    {strength.impact} impact
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Improvement Areas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-800">
            <Target className="w-5 h-5" />
            Growth Opportunities
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {aiInsights.improvementAreas.map((area, index) => (
              <div key={index} className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-orange-900">{area.title}</h4>
                  <Badge className={getPriorityColor(area.priority)}>
                    {area.priority} priority
                  </Badge>
                </div>
                <p className="text-orange-700 text-sm mb-3">{area.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-orange-600 font-medium">
                    Recommended: {area.action}
                  </span>
                  {isOwner && (
                    <Button size="sm" variant="outline" className="text-orange-600 border-orange-300">
                      Take Action <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Career Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <Lightbulb className="w-5 h-5" />
            Personalized Career Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {aiInsights.careerRecommendations.map((rec, index) => (
              <Card key={index} className="bg-blue-50 border-blue-200 hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="text-center mb-3">
                    <div className="text-2xl font-bold text-blue-800 mb-1">
                      {rec.match}%
                    </div>
                    <h4 className="font-semibold text-blue-900">{rec.title}</h4>
                  </div>
                  <p className="text-sm text-blue-700 text-center mb-4">
                    {rec.reason}
                  </p>
                  {isOwner && (
                    <Button 
                      onClick={rec.action}
                      className="w-full"
                      size="sm"
                    >
                      Explore Opportunities
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Market Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Industry Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Industry Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {aiInsights.marketInsights.industryTrends.map((trend, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h5 className="font-medium text-gray-900">{trend.trend}</h5>
                    <p className="text-sm text-gray-600">Relevance: {trend.relevance}</p>
                  </div>
                  <Badge className="bg-green-100 text-green-800">
                    {trend.growth}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Salary Insights */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Salary Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-600 mb-1">Current Market Range</p>
                <p className="text-2xl font-bold text-blue-800">
                  {aiInsights.marketInsights.salaryInsights.currentRange}
                </p>
              </div>
              
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-green-600 mb-1">Potential with Improvements</p>
                <p className="text-2xl font-bold text-green-800">
                  {aiInsights.marketInsights.salaryInsights.potentialRange}
                </p>
              </div>

              <div className="space-y-2">
                <h5 className="font-medium text-gray-900">Actions to Increase Earning Potential:</h5>
                {aiInsights.marketInsights.salaryInsights.improvementActions.map((action, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">{action}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Learning Recommendations */}
      <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-indigo-800">
            <BookOpen className="w-5 h-5" />
            Recommended Learning Path
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { skill: 'Cloud Architecture', priority: 'High', time: '3-4 months' },
              { skill: 'Team Leadership', priority: 'High', time: '2-3 months' },
              { skill: 'DevOps Practices', priority: 'Medium', time: '4-6 months' }
            ].map((item, index) => (
              <div key={index} className="p-4 bg-white rounded-lg border border-indigo-200">
                <h5 className="font-semibold text-indigo-900 mb-2">{item.skill}</h5>
                <div className="space-y-2">
                  <Badge className={getPriorityColor(item.priority.toLowerCase())}>
                    {item.priority} Priority
                  </Badge>
                  <p className="text-sm text-indigo-700">
                    Estimated time: {item.time}
                  </p>
                  {isOwner && (
                    <Button size="sm" className="w-full mt-2">
                      Start Learning
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}