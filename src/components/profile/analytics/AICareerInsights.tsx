import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Zap, 
  Brain, 
  Target, 
  Lightbulb, 
  Users, 
  BookOpen, 
  TrendingUp, 
  ArrowRight,
  Sparkles,
  Star,
  Trophy,
  Rocket,
  Clock,
  CheckCircle
} from 'lucide-react';

interface AIRecommendation {
  type: 'skill' | 'connection' | 'content' | 'course';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  reasoning: string;
  actionUrl?: string;
}

interface AICareerInsightsProps {
  recommendations: AIRecommendation[];
}

export const AICareerInsights = ({ recommendations }: AICareerInsightsProps) => {
  const [dismissedRecommendations, setDismissedRecommendations] = useState<Set<string>>(new Set());

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-red-200 bg-red-50 text-red-700';
      case 'medium':
        return 'border-yellow-200 bg-yellow-50 text-yellow-700';
      case 'low':
        return 'border-blue-200 bg-blue-50 text-blue-700';
      default:
        return 'border-gray-200 bg-gray-50 text-gray-700';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Zap className="h-4 w-4" />;
      case 'medium':
        return <Star className="h-4 w-4" />;
      case 'low':
        return <Lightbulb className="h-4 w-4" />;
      default:
        return <Target className="h-4 w-4" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'skill':
        return <Brain className="h-5 w-5" />;
      case 'connection':
        return <Users className="h-5 w-5" />;
      case 'content':
        return <BookOpen className="h-5 w-5" />;
      case 'course':
        return <Trophy className="h-5 w-5" />;
      default:
        return <Target className="h-5 w-5" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'skill':
        return 'bg-purple-100 text-purple-600';
      case 'connection':
        return 'bg-blue-100 text-blue-600';
      case 'content':
        return 'bg-green-100 text-green-600';
      case 'course':
        return 'bg-orange-100 text-orange-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const dismissRecommendation = (title: string) => {
    setDismissedRecommendations(prev => new Set([...prev, title]));
  };

  const activeRecommendations = recommendations.filter(rec => !dismissedRecommendations.has(rec.title));
  const highPriorityRecommendations = activeRecommendations.filter(rec => rec.priority === 'high');
  const mediumPriorityRecommendations = activeRecommendations.filter(rec => rec.priority === 'medium');
  const lowPriorityRecommendations = activeRecommendations.filter(rec => rec.priority === 'low');

  // Mock additional insights
  const careerPath = {
    currentLevel: 'Mid-Level Professional',
    nextLevel: 'Senior Professional',
    progressPercentage: 68,
    estimatedTimeToNext: '8-12 months',
    keyMilestones: [
      'Complete AI/ML certification',
      'Lead 2+ major projects',
      'Expand network by 50+ connections',
      'Publish 5+ thought leadership articles'
    ]
  };

  const marketInsights = [
    {
      title: 'AI Transformation Trend',
      description: 'Companies in your industry are investing 40% more in AI roles this year.',
      impact: 'High opportunity for AI-skilled professionals',
      action: 'Focus on machine learning and data analysis skills'
    },
    {
      title: 'Remote Work Evolution',
      description: 'Remote job postings increased by 25% in your field.',
      impact: 'Geographic flexibility in job search',
      action: 'Highlight remote collaboration skills'
    },
    {
      title: 'Skill Gap Alert',
      description: 'Critical shortage of professionals with your skill combination.',
      impact: 'Strong negotiating position for opportunities',
      action: 'Leverage unique skill set in applications'
    }
  ];

  const RecommendationCard = ({ rec }: { rec: AIRecommendation }) => (
    <Card className={`hover:shadow-lg transition-all border-l-4 ${
      rec.priority === 'high' ? 'border-l-red-500' :
      rec.priority === 'medium' ? 'border-l-yellow-500' : 'border-l-blue-500'
    }`}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${getTypeColor(rec.type)}`}>
              {getTypeIcon(rec.type)}
            </div>
            <div>
              <h3 className="font-semibold">{rec.title}</h3>
              <Badge variant="secondary" className={`${getPriorityColor(rec.priority)} border`}>
                {getPriorityIcon(rec.priority)}
                <span className="ml-1 capitalize">{rec.priority} Priority</span>
              </Badge>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => dismissRecommendation(rec.title)}
            className="text-muted-foreground hover:text-foreground"
          >
            ×
          </Button>
        </div>

        <p className="text-muted-foreground mb-4">{rec.description}</p>

        <div className="bg-muted/30 p-3 rounded-lg mb-4">
          <div className="flex items-start gap-2">
            <Sparkles className="h-4 w-4 text-purple-500 mt-0.5" />
            <div>
              <p className="text-sm font-medium">AI Reasoning</p>
              <p className="text-sm text-muted-foreground">{rec.reasoning}</p>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          {rec.actionUrl && (
            <Button size="sm" className="flex items-center gap-2">
              Take Action
              <ArrowRight className="h-4 w-4" />
            </Button>
          )}
          <Button variant="outline" size="sm">
            Learn More
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-purple-600" />
            AI Career Intelligence
          </CardTitle>
          <p className="text-muted-foreground">
            Personalized insights powered by AI analysis of market trends, your profile, and career patterns
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-white rounded-lg border">
              <Target className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p className="font-semibold text-blue-900">Career Score</p>
              <p className="text-2xl font-bold text-blue-600">85/100</p>
              <p className="text-xs text-blue-600">Above industry average</p>
            </div>
            <div className="text-center p-4 bg-white rounded-lg border">
              <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="font-semibold text-green-900">Growth Trajectory</p>
              <p className="text-2xl font-bold text-green-600">+23%</p>
              <p className="text-xs text-green-600">Faster than peers</p>
            </div>
            <div className="text-center p-4 bg-white rounded-lg border">
              <Rocket className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <p className="font-semibold text-purple-900">Market Position</p>
              <p className="text-2xl font-bold text-purple-600">Top 15%</p>
              <p className="text-xs text-purple-600">In your field</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="recommendations" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="recommendations">Smart Recommendations</TabsTrigger>
          <TabsTrigger value="career-path">Career Path</TabsTrigger>
          <TabsTrigger value="market-insights">Market Intelligence</TabsTrigger>
        </TabsList>

        {/* Smart Recommendations */}
        <TabsContent value="recommendations" className="space-y-6">
          {/* High Priority Recommendations */}
          {highPriorityRecommendations.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-red-500" />
                <h3 className="text-lg font-semibold">High Priority Actions</h3>
                <Badge variant="destructive">{highPriorityRecommendations.length}</Badge>
              </div>
              <div className="grid gap-4">
                {highPriorityRecommendations.map((rec) => (
                  <RecommendationCard key={rec.title} rec={rec} />
                ))}
              </div>
            </div>
          )}

          {/* Medium Priority Recommendations */}
          {mediumPriorityRecommendations.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                <h3 className="text-lg font-semibold">Medium Priority</h3>
                <Badge variant="secondary">{mediumPriorityRecommendations.length}</Badge>
              </div>
              <div className="grid gap-4">
                {mediumPriorityRecommendations.map((rec) => (
                  <RecommendationCard key={rec.title} rec={rec} />
                ))}
              </div>
            </div>
          )}

          {/* Low Priority Recommendations */}
          {lowPriorityRecommendations.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-blue-500" />
                <h3 className="text-lg font-semibold">Future Considerations</h3>
                <Badge variant="outline">{lowPriorityRecommendations.length}</Badge>
              </div>
              <div className="grid gap-4">
                {lowPriorityRecommendations.map((rec) => (
                  <RecommendationCard key={rec.title} rec={rec} />
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        {/* Career Path */}
        <TabsContent value="career-path" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Rocket className="h-5 w-5" />
                Your Career Progression Path
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Current to Next Level */}
                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                  <div>
                    <p className="font-medium">{careerPath.currentLevel}</p>
                    <p className="text-sm text-muted-foreground">Current Level</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{careerPath.nextLevel}</p>
                    <p className="text-sm text-muted-foreground">Next Level</p>
                  </div>
                </div>

                {/* Progress */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress to Next Level</span>
                    <span className="font-medium">{careerPath.progressPercentage}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all"
                      style={{ width: `${careerPath.progressPercentage}%` }}
                    ></div>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    Estimated time: {careerPath.estimatedTimeToNext}
                  </div>
                </div>

                {/* Key Milestones */}
                <div>
                  <h4 className="font-medium mb-3">Key Milestones to Achieve</h4>
                  <div className="space-y-2">
                    {careerPath.keyMilestones.map((milestone, index) => (
                      <div key={index} className="flex items-center gap-3 p-2 hover:bg-muted/30 rounded">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm">{milestone}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Market Intelligence */}
        <TabsContent value="market-insights" className="space-y-6">
          <div className="grid gap-4">
            {marketInsights.map((insight, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <TrendingUp className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-2">{insight.title}</h3>
                      <p className="text-muted-foreground mb-3">{insight.description}</p>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Target className="h-4 w-4 text-green-500" />
                          <span className="text-sm font-medium">Impact:</span>
                          <span className="text-sm text-green-600">{insight.impact}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <ArrowRight className="h-4 w-4 text-blue-500" />
                          <span className="text-sm font-medium">Action:</span>
                          <span className="text-sm text-blue-600">{insight.action}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};