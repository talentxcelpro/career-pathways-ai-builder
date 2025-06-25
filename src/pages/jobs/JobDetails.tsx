import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { 
  MapPin, 
  DollarSign, 
  Clock, 
  Users, 
  Heart, 
  Share2, 
  Building2,
  Calendar,
  Eye,
  ExternalLink,
  Briefcase,
  GraduationCap,
  Star
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { incrementJobViews } from "@/utils/supabaseHelpers";

export default function JobDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isSaved, setIsSaved] = useState(false);

  // Fetch job details
  const { data: job, isLoading } = useQuery({
    queryKey: ['job', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('jobs')
        .select(`
          *,
          companies (
            id,
            name,
            logo_url,
            website,
            location,
            industry,
            size_range,
            description,
            culture_description,
            benefits,
            tech_stack
          ),
          job_categories (
            name,
            slug
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id
  });

  // Check if job is saved
  useEffect(() => {
    const checkSavedStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !id) return;

      const { data } = await supabase
        .from('saved_jobs')
        .select('id')
        .eq('user_id', user.id)
        .eq('job_id', id)
        .single();

      setIsSaved(!!data);
    };

    checkSavedStatus();
  }, [id]);

  // Track job view
  useEffect(() => {
    const trackView = async () => {
      if (!id) return;

      const { data: { user } } = await supabase.auth.getUser();
      
      await supabase.from('job_views').insert({
        job_id: id,
        user_id: user?.id,
        ip_address: null,
        user_agent: navigator.userAgent,
        referrer: document.referrer
      });

      // Update view count
      try {
        await incrementJobViews(id);
      } catch (error) {
        console.log('Failed to increment job views:', error);
      }
    };

    trackView();
  }, [id]);

  // Save/unsave job mutation
  const saveJobMutation = useMutation({
    mutationFn: async (jobId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      if (isSaved) {
        const { error } = await supabase
          .from('saved_jobs')
          .delete()
          .eq('user_id', user.id)
          .eq('job_id', jobId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('saved_jobs')
          .insert({
            user_id: user.id,
            job_id: jobId
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      setIsSaved(!isSaved);
      toast.success(isSaved ? 'Job removed from saved' : 'Job saved successfully');
    },
    onError: (error) => {
      toast.error('Failed to save job');
      console.error('Save job error:', error);
    }
  });

  const handleApply = () => {
    if (job?.external_url) {
      window.open(job.external_url, '_blank');
    } else {
      navigate(`/jobs/${id}/apply`);
    }
  };

  const handleSave = () => {
    if (id) {
      saveJobMutation.mutate(id);
    }
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: job?.title,
        text: `Check out this job opportunity: ${job?.title} at ${job?.companies?.name}`,
        url: window.location.href
      });
    } catch (error) {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard');
    }
  };

  const formatSalary = () => {
    if (job?.salary_min && job?.salary_max) {
      return `$${job.salary_min.toLocaleString()} - $${job.salary_max.toLocaleString()}`;
    }
    if (job?.salary_min) {
      return `$${job.salary_min.toLocaleString()}+`;
    }
    return 'Salary not specified';
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Job Not Found</h1>
        <p className="text-gray-600 mb-4">The job you're looking for doesn't exist or has been removed.</p>
        <Button onClick={() => navigate('/jobs')}>Back to Jobs</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Job Header */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  {job.companies?.logo_url && (
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={job.companies.logo_url} alt={job.companies.name} />
                      <AvatarFallback className="text-lg">
                        {job.companies.name?.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {job.is_featured && (
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                          Featured
                        </Badge>
                      )}
                      {job.is_remote && (
                        <Badge variant="outline">Remote</Badge>
                      )}
                      {job.job_categories && (
                        <Badge variant="outline">{job.job_categories.name}</Badge>
                      )}
                    </div>
                    <CardTitle className="text-2xl mb-2">{job.title}</CardTitle>
                    <div className="flex items-center space-x-4 text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Building2 className="h-4 w-4" />
                        <span className="font-medium">{job.companies?.name}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-4 w-4" />
                        <span>{job.location}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <DollarSign className="h-4 w-4" />
                        <span>{formatSalary()}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={handleShare}>
                    <Share2 className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleSave}
                    className={isSaved ? 'text-red-500' : ''}
                  >
                    <Heart className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`} />
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Job Details */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Job Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {job.employment_type && (
                  <div className="flex items-center space-x-2">
                    <Briefcase className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-xs text-gray-500">Employment Type</p>
                      <p className="font-medium">{job.employment_type}</p>
                    </div>
                  </div>
                )}
                {job.experience_level && (
                  <div className="flex items-center space-x-2">
                    <GraduationCap className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-xs text-gray-500">Experience Level</p>
                      <p className="font-medium">{job.experience_level}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <Eye className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-500">Views</p>
                    <p className="font-medium">{job.views_count || 0}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-500">Applicants</p>
                    <p className="font-medium">{job.applications_count || 0}</p>
                  </div>
                </div>
              </div>

              {job.application_deadline && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 text-yellow-800">
                    <Calendar className="h-4 w-4" />
                    <span className="font-medium">
                      Application deadline: {new Date(job.application_deadline).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Job Description */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>About this role</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <p className="whitespace-pre-wrap">{job.description}</p>
              </div>
            </CardContent>
          </Card>

          {/* Requirements */}
          {job.requirements && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <p className="whitespace-pre-wrap">{job.requirements}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Skills */}
          {job.skills_required && job.skills_required.length > 0 && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Required Skills</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {job.skills_required.map((skill, index) => (
                    <Badge key={index} variant="secondary">
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
                <div className="flex flex-wrap gap-2">
                  {job.benefits.map((benefit, index) => (
                    <Badge key={index} variant="outline">
                      {benefit}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Apply Card */}
          <Card>
            <CardContent className="p-6">
              <Button onClick={handleApply} size="lg" className="w-full mb-4">
                {job.external_url ? (
                  <>
                    Apply on Company Site
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </>
                ) : (
                  'Apply Now'
                )}
              </Button>
              <div className="text-center text-sm text-gray-500">
                Posted {formatDistanceToNow(new Date(job.posted_at || job.created_at))} ago
              </div>
            </CardContent>
          </Card>

          {/* Company Info */}
          {job.companies && (
            <Card>
              <CardHeader>
                <CardTitle>About {job.companies.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={job.companies.logo_url} alt={job.companies.name} />
                    <AvatarFallback>
                      {job.companies.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium">{job.companies.name}</h3>
                    {job.companies.industry && (
                      <p className="text-sm text-gray-500">{job.companies.industry}</p>
                    )}
                  </div>
                </div>

                {job.companies.description && (
                  <p className="text-sm text-gray-600">{job.companies.description}</p>
                )}

                <div className="space-y-2 text-sm">
                  {job.companies.size_range && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Company size:</span>
                      <span>{job.companies.size_range}</span>
                    </div>
                  )}
                  {job.companies.location && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Headquarters:</span>
                      <span>{job.companies.location}</span>
                    </div>
                  )}
                </div>

                {job.companies.website && (
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => window.open(job.companies.website, '_blank')}
                  >
                    Visit Company Website
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {/* Tech Stack */}
          {job.companies?.tech_stack && job.companies.tech_stack.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Tech Stack</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {job.companies.tech_stack.map((tech, index) => (
                    <Badge key={index} variant="outline">
                      {tech}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
