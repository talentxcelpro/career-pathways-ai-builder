
import React from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

import { ApplicantHeader } from "@/components/jobs/ApplicantHeader";
import { CandidateProfileCard } from "@/components/jobs/CandidateProfileCard";
import { ContactInformation } from "@/components/jobs/ContactInformation";
import { SkillsCard } from "@/components/jobs/SkillsCard";
import { JobInformationCard } from "@/components/jobs/JobInformationCard";
import { ResumeCard } from "@/components/jobs/ResumeCard";
import { AboutCard } from "@/components/jobs/AboutCard";

const ApplicantDetail = () => {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();

  const { data: application, isLoading } = useQuery({
    queryKey: ['jobApplication', id],
    queryFn: async () => {
      if (!id) throw new Error('Application ID is required');

      const { data, error } = await supabase
        .from('job_applications')
        .select(`
          *,
          jobs!job_applications_job_id_fkey (
            id,
            title,
            company_id,
            companies (
              name,
              logo_url
            )
          ),
          profiles (
            id,
            full_name,
            email,
            phone,
            location,
            title,
            about,
            skills,
            experience_years,
            profile_picture_url,
            linkedin_url,
            github_url,
            portfolio_url,
            resume_url
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    }
  });

  const updateApplicationMutation = useMutation({
    mutationFn: async ({ status }: { status: string }) => {
      const { error } = await supabase
        .from('job_applications')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobApplication', id] });
      toast.success('Application status updated');
    },
    onError: () => {
      toast.error('Failed to update application status');
    }
  });

  const handleStatusChange = (status: string) => {
    updateApplicationMutation.mutate({ status });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-300 rounded w-1/3"></div>
            <div className="h-64 bg-gray-300 rounded"></div>
            <div className="h-96 bg-gray-300 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <Card>
            <CardContent className="p-12 text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Application not found</h3>
              <p className="text-gray-600">This application may have been deleted.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ApplicantHeader
          status={application.status}
          onStatusChange={handleStatusChange}
          isUpdating={updateApplicationMutation.isPending}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Candidate Profile */}
          <div className="lg:col-span-1 space-y-6">
            <CandidateProfileCard
              profile={application.profiles}
              matchScore={application.ai_match_score}
            />

            <ContactInformation profile={application.profiles} />

            <SkillsCard skills={application.profiles?.skills || []} />
          </div>

          {/* Right Column - Application Details */}
          <div className="lg:col-span-2 space-y-6">
            <JobInformationCard
              job={application.jobs}
              appliedAt={application.applied_at}
              coverLetter={application.cover_letter}
            />

            <ResumeCard
              resumeUrl={application.resume_url}
              profileResumeUrl={application.profiles?.resume_url}
            />

            <AboutCard about={application.profiles?.about} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicantDetail;
