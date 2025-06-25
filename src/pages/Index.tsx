
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Briefcase, GraduationCap, FileText, TrendingUp, Users, Star } from "lucide-react";
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Mock user data - in real app this would come from Supabase
  const mockUser = {
    name: "Alex Johnson",
    title: "Software Engineer",
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Talenxcel
                </span>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-8">
                <a href="#" className="text-gray-900 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors">Jobs</a>
                <a href="#" className="text-gray-900 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors">Learning</a>
                <a href="#" className="text-gray-900 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors">Tools</a>
                <a href="#" className="text-gray-900 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors">Career Map</a>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {!isLoggedIn ? (
                <>
                  <Button variant="ghost" onClick={() => setIsLoggedIn(true)}>Sign In</Button>
                  <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    Get Started
                  </Button>
                </>
              ) : (
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
                  <span className="text-sm font-medium">{mockUser.name}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {!isLoggedIn ? (
        // Landing Page
        <div className="relative">
          {/* Hero Section */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
            <div className="text-center">
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                Accelerate Your
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Career Journey</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                Build your professional profile, discover opportunities, learn new skills, and let AI guide your career growth - all in one comprehensive platform.
              </p>
              <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-8 py-6 text-lg"
                  onClick={() => setIsLoggedIn(true)}
                >
                  Start Your Journey
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button size="lg" variant="outline" className="px-8 py-6 text-lg">
                  Watch Demo
                </Button>
              </div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Everything You Need to Excel</h2>
              <p className="text-lg text-gray-600">Comprehensive tools powered by AI to transform your career</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle>Professional Profile</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-center">Create a compelling professional presence that stands out to employers and connections.</p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Briefcase className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle>Smart Job Search</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-center">Discover opportunities that match your skills and career goals with AI-powered recommendations.</p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <GraduationCap className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle>Skill Development</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-center">Access courses and learning paths tailored to your career aspirations and industry trends.</p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <FileText className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle>AI Career Tools</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-center">Generate professional resumes, cover letters, and get personalized career guidance.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      ) : (
        // Dashboard for logged-in users
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, {mockUser.name}!</h1>
            <p className="text-gray-600">Continue building your career journey</p>
          </div>

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
