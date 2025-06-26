
import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { 
  MapPin, 
  Building, 
  Clock, 
  DollarSign, 
  Users, 
  Bookmark, 
  BookmarkCheck,
  Share2,
  Sparkles,
  ExternalLink
} from 'lucide-react';

const JobDetails = () => {
  const { id } = useParams();
  const queryClient = useQueryClient();

  const { data: job, isLoading, error } = useQuery({
    queryKey: ['job', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('jobs')
        .select(`
          *,
          companies (
            name,
            logo_url,
            location,
            description,
            website,
            industry,
            employee_count_range
          )
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    }
  });

  const { data: isJobSaved } = useQuery({
    queryKey: ['is-job-saved', id],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data, error } = await supabase
        .from('saved_jobs')
        .select('id')
        .eq('job_id', id)
        .eq('user_id', user.id)
        .single();
      
      return !!data;
    }
  });

  const { data: hasApplied } = useQuery({
    queryKey: ['has-applied', id],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data, error } = await supabase
        .from('job_applications')
        .select('id')
        .eq('job_id', id)
        .eq('user_id', user.id)
        .single();
      
      return !!data;
    }
  });

  const { data: similarJobs } = useQuery({
    queryKey: ['similar-jobs', job?.title, job?.company_id],
    queryFn: async () => {
      if (!job) return [];

      const { data, error } = await supabase
        .from('jobs')
        .select(`
          *,
          companies (name, logo_url)
        `)
        .neq('id', id)
        .eq('is_active', true)
        .or(`title.ilike.%${job.title}%,company_id.eq.${job.company_id}`)
        .limit(3);
      
      if (error) throw error;
      return data;
    },
    enabled: !!job
  });

  const saveJobMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      if (isJobSaved) {
        const { error } = await supabase
          .from('saved_jobs')
          .delete()
          .eq('job_id', id)
          .eq('user_id', user.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('saved_jobs')
          .insert({
            job_id: id,
            user_id: user.id
          });
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['is-job-saved', id] });
      toast.success(isJobSaved ? 'Job removed from saved' : 'Job saved successfully');
    },
    onError: (error) => {
      console.error('Save job error:', error);
      toast.error('Failed to save job');
    }
  });

  // Track job view
  useEffect(() => {
    if (id) {
      supabase.rpc('increment_job_views', { job_id: id });
      
      // Track individual view
      supabase.from('job_views').insert({
        job_id: id,
        user_agent: navigator.userAgent,
        referrer: document.referrer
      });
    }
  }, [id]);

  if (isLoading) return <div>Loading...</div>;
  if (error || !job) return <div>Job not found</div>;

  const company = job.companies;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Job Header */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  {company?.logo_url && (
                    <img
                      src={company.logo_url}
                      alt={company.name}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                  )}
                  <div>
                    <CardTitle className="text-2xl">{job.title}</CardTitle>
                    <CardDescription className="flex items-center gap-2 text-lg">
                      <Building className="h-4 w-4" />
                      {company?.name}
                    </CardDescription>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {job.location}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {job.employment_type}
                      </div>
                      {job.is_remote && (
                        <Badge variant="secondary">Remote</Badge>
                      )}
                    </div>
                  </div>
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => saveJobMutation.mutate()}
                  disabled={saveJobMutation.isPending}
                >
                  {isJobSaved ? (
                    <BookmarkCheck className="h-4 w-4" />
                  ) : (
                    <Bookmark className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </CardHeader>
          </Card>

          {/* Job Description */}
          <Card>
            <CardHeader>
              <CardTitle>Job Description</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <div dangerouslySetInnerHTML={{ __html: job.description.replace(/\n/g, '<br />') }} />
            </CardContent>
          </Card>

          {/* Requirements */}
          {job.requirements && (
            <Card>
              <CardHeader>
                <CardTitle>Requirements</CardTitle>
              </CardHeader>
              <CardContent className="prose max-w-none">
                <div dangerouslySetInnerHTML={{ __html: job.requirements.replace(/\n/g, '<br />') }} />
              </CardContent>
            </Card>
          )}

          {/* Skills */}
          {job.skills_required && job.skills_required.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Required Skills</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {job.skills_required.map((skill: string, index: number) => (
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
                <ul className="list-disc list-inside space-y-1">
                  {job.benefits.map((benefit: string, index: number) => (
                    <li key={index}>{benefit}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Apply Section */}
          <Card>
            <CardHeader>
              <CardTitle>Apply for this job</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {hasApplied ? (
                <div className="text-center py-4">
                  <Badge variant="default" className="mb-2">Already Applied</Badge>
                  <p className="text-sm text-gray-600">
                    You have already applied for this position
                  </p>
                </div>
              ) : (
                <>
                  <Button asChild className="w-full" size="lg">
                    <Link to={`/jobs/${id}/smart-apply`}>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Smart Apply
                    </Link>
                  </Button>
                  
                  <Button asChild variant="outline" className="w-full">
                    <Link to={`/jobs/${id}/apply`}>
                      Manual Apply
                    </Link>
                  </Button>
                </>
              )}
              
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigator.share?.({ 
                  title: job.title, 
                  url: window.location.href 
                }) || navigator.clipboard.writeText(window.location.href)}
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share Job
              </Button>
            </CardContent>
          </Card>

          {/* Job Details */}
          <Card>
            <CardHeader>
              <CardTitle>Job Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {(job.salary_min || job.salary_max) && (
                <div>
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <DollarSign className="h-4 w-4" />
                    Salary Range
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    ${job.salary_min?.toLocaleString() || '0'} - ${job.salary_max?.toLocaleString() || 'Not specified'}
                  </p>
                </div>
              )}

              <div>
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Users className="h-4 w-4" />
                  Experience Level
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {job.experience_level || 'Not specified'}
                </p>
              </div>

              <div>
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Clock className="h-4 w-4" />
                  Posted
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {new Date(job.posted_at || job.created_at).toLocaleDateString()}
                </p>
              </div>

              {job.application_deadline && (
                <div>
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Clock className="h-4 w-4" />
                    Application Deadline
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {new Date(job.application_deadline).toLocaleDateString()}
                  </p>
                </div>
              )}

              <div>
                <div className="text-sm font-medium">Job Views</div>
                <p className="text-sm text-gray-600 mt-1">
                  {job.views_count || 0} views
                </p>
              </div>

              <div>
                <div className="text-sm font-medium">Applications</div>
                <p className="text-sm text-gray-600 mt-1">
                  {job.applications_count || 0} applications
                </p>
              </div>

              {job.external_url && (
                <Button asChild variant="outline" className="w-full">
                  <a href={job.external_url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View on Company Site
                  </a>
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Company Info */}
          {company && (
            <Card>
              <CardHeader>
                <CardTitle>About {company.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {company.description && (
                  <p className="text-sm text-gray-600 line-clamp-4">
                    {company.description}
                  </p>
                )}

                <div className="space-y-2 text-sm">
                  {company.industry && (
                    <div>
                      <span className="font-medium">Industry:</span> {company.industry}
                    </div>
                  )}
                  
                  {company.employee_count_range && (
                    <div>
                      <span className="font-medium">Company Size:</span> {company.employee_count_range}
                    </div>
                  )}

                  {company.location && (
                    <div>
                      <span className="font-medium">Location:</span> {company.location}
                    </div>
                  )}
                </div>

                <Button asChild variant="outline" className="w-full">
                  <Link to={`/companies/${job.company_id}`}>
                    View Company Profile
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Similar Jobs */}
      {similarJobs && similarJobs.length > 0 && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Similar Jobs</CardTitle>
            <CardDescription>Other opportunities you might be interested in</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {similarJobs.map((similarJob: any) => (
                <Card key={similarJob.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      {similarJob.companies?.logo_url && (
                        <img
                          src={similarJob.companies.logo_url}
                          alt={similarJob.companies.name}
                          className="w-10 h-10 rounded object-cover"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm line-clamp-2">
                          {similarJob.title}
                        </h4>
                        <p className="text-xs text-gray-600">
                          {similarJob.companies?.name}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {similarJob.location}
                        </p>
                        <Button asChild variant="outline" size="sm" className="mt-2 w-full">
                          <Link to={`/jobs/${similarJob.id}`}>
                            View Details
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default JobDetails;
