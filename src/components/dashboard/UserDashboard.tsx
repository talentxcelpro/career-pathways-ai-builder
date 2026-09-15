
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Briefcase, GraduationCap, FileText, TrendingUp, Users, Star, ExternalLink, ChevronRight } from "lucide-react";
import { useNavigate, Link } from 'react-router-dom';
import { ProfileCompletionPrompt } from "@/components/profile/ProfileCompletionPrompt";

interface UserDashboardProps {
  currentUserProfile: any;
  userData: {
    name: string;
    title: string;
  };
  missingFields: string[];
}

export const UserDashboard: React.FC<UserDashboardProps> = ({ 
  currentUserProfile, 
  userData, 
  missingFields 
}) => {
  const navigate = useNavigate();

  const featuredJobs = [
    { id: 1, title: "Senior Frontend Developer", company: "TechCorp", location: "Remote", salary: "₹18-25 LPA", type: "Full-time" },
    { id: 2, title: "Product Manager", company: "InnovateLab", location: "Bangalore", salary: "₹22-35 LPA", type: "Full-time" },
    { id: 3, title: "UX Designer", company: "DesignStudio", location: "Mumbai", salary: "₹15-22 LPA", type: "Contract" }
  ];

  const trendingCourses = [
    { id: 1, title: "Advanced React Development", instructor_name: "Sarah Wilson", rating: 4.8, students: 2456 },
    { id: 2, title: "AI & Machine Learning Fundamentals", instructor_name: "Dr. Michael Chen", rating: 4.9, students: 3890 },
    { id: 3, title: "Product Management Masterclass", instructor_name: "Jennifer Davis", rating: 4.7, students: 1823 }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, {userData.name}!</h1>
        <p className="text-gray-600">Continue building your career journey</p>
      </div>

      {missingFields.length > 0 && (
        <ProfileCompletionPrompt 
          missingFields={missingFields}
          className="mb-8"
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100">Courses Completed</p>
                <p className="text-3xl font-bold">{currentUserProfile?.courses_completed || 0}</p>
              </div>
              <GraduationCap className="h-8 w-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Link to="/network/profile/analytics">
          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0 cursor-pointer hover:from-green-600 hover:to-green-700 transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100">Profile Views</p>
                  <p className="text-3xl font-bold">{currentUserProfile?.profile_views_count || 0}</p>
                </div>
                <FileText className="h-8 w-8 text-green-200" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100">Jobs Applied</p>
                <p className="text-3xl font-bold">{currentUserProfile?.jobs_applied_count || 0}</p>
              </div>
              <Briefcase className="h-8 w-8 text-purple-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
              <div 
                key={job.id} 
                className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer hover:bg-blue-50"
                onClick={() => navigate('/jobs')}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-gray-900">{job.title}</h3>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{job.type}</Badge>
                    <ExternalLink className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
                <p className="text-gray-600 mb-1">{job.company} • {job.location}</p>
                <p className="text-green-600 font-medium">{job.salary}</p>
              </div>
            ))}
            <Button 
              variant="outline" 
              className="w-full group"
              onClick={() => navigate('/jobs')}
            >
              View All Jobs
              <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </CardContent>
        </Card>

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
              <div 
                key={course.id} 
                className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer hover:bg-green-50"
                onClick={() => navigate('/learning')}
              >
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-semibold text-gray-900">{course.title}</h3>
                  <ExternalLink className="h-4 w-4 text-gray-400" />
                </div>
                <p className="text-gray-600 mb-2">by {course.instructor_name}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-sm text-gray-600 ml-1">{course.rating}</span>
                  </div>
                  <span className="text-sm text-gray-500">{course.students.toLocaleString()} students</span>
                </div>
              </div>
            ))}
            <Button 
              variant="outline" 
              className="w-full group"
              onClick={() => navigate('/learning')}
            >
              Explore Learning
              <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Button 
            className="h-24 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
            onClick={() => navigate('/resume')}
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
            className="h-24 group"
            onClick={() => navigate('/career-map')}
          >
            <div className="text-center">
              <TrendingUp className="h-6 w-6 mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <span>Career Map</span>
            </div>
          </Button>
          <Button 
            variant="outline" 
            className="h-24 group"
            onClick={() => navigate('/jobs/saved')}
          >
            <div className="text-center">
              <Briefcase className="h-6 w-6 mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <span>Job Alerts</span>
            </div>
          </Button>
        </div>
      </div>
    </div>
  );
};
