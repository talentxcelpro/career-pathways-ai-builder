import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useEnhancedLearningManagement } from '@/hooks/useEnhancedLearningManagement';
import { 
  BookOpen, 
  Target, 
  Users, 
  Award,
  TrendingUp,
  DollarSign,
  Play,
  FileCheck
} from 'lucide-react';
import { Progress } from "@/components/ui/progress";

export const LearningDashboard: React.FC = () => {
  const { learningStats, isLoading } = useEnhancedLearningManagement();

  if (isLoading) {
    return <div className="animate-pulse space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="h-32 bg-muted rounded-lg"></div>
        ))}
      </div>
    </div>;
  }

  const stats = [
    {
      title: "Total Courses",
      value: learningStats?.totalCourses || 0,
      description: `${learningStats?.activeCourses || 0} active`,
      icon: BookOpen,
      color: "text-blue-600"
    },
    {
      title: "Learning Paths",
      value: learningStats?.totalPaths || 0,
      description: "Structured pathways",
      icon: Target,
      color: "text-green-600"
    },
    {
      title: "Total Enrollments",
      value: learningStats?.totalEnrollments || 0,
      description: "Active learners",
      icon: Users,
      color: "text-purple-600"
    },
    {
      title: "Certificates Issued",
      value: learningStats?.certificatesIssued || 0,
      description: "Completed achievements",
      icon: Award,
      color: "text-yellow-600"
    },
    {
      title: "Total Revenue",
      value: `₹${learningStats?.totalRevenue?.toLocaleString() || 0}`,
      description: "From paid courses",
      icon: DollarSign,
      color: "text-green-600"
    },
    {
      title: "Video Content",
      value: learningStats?.totalLessons || 0,
      description: "Lessons available",
      icon: Play,
      color: "text-red-600"
    },
    {
      title: "Assessments",
      value: learningStats?.totalAssessments || 0,
      description: "Quizzes & tests",
      icon: FileCheck,
      color: "text-indigo-600"
    },
    {
      title: "Categories",
      value: learningStats?.categories?.length || 0,
      description: "Course categories",
      icon: TrendingUp,
      color: "text-orange-600"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Progress Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Platform Health</CardTitle>
            <CardDescription>Key performance indicators</CardDescription>
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
                <span>Average Progress</span>
                <span>{learningStats?.averageProgress || 0}%</span>
              </div>
              <Progress value={learningStats?.averageProgress || 0} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest platform events</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {learningStats?.recentActivity?.slice(0, 5).map((activity: any, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <div className="flex-1 text-sm">
                    <span className="font-medium">{activity.profiles?.full_name}</span>
                    <span className="text-muted-foreground"> enrolled in </span>
                    <span className="font-medium">{activity.courses?.title}</span>
                  </div>
                </div>
              )) || (
                <div className="text-sm text-muted-foreground">No recent activity</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common management tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="p-4 bg-primary/10 hover:bg-primary/20 rounded-lg text-center transition-colors">
              <BookOpen className="h-6 w-6 mx-auto mb-2 text-primary" />
              <span className="text-sm font-medium">Create Course</span>
            </button>
            <button className="p-4 bg-green-100 hover:bg-green-200 rounded-lg text-center transition-colors">
              <Target className="h-6 w-6 mx-auto mb-2 text-green-600" />
              <span className="text-sm font-medium">New Path</span>
            </button>
            <button className="p-4 bg-purple-100 hover:bg-purple-200 rounded-lg text-center transition-colors">
              <Users className="h-6 w-6 mx-auto mb-2 text-purple-600" />
              <span className="text-sm font-medium">Bulk Enroll</span>
            </button>
            <button className="p-4 bg-orange-100 hover:bg-orange-200 rounded-lg text-center transition-colors">
              <Award className="h-6 w-6 mx-auto mb-2 text-orange-600" />
              <span className="text-sm font-medium">Issue Certificate</span>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};