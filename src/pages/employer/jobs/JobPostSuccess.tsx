
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Share2, Eye, BarChart3, Users, Link as LinkIcon, Copy } from "lucide-react";
import { useNavigate, useLocation } from 'react-router-dom';

const JobPostSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { jobData, aiGenerated } = location.state || {};

  const jobUrl = `https://talentxcel.com/jobs/job-123`;

  const quickActions = [
    {
      title: "View Job Post",
      description: "See how your job appears to candidates",
      icon: Eye,
      action: () => navigate('/jobs/job-123'),
      color: "text-blue-600"
    },
    {
      title: "Share Job",
      description: "Share on social media or with your network",
      icon: Share2,
      action: () => {},
      color: "text-green-600"
    },
    {
      title: "View Analytics",
      description: "Track job performance and applications",
      icon: BarChart3,
      action: () => navigate('/jobs/manage/job-123/analytics'),
      color: "text-purple-600"
    },
    {
      title: "Manage Applications",
      description: "Review and manage candidate applications",
      icon: Users,
      action: () => navigate('/jobs/manage/job-123/applicants'),
      color: "text-orange-600"
    }
  ];

  const copyJobUrl = () => {
    navigator.clipboard.writeText(jobUrl);
    // Could show a toast notification here
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Success Header */}
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Job Posted Successfully!</h1>
          <p className="text-gray-600 text-lg">
            Your job posting for <span className="font-semibold">{jobData?.title || "Senior Software Engineer"}</span> is now live
          </p>
        </div>
      </div>

      {/* Job Details Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Job Posting Details</CardTitle>
          <CardDescription>Your job is now visible to candidates</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Job Title</p>
              <p className="text-lg">{jobData?.title || "Senior Software Engineer"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Location</p>
              <p className="text-lg">{jobData?.location || "San Francisco, CA"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Employment Type</p>
              <p className="text-lg capitalize">{jobData?.employmentType?.replace('_', ' ') || "Full-time"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Salary Range</p>
              <p className="text-lg">{jobData?.salary || "₹120,000 - ₹180,000"}</p>
            </div>
          </div>

          {/* Job URL */}
          <div className="border-t pt-4">
            <p className="text-sm font-medium text-gray-500 mb-2">Job URL</p>
            <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
              <LinkIcon className="h-4 w-4 text-gray-400" />
              <code className="flex-1 text-sm text-gray-700">{jobUrl}</code>
              <Button size="sm" variant="outline" onClick={copyJobUrl}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>What's Next?</CardTitle>
          <CardDescription>Manage your job posting and track its performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quickActions.map((action, index) => (
              <div
                key={index}
                onClick={action.action}
                className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <div className="flex items-start space-x-3">
                  <action.icon className={`h-6 w-6 ${action.color}`} />
                  <div>
                    <h3 className="font-semibold text-gray-900">{action.title}</h3>
                    <p className="text-sm text-gray-600">{action.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={() => navigate('/jobs/post')}>
          Post Another Job
        </Button>
        <div className="space-x-3">
          <Button variant="outline" onClick={() => navigate('/jobs/manage')}>
            View All Jobs
          </Button>
          <Button onClick={() => navigate('/employer')} className="bg-blue-600 hover:bg-blue-700">
            Back to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default JobPostSuccess;
