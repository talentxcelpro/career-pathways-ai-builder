import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from 'react-router-dom';
import { useQuery } from "@tanstack/react-query";
import { StatsCard } from "@/components/ui/stats-card";
import { ActionCard } from "@/components/ui/action-card";
import { 
  TrendingUp, Users, Star, Bell, Target, Map, Brain, Zap, 
  Briefcase, GraduationCap, FileText, Calendar, MessageSquare,
  BarChart3, Award, Clock, ArrowRight, Sparkles, Eye, Heart,
  Building, Search, PlusCircle
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

  const statsData = [
    {
      title: "Job Applications",
      value: dashboardStats?.appliedJobs || 0,
      subtitle: "This month",
      icon: Briefcase,
      trend: { value: "+12%", isPositive: true },
      gradient: "from-blue-500 to-blue-600"
    },
    {
      title: "Profile Views",
      value: "156",
      subtitle: "Last 30 days",
      icon: Eye,
      trend: { value: "+8%", isPositive: true },
      gradient: "from-green-500 to-green-600"
    },
    {
      title: "Saved Jobs",
      value: dashboardStats?.savedJobs || 0,
      subtitle: "In watchlist",
      icon: Heart,
      trend: { value: "+5", isPositive: true },
      gradient: "from-purple-500 to-purple-600"
    },
    {
      title: "Network",
      value: dashboardStats?.networkConnections || 0,
      subtitle: "Connections",
      icon: Users,
      trend: { value: "+3", isPositive: true },
      gradient: "from-orange-500 to-orange-600"
    }
  ];

  const quickActions = [
    {
      title: "AI Job Matcher",
      description: "Get personalized job recommendations",
      icon: Brain,
      path: "/jobs/recommendations",
      gradient: "from-blue-500 to-purple-500",
      featured: true,
      badge: "AI Powered"
    },
    {
      title: "Resume Builder",
      description: "Create or optimize your resume",
      icon: FileText,
      path: "/tools/resume-check",
      gradient: "from-green-500 to-teal-500"
    },
    {
      title: "Career Roadmap",
      description: "Plan your career journey",
      icon: Map,
      path: "/career-map",
      gradient: "from-orange-500 to-red-500"
    },
    {
      title: "Skill Assessment",
      description: "Evaluate your current skills",
      icon: Award,
      path: "/tools/profile-score",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      title: "Network Builder",
      description: "Expand your professional network",
      icon: Users,
      path: "/network/people",
      gradient: "from-indigo-500 to-blue-500"
    },
    {
      title: "Interview Prep",
      description: "Practice with AI mock interviews",
      icon: MessageSquare,
      path: "/tools/interview-prep",
      gradient: "from-yellow-500 to-orange-500"
    }
  ];

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Please sign in to access your dashboard</h2>
          <Button onClick={() => navigate('/auth/login')}>Sign In</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 p-8 shadow-xl">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">
              Welcome back, {user.user_metadata?.full_name || user.email?.split('@')[0]}!
            </h1>
            <p className="text-blue-100 text-sm">Ready to accelerate your career today?</p>
          </div>
          <div className="flex gap-3">
            <Button 
              variant="secondary" 
              size="sm"
              onClick={() => navigate('/career-map')}
              className="bg-white/20 hover:bg-white/30 text-white border-white/30"
            >
              <Map className="h-4 w-4 mr-2" />
              Career Map
            </Button>
            <Button 
              variant="secondary" 
              size="sm"
              onClick={() => navigate('/tools/ai-assistant')}
              className="bg-white/20 hover:bg-white/30 text-white border-white/30"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              AI Assistant
            </Button>
          </div>
        </div>
      </div>

      {/* Enhanced Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsData.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      {/* Quick Actions */}
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center text-lg">
                <Zap className="h-5 w-5 mr-2 text-yellow-500" />
                Quick Actions
              </CardTitle>
              <CardDescription className="text-xs">
                Fast-track your career growth with AI-powered tools
              </CardDescription>
            </div>
            <Badge variant="secondary" className="bg-blue-100 text-blue-700 text-xs">
              6 Tools Available
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickActions.map((action, index) => (
              <ActionCard
                key={index}
                {...action}
                onClick={() => navigate(action.path)}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Featured Jobs */}
        <Card className="lg:col-span-2 shadow-lg border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center text-lg">
                  <Star className="h-5 w-5 mr-2 text-yellow-500" />
                  Featured Opportunities
                </CardTitle>
                <CardDescription className="text-xs">
                  Hand-picked jobs matching your profile
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => navigate('/jobs')}>
                <Search className="h-3 w-3 mr-1" />
                Browse All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {featuredJobs.slice(0, 3).map((job: any) => (
                <div 
                  key={job.id} 
                  className="p-4 border border-gray-100 rounded-xl hover:shadow-md transition-all duration-200 cursor-pointer bg-white/60 backdrop-blur-sm" 
                  onClick={() => navigate(`/jobs/${job.id}`)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold mb-1">{job.title}</h3>
                      <p className="text-xs text-gray-600">{job.companies?.name}</p>
                      <p className="text-xs text-gray-500">{job.location}</p>
                      {job.salary_min && job.salary_max && (
                        <p className="text-xs text-green-600 font-medium mt-1">
                          ${job.salary_min.toLocaleString()} - ${job.salary_max.toLocaleString()}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      <Badge variant="secondary" className="text-xs">{job.employment_type}</Badge>
                      <Button 
                        size="sm" 
                        className="text-xs h-7"
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          navigate(`/jobs/${job.id}/smart-apply`); 
                        }}
                      >
                        <Sparkles className="h-3 w-3 mr-1" />
                        Apply
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Activity Feed */}
        <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center text-lg">
              <Bell className="h-5 w-5 mr-2 text-blue-500" />
              Recent Activity
            </CardTitle>
            <CardDescription className="text-xs">
              Your latest career updates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { action: "Applied to Senior Developer", company: "TechCorp", time: "2h ago", type: "application" },
                { action: "Completed React Course", company: "Learning Hub", time: "1d ago", type: "learning" },
                { action: "Profile viewed by", company: "Microsoft", time: "2d ago", type: "view" },
                { action: "New connection", company: "Sarah Johnson", time: "3d ago", type: "network" }
              ].map((activity, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50/80 backdrop-blur-sm">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    activity.type === 'application' ? 'bg-green-500' :
                    activity.type === 'learning' ? 'bg-purple-500' :
                    activity.type === 'view' ? 'bg-blue-500' : 'bg-orange-500'
                  }`}></div>
                  <div className="flex-1">
                    <p className="text-xs font-medium">{activity.action}</p>
                    <p className="text-xs text-gray-600">{activity.company}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="ghost" size="sm" className="w-full mt-4 text-xs">
              View All Activity
              <ArrowRight className="ml-2 h-3 w-3" />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Learning Progress */}
      <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center text-lg">
                <GraduationCap className="h-5 w-5 mr-2 text-purple-500" />
                Continue Learning
              </CardTitle>
              <CardDescription className="text-xs">
                Recommended courses to advance your skills
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => navigate('/learning')}>
              <PlusCircle className="h-3 w-3 mr-1" />
              Explore Courses
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recommendedCourses.slice(0, 3).map((course: any) => (
              <div 
                key={course.id} 
                className="p-4 border border-gray-100 rounded-xl hover:shadow-md transition-all duration-200 cursor-pointer bg-white/60 backdrop-blur-sm"
                onClick={() => navigate(`/learning/${course.id}`)}
              >
                <h4 className="text-sm font-semibold mb-2">{course.title}</h4>
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
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
