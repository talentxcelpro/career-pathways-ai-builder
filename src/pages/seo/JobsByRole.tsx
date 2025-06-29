
import React from 'react';
import { useParams } from 'react-router-dom';
import { useSEO } from '@/hooks/useSEO';
import { JobsList } from '@/components/jobs/JobsList';
import { JobsHeader } from '@/components/jobs/JobsHeader';
import { SEOHead } from '@/components/seo/SEOHead';

const JobsByRole = () => {
  const { role } = useParams<{ role: string }>();
  const formattedRole = role?.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) || '';

  const seoConfig = {
    title: `${formattedRole} Jobs | Latest ${formattedRole} Openings | TalentXcel`,
    description: `Find the best ${formattedRole} jobs in India. Browse latest ${formattedRole} openings from top companies. Apply now and advance your career as a ${formattedRole}.`,
    keywords: [
      `${formattedRole.toLowerCase()} jobs`,
      `${formattedRole.toLowerCase()} openings`,
      `${formattedRole.toLowerCase()} career`,
      `${formattedRole.toLowerCase()} positions`,
      'job opportunities',
      'hiring',
      'employment'
    ],
    canonical: `/jobs/role/${role}`,
    structuredData: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "JobPostingOrganization",
      "name": `${formattedRole} Jobs`,
      "description": `Latest ${formattedRole} job opportunities`,
      "occupationalCategory": formattedRole,
      "url": `https://talentxcel.in/jobs/role/${role}`
    })
  };

  useSEO(seoConfig);

  const roleData = {
    'software-engineer': {
      averageSalary: '₹12L',
      experience: '2-8 years',
      skills: ['JavaScript', 'React', 'Node.js', 'Python', 'AWS'],
      description: 'Software Engineers design, develop, and maintain software applications and systems.'
    },
    'data-scientist': {
      averageSalary: '₹15L',
      experience: '3-7 years',
      skills: ['Python', 'Machine Learning', 'SQL', 'Tableau', 'Statistics'],
      description: 'Data Scientists analyze complex data to help organizations make data-driven decisions.'
    },
    'product-manager': {
      averageSalary: '₹18L',
      experience: '4-10 years',
      skills: ['Strategy', 'Analytics', 'User Research', 'Agile', 'Leadership'],
      description: 'Product Managers guide the strategy, roadmap, and feature definition of products.'
    }
  };

  const currentRole = roleData[role as keyof typeof roleData] || roleData['software-engineer'];

  return (
    <div className="min-h-screen bg-gray-50">
      <SEOHead {...seoConfig} />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              {formattedRole} Jobs
            </h1>
            <p className="text-xl mb-8 max-w-3xl mx-auto">
              {currentRole.description} Explore exciting {formattedRole} opportunities 
              with top companies and advance your career.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <span className="bg-white/20 px-3 py-1 rounded-full">2000+ Openings</span>
              <span className="bg-white/20 px-3 py-1 rounded-full">{currentRole.averageSalary} Avg Salary</span>
              <span className="bg-white/20 px-3 py-1 rounded-full">Remote Options</span>
            </div>
          </div>
        </div>
      </section>

      {/* Role Overview */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-4">Average Salary</h3>
              <div className="text-3xl font-bold text-green-600">{currentRole.averageSalary}</div>
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-4">Experience Range</h3>
              <div className="text-3xl font-bold text-blue-600">{currentRole.experience}</div>
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-4">Top Skills</h3>
              <div className="flex flex-wrap gap-2 justify-center">
                {currentRole.skills.map((skill, index) => (
                  <span key={index} className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-sm">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Jobs Listing */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <JobsHeader />
          <JobsList defaultFilters={{ title: formattedRole }} />
        </div>
      </section>

      {/* Career Guide */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose max-w-none">
            <h2>{formattedRole} Career Guide</h2>
            <p>
              A career as a {formattedRole} offers excellent growth opportunities and competitive 
              compensation. The role requires a combination of technical skills, problem-solving 
              abilities, and continuous learning.
            </p>
            
            <h3>Key Responsibilities</h3>
            <ul>
              <li>Develop and implement solutions to complex technical challenges</li>
              <li>Collaborate with cross-functional teams</li>
              <li>Stay updated with latest industry trends and technologies</li>
              <li>Contribute to product strategy and technical decisions</li>
            </ul>

            <h3>Career Progression</h3>
            <p>
              {formattedRole} professionals typically progress from junior roles to senior positions, 
              with opportunities to specialize in specific technologies or move into leadership roles 
              such as Tech Lead, Engineering Manager, or CTO.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default JobsByRole;
