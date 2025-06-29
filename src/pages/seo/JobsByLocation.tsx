
import React from 'react';
import { useParams } from 'react-router-dom';
import { useSEO } from '@/hooks/useSEO';
import { SEOHead } from '@/components/seo/SEOHead';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const JobsByLocation = () => {
  const { location } = useParams<{ location: string }>();
  const formattedLocation = location?.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) || '';

  // Fetch jobs data for this location
  const { data: jobsData = [] } = useQuery({
    queryKey: ['jobs', location],
    queryFn: async () => {
      const { data } = await supabase
        .from('jobs')
        .select(`
          *,
          companies (
            name,
            logo_url,
            industry
          )
        `)
        .eq('is_active', true)
        .ilike('location', `%${formattedLocation}%`)
        .order('posted_at', { ascending: false });
      return data || [];
    }
  });

  const seoConfig = {
    title: `Latest Jobs in ${formattedLocation} | ${formattedLocation} Job Openings | TalentXcel`,
    description: `Find the best job opportunities in ${formattedLocation}. Browse ${formattedLocation} jobs across IT, Finance, Healthcare, Sales, Marketing and more. Apply now and get hired faster.`,
    keywords: [
      `jobs in ${formattedLocation.toLowerCase()}`,
      `${formattedLocation.toLowerCase()} jobs`,
      `${formattedLocation.toLowerCase()} job openings`,
      'employment opportunities',
      'career opportunities',
      'hiring',
      'recruitment'
    ],
    canonical: `/jobs/location/${location}`,
    structuredData: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "JobPostingOrganization",
      "name": `Jobs in ${formattedLocation}`,
      "description": `Latest job opportunities in ${formattedLocation}`,
      "areaServed": formattedLocation,
      "url": `https://talentxcel.in/jobs/location/${location}`
    })
  };

  useSEO(seoConfig);

  // Calculate stats
  const jobsCount = jobsData.length;
  const remoteJobsCount = jobsData.filter(job => job.is_remote).length;
  const featuredJobsCount = jobsData.filter(job => job.is_featured).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <SEOHead {...seoConfig} />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Jobs in {formattedLocation}
            </h1>
            <p className="text-xl mb-8 max-w-3xl mx-auto">
              Discover exciting career opportunities in {formattedLocation}. From startups to Fortune 500 companies, 
              find your dream job with top employers in the city.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <span className="bg-white/20 px-3 py-1 rounded-full">5000+ Active Jobs</span>
              <span className="bg-white/20 px-3 py-1 rounded-full">500+ Companies</span>
              <span className="bg-white/20 px-3 py-1 rounded-full">All Industries</span>
            </div>
          </div>
        </div>
      </section>

      {/* Key Stats */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-center mb-8">
            Why Choose {formattedLocation} for Your Career?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">₹8.5L</div>
              <div className="text-gray-600">Average Salary</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">150+</div>
              <div className="text-gray-600">Tech Companies</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">25%</div>
              <div className="text-gray-600">Year-on-Year Growth</div>
            </div>
          </div>
        </div>
      </section>

      {/* Jobs Listing */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-4">Jobs in {formattedLocation}</h2>
            <p className="text-gray-600">Found {jobsCount} job opportunities</p>
          </div>
          
          <div className="space-y-4">
            {jobsData.map((job) => (
              <div key={job.id} className="bg-white rounded-lg border p-6 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{job.title}</h3>
                    <p className="text-gray-600 mb-2">{job.companies?.name}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>{job.location}</span>
                      {job.salary_min && job.salary_max && (
                        <span>₹{job.salary_min/100000}L - ₹{job.salary_max/100000}L</span>
                      )}
                      <span>{job.employment_type}</span>
                    </div>
                  </div>
                  {job.is_featured && (
                    <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">
                      Featured
                    </span>
                  )}
                </div>
                <p className="text-gray-700 mb-4 line-clamp-2">{job.description}</p>
                <div className="flex justify-between items-center">
                  <div className="flex flex-wrap gap-2">
                    {job.skills_required?.slice(0, 3).map((skill: string, index: number) => (
                      <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                        {skill}
                      </span>
                    ))}
                  </div>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                    Apply Now
                  </button>
                </div>
              </div>
            ))}
          </div>

          {jobsData.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No jobs found for {formattedLocation}. Check back later for new opportunities.</p>
            </div>
          )}
        </div>
      </section>

      {/* SEO Content */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose max-w-none">
            <h2>About Jobs in {formattedLocation}</h2>
            <p>
              {formattedLocation} has emerged as one of India's leading job markets, offering diverse 
              opportunities across technology, finance, healthcare, and traditional industries. 
              The city's robust infrastructure and business-friendly environment make it an 
              attractive destination for both job seekers and employers.
            </p>
            
            <h3>Top Industries in {formattedLocation}</h3>
            <ul>
              <li>Information Technology & Software</li>
              <li>Financial Services & Banking</li>
              <li>Healthcare & Pharmaceuticals</li>
              <li>Manufacturing & Engineering</li>
              <li>E-commerce & Retail</li>
            </ul>

            <h3>Popular Job Roles</h3>
            <p>
              The most in-demand positions in {formattedLocation} include Software Engineers, 
              Data Scientists, Business Analysts, Sales Executives, and Digital Marketing Specialists. 
              These roles offer competitive salaries and excellent growth prospects.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default JobsByLocation;
