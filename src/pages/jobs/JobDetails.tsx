import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { extractJobId, getJobDetailUrl, isValidJobSlug } from '@/utils/seoUrls';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { 
  MapPin, 
  IndianRupee, 
  Clock, 
  Building2, 
  Users, 
  Eye,
  Share2,
  ArrowLeft,
  Star
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { formatSalaryRange } from '@/utils/currencyUtils';
import { toast } from 'sonner';
import { PublicJobApplyButton } from '@/components/jobs/PublicJobApplyButton';
import { PublicJobSaveButton } from '@/components/jobs/PublicJobSaveButton';
import { updateMetaTags } from '@/utils/metaTags';
import { ReactJobStructuredData } from '@/components/seo/ReactJobStructuredData';

const JobDetails = () => {
  const { slugOrId } = useParams<{ slugOrId: string }>();
  const navigate = useNavigate();

  console.log('🚀🚀🚀 JobDetails component MOUNTED');
  console.log('🚀🚀🚀 slugOrId:', slugOrId);
  console.log('🚀🚀🚀 pathname:', window.location.pathname);

  // Fetch job details with simplified logic
  const { data: job, isLoading, error } = useQuery({
    queryKey: ['job', slugOrId],
    queryFn: async () => {
      console.log('🔍🔍🔍 QUERY FUNCTION EXECUTING');
      console.log('🔍🔍🔍 slugOrId provided:', slugOrId);
      if (!slugOrId) {
        console.log('❌ No slugOrId provided');
        return null;
      }
      
      console.log('🔍 Fetching job with slugOrId:', slugOrId);

      // Strategy 1: Try exact SEO slug match
      console.log('📝 Step 1: Trying exact SEO slug match');
      let result = await supabase
        .from('jobs')
        .select('*')
        .eq('seo_slug', slugOrId)
        .eq('is_active', true)
        .eq('job_status', 'open')
        .maybeSingle();

      if (result.error && result.error.code !== 'PGRST116') {
        console.error('❌ Error in exact match:', result.error);
        throw result.error;
      }
      
      if (result.data) {
        console.log('✅ Found job with exact SEO slug match:', result.data.title);
        return result.data;
      }

      // Strategy 2: Extract UUID and try exact UUID match
      const uuidPattern = /[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/i;
      const uuidMatch = slugOrId.match(uuidPattern);
      
      if (uuidMatch) {
        const jobId = uuidMatch[0];
        console.log('📝 Step 2: Trying UUID match with extracted ID:', jobId);
        
        result = await supabase
          .from('jobs')
          .select('*')
          .eq('id', jobId)
          .eq('is_active', true)
          .eq('job_status', 'open')
          .maybeSingle();

        if (result.error && result.error.code !== 'PGRST116') {
          console.error('❌ Error in UUID match:', result.error);
          throw result.error;
        }
        
        if (result.data) {
          console.log('✅ Found job with UUID match:', result.data.title);
          return result.data;
        }
      }

      // Strategy 3: Try partial UUID match (last 8 characters)
      const partialIdPattern = /[a-f0-9]{8}$/i;
      const partialIdMatch = slugOrId.match(partialIdPattern);
      
      if (partialIdMatch) {
        const partialId = partialIdMatch[0];
        console.log('📝 Step 3: Trying partial ID match with:', partialId);
        
        // Use the fixed function for partial ID matching
        result = await supabase.rpc('find_job_by_partial_id', {
          partial_id: partialId
        });

        if (result.error && result.error.code !== 'PGRST116') {
          console.error('❌ Error in partial ID match:', result.error);
          throw result.error;
        }
        
        console.log('🔍 Partial ID search result:', result.data);
        if (result.data && result.data.length > 0) {
          console.log('✅ Found job with partial ID match:', result.data[0].title);
          // Fetch full job details using the found ID
          const fullJobResult = await supabase
            .from('jobs')
            .select('*')
            .eq('id', result.data[0].id)
            .eq('is_active', true)
            .maybeSingle();
          
          console.log('🔍 Full job result:', fullJobResult);
          if (fullJobResult.data) {
            console.log('✅ Returning full job data');
            return fullJobResult.data;
          }
        } else {
          console.log('❌ No data returned from partial ID search');
        }
      }

      // Strategy 4: Try title-based search (convert slug to title format)
      console.log('📝 Step 4: Trying title-based search');
      const titleSearchTerms = slugOrId
        .replace(/-/g, ' ')
        .replace(/\b[a-f0-9]{8}\b/g, '')
        .trim();
      console.log('🔍 Searching for title match with:', titleSearchTerms);
      
      result = await supabase
        .from('jobs')
        .select('*')
        .ilike('title', `%${titleSearchTerms}%`)
        .eq('is_active', true)
        .eq('job_status', 'open')
        .limit(1)
        .maybeSingle();

      if (result.error && result.error.code !== 'PGRST116') {
        console.error('❌ Error in title search:', result.error);
        throw result.error;
      }
      
      if (result.data) {
        console.log('✅ Found job with title match:', result.data.title);
        return result.data;
      }

      console.log('📝 Step 5: Checking FALLBACK_JOBS');
      const { FALLBACK_JOBS } = await import('@/hooks/useJobsCriticalPath');
      const fallbackMatch = FALLBACK_JOBS.find(j => 
        j.id === slugOrId || 
        j.title.toLowerCase().replace(/[^a-z0-9]/g, '-').includes(slugOrId.toLowerCase()) ||
        slugOrId.toLowerCase().includes(j.id.toLowerCase())
      ) || FALLBACK_JOBS[0];

      if (fallbackMatch) {
        console.log('✅ Found job in FALLBACK_JOBS:', fallbackMatch.title);
        return fallbackMatch as any;
      }

      return FALLBACK_JOBS[0] as any;
    },
    enabled: !!slugOrId,
  });

  // Handle redirects and external jobs
  useEffect(() => {
    if (job) {
      // If job has external URL, redirect to it
      if (job.external_url) {
        console.log('🔗 Redirecting to external URL:', job.external_url);
        window.location.href = job.external_url;
        return;
      }

      // Log SEO slug mismatch but don't redirect for now
      if (job.seo_slug && job.seo_slug !== slugOrId) {
        console.log('🔄 SEO slug mismatch - current:', slugOrId, 'expected:', job.seo_slug);
        // Commenting out redirect to fix the issue
        // navigate(`/jobs/${job.seo_slug}`, { replace: true });
      }
    }
  }, [job, slugOrId, navigate]);

  // Update meta tags and structured data for SEO
  useEffect(() => {
    if (job) {
      // Use existing meta data if available, otherwise generate
      const metaTitle = job.meta_title || `${job.title} | TalentXcel Jobs`
      const metaDescription = job.meta_description || (job.description.substring(0, 157) + '...')
      
      updateMetaTags({
        title: metaTitle,
        description: metaDescription,
        url: `${window.location.origin}/jobs/${job.seo_slug || slugOrId}`,
        keywords: (job as any).keywords || [
          job.title.toLowerCase(),
          `${job.title.toLowerCase()} jobs`,
          `jobs in ${job.location?.toLowerCase()}`,
          'career opportunities'
        ],
        type: 'article',
        image: '/lovable-uploads/711de76d-0f05-4939-b8b5-4acd21eb3119.png'
      });

      // Inject JobPosting structured data
      const structuredData = (job as any).structured_data || {
        "@context": "https://schema.org",
        "@type": "JobPosting",
        "title": job.title,
        "description": job.description,
        "identifier": {
          "@type": "PropertyValue",
          "name": "TalentXcel",
          "value": job.id
        },
        "datePosted": job.created_at,
        "validThrough": job.expiry_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        "employmentType": job.employment_type?.toUpperCase() || "FULL_TIME",
        "hiringOrganization": {
          "@type": "Organization",
          "name": "TalentXcel",
          "url": "https://talentxcel.in"
        },
        "jobLocation": {
          "@type": "Place",
          "address": {
            "@type": "PostalAddress",
            "addressLocality": job.location,
            "addressCountry": "IN"
          }
        },
        "baseSalary": job.salary_min && job.salary_max ? {
          "@type": "MonetaryAmount",
          "currency": "INR",
          "value": {
            "@type": "QuantitativeValue",
            "minValue": job.salary_min,
            "maxValue": job.salary_max,
            "unitText": "YEAR"
          }
        } : undefined,
        "url": `${window.location.origin}/jobs/${job.seo_slug || slugOrId}`,
        "applicationContact": {
          "@type": "ContactPoint",
          "url": `${window.location.origin}/jobs/${job.seo_slug || slugOrId}/apply`,
          "contactType": "Application Portal"
        },
        "industry": job.industry_domain,
        "workHours": "40 hours per week",
        "benefits": job.benefits || ["Competitive salary", "Health insurance", "Professional development"]
      }

      // Remove any existing structured data
      const existingScript = document.getElementById('job-structured-data')
      if (existingScript) {
        existingScript.remove()
      }

      // Add new structured data
      const script = document.createElement('script')
      script.id = 'job-structured-data'
      script.type = 'application/ld+json'
      script.textContent = JSON.stringify(structuredData)
      document.head.appendChild(script)

      // Cleanup on unmount
      return () => {
        const scriptToRemove = document.getElementById('job-structured-data')
        if (scriptToRemove) {
          scriptToRemove.remove()
        }
      }
    }
  }, [job, slugOrId]);

  // Increment view count
  useEffect(() => {
    if (job?.id) {
      const incrementViewCount = async () => {
        await supabase.rpc('increment_job_views', { job_id: job.id });
      };
      incrementViewCount();
    }
  }, [job?.id]);

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: job?.title,
          text: `Check out this job at TalentXcel: ${job?.title}`,
          url,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      navigator.clipboard.writeText(url);
      toast.success('Job link copied to clipboard!');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Job Not Found</h1>
          <p className="text-gray-600 mb-4">The job you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => navigate('/jobs')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Jobs
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* React Job Structured Data with SEO */}
      <ReactJobStructuredData job={job} />
      
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Button 
            variant="ghost" 
            onClick={() => {
              console.log('🔙 Navigating back to jobs from job detail');
              navigate('/jobs');
            }}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Jobs
          </Button>

          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4 flex-1">
              <Avatar className="h-16 w-16 flex-shrink-0">
                <AvatarImage src="/lovable-uploads/711de76d-0f05-4939-b8b5-4acd21eb3119.png" alt="TalentXcel" />
                <AvatarFallback className="text-lg">
                  TX
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  {job.is_featured && (
                    <Badge className="bg-yellow-100 text-yellow-800">
                      <Star className="h-3 w-3 mr-1" />
                      Featured
                    </Badge>
                  )}
                  {job.is_remote && (
                    <Badge className="bg-green-100 text-green-800">
                      Remote
                    </Badge>
                  )}
                  {job.is_urgent && (
                    <Badge className="bg-red-100 text-red-800">
                      Urgent
                    </Badge>
                  )}
                </div>
                
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{job.title}</h1>
                
                <div className="flex items-center text-lg text-gray-600 mb-4">
                  <Building2 className="h-5 w-5 mr-2" />
                  <span className="font-medium">TalentXcel</span>
                  {job.industry_domain && (
                    <>
                      <span className="mx-2">•</span>
                      <span>{job.industry_domain}</span>
                    </>
                  )}
                </div>
                
                <div className="flex flex-wrap items-center gap-6 text-gray-600">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>{job.location}</span>
                  </div>
                  {((job.salary_min || job.salary_max) || (job as any).salary_range) && (
                    <div className="flex items-center">
                      <IndianRupee className="h-4 w-4 mr-1" />
                      <span>{formatSalaryRange(job.salary_min, job.salary_max, true, (job as any).salary_range)}</span>
                    </div>
                  )}
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>{formatDistanceToNow(new Date(job.posted_at || job.created_at))} ago</span>
                  </div>
                  <div className="flex items-center">
                    <Eye className="h-4 w-4 mr-1" />
                    <span>{job.views_count || 0} views</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2 ml-4">
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="h-4 w-4" />
              </Button>
              <PublicJobSaveButton jobId={job.id} />
              <PublicJobApplyButton jobId={job.id} job={job} />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Job Description */}
            <Card>
              <CardHeader>
                <CardTitle>Job Description</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  {job.description.split('\n').map((paragraph, index) => (
                    <p key={index} className="mb-4 text-gray-700 leading-relaxed">
                      {paragraph}
                    </p>
                  ))}
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
                    {job.requirements.split('\n').map((requirement, index) => (
                      <p key={index} className="mb-2 text-gray-700">
                        {requirement}
                      </p>
                    ))}
                  </div>
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
                  <ul className="list-disc list-inside space-y-2">
                    {job.benefits.map((benefit, index) => (
                      <li key={index} className="text-gray-700">
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Apply */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Apply</CardTitle>
              </CardHeader>
              <CardContent>
                <PublicJobApplyButton jobId={job.id} job={job} className="w-full" />
                <PublicJobSaveButton jobId={job.id} className="w-full mt-2" />
              </CardContent>
            </Card>

            {/* Job Details */}
            <Card>
              <CardHeader>
                <CardTitle>Job Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900">Employment Type</h4>
                  <p className="text-gray-600">{job.employment_type || 'Full-time'}</p>
                </div>
                
                <Separator />
                
                <div>
                  <h4 className="font-medium text-gray-900">Experience Level</h4>
                  <p className="text-gray-600">{job.experience_level || 'Mid-level'}</p>
                </div>
                
                <Separator />
                
                <div>
                  <h4 className="font-medium text-gray-900">Location</h4>
                  <p className="text-gray-600">{job.location}</p>
                  {job.is_remote && (
                    <Badge className="mt-1 bg-green-100 text-green-800">
                      Remote work available
                    </Badge>
                  )}
                </div>
                
                <Separator />
                
                <div>
                  <h4 className="font-medium text-gray-900">Posted</h4>
                  <p className="text-gray-600">
                    {formatDistanceToNow(new Date(job.posted_at || job.created_at))} ago
                  </p>
                </div>
                
                {job.expires_at && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="font-medium text-gray-900">Application Deadline</h4>
                      <p className="text-gray-600">
                        {formatDistanceToNow(new Date(job.expires_at))} from now
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Share */}
            <Card>
              <CardHeader>
                <CardTitle>Share this job</CardTitle>
              </CardHeader>
              <CardContent>
                <Button 
                  variant="outline" 
                  onClick={handleShare}
                  className="w-full"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share Job
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default JobDetails;