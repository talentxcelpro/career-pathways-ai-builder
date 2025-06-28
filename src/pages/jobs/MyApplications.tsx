
import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { MapPin, DollarSign, Clock, Eye, Building, FileText } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";
import { formatSalaryRange } from "@/utils/currencyUtils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface JobApplication {
  id: string;
  status: string;
  applied_at: string;
  last_activity_at: string;
  ai_match_score?: number;
  cover_letter?: string;
  resume_url?: string;
  jobs: {
    id: string;
    title: string;
    description: string;
    location: string;
    salary_min?: number;
    salary_max?: number;
    employment_type?: string;
    experience_level?: string;
    is_remote?: boolean;
    is_urgent?: boolean;
    is_hiring_fast?: boolean;
    applications_count?: number;
    companies?: {
      id: string;
      name: string;
      logo_url?: string;
      industry?: string;
    } | null;
  };
}

const MyApplications = () => {
  const navigate = useNavigate();

  const { data: applications = [], isLoading, error } = useQuery({
    queryKey: ['my_applications'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Fix the relationship ambiguity by being more specific with the select
      const { data, error } = await supabase
        .from('job_applications')
        .select(`
          id,
          status,
          applied_at,
          last_activity_at,
          ai_match_score,
          cover_letter,
          resume_url,
          jobs!job_applications_job_id_fkey (
            id,
            title,
            description,
            location,
            salary_min,
            salary_max,
            employment_type,
            experience_level,
            is_remote,
            is_urgent,
            is_hiring_fast,
            applications_count,
            companies (
              id,
              name,
              logo_url,
              industry
            )
          )
        `)
        .eq('user_id', user.id)
        .order('applied_at', { ascending: false });

      if (error) throw error;
      
      // Filter out any applications where the job data failed to load
      const validApplications = data?.filter(app => 
        app.jobs && 
        typeof app.jobs === 'object' && 
        !('error' in app.jobs) &&
        app.jobs !== null &&
        'id' in app.jobs
      ) || [];
      
      return validApplications as JobApplication[];
    },
  });

  if (error) {
    toast.error('Failed to load applications');
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'applied': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'in_review': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'shortlisted': return 'bg-green-100 text-green-700 border-green-200';
      case 'interview_scheduled': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'rejected': return 'bg-red-100 text-red-700 border-red-200';
      case 'withdrawn': return 'bg-gray-100 text-gray-700 border-gray-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case 'applied': return 'Applied';
      case 'in_review': return 'In Review';
      case 'shortlisted': return 'Shortlisted';
      case 'interview_scheduled': return 'Interview Scheduled';
      case 'rejected': return 'Rejected';
      case 'withdrawn': return 'Withdrawn';
      default: return status;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <Card>
                  <CardContent className="p-6">
                    <div className="space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-3 bg-gray-200 rounded w-full"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Applications</h1>
          <p className="text-gray-600">
            Track your job applications and their current status
          </p>
        </div>

        {applications.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No applications yet
              </h3>
              <p className="text-gray-500 mb-4">
                Start applying to jobs to see your applications here.
              </p>
              <Button onClick={() => navigate('/jobs')}>
                Browse Jobs
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {applications.map((application) => (
              <Card 
                key={application.id}
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigate(`/jobs/${application.jobs.id}`)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {application.jobs.companies && (
                          <Avatar className="h-10 w-10">
                            <AvatarImage 
                              src={application.jobs.companies.logo_url || ''} 
                              alt={application.jobs.companies.name} 
                            />
                            <AvatarFallback className="text-sm">
                              {application.jobs.companies.name.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <div>
                          <h3 className="font-semibold text-lg text-gray-900">
                            {application.jobs.title}
                          </h3>
                          {application.jobs.companies && (
                            <p className="text-sm text-gray-600 flex items-center gap-1">
                              <Building className="h-3 w-3" />
                              {application.jobs.companies.name}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Job details */}
                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          <span>{application.jobs.location}</span>
                        </div>
                        {(application.jobs.salary_min || application.jobs.salary_max) && (
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4" />
                            <span>{formatSalaryRange(application.jobs.salary_min, application.jobs.salary_max)}</span>
                          </div>
                        )}
                        {application.jobs.employment_type && (
                          <Badge variant="outline" className="text-xs">
                            {application.jobs.employment_type}
                          </Badge>
                        )}
                      </div>

                      {/* Application details */}
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>Applied {formatDistanceToNow(new Date(application.applied_at))} ago</span>
                        </div>
                        {application.ai_match_score && (
                          <div className="flex items-center gap-1">
                            <span>Match: </span>
                            <span className={`font-medium ${
                              application.ai_match_score >= 80 ? 'text-green-600' : 
                              application.ai_match_score >= 60 ? 'text-yellow-600' : 'text-red-600'
                            }`}>
                              {application.ai_match_score}%
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Job tags */}
                      <div className="flex items-center gap-2 mt-3">
                        {application.jobs.is_remote && (
                          <Badge variant="secondary" className="text-xs">Remote</Badge>
                        )}
                        {application.jobs.is_urgent && (
                          <Badge className="text-xs bg-red-100 text-red-700">Urgent</Badge>
                        )}
                        {application.jobs.is_hiring_fast && (
                          <Badge className="text-xs bg-orange-100 text-orange-700">Hiring Fast</Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <Badge className={`${getStatusColor(application.status)}`}>
                        {getStatusText(application.status)}
                      </Badge>
                      {application.jobs.applications_count && (
                        <div className="text-xs text-gray-500">
                          {application.jobs.applications_count} applicants
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Cover letter preview */}
                  {application.cover_letter && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 line-clamp-2">
                        <span className="font-medium">Cover Letter: </span>
                        {application.cover_letter}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyApplications;
