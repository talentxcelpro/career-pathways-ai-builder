import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, Briefcase, TrendingUp, Target, Users, Award } from 'lucide-react';
import { JobFocusedCourses } from './JobFocusedCourses';
import { SkillMarketTrends } from './SkillMarketTrends';
import { useLearningJobIntegration } from '@/hooks/useLearningJobIntegration';
import { AnalyticsView } from './AnalyticsView';

export const LearningEmploymentBridge: React.FC = () => {
  const [activeTab, setActiveTab] = useState('courses');
  const { userProgress, isLoading } = useLearningJobIntegration();

  // Calculate user stats
  const completedCourses = userProgress.filter(p => p.completion_date).length;
  const inProgressCourses = userProgress.filter(p => !p.completion_date && p.progress_percentage > 0).length;
  const certificatesEarned = userProgress.filter(p => p.certificate_earned).length;
  const totalSkillsAcquired = [...new Set(userProgress.flatMap(p => p.skills_acquired))].length;

  const stats = [
    {
      title: 'Courses Completed',
      value: completedCourses,
      icon: BookOpen,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'In Progress',
      value: inProgressCourses,
      icon: Target,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Certificates',
      value: certificatesEarned,
      icon: Award,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      title: 'Skills Acquired',
      value: totalSkillsAcquired,
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">
          Learning-to-Employment Bridge
        </h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Discover job-focused courses aligned with market demands, track your skill development, 
          and bridge the gap between learning and employment opportunities.
        </p>
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
        <TabsList className="grid w-full grid-cols-4 max-w-2xl mx-auto">
          <TabsTrigger value="courses" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Courses
          </TabsTrigger>
          <TabsTrigger value="trends" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Trends
          </TabsTrigger>
          <TabsTrigger value="progress" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Progress
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="courses" className="space-y-6">
          <JobFocusedCourses />
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <SkillMarketTrends />
        </TabsContent>

        <TabsContent value="progress" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Current Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-600" />
                  Current Learning Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {userProgress.filter(p => !p.completion_date).map((progress) => (
                  <div key={progress.id} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">Course #{progress.course_id.slice(-8)}</h4>
                      <Badge variant="outline">
                        {progress.progress_percentage}%
                      </Badge>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progress.progress_percentage}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>{progress.lessons_completed}/{progress.total_lessons} lessons</span>
                      <span>{progress.time_spent_hours}h spent</span>
                    </div>
                  </div>
                ))}
                {userProgress.filter(p => !p.completion_date).length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No courses in progress</p>
                    <Button 
                      variant="outline" 
                      className="mt-2"
                      onClick={() => setActiveTab('courses')}
                    >
                      Browse Courses
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Completed Courses */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-green-600" />
                  Completed Courses
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {userProgress.filter(p => p.completion_date).map((progress) => (
                  <div key={progress.id} className="border rounded-lg p-4 space-y-2">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">Course #{progress.course_id.slice(-8)}</h4>
                      <div className="flex gap-2">
                        {progress.certificate_earned && (
                          <Badge variant="default" className="bg-green-600">
                            <Award className="h-3 w-3 mr-1" />
                            Certified
                          </Badge>
                        )}
                        <Badge variant="outline">
                          Score: {progress.performance_score}%
                        </Badge>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">
                      Completed: {new Date(progress.completion_date!).toLocaleDateString()}
                    </p>
                    {progress.skills_acquired.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {progress.skills_acquired.map((skill, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                {userProgress.filter(p => p.completion_date).length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Award className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No completed courses yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <AnalyticsView />
        </TabsContent>
      </Tabs>
    </div>
  );
};