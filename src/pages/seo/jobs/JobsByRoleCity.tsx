import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { supabase } from '@/integrations/supabase/client';
import { JobCard } from '@/components/jobs/JobCard';
import { SEOJobsBreadcrumb } from '@/components/seo/SEOJobsBreadcrumb';
import { JobsFilterSidebar } from '@/components/jobs/JobsFilterSidebar';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Job {
  id: string;
  title: string;
  company_name: string;
  location: string;
  salary_min?: number;
  salary_max?: number;
  employment_type: string;
  experience_level: string;
  skills_required: string[];
  description: string;
  posted_at: string;
  external_url?: string;
  seo_slug?: string;
}

/**
 * Jobs by Role and City Page
 * URL Pattern: /jobs/[role]/[city]
 * Example: /jobs/software-engineer/bangalore
 * 
 * This component handles the most common job search pattern
 * and is optimized for high search volume keywords
 */
export const JobsByRoleCity: React.FC = () => {
  const { role, city } = useParams<{ role: string; city: string }>();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  // Check if this is actually a job detail URL that was misrouted
  useEffect(() => {
    if (role && city) {
      // Check if this looks like a job slug pattern (contains UUID or is a long combined slug)
      const combinedSlug = `${role}-${city}`;
      const hasUuidPattern = /[a-f0-9]{8}(-[a-f0-9]{4}){3}-[a-f0-9]{12}/i.test(combinedSlug);
      const isLongSlug = combinedSlug.length > 50; // Job slugs are typically much longer
      const hasUuidSuffix = /[a-f0-9]{8}$/i.test(city || '');
      
      if (hasUuidPattern || isLongSlug || hasUuidSuffix) {
        console.log('🔄 Redirecting from JobsByRoleCity to JobDetails for:', combinedSlug);
        navigate(`/job/${combinedSlug}`, { replace: true });
        return;
      }
    }
  }, [role, city, navigate]);

  // Transform URL parameters to display format
  const roleDisplay = role?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || '';
  const cityDisplay = city?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || '';

  useEffect(() => {
    if (!role || !city) return;

    const fetchJobs = async () => {
      try {
        setLoading(true);
        setError(null);

        // Convert URL-friendly formats back to searchable terms
        const searchRole = role.replace(/-/g, ' ');
        const searchCity = city.replace(/-/g, ' ');

        const { data, error, count } = await supabase
          .from('jobs')
          .select('*', { count: 'exact' })
          .or(`title.ilike.%${searchRole}%,role_category.ilike.%${searchRole}%`)
          .ilike('location', `%${searchCity}%`)
          .eq('is_active', true)
          .eq('job_status', 'open')
          .gt('expires_at', new Date().toISOString())
          .order('created_at', { ascending: false })
          .limit(20);

        if (error) throw error;

        setJobs(data || []);
        setTotalCount(count || 0);
      } catch (err) {
        console.error('Error fetching jobs:', err);
        setError('Unable to load jobs at this time');
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [role, city]);

  // SEO Meta Data
  const pageTitle = `${roleDisplay} Jobs in ${cityDisplay} | TalentXcel`;
  const pageDescription = `Find the latest ${roleDisplay} jobs in ${cityDisplay}. Browse ${totalCount}+ opportunities from top companies. Apply now on TalentXcel.`;
  const canonicalUrl = `https://talentxcel.in/jobs/${role}/${city}`;

  // Structured Data for Rich Snippets
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    "name": `${roleDisplay} Jobs in ${cityDisplay}`,
    "description": pageDescription,
    "datePosted": new Date().toISOString(),
    "employmentType": "FULL_TIME",
    "jobLocation": {
      "@type": "Place",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": cityDisplay,
        "addressCountry": "IN"
      }
    },
    "hiringOrganization": {
      "@type": "Organization",
      "name": "TalentXcel",
      "sameAs": "https://talentxcel.in"
    },
    "industry": "Technology",
    "occupationalCategory": roleDisplay
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta name="keywords" content={`${roleDisplay} jobs, ${cityDisplay} jobs, ${roleDisplay} careers, ${cityDisplay} employment`} />
        <link rel="canonical" href={canonicalUrl} />
        
        {/* Open Graph */}
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:type" content="website" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        
        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        <SEOJobsBreadcrumb role={roleDisplay} city={cityDisplay} />
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-4">
            {roleDisplay} Jobs in {cityDisplay}
          </h1>
          <p className="text-lg text-muted-foreground mb-6">
            Discover {totalCount > 0 ? `${totalCount}+ ` : ''}amazing {roleDisplay} opportunities in {cityDisplay}. 
            Join top companies and advance your career with TalentXcel.
          </p>
          
          {totalCount > 0 && (
            <div className="bg-primary/10 text-primary px-4 py-2 rounded-lg inline-block">
              <span className="font-semibold">{totalCount} jobs found</span>
            </div>
          )}
        </div>

        {error ? (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1">
              <JobsFilterSidebar 
                role={role}
                city={city}
                onFiltersChange={(filters) => {
                  console.log('Filters updated:', filters);
                }}
              />
            </div>
            
            <div className="lg:col-span-3">
              {jobs.length === 0 ? (
                <div className="text-center py-12">
                  <h3 className="text-xl font-semibold text-foreground mb-4">
                    No {roleDisplay} jobs found in {cityDisplay}
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    We're constantly adding new opportunities. Try expanding your search or check back soon.
                  </p>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Suggestions:</p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Try searching in nearby cities</li>
                      <li>• Consider remote {roleDisplay} positions</li>
                      <li>• Explore related job titles</li>
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {jobs.map((job) => (
                    <JobCard 
                      key={job.id} 
                      job={job}
                    />
                  ))}
                  
                  {jobs.length >= 20 && (
                    <div className="text-center py-8">
                      <button className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                        Load More Jobs
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Related Jobs Section */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-foreground mb-6">
            Related Job Searches
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <a href={`/jobs/${role}/mumbai`} className="block p-4 border rounded-lg hover:bg-muted transition-colors">
              <span className="text-sm font-medium">{roleDisplay} in Mumbai</span>
            </a>
            <a href={`/jobs/${role}/delhi`} className="block p-4 border rounded-lg hover:bg-muted transition-colors">
              <span className="text-sm font-medium">{roleDisplay} in Delhi</span>
            </a>
            <a href={`/jobs/senior-${role}/${city}`} className="block p-4 border rounded-lg hover:bg-muted transition-colors">
              <span className="text-sm font-medium">Senior {roleDisplay} in {cityDisplay}</span>
            </a>
            <a href={`/jobs/remote/${role}/${city}`} className="block p-4 border rounded-lg hover:bg-muted transition-colors">
              <span className="text-sm font-medium">Remote {roleDisplay}</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};