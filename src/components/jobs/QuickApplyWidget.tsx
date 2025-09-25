import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Zap, Clock, CheckCircle, AlertCircle, Users, 
  TrendingUp, Star, Target, Award, Sparkles
} from 'lucide-react';

export const QuickApplyWidget: React.FC = () => {
  const [appliedToday, setAppliedToday] = useState(3);
  const [quickApplyStreak, setQuickApplyStreak] = useState(5);

  const quickApplyStats = {
    todayApplications: appliedToday,
    weeklyGoal: 10,
    averageResponseTime: '24 hours',
    successRate: '78%',
    streak: quickApplyStreak
  };

  const quickApplyTips = [
    {
      icon: <Zap className="h-4 w-4 text-yellow-500" />,
      tip: "Apply within first 6 hours for 3x better chances",
      priority: "high"
    },
    {
      icon: <Users className="h-4 w-4 text-blue-500" />,
      tip: "Jobs with <10 applicants have higher success rates",
      priority: "medium"
    },
    {
      icon: <TrendingUp className="h-4 w-4 text-green-500" />,
      tip: "Weekend applications get faster responses",
      priority: "low"
    }
  ];

  const applicationPipeline = [
    { status: 'Applied', count: 12, color: 'bg-blue-500' },
    { status: 'Shortlisted', count: 4, color: 'bg-yellow-500' },
    { status: 'Interviewed', count: 2, color: 'bg-purple-500' },
    { status: 'Offered', count: 1, color: 'bg-green-500' }
  ];

  return (
    <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-primary to-secondary rounded-xl flex items-center justify-center">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Quick Apply Dashboard</h3>
              <p className="text-sm text-muted-foreground">Lightning-fast job applications with AI assistance</p>
            </div>
          </div>
          
          <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
            <Sparkles className="h-3 w-3 mr-1" />
            {quickApplyStreak} Day Streak
          </Badge>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4 bg-white/50 backdrop-blur-sm border-0">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary mb-1">
                {quickApplyStats.todayApplications}
              </div>
              <div className="text-xs text-muted-foreground">Today</div>
              <Progress 
                value={(quickApplyStats.todayApplications / quickApplyStats.weeklyGoal) * 100} 
                className="h-1 mt-2" 
              />
            </div>
          </Card>
          
          <Card className="p-4 bg-white/50 backdrop-blur-sm border-0">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {quickApplyStats.successRate}
              </div>
              <div className="text-xs text-muted-foreground">Success Rate</div>
              <div className="flex items-center justify-center mt-2">
                <TrendingUp className="h-3 w-3 text-green-500" />
                <span className="text-xs text-green-600 ml-1">+12%</span>
              </div>
            </div>
          </Card>
          
          <Card className="p-4 bg-white/50 backdrop-blur-sm border-0">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {quickApplyStats.averageResponseTime}
              </div>
              <div className="text-xs text-muted-foreground">Avg Response</div>
              <div className="flex items-center justify-center mt-2">
                <Clock className="h-3 w-3 text-blue-500" />
              </div>
            </div>
          </Card>
          
          <Card className="p-4 bg-white/50 backdrop-blur-sm border-0">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 mb-1">
                {quickApplyStats.weeklyGoal}
              </div>
              <div className="text-xs text-muted-foreground">Weekly Goal</div>
              <div className="flex items-center justify-center mt-2">
                <Target className="h-3 w-3 text-purple-500" />
              </div>
            </div>
          </Card>
        </div>

        {/* Application Pipeline */}
        <div className="mb-6">
          <h4 className="font-semibold text-gray-900 mb-3">Application Pipeline</h4>
          <div className="grid grid-cols-4 gap-3">
            {applicationPipeline.map((stage, index) => (
              <div key={stage.status} className="text-center">
                <div className={`w-full h-2 ${stage.color} rounded-full mb-2`} />
                <div className="text-lg font-bold text-gray-900">{stage.count}</div>
                <div className="text-xs text-muted-foreground">{stage.status}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Apply Tips */}
        <div className="mb-6">
          <h4 className="font-semibold text-gray-900 mb-3">Smart Application Tips</h4>
          <div className="space-y-2">
            {quickApplyTips.map((tip, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-white/50 rounded-lg">
                {tip.icon}
                <div className="flex-1">
                  <p className="text-sm text-gray-700">{tip.tip}</p>
                </div>
                <Badge 
                  variant="outline" 
                  className={`text-xs ${
                    tip.priority === 'high' ? 'border-red-200 text-red-700' :
                    tip.priority === 'medium' ? 'border-yellow-200 text-yellow-700' :
                    'border-green-200 text-green-700'
                  }`}
                >
                  {tip.priority}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button className="flex-1 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90">
            <Zap className="h-4 w-4 mr-2" />
            Find Quick Apply Jobs
          </Button>
          
          <Button variant="outline">
            <Award className="h-4 w-4 mr-2" />
            View Applications
          </Button>
        </div>

        {/* Achievement Banner */}
        <Card className="mt-4 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
          <div className="p-4 flex items-center gap-3">
            <Star className="h-8 w-8 text-purple-500" />
            <div className="flex-1">
              <h5 className="font-semibold text-purple-900">Quick Apply Champion!</h5>
              <p className="text-sm text-purple-700">
                You're in the top 10% of applicants for response speed. Keep it up!
              </p>
            </div>
            <Badge className="bg-purple-500 text-white">
              Top 10%
            </Badge>
          </div>
        </Card>
      </div>
    </Card>
  );
};