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
}

/**
 * Jobs by Role, Skill, City and Experience Level Page
 * URL Pattern: /jobs/[role]/[skill]/[city]/[experience-level]
 * Example: /jobs/data-scientist/python/mumbai/entry-level
 * 
 * This is the most specific job search targeting long-tail keywords
 * with very high conversion potential due to specificity
 */
export const JobsByRoleSkillCityLevel: React.FC = () => {
  const { role, skill, city, experienceLevel } = useParams<{ 
    role: string; 
    skill: string; 
    city: string; 
    experienceLevel: string;
  }>();
  
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  // Transform URL parameters to display format
  const roleDisplay = role?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || '';
  const skillDisplay = skill?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || '';
  const cityDisplay = city?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || '';
  const levelDisplay = experienceLevel?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || '';

  useEffect(() => {
    if (!role || !skill || !city || !experienceLevel) return;

    const fetchJobs = async () => {
      try {
        setLoading(true);
        setError(null);

        // Convert URL-friendly formats back to searchable terms
        const searchRole = role.replace(/-/g, ' ');
        const searchSkill = skill.replace(/-/g, ' ');
        const searchCity = city.replace(/-/g, ' ');
        const searchLevel = experienceLevel.replace(/-/g, ' ');

        const { data, error, count } = await supabase
          .from('jobs')
          .select('*', { count: 'exact' })
          .or(`title.ilike.%${searchRole}%,role_category.ilike.%${searchRole}%`)
          .ilike('location', `%${searchCity}%`)
          .contains('skills_required', [searchSkill])
          .or(`experience_level.ilike.%${searchLevel}%,title.ilike.%${searchLevel}%`)
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
  }, [role, skill, city, experienceLevel]);

  // SEO Meta Data
  const pageTitle = `${levelDisplay} ${roleDisplay} Jobs with ${skillDisplay} in ${cityDisplay} | TalentXcel`;
  const pageDescription = `Find ${levelDisplay} ${roleDisplay} jobs requiring ${skillDisplay} skills in ${cityDisplay}. ${totalCount}+ specialized opportunities for ${skillDisplay} professionals.`;
  const canonicalUrl = `https://talentxcel.in/jobs/${role}/${skill}/${city}/${experienceLevel}`;

  // Structured Data (CollectionPage / ItemList compliant with Google Rich Result guidelines)
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": `${levelDisplay} ${roleDisplay} Jobs with ${skillDisplay} in ${cityDisplay}`,
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
        <meta name="keywords" content={`${levelDisplay} ${roleDisplay}, ${skillDisplay} jobs, ${cityDisplay} jobs, ${skillDisplay} careers, ${roleDisplay} ${skillDisplay}`} />
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
          skill={skillDisplay}
          city={cityDisplay} 
          experienceLevel={levelDisplay}
        />
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-4">
            {levelDisplay} {roleDisplay} Jobs with {skillDisplay} in {cityDisplay}
          </h1>
          <p className="text-lg text-muted-foreground mb-6">
            Specialized {levelDisplay} {roleDisplay} positions requiring {skillDisplay} expertise in {cityDisplay}. 
            Perfect opportunities for professionals with {skillDisplay} skills.
          </p>
          
          {totalCount > 0 && (
            <div className="bg-primary/10 text-primary px-4 py-2 rounded-lg inline-block">
              <span className="font-semibold">{totalCount} targeted jobs found</span>
            </div>
          )}

          {/* Skill Highlight */}
          <div className="mt-6 p-4 bg-muted rounded-lg">
            <h3 className="font-semibold text-foreground mb-2">Perfect for {skillDisplay} Professionals:</h3>
            <p className="text-sm text-muted-foreground">
              These positions specifically require {skillDisplay} skills and offer {levelDisplay} career growth opportunities in {cityDisplay}.
            </p>
          </div>
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
                  No {levelDisplay} {roleDisplay} jobs with {skillDisplay} found in {cityDisplay}
                </h3>
                <p className="text-muted-foreground mb-6">
                  This is a very specific search. Try expanding your criteria:
                </p>
                
                {/* Expansion Suggestions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                  <a href={`/jobs/${role}/${city}`} className="block p-4 border rounded-lg hover:bg-muted transition-colors">
                    <span className="text-sm font-medium">All {roleDisplay} jobs in {cityDisplay}</span>
                  </a>
                  <a href={`/jobs/${role}/${skill}/${city}/mid-level`} className="block p-4 border rounded-lg hover:bg-muted transition-colors">
                    <span className="text-sm font-medium">Mid-Level {roleDisplay} with {skillDisplay}</span>
                  </a>
                  <a href={`/jobs/${role}/${skill}/mumbai/${experienceLevel}`} className="block p-4 border rounded-lg hover:bg-muted transition-colors">
                    <span className="text-sm font-medium">{levelDisplay} {roleDisplay} with {skillDisplay} in Mumbai</span>
                  </a>
                  <a href={`/jobs/remote/${role}/${city}`} className="block p-4 border rounded-lg hover:bg-muted transition-colors">
                    <span className="text-sm font-medium">Remote {roleDisplay} opportunities</span>
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

        {/* Skill-Based Suggestions */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-foreground mb-6">
            Related {skillDisplay} Jobs
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <a href={`/jobs/senior-${role}/${skill}/${city}/senior-level`} className="block p-4 border rounded-lg hover:bg-muted transition-colors">
              <span className="text-sm font-medium">Senior {roleDisplay} with {skillDisplay}</span>
            </a>
            <a href={`/jobs/${role}/${skill}/bangalore/${experienceLevel}`} className="block p-4 border rounded-lg hover:bg-muted transition-colors">
              <span className="text-sm font-medium">{levelDisplay} {roleDisplay} in Bangalore</span>
            </a>
            <a href={`/jobs/full-stack-developer/${skill}/${city}/${experienceLevel}`} className="block p-4 border rounded-lg hover:bg-muted transition-colors">
              <span className="text-sm font-medium">Full Stack with {skillDisplay}</span>
            </a>
            <a href={`/jobs/remote/${role}/${skill}/${experienceLevel}`} className="block p-4 border rounded-lg hover:bg-muted transition-colors">
              <span className="text-sm font-medium">Remote {skillDisplay} Jobs</span>
            </a>
          </div>
        </div>

        {/* Experience Level Variations */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-foreground mb-6">
            Different Experience Levels
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <a href={`/jobs/${role}/${skill}/${city}/entry-level`} className="block p-4 border rounded-lg hover:bg-muted transition-colors">
              <span className="text-sm font-medium">Entry Level</span>
            </a>
            <a href={`/jobs/${role}/${skill}/${city}/mid-level`} className="block p-4 border rounded-lg hover:bg-muted transition-colors">
              <span className="text-sm font-medium">Mid Level</span>
            </a>
            <a href={`/jobs/${role}/${skill}/${city}/senior-level`} className="block p-4 border rounded-lg hover:bg-muted transition-colors">
              <span className="text-sm font-medium">Senior Level</span>
            </a>
            <a href={`/jobs/${role}/${skill}/${city}/lead-level`} className="block p-4 border rounded-lg hover:bg-muted transition-colors">
              <span className="text-sm font-medium">Lead Level</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};