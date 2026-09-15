import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp, Users, Clock, Award, BookOpen } from 'lucide-react';
import { useEnhancedLearningManagement } from '@/hooks/useEnhancedLearningManagement';
import { Progress } from "@/components/ui/progress";

export const LearningAnalytics: React.FC = () => {
  const { learningStats, isLoading } = useEnhancedLearningManagement();

  if (isLoading) {
    return <div className="animate-pulse space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 bg-muted rounded-lg"></div>
        ))}
      </div>
    </div>;
  }

  const analytics = [
    {
      title: "Completion Rate",
      value: `${learningStats?.completionRate || 0}%`,
      description: "Average course completion",
      icon: TrendingUp,
      color: "text-green-600",
      change: "+5.2% from last month"
    },
    {
      title: "Active Learners",
      value: learningStats?.totalEnrollments || 0,
      description: "Currently enrolled",
      icon: Users,
      color: "text-blue-600",
      change: `+${learningStats?.weeklyEnrollments || 0} this week`
    },
    {
      title: "Learning Progress",
      value: `${learningStats?.averageProgress || 0}%`,
      description: "Average progress",
      icon: Clock,
      color: "text-purple-600",
      change: "Across all courses"
    },
    {
      title: "Engagement Score",
      value: `${Math.round(learningStats?.engagementScore || 0)}%`,
      description: "Platform engagement",
      icon: BarChart3,
      color: "text-orange-600",
      change: "Based on activity"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Learning Analytics</h2>
          <p className="text-muted-foreground">Track performance and engagement metrics</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {analytics.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardHeader>
                <Icon className={`h-8 w-8 ${stat.color} mb-2`} />
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
                <p className="text-xs text-green-600 mt-1">{stat.change}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
            <CardDescription>Key learning indicators</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Course Completion Rate</span>
                <span>{learningStats?.completionRate || 0}%</span>
              </div>
              <Progress value={learningStats?.completionRate || 0} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>User Engagement</span>
                <span>{Math.round(learningStats?.engagementScore || 0)}%</span>
              </div>
              <Progress value={learningStats?.engagementScore || 0} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Content Quality Score</span>
                <span>92%</span>
              </div>
              <Progress value={92} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Learning Activity</CardTitle>
            <CardDescription>Recent platform activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {learningStats?.recentActivity?.slice(0, 5).map((activity: any, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <div className="flex-1 text-sm">
                    <span className="font-medium">{activity.profiles?.full_name || 'User'}</span>
                    <span className="text-muted-foreground"> enrolled in </span>
                    <span className="font-medium">{activity.courses?.title || 'Course'}</span>
                  </div>
                </div>
              )) || (
                <div className="text-sm text-muted-foreground">No recent activity</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Analytics</CardTitle>
            <CardDescription>Financial performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-2xl font-bold">₹{learningStats?.totalRevenue?.toLocaleString() || 0}</div>
                <div className="text-sm text-muted-foreground">Total Revenue</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold">{learningStats?.activeCourses || 0}</div>
                <div className="text-sm text-muted-foreground">Active Courses</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Learning Paths</CardTitle>
            <CardDescription>Structured learning</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{learningStats?.totalPaths || 0}</div>
                <div className="text-sm text-muted-foreground">Total Paths</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold">{learningStats?.weeklyEnrollments || 0}</div>
                <div className="text-sm text-muted-foreground">Weekly Enrollments</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Assessments</CardTitle>
            <CardDescription>Knowledge validation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{learningStats?.totalAssessments || 0}</div>
                <div className="text-sm text-muted-foreground">Total Assessments</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold">{learningStats?.certificatesIssued || 0}</div>
                <div className="text-sm text-muted-foreground">Certificates Issued</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};