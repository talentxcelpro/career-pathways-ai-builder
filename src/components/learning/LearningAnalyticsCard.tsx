import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Clock, TrendingUp, Award, Target, Brain, Calendar } from 'lucide-react';
import { useUserLearningStats } from '@/hooks/useLearningAnalytics';

interface LearningAnalyticsCardProps {
  userId?: string;
}

export const LearningAnalyticsCard: React.FC<LearningAnalyticsCardProps> = ({ userId }) => {
  const { data: stats, isLoading } = useUserLearningStats(userId);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            <div className="space-y-2">
              <div className="h-3 bg-gray-200 rounded"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stats) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Start learning to see your analytics</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${remainingMinutes}m`;
    }
    return `${remainingMinutes}m`;
  };

  const completionRate = stats.totalCourses > 0 
    ? (stats.coursesCompleted / stats.totalCourses) * 100 
    : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Learning Overview */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            Learning Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Total Time</span>
              <Badge variant="secondary">{formatTime(stats.totalTimeSpent)}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Lessons Completed</span>
              <Badge variant="secondary">{stats.totalLessonsCompleted}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Courses Enrolled</span>
              <Badge variant="secondary">{stats.totalCourses}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Course Progress */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Target className="h-5 w-5 text-green-600" />
            Course Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-muted-foreground">Completion Rate</span>
                <span className="text-sm font-medium">{Math.round(completionRate)}%</span>
              </div>
              <Progress value={completionRate} className="h-2" />
            </div>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-600">{stats.coursesCompleted}</div>
                <div className="text-xs text-muted-foreground">Completed</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">{stats.coursesInProgress}</div>
                <div className="text-xs text-muted-foreground">In Progress</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Engagement Score */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Award className="h-5 w-5 text-purple-600" />
            Engagement
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {Math.round(stats.averageEngagementScore)}/100
            </div>
            <div className="text-sm text-muted-foreground mb-3">Engagement Score</div>
            <Progress value={stats.averageEngagementScore} className="h-2" />
          </div>
          <div className="text-xs text-muted-foreground text-center">
            Based on course interaction and completion patterns
          </div>
        </CardContent>
      </Card>

      {/* Weekly Activity */}
      <Card className="md:col-span-2 lg:col-span-3">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5 text-orange-600" />
            Learning Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Recent Activity</h4>
              <div className="space-y-1">
                {stats.rawData.slice(0, 3).map((record, index) => (
                  <div key={index} className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Course {index + 1}</span>
                    <span>{Math.round(record.completion_rate)}% complete</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Time Investment</h4>
              <div className="text-2xl font-bold text-blue-600">
                {formatTime(stats.totalTimeSpent)}
              </div>
              <div className="text-xs text-muted-foreground">
                Average: {stats.totalCourses > 0 
                  ? formatTime(Math.round(stats.totalTimeSpent / stats.totalCourses))
                  : '0m'} per course
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Learning Consistency</h4>
              <div className="flex items-center gap-2">
                <div className="text-2xl font-bold text-green-600">
                  {stats.coursesCompleted}
                </div>
                <div className="text-xs text-muted-foreground">
                  courses completed
                </div>
              </div>
              <div className="text-xs text-muted-foreground">
                Keep up the great work!
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};