import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Target, 
  Calendar, 
  TrendingUp, 
  AlertCircle,
  BookOpen,
  Clock,
  Trophy,
  Lightbulb,
  CheckCircle,
  ArrowRight,
  Bell,
  BarChart3
} from 'lucide-react';

interface PersonalizedDashboardProps {
  userData: {
    name: string;
    currentStreak: number;
    weeklyGoal: { target: number; current: number };
    dailyGoal: { target: number; current: number };
    skillGaps: Array<{
      skill: string;
      currentLevel: number;
      targetLevel: number;
      priority: 'high' | 'medium' | 'low';
    }>;
    upcomingDeadlines: Array<{
      title: string;
      dueDate: Date;
      type: 'assignment' | 'course' | 'certification';
    }>;
    recommendations: Array<{
      title: string;
      reason: string;
      type: 'course' | 'skill' | 'practice';
      duration: string;
    }>;
    recentActivity: Array<{
      action: string;
      item: string;
      timestamp: Date;
      progress?: number;
    }>;
  };
}

export const PersonalizedDashboard: React.FC<PersonalizedDashboardProps> = ({ userData }) => {
  const [reminderSettings, setReminderSettings] = useState({
    daily: true,
    weekly: true,
    deadlines: true,
  });

  const weeklyProgress = (userData.weeklyGoal.current / userData.weeklyGoal.target) * 100;
  const dailyProgress = (userData.dailyGoal.current / userData.dailyGoal.target) * 100;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-background">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Welcome back, {userData.name}!</h2>
              <p className="text-muted-foreground mt-1">
                You're on a {userData.currentStreak}-day learning streak 🔥
              </p>
            </div>
            <div className="text-right">
              <Button>
                <BookOpen className="h-4 w-4 mr-2" />
                Continue Learning
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="goals" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="goals">Goals & Progress</TabsTrigger>
          <TabsTrigger value="skills">Skill Gaps</TabsTrigger>
          <TabsTrigger value="recommendations">AI Recommendations</TabsTrigger>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="goals" className="space-y-6">
          {/* Learning Goals */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  Daily Goal
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span>Learning Time</span>
                    <span>{userData.dailyGoal.current} / {userData.dailyGoal.target} hours</span>
                  </div>
                  <Progress value={dailyProgress} className="h-3" />
                  {dailyProgress >= 100 && (
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Goal Achieved!
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-500" />
                  Weekly Goal
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span>Learning Time</span>
                    <span>{userData.weeklyGoal.current} / {userData.weeklyGoal.target} hours</span>
                  </div>
                  <Progress value={weeklyProgress} className="h-3" />
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      {Math.max(0, userData.weeklyGoal.target - userData.weeklyGoal.current)} hours to go
                    </span>
                    <Button variant="outline" size="sm">
                      <Bell className="h-3 w-3 mr-1" />
                      Set Reminder
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Upcoming Deadlines */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-orange-500" />
                Upcoming Deadlines
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {userData.upcomingDeadlines.map((deadline, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">
                        {deadline.type}
                      </Badge>
                      <div>
                        <div className="font-medium">{deadline.title}</div>
                        <div className="text-sm text-muted-foreground">
                          Due {deadline.dueDate.toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <Button size="sm" variant="ghost">
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="skills" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-purple-500" />
                Skill Gap Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {userData.skillGaps.map((gap, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{gap.skill}</h3>
                        <Badge className={getPriorityColor(gap.priority)}>
                          {gap.priority} priority
                        </Badge>
                      </div>
                      <Button size="sm" variant="outline">
                        Improve Skill
                      </Button>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Current Level</span>
                        <span>Level {gap.currentLevel} → {gap.targetLevel}</span>
                      </div>
                      <Progress 
                        value={(gap.currentLevel / gap.targetLevel) * 100} 
                        className="h-2" 
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-yellow-500" />
                AI-Powered Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {userData.recommendations.map((rec, index) => (
                  <div key={index} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline">{rec.type}</Badge>
                          <span className="text-sm text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {rec.duration}
                          </span>
                        </div>
                        <h3 className="font-medium mb-1">{rec.title}</h3>
                        <p className="text-sm text-muted-foreground">{rec.reason}</p>
                      </div>
                      <Button size="sm">
                        Start Now
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-green-500" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {userData.recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{activity.action}</div>
                      <div className="text-sm text-muted-foreground">{activity.item}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">
                        {formatTimeAgo(activity.timestamp)}
                      </div>
                      {activity.progress && (
                        <div className="text-sm font-medium text-primary">
                          {activity.progress}% complete
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};