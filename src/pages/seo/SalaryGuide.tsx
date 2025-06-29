
import React from 'react';
import { useParams } from 'react-router-dom';
import { useSEO } from '@/hooks/useSEO';
import { SEOHead } from '@/components/seo/SEOHead';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const SalaryGuide = () => {
  const { role } = useParams<{ role: string }>();
  const formattedRole = role?.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) || '';

  const { data: salaryData = [] } = useQuery({
    queryKey: ['salary-data', role],
    queryFn: async () => {
      const { data } = await supabase
        .from('salary_data')
        .select('*')
        .ilike('job_title', `%${formattedRole}%`)
        .order('salary_range_max', { ascending: false })
        .limit(20);
      return data || [];
    }
  });

  const seoConfig = {
    title: `${formattedRole} Salary in India | ${formattedRole} Pay Scale | TalentXcel`,
    description: `Discover ${formattedRole} salary ranges in India. Compare ${formattedRole} salaries by experience, location, and company. Get insights into compensation trends and negotiation tips.`,
    keywords: [
      `${formattedRole.toLowerCase()} salary`,
      `${formattedRole.toLowerCase()} pay scale`,
      `${formattedRole.toLowerCase()} compensation`,
      'salary guide',
      'pay trends',
      'salary negotiation'
    ],
    canonical: `/salary/${role}`,
    structuredData: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": `${formattedRole} Salary Guide`,
      "description": `Comprehensive salary information for ${formattedRole} positions`,
      "author": {
        "@type": "Organization",
        "name": "TalentXcel"
      }
    })
  };

  useSEO(seoConfig);

  const calculateAverageSalary = () => {
    if (salaryData.length === 0) return '₹8L - ₹15L';
    const avgMin = salaryData.reduce((sum, item) => sum + (item.salary_range_min || 0), 0) / salaryData.length;
    const avgMax = salaryData.reduce((sum, item) => sum + (item.salary_range_max || 0), 0) / salaryData.length;
    return `₹${Math.round(avgMin/100000)}L - ₹${Math.round(avgMax/100000)}L`;
  };

  const experienceLevels = [
    { level: 'Entry Level (0-2 years)', multiplier: 0.7 },
    { level: 'Mid Level (3-5 years)', multiplier: 1.0 },
    { level: 'Senior Level (6-8 years)', multiplier: 1.4 },
    { level: 'Lead Level (9+ years)', multiplier: 1.8 }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <SEOHead {...seoConfig} />
      
      <section className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              {formattedRole} Salary Guide
            </h1>
            <p className="text-xl mb-8 max-w-3xl mx-auto">
              Comprehensive salary information for {formattedRole} positions in India. 
              Compare compensation across experience levels, locations, and companies.
            </p>
            <div className="text-3xl font-bold bg-white/20 px-6 py-3 rounded-lg inline-block">
              {calculateAverageSalary()}
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-8 text-center">Salary by Experience Level</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {experienceLevels.map((exp, index) => (
              <div key={index} className="bg-gradient-to-br from-emerald-50 to-teal-50 p-6 rounded-lg border">
                <h3 className="font-semibold mb-2">{exp.level}</h3>
                <div className="text-2xl font-bold text-emerald-600">
                  ₹{Math.round(8 * exp.multiplier)}L - ₹{Math.round(15 * exp.multiplier)}L
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-8">Salary by Location</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {salaryData.slice(0, 9).map((salary, index) => (
              <div key={index} className="bg-white rounded-lg border p-6">
                <h3 className="text-lg font-semibold mb-2">{salary.location}</h3>
                <div className="text-xl font-bold text-emerald-600">
                  ₹{Math.round((salary.salary_range_min || 0)/100000)}L - ₹{Math.round((salary.salary_range_max || 0)/100000)}L
                </div>
                <p className="text-sm text-gray-600 mt-2">{salary.job_title}</p>
              </div>
            ))}
          </div>
          
          {salaryData.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">Salary data is being updated. Check back soon for detailed information.</p>
            </div>
          )}
        </div>
      </section>

      <section className="py-12 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose max-w-none">
            <h2>Understanding {formattedRole} Compensation</h2>
            <p>
              {formattedRole} salaries in India vary significantly based on factors such as 
              experience level, location, company size, industry, and specific skills. 
              Metropolitan cities typically offer higher compensation to offset living costs.
            </p>
            
            <h3>Factors Affecting Salary</h3>
            <ul>
              <li><strong>Experience Level:</strong> More experience generally leads to higher compensation</li>
              <li><strong>Location:</strong> Tier-1 cities offer premium salaries</li>
              <li><strong>Company Size:</strong> Large corporations often provide better packages</li>
              <li><strong>Industry:</strong> Tech, finance, and consulting typically pay more</li>
              <li><strong>Skills:</strong> Specialized and in-demand skills command premium</li>
            </ul>

            <h3>Negotiation Tips</h3>
            <ul>
              <li>Research market rates for your role and experience</li>
              <li>Highlight your unique skills and achievements</li>
              <li>Consider the complete compensation package, not just base salary</li>
              <li>Be prepared to discuss your value proposition</li>
              <li>Time your negotiation appropriately</li>
            </ul>

            <h3>Beyond Base Salary</h3>
            <p>
              Modern compensation packages include various components beyond base salary:
              performance bonuses, stock options, health insurance, retirement benefits,
              flexible work arrangements, and professional development opportunities.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SalaryGuide;
