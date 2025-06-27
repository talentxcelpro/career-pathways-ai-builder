
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Edit, Copy, XCircle, Star, Users, BarChart3, Calendar, Share2, MoreHorizontal } from "lucide-react";
import { useNavigate, useParams } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const JobView = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const jobData = {
    id: id,
    title: "Senior Software Engineer",
    company: "TechCorp Inc.",
    location: "San Francisco, CA",
    employmentType: "full_time",
    status: "active",
    salary: "$120,000 - $180,000",
    applicationsCount: 47,
    viewsCount: 234,
    postedAt: "2024-01-15",
    expiresAt: "2024-02-15"
  };

  const quickActions = [
    {
      title: "View Applicants",
      icon: Users,
      count: jobData.applicationsCount,
      action: () => navigate(`/jobs/manage/${id}/applicants`),
      color: "text-blue-600"
    },
    {
      title: "Analytics",
      icon: BarChart3,
      count: jobData.viewsCount,
      action: () => navigate(`/jobs/manage/${id}/analytics`),
      color: "text-green-600"
    },
    {
      title: "Interviews",
      icon: Calendar,
      count: 5,
      action: () => navigate(`/jobs/manage/${id}/interview`),
      color: "text-purple-600"
    }
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <h1 className="text-3xl font-bold text-gray-900">{jobData.title}</h1>
            <Badge className={jobData.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
              {jobData.status}
            </Badge>
          </div>
          <p className="text-gray-600">{jobData.company} • {jobData.location}</p>
          <p className="text-sm text-gray-500">Posted on {new Date(jobData.postedAt).toLocaleDateString()}</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => navigate(`/jobs/manage/${id}/edit`)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => navigate(`/jobs/manage/${id}/duplicate`)}>
                <Copy className="h-4 w-4 mr-2" />
                Duplicate Job
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate(`/jobs/manage/${id}/promote`)}>
                <Star className="h-4 w-4 mr-2" />
                Promote Job
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Share2 className="h-4 w-4 mr-2" />
                Share Job
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate(`/jobs/manage/${id}/close`)} className="text-red-600">
                <XCircle className="h-4 w-4 mr-2" />
                Close Job
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {quickActions.map((action, index) => (
          <Card key={index} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={action.action}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900">{action.count}</div>
                  <div className="text-sm text-gray-600">{action.title}</div>
                </div>
                <action.icon className={`h-8 w-8 ${action.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Job Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Job Description */}
          <Card>
            <CardHeader>
              <CardTitle>Job Description</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <p>We are seeking a talented Senior Software Engineer to join our dynamic engineering team...</p>
                {/* Job description content would go here */}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest updates for this job posting</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                  <Users className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium">3 new applications</p>
                    <p className="text-sm text-gray-600">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                  <Eye className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium">15 profile views</p>
                    <p className="text-sm text-gray-600">Today</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Job Info */}
          <Card>
            <CardHeader>
              <CardTitle>Job Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Salary Range</p>
                <p className="text-lg font-semibold">{jobData.salary}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Employment Type</p>
                <p className="capitalize">{jobData.employmentType.replace('_', ' ')}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Expires On</p>
                <p>{new Date(jobData.expiresAt).toLocaleDateString()}</p>
              </div>
            </CardContent>
          </Card>

          {/* Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Performance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Views</span>
                <span className="font-medium">{jobData.viewsCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Applications</span>
                <span className="font-medium">{jobData.applicationsCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Conversion Rate</span>
                <span className="font-medium">20.1%</span>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full" onClick={() => navigate(`/jobs/manage/${id}/ai-shortlist`)}>
                <Users className="h-4 w-4 mr-2" />
                AI Shortlist
              </Button>
              <Button variant="outline" className="w-full" onClick={() => navigate(`/jobs/manage/${id}/smart-recommend`)}>
                <Star className="h-4 w-4 mr-2" />
                Smart Recommend
              </Button>
              <Button variant="outline" className="w-full" onClick={() => navigate(`/jobs/manage/${id}/ai-insights`)}>
                <BarChart3 className="h-4 w-4 mr-2" />
                AI Insights
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default JobView;
