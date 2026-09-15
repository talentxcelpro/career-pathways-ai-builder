import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  Target, 
  Award, 
  Users, 
  Brain, 
  Briefcase,
  CheckCircle,
  Clock,
  BarChart3,
  Star,
  Calendar,
  Zap
} from 'lucide-react';
import { useCareerPassport } from '@/hooks/useCareerPassport';
import { useAuth } from '@/contexts/AuthContext';

const ComprehensiveCareerDashboard: React.FC = () => {
  const { user } = useAuth();
  const { careerPassport, achievements, getCompletionBreakdown, getNextMilestone } = useCareerPassport();
  const [activeGoals, setActiveGoals] = useState(3);
  const [weeklyProgress, setWeeklyProgress] = useState(75);

  const completionData = getCompletionBreakdown();
  const nextMilestone = getNextMilestone();

  // Mock data for comprehensive dashboard
  const skillsProgress = [
    { name: 'AI & Machine Learning', current: 85, target: 90, trending: 'up' },
    { name: 'Leadership', current: 70, target: 85, trending: 'up' },
    { name: 'Data Analysis', current: 92, target: 95, trending: 'stable' },
    { name: 'Public Speaking', current: 60, target: 80, trending: 'up' }
  ];

  const careerMetrics = {
    marketCompetitiveness: careerPassport?.market_competitiveness_score || 85,
    careerReadiness: careerPassport?.career_readiness_score || 78,
    networkGrowth: 23,
    skillDevelopment: 67
  };

  const recentAchievements = [
    { title: 'LinkedIn Profile Optimized', date: '2 days ago', points: 50 },
    { title: 'Technical Interview Passed', date: '1 week ago', points: 100 },
    { title: 'New Certification Earned', date: '2 weeks ago', points: 150 }
  ];

  const upcomingMilestones = [
    { title: 'Complete React Advanced Course', deadline: '3 days', priority: 'high' },
    { title: 'Attend Tech Conference', deadline: '1 week', priority: 'medium' },
    { title: 'Update Portfolio Projects', deadline: '2 weeks', priority: 'medium' },
    { title: 'Schedule Mentor Meeting', deadline: '5 days', priority: 'low' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Career Dashboard</h1>
          <p className="text-muted-foreground">Your comprehensive career development overview</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="default" className="gap-1">
            <Star className="h-3 w-3" />
            Pro Member
          </Badge>
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4 mr-1" />
            Schedule Review
          </Button>
        </div>
      </div>

      {/* Key Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Career Readiness</p>
                <p className="text-2xl font-bold">{careerMetrics.careerReadiness}%</p>
              </div>
              <div className="p-2 bg-primary/10 rounded-lg">
                <Target className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div className="mt-2">
              <Progress value={careerMetrics.careerReadiness} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Market Competitiveness</p>
                <p className="text-2xl font-bold">{careerMetrics.marketCompetitiveness}%</p>
              </div>
              <div className="p-2 bg-primary/10 rounded-lg">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div className="mt-2">
              <Progress value={careerMetrics.marketCompetitiveness} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Goals</p>
                <p className="text-2xl font-bold">{activeGoals}</p>
              </div>
              <div className="p-2 bg-primary/10 rounded-lg">
                <Briefcase className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div className="mt-2">
              <Badge variant="outline" size="sm">On Track</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Weekly Progress</p>
                <p className="text-2xl font-bold">{weeklyProgress}%</p>
              </div>
              <div className="p-2 bg-primary/10 rounded-lg">
                <Zap className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div className="mt-2">
              <Progress value={weeklyProgress} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard Content */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="skills">Skills</TabsTrigger>
          <TabsTrigger value="goals">Goals</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Progress Overview */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Career Progress Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {skillsProgress.map((skill, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{skill.name}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">
                              {skill.current}% / {skill.target}%
                            </span>
                            <TrendingUp className={`h-4 w-4 ${
                              skill.trending === 'up' ? 'text-green-500' : 'text-gray-400'
                            }`} />
                          </div>
                        </div>
                        <Progress value={skill.current} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full gap-2" variant="default">
                    <Brain className="h-4 w-4" />
                    Start AI Interview
                  </Button>
                  <Button className="w-full gap-2" variant="outline">
                    <Users className="h-4 w-4" />
                    Network Analysis
                  </Button>
                  <Button className="w-full gap-2" variant="outline">
                    <BarChart3 className="h-4 w-4" />
                    Skill Assessment
                  </Button>
                  <Button className="w-full gap-2" variant="outline">
                    <Target className="h-4 w-4" />
                    Set New Goal
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Achievements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Recent Achievements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentAchievements.map((achievement, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{achievement.title}</p>
                        <p className="text-sm text-muted-foreground">{achievement.date}</p>
                      </div>
                      <Badge variant="secondary">+{achievement.points} pts</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Milestones */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Upcoming Milestones
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {upcomingMilestones.map((milestone, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{milestone.title}</p>
                        <p className="text-sm text-muted-foreground">Due in {milestone.deadline}</p>
                      </div>
                      <Badge variant={
                        milestone.priority === 'high' ? 'destructive' :
                        milestone.priority === 'medium' ? 'default' : 'secondary'
                      }>
                        {milestone.priority}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="skills" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Skills Development Dashboard</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Comprehensive skills tracking and development recommendations coming soon.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="goals" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Goal Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Advanced goal setting and tracking system coming soon.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Achievement Gallery</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Complete achievement system with badges and rewards coming soon.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>AI-Powered Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Advanced career analytics and personalized insights coming soon.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ComprehensiveCareerDashboard;