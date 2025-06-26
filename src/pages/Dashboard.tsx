
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from 'react-router-dom';
import { useQuery } from "@tanstack/react-query";
import { 
  TrendingUp, Users, Star, Bell, Target, Map, Brain, Zap, 
  Briefcase, GraduationCap, FileText, Calendar, MessageSquare,
  BarChart3, Award, Clock, ArrowRight
} from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  // Fetch dashboard stats
  const { data: dashboardStats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const [
        { count: appliedJobs },
        { count: savedJobs },
        { count: courseProgress },
        { count: networkConnections },
        { data: recentApplications }
      ] = await Promise.all([
        supabase.from('job_applications').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('saved_jobs').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('user_courses').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('connections').select('*', { count: 'exact', head: true }).or(`requester_id.eq.${user.id},recipient_id.eq.${user.id}`).eq('status', 'accepted'),
        supabase.from('job_applications').select(`
          *,
          jobs (title, companies (name))
        `).eq('user_id', user.id).order('applied_at', { ascending: false }).limit(5)
      ]);

      return {
        appliedJobs: appliedJobs || 0,
        savedJobs: savedJobs || 0,
        courseProgress: courseProgress || 0,
        networkConnections: networkConnections || 0,
        recentApplications: recentApplications || []
      };
    },
    enabled: !!user
  });

  // Fetch featured content
  const { data: featuredJobs = [] } = useQuery({
    queryKey: ['featured-jobs-dashboard'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('jobs')
        .select(`
          *,
          companies (name, logo_url)
        `)
        .eq('is_featured', true)
        .eq('is_active', true)
        .limit(4);
      
      if (error) throw error;
      return data;
    }
  });

  const { data: recommendedCourses = [] } = useQuery({
    queryKey: ['recommended-courses-dashboard'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('is_active', true)
        .order('rating', { ascending: false })
        .limit(3);
      
      if (error) throw error;
      return data;
    }
  });

  const quickActions = [
    {
      title: "AI Job Matcher",
      description: "Find personalized job matches",
      icon: Brain,
      path: "/jobs/recommendations",
      color: "from-blue-500 to-purple-500",
      featured: true
    },
    {
      title: "Resume Builder",
      description: "Create or update your resume",
      icon: FileText,
      path: "/tools/resume-check",
      color: "from-green-500 to-teal-500"
    },
    {
      title: "Career Roadmap",
      description: "Plan your career journey",
      icon: Map,
      path: "/career-map",
      color: "from-orange-500 to-red-500"
    },
    {
      title: "Skill Assessment",
      description: "Evaluate your skills",
      icon: Award,
      path: "/tools/profile-score",
      color: "from-purple-500 to-pink-500"
    },
    {
      title: "Network Builder",
      description: "Expand your connections",
      icon: Users,
      path: "/network/people",
      color: "from-indigo-500 to-blue-500"
    },
    {
      title: "Interview Prep",
      description: "Practice with AI",
      icon: MessageSquare,
      path: "/tools/interview-prep",
      color: "from-yellow-500 to-orange-500"
    }
  ];

  const upcomingTasks = [
    { task: "Complete React Advanced Course", deadline: "2 days", priority: "high" },
    { task: "Follow up on TechCorp application", deadline: "3 days", priority: "medium" },
    { task: "Update LinkedIn profile", deadline: "1 week", priority: "low" },
    { task: "Schedule mock interview", deadline: "5 days", priority: "high" }
  ];

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please sign in to access your dashboard</h2>
          <Button onClick={() => navigate('/auth/login')}>Sign In</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Welcome back, {user.user_metadata?.full_name || user.email?.split('@')[0]}!
            </h1>
            <p className="text-blue-100 text-lg">Ready to accelerate your career today?</p>
          </div>
          <div className="text-right">
            <Button variant="secondary" onClick={() => navigate('/career-map')}>
              <Map className="h-4 w-4 mr-2" />
              Career Map
            </Button>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 font-medium">Applications</p>
                <p className="text-3xl font-bold text-blue-800">{dashboardStats?.appliedJobs || 0}</p>
                <p className="text-blue-600 text-sm">Jobs applied to</p>
              </div>
              <Briefcase className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 font-medium">Saved Jobs</p>
                <p className="text-3xl font-bold text-green-800">{dashboardStats?.savedJobs || 0}</p>
                <p className="text-green-600 text-sm">In your watchlist</p>
              </div>
              <Star className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 font-medium">Learning</p>
                <p className="text-3xl font-bold text-purple-800">{dashboardStats?.courseProgress || 0}</p>
                <p className="text-purple-600 text-sm">Courses enrolled</p>
              </div>
              <GraduationCap className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-600 font-medium">Network</p>
                <p className="text-3xl font-bold text-orange-800">{dashboardStats?.networkConnections || 0}</p>
                <p className="text-orange-600 text-sm">Connections</p>
              </div>
              <Users className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Zap className="h-5 w-5 mr-2 text-yellow-500" />
            Quick Actions
          </CardTitle>
          <CardDescription>Fast-track your career growth with AI-powered tools</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {quickActions.map((action, index) => (
              <Card 
                key={index} 
                className={`cursor-pointer hover:shadow-lg transition-all duration-200 ${action.featured ? 'ring-2 ring-blue-500' : ''}`}
                onClick={() => navigate(action.path)}
              >
                <CardContent className="p-4">
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${action.color} flex items-center justify-center mb-3`}>
                    <action.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold mb-1">{action.title}</h3>
                  <p className="text-sm text-gray-600">{action.description}</p>
                  {action.featured && (
                    <Badge className="mt-2 bg-blue-100 text-blue-700">Recommended</Badge>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Featured Jobs */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center">
                  <Star className="h-5 w-5 mr-2 text-yellow-500" />
                  Featured Jobs
                </CardTitle>
                <CardDescription>Hand-picked opportunities for you</CardDescription>
              </div>
              <Button variant="outline" onClick={() => navigate('/jobs')}>
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {featuredJobs.slice(0, 3).map((job: any) => (
                <div key={job.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate(`/jobs/${job.id}`)}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">{job.title}</h3>
                      <p className="text-gray-600 text-sm">{job.companies?.name}</p>
                      <p className="text-gray-500 text-sm">{job.location}</p>
                      {job.salary_min && job.salary_max && (
                        <p className="text-green-600 font-medium text-sm mt-1">
                          ${job.salary_min.toLocaleString()} - ${job.salary_max.toLocaleString()}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      <Badge variant="secondary">{job.employment_type}</Badge>
                      <Button size="sm" onClick={(e) => { e.stopPropagation(); navigate(`/jobs/${job.id}/smart-apply`); }}>
                        Quick Apply
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Tasks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-blue-500" />
              Upcoming Tasks
            </CardTitle>
            <CardDescription>Stay on track with your goals</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingTasks.map((task, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{task.task}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="h-3 w-3 text-gray-500" />
                        <span className="text-xs text-gray-500">{task.deadline}</span>
                        <Badge 
                          variant={task.priority === 'high' ? 'destructive' : task.priority === 'medium' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {task.priority}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4">
              <Target className="h-4 w-4 mr-2" />
              View All Tasks
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity & Learning */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Applications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-green-500" />
              Recent Applications
            </CardTitle>
            <CardDescription>Track your application progress</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardStats?.recentApplications?.slice(0, 4).map((app: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{app.jobs?.title || 'Job Title'}</p>
                    <p className="text-xs text-gray-500">{app.jobs?.companies?.name || 'Company'}</p>
                  </div>
                  <Badge variant={app.status === 'applied' ? 'default' : 'secondary'}>
                    {app.status}
                  </Badge>
                </div>
              )) || (
                <div className="text-center py-8 text-gray-500">
                  <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No applications yet</p>
                  <Button variant="outline" className="mt-2" onClick={() => navigate('/jobs')}>
                    Browse Jobs
                  </Button>
                </div>
              )}
            </div>
            {dashboardStats?.recentApplications?.length > 0 && (
              <Button variant="outline" className="w-full mt-4" onClick={() => navigate('/jobs/applied')}>
                View All Applications
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Learning Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <GraduationCap className="h-5 w-5 mr-2 text-purple-500" />
              Learning Progress
            </CardTitle>
            <CardDescription>Continue your professional development</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recommendedCourses.slice(0, 3).map((course: any) => (
                <div key={course.id} className="p-3 border rounded-lg hover:shadow-sm transition-shadow cursor-pointer" onClick={() => navigate(`/learning/${course.id}`)}>
                  <h4 className="font-medium text-sm mb-1">{course.title}</h4>
                  <p className="text-xs text-gray-600 mb-2">{course.instructor_name}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 text-yellow-400" />
                      <span className="text-xs">{course.rating || 'New'}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {course.difficulty_level}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4" onClick={() => navigate('/learning')}>
              Explore Courses
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
