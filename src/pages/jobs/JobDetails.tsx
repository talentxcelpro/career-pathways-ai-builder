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

  console.log('🚀 JobDetails component mounted with slugOrId:', slugOrId);
  console.log('🔥 Current pathname:', window.location.pathname);
  console.log('🔥 Current route params:', useParams());

  // Fetch job details with enhanced logic
  const { data: job, isLoading, error } = useQuery({
    queryKey: ['job', slugOrId],
    queryFn: async () => {
      if (!slugOrId) return null;
      
      console.log('🔍 Fetching job with slugOrId:', slugOrId);
      console.log('🔍 Looking for exact SEO slug match first...');
      
      // Step 1: Try exact SEO slug match
      console.log('📝 Step 1: Trying exact SEO slug match');
      let { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('seo_slug', slugOrId)
        .eq('is_active', true)
        .eq('job_status', 'open')
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('❌ Error in exact match:', error);
        throw error;
      }
      
      if (data) {
        console.log('✅ Found job with exact SEO slug match:', data.title);
        return data;
      }

      // Step 2: Extract potential job ID from the slug (last UUID-like segment)
      const uuidPattern = /[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/i;
      const uuidMatch = slugOrId.match(uuidPattern);
      
      if (uuidMatch) {
        const jobId = uuidMatch[0];
        console.log('📝 Step 2: Trying UUID match with extracted ID:', jobId);
        
        ({ data, error } = await supabase
          .from('jobs')
          .select('*')
          .eq('id', jobId)
          .eq('is_active', true)
          .eq('job_status', 'open')
          .maybeSingle());

        if (error && error.code !== 'PGRST116') {
          console.error('❌ Error in UUID match:', error);
          throw error;
        }
        
        if (data) {
          console.log('✅ Found job with UUID match:', data.title);
          return data;
        }
      }

      // Step 3: Try partial job ID match (last 8 characters)
      const partialIdPattern = /[a-f0-9]{8}$/i;
      const partialIdMatch = slugOrId.match(partialIdPattern);
      
      if (partialIdMatch) {
        const partialId = partialIdMatch[0];
        console.log('📝 Step 3: Trying partial ID match with:', partialId);
        
        ({ data, error } = await supabase
          .from('jobs')
          .select('*')
          .ilike('id::text', `${partialId}%`)
          .eq('is_active', true)
          .eq('job_status', 'open')
          .limit(1)
          .maybeSingle());

        if (error && error.code !== 'PGRST116') {
          console.error('❌ Error in partial ID match:', error);
          throw error;
        }
        
        if (data) {
          console.log('✅ Found job with partial ID match:', data.title);
          return data;
        }
      }

      // Step 4: Try partial SEO slug match by checking if current slug is contained in any SEO slug
      console.log('📝 Step 4: Trying partial SEO slug match');
      const slugWithoutId = partialIdMatch ? slugOrId.replace(partialIdMatch[0], '').replace(/-$/, '') : slugOrId;
      console.log('🔍 Searching for partial match with:', slugWithoutId);
      
      ({ data, error } = await supabase
        .from('jobs')
        .select('*')
        .ilike('seo_slug', `%${slugWithoutId}%`)
        .eq('is_active', true)
        .eq('job_status', 'open')
        .limit(1)
        .maybeSingle());

      if (error && error.code !== 'PGRST116') {
        console.error('❌ Error in partial match:', error);
        throw error;
      }
      
      if (data) {
        console.log('✅ Found job with partial SEO slug match:', data.title);
        return data;
      }

      // Step 5: Try title-based search as last resort
      console.log('📝 Step 5: Trying title-based search');
      const titleSearchTerms = slugOrId.replace(/-/g, ' ').replace(/\b\d+\b/g, '').trim();
      console.log('🔍 Searching for title match with:', titleSearchTerms);
      
      ({ data, error } = await supabase
        .from('jobs')
        .select('*')
        .ilike('title', `%${titleSearchTerms}%`)
        .eq('is_active', true)
        .eq('job_status', 'open')
        .limit(1)
        .maybeSingle());

      if (error && error.code !== 'PGRST116') {
        console.error('❌ Error in title search:', error);
        throw error;
      }
      
      if (data) {
        console.log('✅ Found job with title match:', data.title);
        return data;
      }

      console.log('❌ No job found with any matching strategy');
      return null;
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

      // If current URL doesn't match the proper SEO slug, redirect
      if (job.seo_slug && job.seo_slug !== slugOrId) {
        console.log('🔄 Redirecting to proper SEO URL:', job.seo_slug);
        navigate(`/jobs/${job.seo_slug}`, { replace: true });
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

            {/* Skills Required */}
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
                  <CardTitle>Benefits & Perks</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {job.benefits.map((benefit, index) => (
                      <div key={index} className="flex items-center">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                        <span className="text-gray-700">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Quick Apply */}
            <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-purple-50">
              <CardContent className="p-6 text-center">
                <div className="mb-4">
                  <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-2">Ready to Apply?</h3>
                <p className="text-gray-600 mb-4">
                  Take the next step in your career journey
                </p>
                <PublicJobApplyButton jobId={job.id} job={job} className="w-full" />
              </CardContent>
            </Card>

            {/* Job Details */}
            <Card>
              <CardHeader>
                <CardTitle>Job Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {job.employment_type && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Employment Type:</span>
                    <Badge variant="outline">{job.employment_type}</Badge>
                  </div>
                )}
                {job.experience_level && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Experience Level:</span>
                    <Badge variant="outline">{job.experience_level}</Badge>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Applications:</span>
                  <span className="font-medium">{job.applications_count || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Posted:</span>
                  <span className="font-medium">
                    {formatDistanceToNow(new Date(job.posted_at || job.created_at))} ago
                  </span>
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
                  {job.companies.description && (
                    <p className="text-gray-700">{job.companies.description}</p>
                  )}
                  
                  <div className="space-y-2">
                    {job.companies.industry && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Industry:</span>
                        <span className="font-medium">{job.companies.industry}</span>
                      </div>
                    )}
                    {job.companies.founded_year && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Founded:</span>
                        <span className="font-medium">{job.companies.founded_year}</span>
                      </div>
                    )}
                  </div>

                  {job.companies.website && (
                    <Button variant="outline" className="w-full" asChild>
                      <a href={job.companies.website} target="_blank" rel="noopener noreferrer">
                        Visit Company Website
                      </a>
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
        </div>
      </div>
    </>
  );
};

export default JobDetails;
