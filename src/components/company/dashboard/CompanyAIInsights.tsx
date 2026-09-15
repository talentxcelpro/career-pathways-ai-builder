import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  Lightbulb, 
  TrendingUp, 
  Target, 
  Sparkles,
  Award
} from 'lucide-react';

interface CompanyAIInsightsProps {
  company: any;
  metrics: any;
  userRole: string;
}

export const CompanyAIInsights: React.FC<CompanyAIInsightsProps> = ({ 
  company, 
  metrics, 
  userRole 
}) => {
  const generateAIInsights = () => {
    const insights = [];
    
    if (metrics?.engagement_score < 30) {
      insights.push({
        id: 'engagement-boost',
        title: 'Boost Engagement Rate',
        description: 'Your engagement rate is below industry average. Consider posting more interactive content.',
        impact_score: 85,
        implementation_effort: 'medium'
      });
    }

    insights.push({
      id: 'content-timing',
      title: 'Optimize Posting Schedule',
      description: 'AI analysis suggests better posting times based on your audience patterns.',
      impact_score: 73,
      implementation_effort: 'low'
    });

    return insights;
  };

  const aiInsights = generateAIInsights();

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            AI-Powered Insights
          </h3>
          <p className="text-sm text-muted-foreground">Smart recommendations to boost performance</p>
        </div>
        <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
          <Sparkles className="h-3 w-3 mr-1" />
          <span className="text-xs">AI Powered</span>
        </Badge>
      </div>

      <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Award className="h-4 w-4 text-primary" />
            AI Performance Score
          </CardTitle>
          <CardDescription className="text-sm">Overall company performance analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary mb-1">
                {Math.round(((metrics?.engagement_score || 0) + (metrics?.success_rate || 0) + (metrics?.content_performance_score || 0)) / 3)}
              </div>
              <p className="text-xs text-muted-foreground">Overall Score</p>
              <Progress value={((metrics?.engagement_score || 0) + (metrics?.success_rate || 0) + (metrics?.content_performance_score || 0)) / 3} className="mt-2 h-1" />
            </div>
            
            <div className="text-center">
              <div className="text-xl font-bold text-success mb-1">{metrics?.engagement_score?.toFixed(0) || 0}</div>
              <p className="text-xs text-muted-foreground">Engagement</p>
              <Progress value={metrics?.engagement_score || 0} className="mt-2 h-1" />
            </div>
            
            <div className="text-center">
              <div className="text-xl font-bold text-accent-foreground mb-1">{metrics?.content_performance_score?.toFixed(0) || 0}</div>
              <p className="text-xs text-muted-foreground">Content</p>
              <Progress value={metrics?.content_performance_score || 0} className="mt-2 h-1" />
            </div>
            
            <div className="text-center">
              <div className="text-xl font-bold text-secondary-foreground mb-1">{metrics?.success_rate?.toFixed(0) || 0}</div>
              <p className="text-xs text-muted-foreground">Success Rate</p>
              <Progress value={metrics?.success_rate || 0} className="mt-2 h-1" />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {aiInsights.map((insight, index) => (
          <Card key={insight.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-primary" />
                    {insight.title}
                  </CardTitle>
                  <CardDescription className="text-sm mt-1">{insight.description}</CardDescription>
                </div>
                <div className="flex gap-2 ml-4">
                  <Badge className="text-xs border bg-primary/10 text-primary border-primary/20">
                    {insight.impact_score}% Impact
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {insight.implementation_effort} effort
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex justify-end">
                <Button size="sm" className="text-xs">
                  <Target className="h-3 w-3 mr-1" />
                  Implement
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};