
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Share2, Eye, BarChart3, Users, Link as LinkIcon, Copy } from "lucide-react";
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';

const JobPostSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { jobData, aiGenerated } = location.state || {};

  const jobIdentifier = jobData?.slug || jobData?.seo_slug || jobData?.id || '';
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://talentxcel.in';
  const jobUrl = jobIdentifier ? `${origin}/jobs/${jobIdentifier}` : `${origin}/jobs`;

  const jobTitle = jobData?.job_title || jobData?.title || "Job Posting";
  const jobLocation = [jobData?.location_city, jobData?.location_state].filter(Boolean).join(', ') || jobData?.location || "Remote / On-site";
  const employmentType = (jobData?.employment_type || jobData?.employmentType || "Full-time").replace(/_/g, ' ');

  const formatSalary = () => {
    const min = jobData?.salary_min ?? jobData?.min_salary;
    const max = jobData?.salary_max ?? jobData?.max_salary;
    if (min && max) {
      const formatAmount = (amt: number) => {
        if (amt >= 100000) return `₹${(amt / 100000).toFixed(amt % 100000 === 0 ? 0 : 1)}L`;
        return `₹${amt.toLocaleString()}`;
      };
      return `${formatAmount(min)} - ${formatAmount(max)} / year`;
    }
    if (min) return `₹${(min / 100000).toFixed(1)}L+ / year`;
    if (max) return `Up to ₹${(max / 100000).toFixed(1)}L / year`;
    if (jobData?.salary) return jobData.salary;
    return 'Salary not disclosed / Best in industry';
  };

  const copyJobUrl = () => {
    navigator.clipboard.writeText(jobUrl);
    toast.success('Job link copied to clipboard!');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: jobTitle,
        text: `Check out this opening for ${jobTitle} at ${jobData?.company_name || 'TalentXcel'}!`,
        url: jobUrl,
      }).catch(() => {
        copyJobUrl();
      });
    } else {
      copyJobUrl();
    }
  };

  const quickActions = [
    {
      title: "View Job Post",
      description: "See how your live job appears to candidate pool",
      icon: Eye,
      action: () => navigate(jobIdentifier ? `/jobs/${jobIdentifier}` : '/jobs'),
      color: "text-blue-600"
    },
    {
      title: "Share Job",
      description: "Share on WhatsApp, LinkedIn or with your candidate network",
      icon: Share2,
      action: handleShare,
      color: "text-green-600"
    },
    {
      title: "Employer Dashboard",
      description: "Track candidate match scores and applications",
      icon: BarChart3,
      action: () => navigate('/employer'),
      color: "text-purple-600"
    },
    {
      title: "Manage Candidates",
      description: "Review, filter and shortlist candidate resumes",
      icon: Users,
      action: () => navigate('/employer'),
      color: "text-orange-600"
    }
  ];

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
            Your job posting for <span className="font-semibold text-slate-900">{jobTitle}</span> is now live
          </p>
        </div>
      </div>

      {/* Job Details Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Job Posting Details</CardTitle>
          <CardDescription>Your job is now visible to candidates across TalentXcel</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Job Title</p>
              <p className="text-lg font-semibold text-slate-900">{jobTitle}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Location</p>
              <p className="text-lg font-medium text-slate-800">{jobLocation}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Employment Type</p>
              <p className="text-lg font-medium text-slate-800 capitalize">{employmentType}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Salary Range</p>
              <p className="text-lg font-medium text-slate-800">{formatSalary()}</p>
            </div>
          </div>

          {/* Job URL */}
          <div className="border-t pt-4">
            <p className="text-sm font-medium text-gray-500 mb-2">Live Job URL</p>
            <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg border border-slate-200">
              <LinkIcon className="h-4 w-4 text-gray-400 shrink-0" />
              <code className="flex-1 text-sm text-gray-700 font-mono break-all">{jobUrl}</code>
              <Button size="sm" variant="outline" onClick={copyJobUrl} className="shrink-0 font-semibold">
                <Copy className="h-4 w-4 mr-1.5" /> Copy Link
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>What's Next?</CardTitle>
          <CardDescription>Manage your job posting and track candidate applications</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quickActions.map((action, index) => (
              <div
                key={index}
                onClick={action.action}
                className="p-4 border rounded-xl hover:bg-gray-50 cursor-pointer transition-all hover:border-blue-300"
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
      <div className="flex flex-col sm:flex-row justify-between gap-3 pt-2">
        <Button variant="outline" onClick={() => navigate('/jobs/post')}>
          Post Another Job
        </Button>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => navigate('/jobs')}>
            Browse All Jobs
          </Button>
          <Button onClick={() => navigate('/employer')} className="bg-blue-600 hover:bg-blue-700 text-white font-bold">
            Back to Employer Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default JobPostSuccess;
