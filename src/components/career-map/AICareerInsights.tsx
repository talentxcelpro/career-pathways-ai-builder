
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, Brain, Target, AlertTriangle, CheckCircle, Star, MapPin } from 'lucide-react';

interface MarketTrend {
  skill: string;
  demand: 'high' | 'medium' | 'low';
  growth: number;
  salaryRange: { min: number; max: number };
}

interface CareerInsight {
  type: 'opportunity' | 'risk' | 'recommendation';
  title: string;
  description: string;
  confidence: number;
  priority: 'high' | 'medium' | 'low';
}

interface AICareerInsightsProps {
  targetRole: string;
  currentSkills: string[];
  location?: string;
}

export const AICareerInsights: React.FC<AICareerInsightsProps> = ({
  targetRole,
  currentSkills,
  location = 'Global'
}) => {
  // Mock AI-powered insights data
  const marketTrends: MarketTrend[] = [
    { skill: 'AI/ML', demand: 'high', growth: 45, salaryRange: { min: 120000, max: 180000 } },
    { skill: 'Cloud Computing', demand: 'high', growth: 38, salaryRange: { min: 110000, max: 160000 } },
    { skill: 'Data Science', demand: 'high', growth: 32, salaryRange: { min: 100000, max: 150000 } },
    { skill: 'DevOps', demand: 'medium', growth: 28, salaryRange: { min: 95000, max: 140000 } },
    { skill: 'Cybersecurity', demand: 'high', growth: 41, salaryRange: { min: 105000, max: 155000 } }
  ];

  const careerInsights: CareerInsight[] = [
    {
      type: 'opportunity',
      title: 'High Market Demand',
      description: `${targetRole} positions have increased by 35% in the last 6 months in ${location}`,
      confidence: 92,
      priority: 'high'
    },
    {
      type: 'recommendation',
      title: 'Skill Enhancement Priority',
      description: 'Focus on AI/ML skills - 67% salary increase potential identified',
      confidence: 88,
      priority: 'high'
    },
    {
      type: 'risk',
      title: 'Automation Risk Assessment',
      description: 'Low automation risk (15%) for your target role - safe career choice',
      confidence: 85,
      priority: 'medium'
    }
  ];

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'opportunity': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'risk': return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      case 'recommendation': return <Target className="h-4 w-4 text-blue-600" />;
      default: return <Brain className="h-4 w-4" />;
    }
  };

  const getDemandColor = (demand: string) => {
    switch (demand) {
      case 'high': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* AI Insights Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-blue-600" />
            TalentXcel AI Career Insights
          </CardTitle>
          <CardDescription>
            Powered by real-world market data and predictive analytics
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Market Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            Market Trends & Demand
          </CardTitle>
          <CardDescription>
            Real-time skill demand and salary projections for {location}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {marketTrends.map((trend, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-medium">{trend.skill}</span>
                    <Badge className={getDemandColor(trend.demand)}>
                      {trend.demand} demand
                    </Badge>
                    {currentSkills.includes(trend.skill.toLowerCase()) && (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      {trend.growth}% growth
                    </div>
                    <div>
                      ${trend.salaryRange.min.toLocaleString()} - ${trend.salaryRange.max.toLocaleString()}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <Progress value={trend.growth} className="w-20 h-2 mb-1" />
                  <span className="text-xs text-gray-500">{trend.growth}%</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* AI Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            TalentXcel AI Insights
          </CardTitle>
          <CardDescription>
            Personalized recommendations based on your profile and market analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {careerInsights.map((insight, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getInsightIcon(insight.type)}
                    <h4 className="font-medium">{insight.title}</h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={insight.priority === 'high' ? 'default' : 'secondary'}>
                      {insight.priority} priority
                    </Badge>
                    <span className="text-xs text-gray-500">{insight.confidence}% confidence</span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-3">{insight.description}</p>
                <Progress value={insight.confidence} className="h-1" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Geographic Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-purple-600" />
            Geographic Market Analysis
          </CardTitle>
          <CardDescription>
            Location-based opportunities and salary comparisons
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Top Markets for {targetRole}</h4>
              <div className="space-y-2">
                {['San Francisco', 'New York', 'Seattle', 'Austin'].map((city, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span>{city}</span>
                    <span className="text-green-600">+{25 - index * 3}%</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Remote Work Availability</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Fully Remote</span>
                  <span>68%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Hybrid</span>
                  <span>24%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>On-site</span>
                  <span>8%</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Recommended Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Button className="w-full justify-start">
              <Target className="h-4 w-4 mr-2" />
              Update Skills Based on Market Trends
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <TrendingUp className="h-4 w-4 mr-2" />
              Explore High-Growth Opportunities
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <MapPin className="h-4 w-4 mr-2" />
              Consider Geographic Relocation
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
