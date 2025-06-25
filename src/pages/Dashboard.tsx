
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Briefcase, 
  BookOpen, 
  Target, 
  TrendingUp, 
  Plus,
  MessageSquare,
  Bell,
  Award,
  Eye
} from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState({
    applications: 0,
    savedJobs: 0,
    connections: 0,
    coursesEnrolled: 0,
    profileViews: 0
  });

  useEffect(() => {
    getCurrentUser();
  }, []);

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUser(user);
      await fetchProfile(user.id);
      await fetchStats(user.id);
    }
  };

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    setProfile(data);
  };

  const fetchStats = async (userId: string) => {
    // Fetch user stats
    const [applications, savedJobs, connections, courses] = await Promise.all([
      supabase.from('job_applications').select('*', { count: 'exact' }).eq('user_id', userId),
      supabase.from('saved_jobs').select('*', { count: 'exact' }).eq('user_id', userId),
      supabase.from('connections').select('*', { count: 'exact' }).or(`requester_id.eq.${userId},recipient_id.eq.${userId}`),
      supabase.from('user_courses').select('*', { count: 'exact' }).eq('user_id', userId)
    ]);

    setStats({
      applications: applications.count || 0,
      savedJobs: savedJobs.count || 0,
      connections: connections.count || 0,
      coursesEnrolled: courses.count || 0,
      profileViews: Math.floor(Math.random() * 100) // Mock data
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {profile?.full_name || user.email}!
          </h1>
          <p className="text-gray-600 mt-2">
            Here's what's happening with your career journey today.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Applications</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.applications}</div>
              <p className="text-xs text-muted-foreground">+2 this week</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Saved Jobs</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.savedJobs}</div>
              <p className="text-xs text-muted-foreground">Ready to apply</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Connections</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.connections}</div>
              <p className="text-xs text-muted-foreground">+5 this week</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Courses</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.coursesEnrolled}</div>
              <p className="text-xs text-muted-foreground">In progress</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Profile Views</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.profileViews}</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Jump into your career development</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button variant="outline" className="h-20 flex flex-col space-y-2" onClick={() => navigate('/jobs')}>
                    <Briefcase className="h-6 w-6" />
                    <span className="text-sm">Find Jobs</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col space-y-2" onClick={() => navigate('/tools/resume-check')}>
                    <Target className="h-6 w-6" />
                    <span className="text-sm">Resume Check</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col space-y-2" onClick={() => navigate('/network')}>
                    <Users className="h-6 w-6" />
                    <span className="text-sm">Network</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col space-y-2" onClick={() => navigate('/learning')}>
                    <BookOpen className="h-6 w-6" />
                    <span className="text-sm">Learn Skills</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                    <Briefcase className="h-5 w-5 text-blue-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Applied to Senior Developer at TechCorp</p>
                      <p className="text-xs text-gray-500">2 hours ago</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                    <Users className="h-5 w-5 text-green-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Connected with Sarah Johnson</p>
                      <p className="text-xs text-gray-500">1 day ago</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                    <BookOpen className="h-5 w-5 text-purple-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Completed React Advanced Course</p>
                      <p className="text-xs text-gray-500">3 days ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Profile Completion */}
            <Card>
              <CardHeader>
                <CardTitle>Profile Strength</CardTitle>
                <CardDescription>Complete your profile to attract more opportunities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span>Profile completion</span>
                    <span>75%</span>
                  </div>
                  <Progress value={75} className="h-2" />
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Add skills</span>
                      <Button variant="ghost" size="sm" onClick={() => navigate('/profile/edit')}>
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Upload resume</span>
                      <Button variant="ghost" size="sm" onClick={() => navigate('/profile/resume')}>
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Job Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle>Recommended Jobs</CardTitle>
                <CardDescription>Based on your profile and preferences</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                    <h4 className="font-medium text-sm">Senior Frontend Developer</h4>
                    <p className="text-xs text-gray-600">TechCorp Inc. • San Francisco</p>
                    <div className="flex gap-1 mt-2">
                      <Badge variant="secondary" className="text-xs">React</Badge>
                      <Badge variant="secondary" className="text-xs">TypeScript</Badge>
                    </div>
                  </div>
                  
                  <div className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                    <h4 className="font-medium text-sm">Full Stack Engineer</h4>
                    <p className="text-xs text-gray-600">InnovateLab • Austin</p>
                    <div className="flex gap-1 mt-2">
                      <Badge variant="secondary" className="text-xs">Node.js</Badge>
                      <Badge variant="secondary" className="text-xs">PostgreSQL</Badge>
                    </div>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="w-full mt-4" onClick={() => navigate('/jobs')}>
                  View All Recommendations
                </Button>
              </CardContent>
            </Card>

            {/* Learning Progress */}
            <Card>
              <CardHeader>
                <CardTitle>Learning Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>React Advanced</span>
                      <span>80%</span>
                    </div>
                    <Progress value={80} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>System Design</span>
                      <span>45%</span>
                    </div>
                    <Progress value={45} className="h-2" />
                  </div>
                </div>
                <Button variant="outline" size="sm" className="w-full mt-4" onClick={() => navigate('/learning')}>
                  Continue Learning
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
