import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { supabase } from '@/integrations/supabase/client';
import { JobCard } from '@/components/jobs/JobCard';
import { SEOJobsBreadcrumb } from '@/components/seo/SEOJobsBreadcrumb';
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
  industry?: string;
}

/**
 * Jobs by Role, Industry and City Page
 * URL Pattern: /jobs/[role]/[industry]/[city]
 * Example: /jobs/marketing-manager/retail/delhi
 * 
 * This component targets more specific search queries
 * combining job role, industry and location
 */
export const JobsByRoleIndustryCity: React.FC = () => {
  const { role, industry, city } = useParams<{ 
    role: string; 
    industry: string; 
    city: string; 
  }>();
  
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  // Transform URL parameters to display format
  const roleDisplay = role?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || '';
  const industryDisplay = industry?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || '';
  const cityDisplay = city?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || '';

  useEffect(() => {
    if (!role || !industry || !city) return;

    const fetchJobs = async () => {
      try {
        setLoading(true);
        setError(null);

        // Convert URL-friendly formats back to searchable terms
        const searchRole = role.replace(/-/g, ' ');
        const searchIndustry = industry.replace(/-/g, ' ');
        const searchCity = city.replace(/-/g, ' ');

        const { data, error, count } = await supabase
          .from('jobs')
          .select(`
            *,
            companies (
              industry,
              name
            )
          `, { count: 'exact' })
          .or(`title.ilike.%${searchRole}%,role_category.ilike.%${searchRole}%`)
          .ilike('location', `%${searchCity}%`)
          .eq('is_active', true)
          .eq('job_status', 'open')
          .gt('expires_at', new Date().toISOString())
          .order('created_at', { ascending: false })
          .limit(20);

        if (error) throw error;

        // Filter by industry if company data is available
        const filteredJobs = data?.filter(job => 
          !job.companies || 
          job.companies.industry?.toLowerCase().includes(searchIndustry.toLowerCase()) ||
          job.description?.toLowerCase().includes(searchIndustry.toLowerCase())
        ) || [];

        setJobs(filteredJobs);
        setTotalCount(filteredJobs.length);
      } catch (err) {
        console.error('Error fetching jobs:', err);
        setError('Unable to load jobs at this time');
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [role, industry, city]);

  // SEO Meta Data
  const pageTitle = `${roleDisplay} Jobs in ${industryDisplay} Industry - ${cityDisplay} | TalentXcel`;
  const pageDescription = `Find ${roleDisplay} jobs in ${industryDisplay} companies in ${cityDisplay}. ${totalCount}+ specialized opportunities from leading ${industryDisplay} employers.`;
  const canonicalUrl = `https://talentxcel.in/jobs/${role}/${industry}/${city}`;

  // Structured Data (CollectionPage / ItemList compliant with Google Rich Result guidelines)
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": `${roleDisplay} Jobs in ${industryDisplay} - ${cityDisplay}`,
    "description": pageDescription,
    "url": canonicalUrl,
    "mainEntity": {
      "@type": "ItemList",
      "numberOfItems": totalCount,
      "itemListElement": jobs.map((job, idx) => ({
        "@type": "ListItem",
        "position": idx + 1,
        "name": job.title,
        "url": `https://talentxcel.in/jobs/${job.id}`
      }))
    }
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
        <meta name="keywords" content={`${roleDisplay} jobs, ${industryDisplay} jobs, ${cityDisplay} jobs, ${industryDisplay} careers, ${roleDisplay} ${industryDisplay}`} />
        <link rel="canonical" href={canonicalUrl} />
        
        {/* Open Graph */}
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:type" content="website" />
        
        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        <SEOJobsBreadcrumb 
          role={roleDisplay} 
          industry={industryDisplay}
          city={cityDisplay} 
        />
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-4">
            {roleDisplay} Jobs in {industryDisplay} Industry - {cityDisplay}
          </h1>
          <p className="text-lg text-muted-foreground mb-6">
            Specialized {roleDisplay} opportunities in the {industryDisplay} sector in {cityDisplay}. 
            Find your perfect role with industry-leading companies.
          </p>
          
          {totalCount > 0 && (
            <div className="bg-primary/10 text-primary px-4 py-2 rounded-lg inline-block">
              <span className="font-semibold">{totalCount} specialized jobs found</span>
            </div>
          )}
        </div>

        {error ? (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-6">
            {jobs.length === 0 ? (
              <div className="text-center py-12">
                <h3 className="text-xl font-semibold text-foreground mb-4">
                  No {roleDisplay} jobs found in {industryDisplay} industry in {cityDisplay}
                </h3>
                <p className="text-muted-foreground mb-6">
                  Try expanding your search to related industries or nearby cities.
                </p>
                
                {/* Industry Suggestions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                  <a href={`/jobs/${role}/${city}`} className="block p-4 border rounded-lg hover:bg-muted transition-colors">
                    <span className="text-sm font-medium">All {roleDisplay} jobs in {cityDisplay}</span>
                  </a>
                  <a href={`/jobs/${role}/technology/${city}`} className="block p-4 border rounded-lg hover:bg-muted transition-colors">
                    <span className="text-sm font-medium">{roleDisplay} in Technology</span>
                  </a>
                  <a href={`/jobs/${role}/healthcare/${city}`} className="block p-4 border rounded-lg hover:bg-muted transition-colors">
                    <span className="text-sm font-medium">{roleDisplay} in Healthcare</span>
                  </a>
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
              </div>
            )}
          </div>
        )}

        {/* Related Industry Searches */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-foreground mb-6">
            Related Industry Searches
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <a href={`/jobs/${role}/technology/${city}`} className="block p-4 border rounded-lg hover:bg-muted transition-colors">
              <span className="text-sm font-medium">{roleDisplay} in Technology</span>
            </a>
            <a href={`/jobs/${role}/finance/${city}`} className="block p-4 border rounded-lg hover:bg-muted transition-colors">
              <span className="text-sm font-medium">{roleDisplay} in Finance</span>
            </a>
            <a href={`/jobs/${role}/healthcare/${city}`} className="block p-4 border rounded-lg hover:bg-muted transition-colors">
              <span className="text-sm font-medium">{roleDisplay} in Healthcare</span>
            </a>
            <a href={`/jobs/${role}/education/${city}`} className="block p-4 border rounded-lg hover:bg-muted transition-colors">
              <span className="text-sm font-medium">{roleDisplay} in Education</span>
            </a>
          </div>
        </div>

        {/* Location-based suggestions */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-foreground mb-6">
            Other Cities for {roleDisplay} in {industryDisplay}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <a href={`/jobs/${role}/${industry}/mumbai`} className="block p-4 border rounded-lg hover:bg-muted transition-colors">
              <span className="text-sm font-medium">Mumbai</span>
            </a>
            <a href={`/jobs/${role}/${industry}/bangalore`} className="block p-4 border rounded-lg hover:bg-muted transition-colors">
              <span className="text-sm font-medium">Bangalore</span>
            </a>
            <a href={`/jobs/${role}/${industry}/delhi`} className="block p-4 border rounded-lg hover:bg-muted transition-colors">
              <span className="text-sm font-medium">Delhi</span>
            </a>
            <a href={`/jobs/${role}/${industry}/pune`} className="block p-4 border rounded-lg hover:bg-muted transition-colors">
              <span className="text-sm font-medium">Pune</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};