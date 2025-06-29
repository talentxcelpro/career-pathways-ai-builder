
import React from 'react';
import { useParams } from 'react-router-dom';
import { useSEO } from '@/hooks/useSEO';
import { SEOHead } from '@/components/seo/SEOHead';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const JobsBySkill = () => {
  const { skill } = useParams<{ skill: string }>();
  const formattedSkill = skill?.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) || '';

  const { data: jobsData = [] } = useQuery({
    queryKey: ['jobs-by-skill', skill],
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
        .contains('skills_required', [formattedSkill])
        .order('posted_at', { ascending: false })
        .limit(50);
      return data || [];
    }
  });

  const seoConfig = {
    title: `${formattedSkill} Jobs | Latest ${formattedSkill} Openings | TalentXcel`,
    description: `Find the best ${formattedSkill} jobs in India. Browse latest ${formattedSkill} job openings from top companies. Apply now and advance your ${formattedSkill} career.`,
    keywords: [
      `${formattedSkill.toLowerCase()} jobs`,
      `${formattedSkill.toLowerCase()} developer jobs`,
      `${formattedSkill.toLowerCase()} career`,
      `${formattedSkill.toLowerCase()} skills`,
      'programming jobs',
      'tech jobs',
      'developer positions'
    ],
    canonical: `/jobs/skill/${skill}`,
    structuredData: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "JobPostingOrganization",
      "name": `${formattedSkill} Jobs`,
      "description": `Latest ${formattedSkill} job opportunities`,
      "hiringOrganization": {
        "@type": "Organization",
        "name": "TalentXcel"
      },
      "url": `https://talentxcel.in/jobs/skill/${skill}`
    })
  };

  useSEO(seoConfig);

  const skillData = {
    'javascript': {
      averageSalary: '₹8L',
      demand: 'Very High',
      relatedSkills: ['React', 'Node.js', 'TypeScript', 'Vue.js'],
      description: 'JavaScript is the backbone of modern web development, powering both frontend and backend applications.'
    },
    'python': {
      averageSalary: '₹12L',
      demand: 'Very High',
      relatedSkills: ['Django', 'Flask', 'Machine Learning', 'Data Science'],
      description: 'Python is a versatile programming language widely used in web development, data science, and AI.'
    },
    'react': {
      averageSalary: '₹10L',
      demand: 'High',
      relatedSkills: ['JavaScript', 'Redux', 'Next.js', 'TypeScript'],
      description: 'React is the most popular frontend framework for building interactive user interfaces.'
    }
  };

  const currentSkill = skillData[skill as keyof typeof skillData] || skillData['javascript'];

  return (
    <div className="min-h-screen bg-gray-50">
      <SEOHead {...seoConfig} />
      
      <section className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              {formattedSkill} Jobs
            </h1>
            <p className="text-xl mb-8 max-w-3xl mx-auto">
              {currentSkill.description} Find exciting {formattedSkill} opportunities 
              with top companies and grow your technical career.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <span className="bg-white/20 px-3 py-1 rounded-full">{jobsData.length}+ Jobs</span>
              <span className="bg-white/20 px-3 py-1 rounded-full">{currentSkill.averageSalary} Avg Salary</span>
              <span className="bg-white/20 px-3 py-1 rounded-full">{currentSkill.demand} Demand</span>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-4">Average Salary</h3>
              <div className="text-3xl font-bold text-cyan-600">{currentSkill.averageSalary}</div>
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-4">Market Demand</h3>
              <div className="text-3xl font-bold text-green-600">{currentSkill.demand}</div>
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-4">Related Skills</h3>
              <div className="flex flex-wrap gap-2 justify-center">
                {currentSkill.relatedSkills.map((relatedSkill, index) => (
                  <span key={index} className="bg-cyan-100 text-cyan-800 px-2 py-1 rounded text-sm">
                    {relatedSkill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-4">{formattedSkill} Job Opportunities</h2>
            <p className="text-gray-600">Found {jobsData.length} job openings requiring {formattedSkill}</p>
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
                    {job.skills_required?.slice(0, 4).map((jobSkill: string, index: number) => (
                      <span key={index} className="bg-cyan-100 text-cyan-800 px-2 py-1 rounded text-xs">
                        {jobSkill}
                      </span>
                    ))}
                  </div>
                  <button className="bg-cyan-600 text-white px-4 py-2 rounded hover:bg-cyan-700">
                    Apply Now
                  </button>
                </div>
              </div>
            ))}
          </div>

          {jobsData.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No {formattedSkill} jobs found currently. Check back later for new opportunities.</p>
            </div>
          )}
        </div>
      </section>

      <section className="py-12 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose max-w-none">
            <h2>{formattedSkill} Career Guide</h2>
            <p>
              {currentSkill.description} With {currentSkill.demand.toLowerCase()} market demand 
              and competitive salaries, {formattedSkill} skills open doors to exciting career 
              opportunities across various industries.
            </p>
            
            <h3>Learning Path</h3>
            <ul>
              <li>Master the fundamentals of {formattedSkill}</li>
              <li>Build real-world projects to showcase your skills</li>
              <li>Learn complementary technologies and frameworks</li>
              <li>Contribute to open-source projects</li>
              <li>Stay updated with the latest {formattedSkill} trends</li>
            </ul>

            <h3>Career Opportunities</h3>
            <p>
              {formattedSkill} professionals can pursue various career paths including software 
              development, system architecture, technical leadership, and specialized roles in 
              emerging technologies like AI, blockchain, and cloud computing.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default JobsBySkill;
