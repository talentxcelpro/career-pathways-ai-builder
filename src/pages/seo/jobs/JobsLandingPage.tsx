import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { supabase } from '@/integrations/supabase/client';
import { JobCard } from '@/components/jobs/JobCard';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

/**
 * Main Jobs Landing Page
 * URL: /jobs
 * 
 * Central hub for all job searches with category navigation
 */
export const JobsLandingPage: React.FC = () => {
  const [featuredJobs, setFeaturedJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [jobStats, setJobStats] = useState({ total: 0, companies: 0, locations: 0 });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch featured jobs
        const { data: jobs } = await supabase
          .from('jobs')
          .select('*')
          .eq('is_active', true)
          .eq('job_status', 'open')
          .eq('is_featured', true)
          .gt('expires_at', new Date().toISOString())
          .order('created_at', { ascending: false })
          .limit(6);

        // Fetch job statistics
        const { count: totalJobs } = await supabase
          .from('jobs')
          .select('*', { count: 'exact', head: true })
          .eq('is_active', true)
          .eq('job_status', 'open');

        setFeaturedJobs(jobs || []);
        setJobStats({ total: totalJobs || 0, companies: 500, locations: 100 });
      } catch (error) {
        console.error('Error fetching jobs data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Jobs in India | Find Your Dream Career - TalentXcel</title>
        <meta name="description" content="Find your dream job in India. Browse thousands of opportunities across all industries and locations. Start your career journey with TalentXcel." />
        <meta name="keywords" content="jobs India, careers, employment, job search, hiring, recruitment" />
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Find Your Dream Job in India
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Browse {jobStats.total.toLocaleString()}+ jobs from {jobStats.companies}+ companies across {jobStats.locations}+ locations
          </p>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">{jobStats.total.toLocaleString()}+</div>
              <div className="text-sm text-muted-foreground">Active Jobs</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">{jobStats.companies}+</div>
              <div className="text-sm text-muted-foreground">Companies</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">{jobStats.locations}+</div>
              <div className="text-sm text-muted-foreground">Locations</div>
            </div>
          </div>
        </div>

        {/* Popular Categories */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-6">Browse Jobs by Role</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[
              'software-engineer', 'data-scientist', 'product-manager', 'marketing-manager',
              'sales-executive', 'business-analyst', 'ui-ux-designer', 'project-manager'
            ].map(role => (
              <a 
                key={role}
                href={`/jobs/${role}/bangalore`}
                className="block p-4 border rounded-lg hover:bg-muted transition-colors"
              >
                <span className="text-sm font-medium capitalize">{role.replace(/-/g, ' ')}</span>
              </a>
            ))}
          </div>
        </div>

        {/* Popular Cities */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-6">Jobs by Location</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[
              'bangalore', 'mumbai', 'delhi', 'pune', 'hyderabad', 'chennai',
              'gurgaon', 'noida', 'kolkata', 'ahmedabad', 'jaipur', 'kochi'
            ].map(city => (
              <a 
                key={city}
                href={`/jobs/software-engineer/${city}`}
                className="block p-3 border rounded-lg hover:bg-muted transition-colors text-center"
              >
                <span className="text-sm font-medium capitalize">{city}</span>
              </a>
            ))}
          </div>
        </div>

        {/* Featured Jobs */}
        {featuredJobs.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-6">Featured Jobs</h2>
            <div className="grid gap-6">
              {featuredJobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          </div>
        )}

        {/* Industry-specific sections */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-6">Jobs by Industry</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { industry: 'technology', roles: ['software-engineer', 'data-scientist', 'product-manager'] },
              { industry: 'finance', roles: ['financial-analyst', 'investment-banker', 'accountant'] },
              { industry: 'healthcare', roles: ['doctor', 'nurse', 'pharmacist'] },
              { industry: 'education', roles: ['teacher', 'professor', 'training-specialist'] },
              { industry: 'marketing', roles: ['marketing-manager', 'digital-marketer', 'content-writer'] },
              { industry: 'sales', roles: ['sales-executive', 'account-manager', 'business-development'] }
            ].map(({ industry, roles }) => (
              <div key={industry} className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2 capitalize">{industry}</h3>
                <div className="space-y-1">
                  {roles.map(role => (
                    <a 
                      key={role}
                      href={`/jobs/${role}/${industry}/bangalore`}
                      className="block text-sm text-muted-foreground hover:text-primary"
                    >
                      {role.replace(/-/g, ' ')}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};