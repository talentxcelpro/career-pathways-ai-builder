import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Brain, TrendingUp, Target, Lightbulb, MessageSquare, FileText } from "lucide-react";

const AICareerDashboard = () => {
  const recommendations = [
    {
      id: 1,
      type: 'job_match',
      title: 'Senior Frontend Developer at TechCorp',
      description: 'Perfect match based on your React and TypeScript skills',
      confidence: 92,
      priority: 'high'
    },
    {
      id: 2,
      type: 'skill_gap',
      title: 'Learn AWS Cloud Architecture',
      description: 'Adding AWS skills could increase your salary by 15-20%',
      confidence: 88,
      priority: 'medium'
    },
    {
      id: 3,
      type: 'career_path',
      title: 'Engineering Manager Track',
      description: 'Consider leadership roles based on your experience',
      confidence: 75,
      priority: 'medium'
    }
  ];

  const insights = [
    {
      type: 'salary_trend',
      title: 'Salary Outlook',
      value: '+12%',
      description: 'Frontend developer salaries trending up in your area'
    },
    {
      type: 'skill_demand',
      title: 'Skills in Demand',
      value: 'React, TypeScript',
      description: 'Your core skills are highly sought after'
    },
    {
      type: 'market_outlook',
      title: 'Job Market',
      value: 'Strong',
      description: '2,340 relevant positions posted this month'
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      default: return 'outline';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'job_match': return Target;
      case 'skill_gap': return TrendingUp;
      case 'career_path': return Lightbulb;
      default: return Brain;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <Brain className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">AI Career Intelligence</h2>
          <p className="text-muted-foreground">Personalized insights powered by AI</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
          <MessageSquare className="h-6 w-6" />
          <span>Career Chat</span>
          <span className="text-xs text-muted-foreground">Ask AI anything</span>
        </Button>
        <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
          <FileText className="h-6 w-6" />
          <span>Resume Analysis</span>
          <span className="text-xs text-muted-foreground">Get AI feedback</span>
        </Button>
        <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
          <Target className="h-6 w-6" />
          <span>Job Matching</span>
          <span className="text-xs text-muted-foreground">Find perfect fits</span>
        </Button>
      </div>

      {/* AI Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {recommendations.map((rec) => {
            const IconComponent = getTypeIcon(rec.type);
            return (
              <div key={rec.id} className="p-4 border rounded-lg space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <IconComponent className="h-4 w-4 text-primary" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-medium">{rec.title}</h4>
                      <p className="text-sm text-muted-foreground">{rec.description}</p>
                    </div>
                  </div>
                  <Badge variant={getPriorityColor(rec.priority)}>
                    {rec.confidence}% match
                  </Badge>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <Progress value={rec.confidence} className="h-2" />
                  </div>
                  <Button size="sm">View Details</Button>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Career Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Market Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {insights.map((insight, index) => (
              <div key={index} className="p-4 border rounded-lg text-center space-y-2">
                <div className="text-2xl font-bold text-primary">{insight.value}</div>
                <div className="font-medium">{insight.title}</div>
                <div className="text-sm text-muted-foreground">{insight.description}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AICareerDashboard;