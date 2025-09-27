import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { supabase } from '@/integrations/supabase/client';
import { JobCard } from '@/components/jobs/JobCard';
import { SEOJobsBreadcrumb } from '@/components/seo/SEOJobsBreadcrumb';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Alert, AlertDescription } from '@/components/ui/alert';

/**
 * Jobs by Company, Role and City Page
 * URL Pattern: /jobs/top-companies/[company]/[role]/[city]
 * Example: /jobs/top-companies/google/software-engineer/bangalore
 */
export const JobsByCompanyRoleCity: React.FC = () => {
  const { company, role, city } = useParams<{ 
    company: string; 
    role: string; 
    city: string; 
  }>();
  
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  const companyDisplay = company?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || '';
  const roleDisplay = role?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || '';
  const cityDisplay = city?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || '';

  useEffect(() => {
    if (!company || !role || !city) return;

    const fetchJobs = async () => {
      try {
        setLoading(true);
        const searchCompany = company.replace(/-/g, ' ');
        const searchRole = role.replace(/-/g, ' ');
        const searchCity = city.replace(/-/g, ' ');

        const { data, error, count } = await supabase
          .from('jobs')
          .select('*', { count: 'exact' })
          .ilike('company_name', `%${searchCompany}%`)
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
  }, [company, role, city]);

  const pageTitle = `${roleDisplay} Jobs at ${companyDisplay} in ${cityDisplay} | TalentXcel`;
  const pageDescription = `Find ${roleDisplay} jobs at ${companyDisplay} in ${cityDisplay}. ${totalCount}+ opportunities at top companies.`;

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        <SEOJobsBreadcrumb 
          role={roleDisplay} 
          city={cityDisplay}
          company={companyDisplay}
        />
        
        <h1 className="text-3xl font-bold mb-6">
          {roleDisplay} Jobs at {companyDisplay} in {cityDisplay}
        </h1>

        {error ? (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-6">
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};