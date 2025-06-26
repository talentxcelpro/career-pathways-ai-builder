
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Briefcase, GraduationCap, FileText, TrendingUp, Users, Star, Bell, Target, Map, Brain, Zap } from "lucide-react";
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
    { id: 1, title: "Senior Frontend Developer", company: "TechCorp", location: "Remote", salary: "$90k-120k", type: "Full-time", urgent: true },
    { id: 2, title: "Product Manager", company: "InnovateLab", location: "San Francisco", salary: "$110k-140k", type: "Full-time", featured: true },
    { id: 3, title: "UX Designer", company: "DesignStudio", location: "New York", salary: "$80k-100k", type: "Contract", new: true }
  ];

  const recentActivity = [
    { type: 'application', message: 'Applied to Senior Developer at TechCorp', time: '2 hours ago', status: 'pending' },
    { type: 'course', message: 'Completed React Advanced Patterns', time: '1 day ago', status: 'completed' },
    { type: 'connection', message: 'Connected with Sarah Johnson', time: '2 days ago', status: 'accepted' },
    { type: 'interview', message: 'Interview scheduled with InnovateLab', time: '3 days ago', status: 'scheduled' }
  ];

  const careerProgress = {
    currentLevel: 'Mid-level Developer',
    nextLevel: 'Senior Developer',
    progress: 75,
    skillsNeeded: ['Advanced React', 'System Design', 'Team Leadership'],
    timeToGoal: '6 months'
  };

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Welcome back, {mockUser.name}!</h1>
            <p className="text-blue-100 text-lg">{mockUser.title}</p>
            <p className="text-blue-200 mt-2">Ready to advance your career today?</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{careerProgress.progress}%</div>
            <div className="text-blue-200">Career Progress</div>
            <Button variant="secondary" className="mt-2" onClick={() => navigate('/career-map')}>
              <Map className="h-4 w-4 mr-2" />
              View Career Map
            </Button>
          </div>
        </div>
      </div>

      {missingFields.length > 0 && (
        <ProfileCompletionPrompt 
          missingFields={missingFields}
          className="mb-8"
        />
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 font-medium">Courses Completed</p>
                <p className="text-3xl font-bold text-blue-800">{mockUser.completedCourses}</p>
                <p className="text-blue-600 text-sm">+2 this month</p>
              </div>
              <GraduationCap className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 font-medium">Resume Views</p>
                <p className="text-3xl font-bold text-green-800">{mockUser.resumeViews}</p>
                <p className="text-green-600 text-sm">+12 this week</p>
              </div>
              <FileText className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 font-medium">Jobs Applied</p>
                <p className="text-3xl font-bold text-purple-800">{mockUser.appliedJobs}</p>
                <p className="text-purple-600 text-sm">3 pending responses</p>
              </div>
              <Briefcase className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-600 font-medium">Network Size</p>
                <p className="text-3xl font-bold text-orange-800">248</p>
                <p className="text-orange-600 text-sm">+5 connections</p>
              </div>
              <Users className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Career Progress */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="h-5 w-5 mr-2 text-blue-600" />
              Career Progress
            </CardTitle>
            <CardDescription>Track your journey to the next level</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium">{careerProgress.currentLevel}</span>
                <span className="text-gray-500">{careerProgress.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${careerProgress.progress}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600 mt-2">Next: {careerProgress.nextLevel}</p>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Skills to develop:</h4>
              <div className="space-y-1">
                {careerProgress.skillsNeeded.map((skill, index) => (
                  <Badge key={index} variant="outline" className="mr-1 mb-1">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div className="pt-4 border-t">
              <p className="text-sm text-gray-600">Estimated time to goal:</p>
              <p className="font-semibold text-blue-600">{careerProgress.timeToGoal}</p>
            </div>
            
            <Button className="w-full" onClick={() => navigate('/career-map')}>
              <Map className="h-4 w-4 mr-2" />
              View Full Career Map
            </Button>
          </CardContent>
        </Card>

        {/* Featured Jobs */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center">
                  <Briefcase className="h-5 w-5 mr-2 text-green-600" />
                  Featured Jobs
                </CardTitle>
                <CardDescription>Opportunities matching your profile</CardDescription>
              </div>
              <Button variant="outline" onClick={() => navigate('/jobs')}>
                View All Jobs
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {featuredJobs.map((job) => (
              <div key={job.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow bg-white">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold text-gray-900 flex items-center">
                      {job.title}
                      {job.urgent && <Badge className="ml-2 bg-red-100 text-red-700">Urgent</Badge>}
                      {job.featured && <Badge className="ml-2 bg-yellow-100 text-yellow-700">Featured</Badge>}
                      {job.new && <Badge className="ml-2 bg-green-100 text-green-700">New</Badge>}
                    </h3>
                    <p className="text-gray-600">{job.company} • {job.location}</p>
                    <p className="text-green-600 font-medium">{job.salary}</p>
                  </div>
                  <Badge variant="secondary">{job.type}</Badge>
                </div>
                <div className="flex gap-2 mt-3">
                  <Button size="sm" className="flex-1" onClick={() => navigate(`/jobs/${job.id}/smart-apply`)}>
                    <Zap className="h-3 w-3 mr-1" />
                    Smart Apply
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => navigate(`/jobs/${job.id}`)}>
                    View Details
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="h-5 w-5 mr-2 text-purple-600" />
              Recent Activity
            </CardTitle>
            <CardDescription>Your latest career activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    activity.status === 'completed' ? 'bg-green-500' :
                    activity.status === 'pending' ? 'bg-yellow-500' :
                    activity.status === 'scheduled' ? 'bg-blue-500' : 'bg-gray-500'
                  }`}></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.message}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="ghost" className="w-full mt-4">
              View All Activity
            </Button>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Zap className="h-5 w-5 mr-2 text-orange-600" />
              Quick Actions
            </CardTitle>
            <CardDescription>Fast track your career growth</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Button 
                className="h-20 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                onClick={() => navigate('/tools/resume-check')}
              >
                <div className="text-center">
                  <FileText className="h-6 w-6 mx-auto mb-1" />
                  <span className="text-sm">Resume Checker</span>
                </div>
              </Button>
              
              <Button 
                variant="outline" 
                className="h-20"
                onClick={() => navigate('/tools/ai-assistant')}
              >
                <div className="text-center">
                  <Brain className="h-6 w-6 mx-auto mb-1" />
                  <span className="text-sm">AI Assistant</span>
                </div>
              </Button>
              
              <Button 
                variant="outline" 
                className="h-20"
                onClick={() => navigate('/network')}
              >
                <div className="text-center">
                  <Users className="h-6 w-6 mx-auto mb-1" />
                  <span className="text-sm">Networking</span>
                </div>
              </Button>
              
              <Button 
                variant="outline" 
                className="h-20"
                onClick={() => navigate('/learning')}
              >
                <div className="text-center">
                  <GraduationCap className="h-6 w-6 mx-auto mb-1" />
                  <span className="text-sm">Learning</span>
                </div>
              </Button>
            </div>
            
            <Button 
              className="w-full mt-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              onClick={() => navigate('/career-map/generate')}
            >
              <Map className="h-4 w-4 mr-2" />
              Generate Career Roadmap
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
