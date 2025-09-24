import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, Briefcase, TrendingUp, Target, Users, Award, GraduationCap, Play } from 'lucide-react';
import { EmploymentBridgeModules } from './EmploymentBridgeModules';
import { EmploymentBridgeCertificate } from './EmploymentBridgeCertificate';
import { useLearningProgress } from '@/hooks/useLearningProgress';

export const LearningEmploymentBridge: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const { progress, isLoading } = useLearningProgress();

  // Calculate user stats for Employment Bridge modules
  const employmentBridgeProgress = progress.filter(p => 
    ['career-readiness', 'soft-skills', 'interview-prep', 'job-search', 'workplace-adaptation'].includes(p.course_id)
  );
  
  const completedModules = employmentBridgeProgress.filter(p => p.progress_percentage === 100).length;
  const inProgressModules = employmentBridgeProgress.filter(p => p.progress_percentage > 0 && p.progress_percentage < 100).length;
  const totalTimeSpent = employmentBridgeProgress.reduce((acc, p) => acc + (p.completed_lessons * 0.5), 0); // Estimate 30min per lesson
  const averageScore = employmentBridgeProgress.length > 0 
    ? Math.round(employmentBridgeProgress.reduce((acc, p) => acc + (p.progress_percentage || 0), 0) / employmentBridgeProgress.length)
    : 0;

  const stats = [
    {
      title: 'Modules Completed',
      value: `${completedModules}/5`,
      icon: BookOpen,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'In Progress',
      value: inProgressModules,
      icon: Target,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Time Invested',
      value: `${Math.round(totalTimeSpent)}h`,
      icon: Play,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      title: 'Average Score',
      value: `${averageScore}%`,
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">
          Employment Bridge Certification Program
        </h1>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          Master essential career skills through our comprehensive 5-module program. From resume building to workplace adaptation, 
          get job-ready with hands-on learning, assessments, and earn your official certification.
        </p>
        <div className="flex justify-center gap-4 mt-6">
          <Badge variant="secondary" className="text-sm">
            5 Core Modules
          </Badge>
          <Badge variant="secondary" className="text-sm">
            15-20 Hours
          </Badge>
          <Badge variant="secondary" className="text-sm">
            Official Certificate
          </Badge>
          <Badge variant="secondary" className="text-sm">
            Career Ready
          </Badge>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <Card key={index} className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-full ${stat.bgColor}`}>
                    <IconComponent className={`h-6 w-6 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 max-w-xl mx-auto">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Program Overview
          </TabsTrigger>
          <TabsTrigger value="modules" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Learning Modules
          </TabsTrigger>
          <TabsTrigger value="certificate" className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4" />
            Certification
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Program Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-primary" />
                  What You'll Learn
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="p-1 rounded-full bg-green-100 mt-1">
                      <Award className="h-3 w-3 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">Career Readiness</h4>
                      <p className="text-sm text-muted-foreground">Master resume writing, cover letters, and LinkedIn optimization</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="p-1 rounded-full bg-blue-100 mt-1">
                      <Users className="h-3 w-3 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">Essential Soft Skills</h4>
                      <p className="text-sm text-muted-foreground">Develop communication, teamwork, and leadership abilities</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="p-1 rounded-full bg-purple-100 mt-1">
                      <Target className="h-3 w-3 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">Interview Excellence</h4>
                      <p className="text-sm text-muted-foreground">Ace interviews with proven strategies and mock sessions</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="p-1 rounded-full bg-orange-100 mt-1">
                      <TrendingUp className="h-3 w-3 text-orange-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">Job Search Mastery</h4>
                      <p className="text-sm text-muted-foreground">Learn networking, applications, and negotiation skills</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Program Structure */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  Program Structure
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="p-3 rounded-lg bg-muted/50">
                    <div className="text-2xl font-bold text-primary">5</div>
                    <div className="text-sm text-muted-foreground">Core Modules</div>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <div className="text-2xl font-bold text-primary">30+</div>
                    <div className="text-sm text-muted-foreground">Video Lessons</div>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <div className="text-2xl font-bold text-primary">15-20</div>
                    <div className="text-sm text-muted-foreground">Hours Total</div>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <div className="text-2xl font-bold text-primary">100%</div>
                    <div className="text-sm text-muted-foreground">Job Focused</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Learning Format:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Interactive video lessons (5-10 min each)</li>
                    <li>• Downloadable workbooks and templates</li>
                    <li>• Hands-on assignments and projects</li>
                    <li>• Knowledge assessments and quizzes</li>
                    <li>• Real-world case studies and examples</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Start */}
          <Card>
            <CardHeader>
              <CardTitle>Ready to Get Started?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div>
                  <p className="text-muted-foreground">
                    Join thousands of learners who have successfully transitioned to their dream careers through our comprehensive program.
                  </p>
                </div>
                <Button 
                  size="lg" 
                  onClick={() => setActiveTab('modules')}
                  className="flex items-center gap-2"
                >
                  <Play className="h-4 w-4" />
                  Start Learning Now
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="modules" className="space-y-6">
          <EmploymentBridgeModules />
        </TabsContent>

        <TabsContent value="certificate" className="space-y-6">
          <EmploymentBridgeCertificate />
        </TabsContent>
      </Tabs>
    </div>
  );
};