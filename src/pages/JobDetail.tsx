import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { 
  MapPin, 
  Building, 
  Calendar, 
  IndianRupee, 
  Users, 
  Clock,
  Share2,
  Bookmark,
  Send,
  ArrowLeft,
  Eye,
  Heart,
  Flag,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Star
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { formatSalaryRange } from '@/utils/currencyUtils';
import { toast } from 'sonner';
import { BrandedFooter } from '@/components/branded/BrandedFooter';
import { updateMetaTags } from '@/utils/metaTags';

const JobDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [hasApplied, setHasApplied] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Get current user
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
    };
    getCurrentUser();
  }, []);

  // Fetch job details
  const { data: job, isLoading, error } = useQuery({
    queryKey: ['job-detail', slug],
    queryFn: async () => {
      if (!slug) throw new Error('No job slug provided');
      
      const { data, error } = await supabase
        .from('jobs')
        .select(`
          *,
          companies (
            name,
            logo_url,
            industry,
            description,
            website_url,
            employee_count,
            founded_year,
            is_verified
          ),
          job_applications (
            id,
            user_id,
            status,
            applied_at
          )
        `)
        .eq('seo_slug', slug)
        .eq('is_active', true)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });

  // Track job view
  useEffect(() => {
    if (job && currentUser) {
      const trackView = async () => {
        await supabase
          .from('job_views')
          .insert({
            job_id: job.id,
            user_id: currentUser.id,
            viewed_at: new Date().toISOString()
          });

        // Update job views count
        await supabase
          .from('jobs')
          .update({ views_count: (job.views_count || 0) + 1 })
          .eq('id', job.id);
      };
      trackView();
    }
  }, [job, currentUser]);

  // Check if user has applied or saved this job
  useEffect(() => {
    if (job && currentUser) {
      const checkUserStatus = async () => {
        // Check if applied
        const { data: application } = await supabase
          .from('job_applications')
          .select('id')
          .eq('job_id', job.id)
          .eq('user_id', currentUser.id)
          .single();

        setHasApplied(!!application);

        // Check if saved
        const { data: saved } = await supabase
          .from('saved_jobs')
          .select('id')
          .eq('job_id', job.id)
          .eq('user_id', currentUser.id)
          .single();

        setIsSaved(!!saved);
      };
      checkUserStatus();
    }
  }, [job, currentUser]);

  // Update meta tags when job loads
  useEffect(() => {
    if (job) {
      updateMetaTags({
        title: `${job.title} at ${job.companies?.name || job.company_name} | TalentXcel Jobs`,
        description: `Apply for ${job.title} position at ${job.companies?.name || job.company_name} in ${job.location}. ${job.description?.substring(0, 150)}...`,
        url: `${window.location.origin}/jobs/${job.seo_slug}`,
        keywords: [
          job.title,
          job.companies?.name || job.company_name,
          job.location,
          'job opportunity',
          'career',
          'hiring'
        ],
        type: 'article',
        image: job.companies?.logo_url || '/logo.png'
      });

      // Add JobPosting structured data
      const jobPostingSchema = {
        "@context": "https://schema.org/",
        "@type": "JobPosting",
        "title": job.title,
        "description": job.description,
        "datePosted": job.posted_at || job.created_at,
        "validThrough": job.expires_at,
        "employmentType": job.employment_type?.toUpperCase(),
        "hiringOrganization": {
          "@type": "Organization",
          "name": job.companies?.name || job.company_name,
          "url": job.companies?.website_url || "#",
          "logo": job.companies?.logo_url
        },
        "jobLocation": {
          "@type": "Place",
          "address": {
            "@type": "PostalAddress",
            "addressLocality": job.location,
            "addressCountry": "IN"
          }
        },
        "baseSalary": job.salary_min || job.salary_max ? {
          "@type": "MonetaryAmount",
          "currency": "INR",
          "value": {
            "@type": "QuantitativeValue",
            "minValue": job.salary_min,
            "maxValue": job.salary_max,
            "unitText": "YEAR"
          }
        } : undefined,
        "url": `${window.location.origin}/jobs/${job.seo_slug}`,
        "applicationContact": {
          "@type": "ContactPoint",
          "url": `${window.location.origin}/jobs/${job.seo_slug}`,
          "contactType": "Application"
        }
      };

      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(jobPostingSchema);
      script.id = 'job-schema';
      
      const existing = document.getElementById('job-schema');
      if (existing) existing.remove();
      
      document.head.appendChild(script);

      return () => {
        const schemaScript = document.getElementById('job-schema');
        if (schemaScript) schemaScript.remove();
      };
    }
  }, [job]);

  // Apply to job mutation
  const applyMutation = useMutation({
    mutationFn: async () => {
      if (!currentUser) throw new Error('Please login to apply');
      if (!job) throw new Error('Job not found');

      const { error } = await supabase
        .from('job_applications')
        .insert({
          job_id: job.id,
          user_id: currentUser.id,
          application_data: {
            applied_via: 'talentxcel',
            source_page: 'job_detail'
          }
        });

      if (error) throw error;
    },
    onSuccess: () => {
      setHasApplied(true);
      toast.success('Application submitted successfully!');
      queryClient.invalidateQueries({ queryKey: ['job-detail', slug] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to apply');
    }
  });

  // Save job mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!currentUser) throw new Error('Please login to save jobs');
      if (!job) throw new Error('Job not found');

      if (isSaved) {
        const { error } = await supabase
          .from('saved_jobs')
          .delete()
          .eq('job_id', job.id)
          .eq('user_id', currentUser.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('saved_jobs')
          .insert({
            job_id: job.id,
            user_id: currentUser.id
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      setIsSaved(!isSaved);
      toast.success(isSaved ? 'Job removed from saved' : 'Job saved successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to save job');
    }
  });

  const handleApply = () => {
    if (!currentUser) {
      toast.error('Please login to apply for jobs');
      return;
    }
    applyMutation.mutate();
  };

  const handleSave = () => {
    if (!currentUser) {
      toast.error('Please login to save jobs');
      return;
    }
    saveMutation.mutate();
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: job?.title,
        text: `Check out this ${job?.title} position at ${job?.companies?.name || job?.company_name}`,
        url: window.location.href,
      });
    } catch (error) {
      // Fallback to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast.success('Job link copied to clipboard');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-12 bg-gray-200 rounded w-3/4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">Job Not Found</h1>
          <p className="text-muted-foreground mb-4">
            The job you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={() => navigate('/jobs')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Jobs
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/jobs')}
            className="p-0 h-auto text-primary hover:text-primary/80"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            All Jobs
          </Button>
          <span>/</span>
          <span>{job.title}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Job Header */}
            <Card>
              <CardHeader>
                <div className="flex items-start gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage 
                      src={job.companies?.logo_url || job.company_logo} 
                      alt={job.companies?.name || job.company_name} 
                    />
                    <AvatarFallback>
                      {(job.companies?.name || job.company_name || 'C').slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h1 className="text-2xl font-bold text-foreground mb-2">{job.title}</h1>
                        <div className="flex items-center gap-2 mb-3">
                          <h2 className="text-lg font-semibold text-primary">
                            {job.companies?.name || job.company_name}
                          </h2>
                          {job.companies?.is_verified && (
                            <Badge className="bg-green-100 text-green-800">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Verified
                            </Badge>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            <span>{job.location}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Building className="h-4 w-4" />
                            <span>{job.employment_type}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>Posted {formatDistanceToNow(new Date(job.posted_at || job.created_at))} ago</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            <span>{job.views_count || 0} views</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleShare}
                        >
                          <Share2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleSave}
                          disabled={saveMutation.isPending}
                        >
                          <Bookmark className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`} />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Job Description */}
            <Card>
              <CardHeader>
                <CardTitle>Job Description</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none">
                <div 
                  dangerouslySetInnerHTML={{ 
                    __html: job.description?.replace(/\n/g, '<br>') || 'No description available' 
                  }} 
                />
              </CardContent>
            </Card>

            {/* Requirements */}
            {job.requirements && (
              <Card>
                <CardHeader>
                  <CardTitle>Requirements</CardTitle>
                </CardHeader>
                <CardContent className="prose prose-sm max-w-none">
                  <div 
                    dangerouslySetInnerHTML={{ 
                      __html: job.requirements.replace(/\n/g, '<br>') 
                    }} 
                  />
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
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Apply Card */}
            <Card>
              <CardHeader>
                <CardTitle>Apply for this position</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {(job.salary_min || job.salary_max) && (
                  <div className="flex items-center gap-2">
                    <IndianRupee className="h-4 w-4 text-green-600" />
                    <span className="font-semibold text-green-600">
                      {formatSalaryRange(job.salary_min, job.salary_max)}
                    </span>
                  </div>
                )}
                
                <div className="space-y-2">
                  <Button
                    className="w-full"
                    onClick={handleApply}
                    disabled={hasApplied || applyMutation.isPending}
                  >
                    {hasApplied ? (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Applied
                      </>
                    ) : applyMutation.isPending ? (
                      'Applying...'
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Apply Now
                      </>
                    )}
                  </Button>
                  
                  {job.external_url && (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => window.open(job.external_url, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Apply on Company Site
                    </Button>
                  )}
                </div>

                {hasApplied && (
                  <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-sm text-green-800">
                      You have already applied for this position. The company will review your application and get back to you.
                    </p>
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
                    <p className="text-sm text-muted-foreground">
                      {job.companies.description}
                    </p>
                  )}
                  
                  <div className="space-y-2 text-sm">
                    {job.companies.industry && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Industry:</span>
                        <span>{job.companies.industry}</span>
                      </div>
                    )}
                    {job.companies.employee_count && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Size:</span>
                        <span>{job.companies.employee_count} employees</span>
                      </div>
                    )}
                    {job.companies.founded_year && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Founded:</span>
                        <span>{job.companies.founded_year}</span>
                      </div>
                    )}
                  </div>

                  {job.companies.website_url && (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => window.open(job.companies.website_url, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Company Website
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Job Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Job Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Applications:</span>
                  <span>{job.applications_count || 0}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Views:</span>
                  <span>{job.views_count || 0}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Posted:</span>
                  <span>{formatDistanceToNow(new Date(job.posted_at || job.created_at))} ago</span>
                </div>
                {job.expires_at && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Expires:</span>
                    <span>{formatDistanceToNow(new Date(job.expires_at))} left</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      <BrandedFooter />
    </div>
  );
};

export default JobDetail;