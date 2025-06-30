
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  MapPin, 
  Calendar, 
  Briefcase, 
  DollarSign, 
  Clock, 
  Users,
  Building2,
  Share2
} from "lucide-react";
import JobApplicationModal from "@/components/jobs/JobApplicationModal";
import { useAuth } from '@/contexts/AuthContext';
import { toast } from "sonner";

const JobDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showApplicationModal, setShowApplicationModal] = useState(false);

  const { data: job, isLoading, error } = useQuery({
    queryKey: ['job-detail', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('jobs')
        .select(`
          *,
          companies(
            id,
            name,
            logo_url,
            website,
            description,
            location,
            industry
          )
        `)
        .eq('id', id)
        .eq('is_active', true)
        .single();
      
      if (error) throw error;
      
      // Increment view count
      await supabase.rpc('increment_job_views', { job_id: id });
      
      return data;
    }
  });

  const handleApplyClick = () => {
    if (!user) {
      toast.info('Please sign in to apply for this job');
      navigate('/auth/login', { state: { returnTo: `/jobs/${id}` } });
      return;
    }
    setShowApplicationModal(true);
  };

  const handleShareJob = async () => {
    const url = `${window.location.origin}/jobs/${id}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Job URL copied to clipboard!');
    } catch (err) {
      toast.error('Failed to copy URL');
    }
  };

  const formatSalary = (min?: number, max?: number, currency = 'INR') => {
    if (!min && !max) return 'Salary not disclosed';
    if (min && max) return `${currency} ${min.toLocaleString()} - ${max.toLocaleString()}`;
    if (min) return `${currency} ${min.toLocaleString()}+`;
    return `Up to ${currency} ${max?.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-2/3"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Job not found</h1>
          <p className="text-gray-600 mb-6">The job you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => navigate('/jobs')}>Browse All Jobs</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              {job.companies?.logo_url && (
                <img 
                  src={job.companies.logo_url} 
                  alt={job.companies.name}
                  className="w-16 h-16 rounded-lg object-cover"
                />
              )}
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{job.title}</h1>
                <p className="text-xl text-gray-600">{job.companies?.name}</p>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span>{job.location}</span>
              </div>
              <div className="flex items-center gap-1">
                <Briefcase className="h-4 w-4" />
                <span className="capitalize">{job.employment_type?.replace('_', ' ')}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>Posted {formatDate(job.posted_at)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{job.applications_count || 0} applicants</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={handleShareJob}>
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button onClick={handleApplyClick} size="lg" className="bg-blue-600 hover:bg-blue-700">
              Apply Now
            </Button>
          </div>
        </div>

        {/* Job Details Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Job Description */}
            <Card>
              <CardHeader>
                <CardTitle>Job Description</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <div dangerouslySetInnerHTML={{ __html: job.description.replace(/\n/g, '<br>') }} />
                </div>
              </CardContent>
            </Card>

            {/* Requirements */}
            {job.requirements && (
              <Card>
                <CardHeader>
                  <CardTitle>Requirements</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose max-w-none">
                    <div dangerouslySetInnerHTML={{ __html: job.requirements.replace(/\n/g, '<br>') }} />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Skills Required */}
            {job.skills_required && job.skills_required.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Skills Required</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {job.skills_required.map((skill: string) => (
                      <Badge key={skill} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            {/* Job Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Job Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Salary</span>
                  <span className="font-medium">{formatSalary(job.salary_min, job.salary_max, job.salary_currency)}</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Experience</span>
                  <span className="font-medium capitalize">{job.experience_level?.replace('_', ' ') || 'Not specified'}</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Job Type</span>
                  <span className="font-medium capitalize">{job.employment_type?.replace('_', ' ')}</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Remote</span>
                  <span className="font-medium">{job.is_remote ? 'Yes' : 'No'}</span>
                </div>
                {job.application_deadline && (
                  <>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Deadline</span>
                      <span className="font-medium">{formatDate(job.application_deadline)}</span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Company Info */}
            {job.companies && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    About {job.companies.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {job.companies.description && (
                    <p className="text-sm text-gray-600">{job.companies.description}</p>
                  )}
                  {job.companies.industry && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Industry</span>
                      <span className="font-medium">{job.companies.industry}</span>
                    </div>
                  )}
                  {job.companies.website && (
                    <div className="pt-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => window.open(job.companies.website, '_blank')}
                        className="w-full"
                      >
                        Visit Company Website
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Benefits */}
            {job.benefits && job.benefits.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Benefits</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {job.benefits.map((benefit: string) => (
                      <li key={benefit} className="text-sm text-gray-600 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Bottom Apply Button */}
        <div className="sticky bottom-0 bg-white border-t p-4 -mx-4">
          <div className="max-w-4xl mx-auto flex justify-center">
            <Button onClick={handleApplyClick} size="lg" className="bg-blue-600 hover:bg-blue-700 px-8">
              Apply for this Position
            </Button>
          </div>
        </div>
      </div>

      {/* Application Modal */}
      {showApplicationModal && (
        <JobApplicationModal
          open={showApplicationModal}
          onOpenChange={setShowApplicationModal}
          job={job}
        />
      )}
    </div>
  );
};

export default JobDetail;
