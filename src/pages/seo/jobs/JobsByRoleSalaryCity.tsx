import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { supabase } from '@/integrations/supabase/client';
import { JobCard } from '@/components/jobs/JobCard';
import { SEOJobsBreadcrumb } from '@/components/seo/SEOJobsBreadcrumb';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Alert, AlertDescription } from '@/components/ui/alert';

/**
 * Jobs by Role, Salary Range and City Page
 * URL Pattern: /jobs/[role]/[salary-range]/[city]
 * Example: /jobs/software-developer/5-10lpa/bangalore
 */
export const JobsByRoleSalaryCity: React.FC = () => {
  const { role, salaryRange, city } = useParams<{ 
    role: string; 
    salaryRange: string; 
    city: string; 
  }>();
  
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  const roleDisplay = role?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || '';
  const cityDisplay = city?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || '';
  const salaryDisplay = salaryRange?.replace(/-/g, ' ').replace(/lpa/i, ' LPA').toUpperCase() || '';

  useEffect(() => {
    if (!role || !salaryRange || !city) return;

    const fetchJobs = async () => {
      try {
        setLoading(true);
        
        // Parse salary range (e.g., "5-10lpa" -> min: 500000, max: 1000000)
        const salaryMatch = salaryRange.match(/(\d+)-(\d+)(?:lpa)?/i);
        const minSalary = salaryMatch ? parseInt(salaryMatch[1]) * 100000 : 0;
        const maxSalary = salaryMatch ? parseInt(salaryMatch[2]) * 100000 : 0;

        const searchRole = role.replace(/-/g, ' ');
        const searchCity = city.replace(/-/g, ' ');

        const { data, error, count } = await supabase
          .from('jobs')
          .select('*', { count: 'exact' })
          .or(`title.ilike.%${searchRole}%,role_category.ilike.%${searchRole}%`)
          .ilike('location', `%${searchCity}%`)
          .gte('salary_min', minSalary)
          .lte('salary_max', maxSalary)
          .eq('is_active', true)
          .eq('job_status', 'open')
          .gt('expires_at', new Date().toISOString())
          .order('salary_max', { ascending: false })
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
  }, [role, salaryRange, city]);

  const pageTitle = `${roleDisplay} Jobs ${salaryDisplay} in ${cityDisplay} | TalentXcel`;
  const pageDescription = `Find ${roleDisplay} jobs with salary range ${salaryDisplay} in ${cityDisplay}. ${totalCount}+ high-paying opportunities.`;

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
          salaryRange={salaryDisplay}
        />
        
        <h1 className="text-3xl font-bold mb-6">
          {roleDisplay} Jobs {salaryDisplay} in {cityDisplay}
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