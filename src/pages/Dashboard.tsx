
import React, { useEffect, useState } from 'react';
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { UserDashboard } from "@/components/dashboard/UserDashboard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { JobPlatformIcon, JobPlatformIconKey } from "@/components/ui/job-platform-icons";
import { StatsCard } from "@/components/ui/stats-card";
import { ActionCard } from "@/components/ui/action-card";
import { 
  TrendingUp, 
  Users, 
  BookOpen, 
  Briefcase,
  Target,
  Zap,
  Activity,
  Rocket
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [currentUserProfile, setCurrentUserProfile] = useState(null);

  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    }
  });

  useEffect(() => {
    setCurrentUserProfile(profile);
  }, [profile]);

  const mockUser = {
    name: profile?.display_name || 'Professional',
    title: profile?.current_role || 'Career Builder',
    completedCourses: 12,
    resumeViews: 84,
    appliedJobs: 23,
  };

  const missingFields = [];
  if (!profile?.display_name) missingFields.push('display_name');
  if (!profile?.current_role) missingFields.push('current_role');
  if (!profile?.location) missingFields.push('location');
  if (!profile?.bio) missingFields.push('bio');

  const stats = [
    { 
      title: "Active Applications", 
      value: "23", 
      subtitle: "In progress",
      icon: TrendingUp, 
      trend: { value: "+5 this week", isPositive: true },
      gradient: "from-blue-500 to-blue-600"
    },
    { 
      title: "Profile Views", 
      value: "84", 
      subtitle: "This month",
      icon: Users, 
      trend: { value: "+24%", isPositive: true },
      gradient: "from-green-500 to-emerald-600"
    },
    { 
      title: "Skills Learned", 
      value: "12", 
      subtitle: "Courses completed",
      icon: BookOpen, 
      trend: { value: "+3 new", isPositive: true },
      gradient: "from-purple-500 to-indigo-600"
    },
    { 
      title: "Network Size", 
      value: "248", 
      subtitle: "Connections",
      icon: Users, 
      trend: { value: "+12", isPositive: true },
      gradient: "from-orange-500 to-red-500"
    },
  ];

  const quickActions = [
    {
      title: "Smart Job Search",
      description: "AI-powered job recommendations",
      icon: Target,
      path: "/jobs",
      gradient: "from-blue-500 to-purple-500",
      featured: true,
      badge: "AI Enhanced"
    },
    {
      title: "Career Tools",
      description: "Resume checker, interview prep & more",
      icon: Zap,
      path: "/tools",
      gradient: "from-green-500 to-teal-500"
    },
    {
      title: "Learning Hub",
      description: "Skill development and certifications",
      icon: BookOpen,
      path: "/learning",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      title: "Professional Network",
      description: "Connect with industry professionals",
      icon: Users,
      path: "/network",
      gradient: "from-orange-500 to-yellow-500"
    }
  ];

  const jobCategories = [
    { 
      key: 'activeJobs' as JobPlatformIconKey, 
      title: 'Active Jobs', 
      count: '2.4k+', 
      description: 'Currently hiring',
      gradient: 'from-blue-500 to-blue-600'
    },
    { 
      key: 'remoteJobs' as JobPlatformIconKey, 
      title: 'Remote Work', 
      count: '1.8k+', 
      description: 'Work from anywhere',
      gradient: 'from-green-500 to-emerald-600'
    },
    { 
      key: 'featuredJobs' as JobPlatformIconKey, 
      title: 'Featured Jobs', 
      count: '340+', 
      description: 'Premium opportunities',
      gradient: 'from-yellow-500 to-orange-500'
    },
    { 
      key: 'companies' as JobPlatformIconKey, 
      title: 'Top Companies', 
      count: '150+', 
      description: 'Industry leaders',
      gradient: 'from-purple-500 to-indigo-600'
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Enhanced Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 p-8 mb-8 shadow-xl">
          <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
          <div className="relative z-10 text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <Rocket className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-white mb-3">Career Command Center</h1>
            <p className="text-lg text-blue-100 max-w-2xl mx-auto mb-6">
              Your personalized dashboard for career advancement and professional growth
            </p>
            <div className="flex justify-center gap-3">
              <Button size="lg" variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-white/30">
                <Target className="h-4 w-4 mr-2" />
                Find Jobs
              </Button>
              <Button size="lg" variant="outline" className="text-white border-white/30 hover:bg-white/10">
                <Activity className="h-4 w-4 mr-2" />
                View Analytics
              </Button>
            </div>
          </div>
        </div>

        {/* Enhanced Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => (
            <StatsCard key={index} {...stat} />
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Quick Actions</h2>
              <p className="text-sm text-gray-600">Fast-track your career progress</p>
            </div>
            <Badge className="bg-blue-100 text-blue-700 text-xs">4 Tools</Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <ActionCard
                key={index}
                {...action}
                onClick={() => window.location.href = action.path}
              />
            ))}
          </div>
        </div>

        {/* Job Categories with New Icons */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Job Market Overview</h2>
              <p className="text-sm text-gray-600">Explore opportunities by category</p>
            </div>
            <Link to="/jobs">
              <Button variant="outline" size="sm" className="text-xs">
                <Briefcase className="h-3 w-3 mr-2" />
                Browse All Jobs
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {jobCategories.map((category) => (
              <Card key={category.key} className="group bg-white/80 backdrop-blur-sm border-0 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] overflow-hidden cursor-pointer">
                <div className={`absolute inset-0 bg-gradient-to-br ${category.gradient} opacity-5 group-hover:opacity-10 transition-opacity duration-300`}></div>
                <CardContent className="relative z-10 p-6">
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${category.gradient} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <JobPlatformIcon 
                        iconKey={category.key} 
                        size="md"
                        variant="neutral"
                        className="bg-white/20 backdrop-blur-sm border-0"
                        animated={true}
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-base font-semibold text-gray-900 mb-1">{category.title}</h3>
                      <p className="text-2xl font-bold text-gray-800 mb-1">{category.count}</p>
                      <p className="text-xs text-gray-600">{category.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* User Dashboard Component */}
        <UserDashboard 
          currentUserProfile={currentUserProfile}
          mockUser={mockUser}
          missingFields={missingFields}
        />
      </div>
    </div>
  );
};

export default Dashboard;
