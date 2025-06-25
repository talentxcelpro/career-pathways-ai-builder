
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from 'react-router-dom';
import { useQuery } from "@tanstack/react-query";
import { 
  Briefcase, 
  GraduationCap, 
  FileText, 
  Users, 
  Star, 
  ArrowRight,
  BookOpen,
  Target,
  TrendingUp
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

  // Fetch featured jobs
  const { data: featuredJobs = [] } = useQuery({
    queryKey: ['featured-jobs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('jobs')
        .select(`
          *,
          companies (
            name,
            logo_url
          )
        `)
        .eq('is_active', true)
        .limit(3);
      
      if (error) throw error;
      return data;
    }
  });

  // Fetch trending courses
  const { data: trendingCourses = [] } = useQuery({
    queryKey: ['trending-courses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('is_active', true)
        .order('enrolled_count', { ascending: false })
        .limit(3);
      
      if (error) throw error;
      return data;
    }
  });

  // Mock user stats - in a real app, these would come from the database
  const userStats = {
    coursesCompleted: 12,
    resumeViews: 156,
    appliedJobs: 8,
    profileViews: 89
  };

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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user.user_metadata?.full_name || user.email}!
          </h1>
          <p className="text-gray-600">Continue building your career journey</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100">Courses Completed</p>
                  <p className="text-3xl font-bold">{userStats.coursesCompleted}</p>
                </div>
                <GraduationCap className="h-8 w-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100">Resume Views</p>
                  <p className="text-3xl font-bold">{userStats.resumeViews}</p>
                </div>
                <FileText className="h-8 w-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100">Jobs Applied</p>
                  <p className="text-3xl font-bold">{userStats.appliedJobs}</p>
                </div>
                <Briefcase className="h-8 w-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100">Profile Views</p>
                  <p className="text-3xl font-bold">{userStats.profileViews}</p>
                </div>
                <Users className="h-8 w-8 text-orange-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Featured Jobs */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Briefcase className="h-5 w-5 mr-2" />
                Featured Jobs
              </CardTitle>
              <CardDescription>Opportunities matching your profile</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {featuredJobs.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No jobs available at the moment</p>
              ) : (
                featuredJobs.map((job) => (
                  <div key={job.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-900">{job.title}</h3>
                      <Badge variant="secondary">{job.employment_type}</Badge>
                    </div>
                    <p className="text-gray-600 mb-1">
                      {job.companies?.name} • {job.location || 'Remote'}
                    </p>
                    {job.salary_min && job.salary_max && (
                      <p className="text-green-600 font-medium">
                        ${job.salary_min}k - ${job.salary_max}k
                      </p>
                    )}
                  </div>
                ))
              )}
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => navigate('/jobs')}
              >
                View All Jobs
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          {/* Trending Courses */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <GraduationCap className="h-5 w-5 mr-2" />
                Trending Courses
              </CardTitle>
              <CardDescription>Popular learning paths in your field</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {trendingCourses.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No courses available at the moment</p>
              ) : (
                trendingCourses.map((course) => (
                  <div key={course.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                    <h3 className="font-semibold text-gray-900 mb-1">{course.title}</h3>
                    <p className="text-gray-600 mb-2">by {course.instructor_name}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="text-sm text-gray-600 ml-1">{course.rating}</span>
                      </div>
                      <span className="text-sm text-gray-500">
                        {course.enrolled_count?.toLocaleString()} students
                      </span>
                    </div>
                  </div>
                ))
              )}
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => navigate('/learning')}
              >
                Explore Learning
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button 
              className="h-24 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
              onClick={() => navigate('/tools/resume-builder')}
            >
              <div className="text-center">
                <FileText className="h-6 w-6 mx-auto mb-2" />
                <span>Build Resume</span>
              </div>
            </Button>
            <Button 
              variant="outline" 
              className="h-24"
              onClick={() => navigate('/profile')}
            >
              <div className="text-center">
                <Users className="h-6 w-6 mx-auto mb-2" />
                <span>Edit Profile</span>
              </div>
            </Button>
            <Button 
              variant="outline" 
              className="h-24"
              onClick={() => navigate('/learning')}
            >
              <div className="text-center">
                <BookOpen className="h-6 w-6 mx-auto mb-2" />
                <span>Learning Hub</span>
              </div>
            </Button>
            <Button 
              variant="outline" 
              className="h-24"
            >
              <div className="text-center">
                <Target className="h-6 w-6 mx-auto mb-2" />
                <span>Career Map</span>
              </div>
            </Button>
          </div>
        </div>

        {/* Career Insights */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Career Insights
            </CardTitle>
            <CardDescription>Personalized recommendations for your career growth</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <BookOpen className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <h3 className="font-semibold text-gray-900 mb-1">Skill Gaps</h3>
                <p className="text-sm text-gray-600">Complete 2 more courses to match your target role</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <Briefcase className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <h3 className="font-semibold text-gray-900 mb-1">Job Matches</h3>
                <p className="text-sm text-gray-600">5 new jobs match your profile this week</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <Users className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <h3 className="font-semibold text-gray-900 mb-1">Network Growth</h3>
                <p className="text-sm text-gray-600">Connect with 3 professionals in your field</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
