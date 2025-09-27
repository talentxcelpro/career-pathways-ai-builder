import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { supabase } from '@/integrations/supabase/client';
import { JobCard } from '@/components/jobs/JobCard';
import { SEOJobsBreadcrumb } from '@/components/seo/SEOJobsBreadcrumb';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Alert, AlertDescription } from '@/components/ui/alert';

/**
 * Remote Jobs by Role and City Page
 * URL Pattern: /jobs/remote/[role]/[city]
 * Example: /jobs/remote/project-manager/pune
 */
export const JobsByRemoteRoleCity: React.FC = () => {
  const { role, city } = useParams<{ role: string; city: string }>();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  const roleDisplay = role?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || '';
  const cityDisplay = city?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || '';

  useEffect(() => {
    if (!role || !city) return;

    const fetchJobs = async () => {
      try {
        setLoading(true);
        const searchRole = role.replace(/-/g, ' ');
        const searchCity = city.replace(/-/g, ' ');

        const { data, error, count } = await supabase
          .from('jobs')
          .select('*', { count: 'exact' })
          .or(`title.ilike.%${searchRole}%,role_category.ilike.%${searchRole}%`)
          .or(`is_remote.eq.true,location.ilike.%remote%,location.ilike.%${searchCity}%`)
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

  const pageTitle = `Remote ${roleDisplay} Jobs in ${cityDisplay} | TalentXcel`;
  const pageDescription = `Find remote ${roleDisplay} jobs in ${cityDisplay}. ${totalCount}+ work-from-home opportunities.`;

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
          isRemote={true}
        />
        
        <h1 className="text-3xl font-bold mb-6">
          Remote {roleDisplay} Jobs in {cityDisplay}
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