
import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { 
  MapPin, 
  DollarSign, 
  Clock, 
  Building2, 
  Users, 
  Calendar,
  ArrowLeft,
  Share2,
  Bookmark,
  Eye,
  TrendingUp
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { formatSalaryRange } from "@/utils/currencyUtils";
import { incrementJobViews } from "@/utils/supabaseHelpers";
import ApplyButton from "@/components/jobs/ApplyButton";

export default function JobDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: job, isLoading, error } = useQuery({
    queryKey: ['job', id],
    queryFn: async () => {
      if (!id) throw new Error('Job ID is required');

      const { data, error } = await supabase
        .from('jobs')
        .select(`
          *,
          companies (
            id,
            name,
            logo_url,
            description,
            website,
            industry,
            size_range,
            location
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id
  });

  // Increment view count when job is loaded
  useEffect(() => {
    if (job?.id) {
      incrementJobViews(job.id).catch(console.error);
    }
  }, [job?.id]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Job Not Found</h1>
        <p className="text-gray-600 mb-4">The job you're looking for doesn't exist or has been removed.</p>
        <Button onClick={() => navigate('/jobs')}>Back to Jobs</Button>
      </div>
    );
  }

  const handleSaveJob = async () => {
    // Implementation for saving job
    toast.success('Job saved to your list!');
  };

  const handleShareJob = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: job.title,
          text: `Check out this job at ${job.companies?.name}: ${job.title}`,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Job link copied to clipboard!');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={() => navigate('/jobs')}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Jobs
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Job Header */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-4">
                    {job.companies?.logo_url && (
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={job.companies.logo_url} alt={job.companies.name} />
                        <AvatarFallback>
                          {job.companies.name?.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div className="flex-1">
                      <h1 className="text-3xl font-bold text-gray-900 mb-2">{job.title}</h1>
                      {job.companies && (
                        <div className="flex items-center space-x-2 text-gray-600 mb-3">
                          <Building2 className="h-4 w-4" />
                          <span className="font-medium">{job.companies.name}</span>
                          {job.companies.industry && (
                            <>
                              <span>•</span>
                              <span>{job.companies.industry}</span>
                            </>
                          )}
                        </div>
                      )}
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          <span>{job.location}</span>
                        </div>
                        {(job.salary_min || job.salary_max) && (
                          <div className="flex items-center">
                            <DollarSign className="h-4 w-4 mr-1" />
                            <span>{formatSalaryRange(job.salary_min, job.salary_max)}</span>
                          </div>
                        )}
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          <span>Posted {formatDistanceToNow(new Date(job.posted_at))} ago</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" onClick={handleShareJob}>
                      <Share2 className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleSaveJob}>
                      <Bookmark className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Job Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {job.employment_type && (
                    <Badge variant="secondary">{job.employment_type}</Badge>
                  )}
                  {job.experience_level && (
                    <Badge variant="outline">{job.experience_level}</Badge>
                  )}
                  {job.is_remote && (
                    <Badge className="bg-green-100 text-green-800">Remote</Badge>
                  )}
                  {job.is_urgent && (
                    <Badge className="bg-red-100 text-red-800">Urgent</Badge>
                  )}
                  {job.is_hiring_fast && (
                    <Badge className="bg-orange-100 text-orange-800">Hiring Fast</Badge>
                  )}
                </div>

                {/* Apply Button */}
                <ApplyButton 
                  job={{
                    id: job.id,
                    title: job.title,
                    companies: job.companies,
                    skills_required: job.skills_required
                  }}
                  size="lg"
                  className="w-full sm:w-auto"
                />
              </CardContent>
            </Card>

            {/* Job Description */}
            <Card>
              <CardHeader>
                <CardTitle>Job Description</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {job.description}
                  </p>
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
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {job.requirements}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Skills Required */}
            {job.skills_required && job.skills_required.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Required Skills</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {job.skills_required.map((skill, index) => (
                      <Badge key={index} variant="outline" className="text-sm">
                        {skill}
                      </Badge>
                    ))}
                  </div>
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {job.benefits.map((benefit, index) => (
                      <div key={index} className="flex items-center text-sm text-gray-700">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-3 flex-shrink-0"></span>
                        {benefit}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Job Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Job Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm text-gray-600">
                    <Eye className="h-4 w-4 mr-2" />
                    Views
                  </div>
                  <span className="font-medium">{job.views_count || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="h-4 w-4 mr-2" />
                    Applications
                  </div>
                  <span className="font-medium">{job.applications_count || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    Posted
                  </div>
                  <span className="font-medium">
                    {formatDistanceToNow(new Date(job.posted_at))} ago
                  </span>
                </div>
                {job.application_deadline && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-600">
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Deadline
                    </div>
                    <span className="font-medium text-red-600">
                      {formatDistanceToNow(new Date(job.application_deadline))} left
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Company Info */}
            {job.companies && (
              <Card>
                <CardHeader>
                  <CardTitle>About {job.companies.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {job.companies.description && (
                    <p className="text-sm text-gray-700 line-clamp-3">
                      {job.companies.description}
                    </p>
                  )}
                  <div className="space-y-2 text-sm">
                    {job.companies.industry && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Industry:</span>
                        <span className="font-medium">{job.companies.industry}</span>
                      </div>
                    )}
                    {job.companies.size_range && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Company Size:</span>
                        <span className="font-medium">{job.companies.size_range}</span>
                      </div>
                    )}
                    {job.companies.location && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Location:</span>
                        <span className="font-medium">{job.companies.location}</span>
                      </div>
                    )}
                  </div>
                  {job.companies.website && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => window.open(job.companies?.website, '_blank')}
                    >
                      Visit Website
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
