
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Briefcase, GraduationCap, FileText, TrendingUp, Users, Star, CheckCircle, Globe, Zap, Shield, Menu, X } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { ProfileCompletionPrompt } from "@/components/profile/ProfileCompletionPrompt";

const Index = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Check authentication status
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIsLoggedIn(!!user);
    };
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch current user profile
  const { data: currentUserProfile } = useQuery({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) return null;
      return data;
    },
    enabled: isLoggedIn
  });

  // Mock user data - in real app this would come from Supabase
  const mockUser = {
    name: currentUserProfile?.full_name || "Professional User",
    title: currentUserProfile?.title || "Software Engineer",
    completedCourses: 12,
    resumeViews: 156,
    appliedJobs: 8
  };

  const featuredJobs = [
    { id: 1, title: "Senior Frontend Developer", company: "TechCorp", location: "Remote", salary: "$90k-120k", type: "Full-time" },
    { id: 2, title: "Product Manager", company: "InnovateLab", location: "San Francisco", salary: "$110k-140k", type: "Full-time" },
    { id: 3, title: "UX Designer", company: "DesignStudio", location: "New York", salary: "$80k-100k", type: "Contract" }
  ];

  const trendingCourses = [
    { id: 1, title: "Advanced React Development", instructor: "Sarah Wilson", rating: 4.8, students: 2456 },
    { id: 2, title: "AI & Machine Learning Fundamentals", instructor: "Dr. Michael Chen", rating: 4.9, students: 3890 },
    { id: 3, title: "Product Management Masterclass", instructor: "Jennifer Davis", rating: 4.7, students: 1823 }
  ];

  // Check for missing profile fields
  const getMissingFields = () => {
    if (!currentUserProfile) return [];
    
    const missing = [];
    if (!currentUserProfile.full_name) missing.push('full name');
    if (!currentUserProfile.profile_picture_url) missing.push('profile picture');
    if (!currentUserProfile.title) missing.push('professional title');
    
    return missing;
  };

  const missingFields = getMissingFields();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {!isLoggedIn ? (
        // Modern Landing Page without duplicate navbar
        <div className="relative overflow-hidden">
          {/* Background Elements */}
          <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10"></div>
          <div className="absolute top-0 right-0 -z-10 transform-gpu overflow-hidden blur-3xl">
            <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-20"></div>
          </div>

          {/* Hero Section with integrated navigation feel */}
          <section className="relative pt-8 pb-20 sm:pt-12 sm:pb-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {/* Top Brand Area */}
              <div className="flex justify-between items-center mb-16">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-xl">TX</span>
                  </div>
                  <div>
                    <span className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                      TalentXcel
                    </span>
                    <p className="text-sm text-gray-600 mt-1">Your Career. One Platform. Endless Possibilities.</p>
                  </div>
                </div>
                
                {/* Desktop Auth Buttons */}
                <div className="hidden md:flex items-center space-x-4">
                  <Button 
                    variant="ghost" 
                    onClick={() => navigate('/auth/login')}
                    className="text-gray-600 hover:text-gray-900 px-6"
                  >
                    Sign In
                  </Button>
                  <Button 
                    onClick={() => navigate('/auth/register')}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg px-6"
                  >
                    Get Started
                  </Button>
                </div>

                {/* Mobile Menu Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                  {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </Button>
              </div>

              {/* Mobile Menu */}
              {isMobileMenuOpen && (
                <div className="md:hidden mb-8 p-4 bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50">
                  <div className="flex flex-col space-y-3">
                    <Button 
                      variant="ghost" 
                      onClick={() => {
                        navigate('/auth/login');
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full justify-start"
                    >
                      Sign In
                    </Button>
                    <Button 
                      onClick={() => {
                        navigate('/auth/register');
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                    >
                      Get Started
                    </Button>
                  </div>
                </div>
              )}
              
              {/* Hero Content */}
              <div className="text-center">
                <div className="inline-flex items-center px-6 py-3 rounded-full bg-blue-50 border border-blue-200 mb-8 shadow-sm">
                  <Zap className="w-5 h-5 text-blue-600 mr-3" />
                  <span className="text-sm font-medium text-blue-800">AI-Powered Career Platform</span>
                </div>
                
                <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-8 leading-tight">
                  Transform Your
                  <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                    Career Journey
                  </span>
                  <span className="block text-4xl md:text-5xl text-gray-700 mt-2">
                    with AI Excellence
                  </span>
                </h1>
                
                <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
                  Build your professional profile, discover opportunities, learn new skills, and let AI guide your career growth - all in one comprehensive platform.
                </p>
                
                <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6 mb-16">
                  <Button 
                    size="lg" 
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-10 py-7 text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 rounded-xl"
                    onClick={() => navigate('/auth/register')}
                  >
                    Start Your Journey
                    <ArrowRight className="ml-3 h-5 w-5" />
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="px-10 py-7 text-lg border-2 hover:bg-gray-50 rounded-xl shadow-lg"
                  >
                    Watch Demo
                  </Button>
                </div>

                {/* Enhanced Social Proof */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto">
                  {[
                    { icon: CheckCircle, text: "10,000+ Professionals", color: "text-green-500" },
                    { icon: Shield, text: "500+ Companies", color: "text-blue-500" },
                    { icon: Globe, text: "98% Success Rate", color: "text-purple-500" }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-center space-x-3 p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200/50 shadow-sm">
                      <item.icon className={`w-5 h-5 ${item.color}`} />
                      <span className="text-gray-700 font-medium">{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Features Section */}
          <section className="py-24 bg-white/70 backdrop-blur-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-20">
                <h2 className="text-4xl font-bold text-gray-900 mb-6">Everything You Need to Excel</h2>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">Comprehensive tools powered by AI to transform your career journey</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {[
                  {
                    icon: Users,
                    title: "Professional Profile",
                    description: "Create a compelling professional presence that stands out to employers and connections.",
                    gradient: "from-blue-500 to-blue-600"
                  },
                  {
                    icon: Briefcase,
                    title: "Smart Job Search",
                    description: "Discover opportunities that match your skills and career goals with AI-powered recommendations.",
                    gradient: "from-green-500 to-green-600"
                  },
                  {
                    icon: GraduationCap,
                    title: "Skill Development",
                    description: "Access courses and learning paths tailored to your career aspirations and industry trends.",
                    gradient: "from-purple-500 to-purple-600"
                  },
                  {
                    icon: FileText,
                    title: "AI Career Tools",
                    description: "Generate professional resumes, cover letters, and get personalized career guidance.",
                    gradient: "from-orange-500 to-orange-600"
                  }
                ].map((feature, index) => (
                  <Card key={index} className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 bg-white/90 backdrop-blur-sm group">
                    <CardHeader className="text-center pb-4">
                      <div className={`w-20 h-20 bg-gradient-to-r ${feature.gradient} rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                        <feature.icon className="h-10 w-10 text-white" />
                      </div>
                      <CardTitle className="text-xl mb-2">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 text-center leading-relaxed">{feature.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>

          {/* Stats Section */}
          <section className="py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                {[
                  { number: "10K+", label: "Active Users" },
                  { number: "500+", label: "Partner Companies" },
                  { number: "50K+", label: "Jobs Posted" },
                  { number: "98%", label: "Success Rate" }
                ].map((stat, index) => (
                  <div key={index} className="p-8 bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
                    <div className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
                      {stat.number}
                    </div>
                    <div className="text-gray-600 font-medium text-lg">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-24 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 relative overflow-hidden">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
              <h2 className="text-5xl font-bold text-white mb-8">Ready to Accelerate Your Career?</h2>
              <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto leading-relaxed">
                Join thousands of professionals who have transformed their careers with TalentXcel.
              </p>
              <Button 
                size="lg" 
                className="bg-white text-blue-600 hover:bg-gray-50 px-10 py-7 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 rounded-xl"
                onClick={() => navigate('/auth/register')}
              >
                Get Started Today
                <ArrowRight className="ml-3 h-5 w-5" />
              </Button>
            </div>
          </section>
        </div>
      ) : (
        // Dashboard for logged-in users
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, {mockUser.name}!</h1>
            <p className="text-gray-600">Continue building your career journey</p>
          </div>

          {/* Profile Completion Prompt */}
          {missingFields.length > 0 && (
            <ProfileCompletionPrompt 
              missingFields={missingFields}
              className="mb-8"
            />
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100">Courses Completed</p>
                    <p className="text-3xl font-bold">{mockUser.completedCourses}</p>
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
                    <p className="text-3xl font-bold">{mockUser.resumeViews}</p>
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
                    <p className="text-3xl font-bold">{mockUser.appliedJobs}</p>
                  </div>
                  <Briefcase className="h-8 w-8 text-purple-200" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
                {featuredJobs.map((job) => (
                  <div key={job.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-900">{job.title}</h3>
                      <Badge variant="secondary">{job.type}</Badge>
                    </div>
                    <p className="text-gray-600 mb-1">{job.company} • {job.location}</p>
                    <p className="text-green-600 font-medium">{job.salary}</p>
                  </div>
                ))}
                <Button variant="outline" className="w-full">
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
                {trendingCourses.map((course) => (
                  <div key={course.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                    <h3 className="font-semibold text-gray-900 mb-1">{course.title}</h3>
                    <p className="text-gray-600 mb-2">by {course.instructor}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="text-sm text-gray-600 ml-1">{course.rating}</span>
                      </div>
                      <span className="text-sm text-gray-500">{course.students.toLocaleString()} students</span>
                    </div>
                  </div>
                ))}
                <Button variant="outline" className="w-full">
                  Explore Learning
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
              <Button variant="outline" className="h-24">
                <div className="text-center">
                  <TrendingUp className="h-6 w-6 mx-auto mb-2" />
                  <span>Career Map</span>
                </div>
              </Button>
              <Button variant="outline" className="h-24">
                <div className="text-center">
                  <Briefcase className="h-6 w-6 mx-auto mb-2" />
                  <span>Job Alerts</span>
                </div>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;
