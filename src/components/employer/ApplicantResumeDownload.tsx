
import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, FileText, Mail, Phone, MapPin, Calendar, Star } from "lucide-react";
import { toast } from "sonner";

interface ApplicantData {
  id: string;
  status: string;
  applied_at: string;
  ai_match_score?: number;
  resume_url?: string;
  cover_letter?: string;
  application_data?: any;
  profiles: {
    full_name: string;
    email: string;
    phone?: string;
    profile_picture_url?: string;
    title?: string;
    location?: string;
    experience_years?: number;
    skills?: string[];
  } | null;
}

interface ApplicantResumeDownloadProps {
  applicant: ApplicantData;
  jobTitle: string;
}

export const ApplicantResumeDownload: React.FC<ApplicantResumeDownloadProps> = ({ 
  applicant, 
  jobTitle 
}) => {
  const downloadResume = async () => {
    if (!applicant.resume_url) {
      toast.error('Resume not available for download');
      return;
    }

    try {
      const response = await fetch(applicant.resume_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${applicant.profiles?.full_name || 'applicant'}_resume.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Resume downloaded successfully');
    } catch (error) {
      toast.error('Failed to download resume');
    }
  };

  const downloadApplicationData = () => {
    const applicationInfo = {
      applicant_name: applicant.profiles?.full_name,
      email: applicant.profiles?.email,
      phone: applicant.profiles?.phone,
      location: applicant.profiles?.location,
      job_title: jobTitle,
      application_status: applicant.status,
      applied_date: applicant.applied_at,
      ai_match_score: applicant.ai_match_score,
      experience_years: applicant.profiles?.experience_years,
      skills: applicant.profiles?.skills,
      ...applicant.application_data
    };

    const dataStr = JSON.stringify(applicationInfo, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${applicant.profiles?.full_name || 'applicant'}_application_data.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Application data downloaded successfully');
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'applied': { color: 'bg-blue-100 text-blue-800', label: 'Applied' },
      'reviewing': { color: 'bg-yellow-100 text-yellow-800', label: 'Reviewing' },
      'shortlisted': { color: 'bg-purple-100 text-purple-800', label: 'Shortlisted' },
      'interview_scheduled': { color: 'bg-orange-100 text-orange-800', label: 'Interview Scheduled' },
      'interviewed': { color: 'bg-indigo-100 text-indigo-800', label: 'Interviewed' },
      'offered': { color: 'bg-green-100 text-green-800', label: 'Offered' },
      'hired': { color: 'bg-emerald-100 text-emerald-800', label: 'Hired' },
      'rejected': { color: 'bg-red-100 text-red-800', label: 'Rejected' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.applied;
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
              {applicant.profiles?.profile_picture_url ? (
                <img 
                  src={applicant.profiles.profile_picture_url} 
                  alt={applicant.profiles.full_name || 'Profile'}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <FileText className="h-6 w-6 text-gray-400" />
              )}
            </div>
            <div>
              <CardTitle className="text-lg">
                {applicant.profiles?.full_name || 'Unknown Applicant'}
              </CardTitle>
              <CardDescription>
                {applicant.profiles?.title || 'No title provided'}
              </CardDescription>
            </div>
          </div>
          {getStatusBadge(applicant.status)}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Contact Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          {applicant.profiles?.email && (
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-gray-400" />
              <span>{applicant.profiles.email}</span>
            </div>
          )}
          {applicant.profiles?.phone && (
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-gray-400" />
              <span>{applicant.profiles.phone}</span>
            </div>
          )}
          {applicant.profiles?.location && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-gray-400" />
              <span>{applicant.profiles.location}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-400" />
            <span>Applied {new Date(applicant.applied_at).toLocaleDateString()}</span>
          </div>
        </div>

        {/* AI Match Score */}
        {applicant.ai_match_score && (
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4 text-yellow-500" />
            <span className="text-sm font-medium">
              AI Match Score: {Math.round(applicant.ai_match_score * 100)}%
            </span>
          </div>
        )}

        {/* Experience and Skills */}
        {applicant.profiles?.experience_years !== undefined && (
          <div className="text-sm">
            <span className="font-medium">Experience: </span>
            <span>{applicant.profiles.experience_years} years</span>
          </div>
        )}

        {applicant.profiles?.skills && applicant.profiles.skills.length > 0 && (
          <div>
            <p className="text-sm font-medium mb-2">Skills:</p>
            <div className="flex flex-wrap gap-1">
              {applicant.profiles.skills.slice(0, 5).map((skill: string) => (
                <Badge key={skill} variant="outline" className="text-xs">
                  {skill}
                </Badge>
              ))}
              {applicant.profiles.skills.length > 5 && (
                <Badge variant="outline" className="text-xs">
                  +{applicant.profiles.skills.length - 5} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Download Actions */}
        <div className="flex flex-wrap gap-2 pt-4 border-t">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={downloadResume}
            disabled={!applicant.resume_url}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Download Resume
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={downloadApplicationData}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Download Application Data
          </Button>
          {applicant.profiles?.email && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => window.open(`mailto:${applicant.profiles.email}`)}
              className="flex items-center gap-2"
            >
              <Mail className="h-4 w-4" />
              Send Email
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
