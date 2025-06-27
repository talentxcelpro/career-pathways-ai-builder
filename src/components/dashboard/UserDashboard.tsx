
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Briefcase, GraduationCap, FileText, TrendingUp, Users, Star } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { ProfileCompletionPrompt } from "@/components/profile/ProfileCompletionPrompt";

interface UserDashboardProps {
  currentUserProfile: any;
  mockUser: {
    name: string;
    title: string;
    completedCourses: number;
    resumeViews: number;
    appliedJobs: number;
  };
  missingFields: string[];
}

export const UserDashboard: React.FC<UserDashboardProps> = ({ 
  currentUserProfile, 
  mockUser, 
  missingFields 
}) => {
  const navigate = useNavigate();

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, {mockUser.name}!</h1>
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
  );
};
