
import React from 'react';
import { useParams } from 'react-router-dom';
import { useSEO } from '@/hooks/useSEO';
import { SEOHead } from '@/components/seo/SEOHead';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const CompaniesByLocation = () => {
  const { location } = useParams<{ location: string }>();
  const formattedLocation = location?.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) || '';

  const { data: companiesData = [] } = useQuery({
    queryKey: ['companies', location],
    queryFn: async () => {
      const { data } = await supabase
        .from('companies')
        .select('*')
        .ilike('location', `%${formattedLocation}%`)
        .order('created_at', { ascending: false })
        .limit(50);
      return data || [];
    }
  });

  const seoConfig = {
    title: `Top Companies in ${formattedLocation} | ${formattedLocation} Employers | TalentXcel`,
    description: `Discover leading companies hiring in ${formattedLocation}. Explore company profiles, culture, benefits, and current job openings from top employers in ${formattedLocation}.`,
    keywords: [
      `companies in ${formattedLocation.toLowerCase()}`,
      `${formattedLocation.toLowerCase()} employers`,
      `${formattedLocation.toLowerCase()} companies hiring`,
      'company profiles',
      'employer reviews',
      'company culture'
    ],
    canonical: `/companies/location/${location}`,
    structuredData: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "ItemList",
      "name": `Companies in ${formattedLocation}`,
      "description": `Top companies and employers in ${formattedLocation}`,
      "url": `https://talentxcel.in/companies/location/${location}`,
      "numberOfItems": companiesData.length
    })
  };

  useSEO(seoConfig);

  return (
    <div className="min-h-screen bg-gray-50">
      <SEOHead {...seoConfig} />
      
      <section className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Companies in {formattedLocation}
            </h1>
            <p className="text-xl mb-8 max-w-3xl mx-auto">
              Discover top employers and innovative companies in {formattedLocation}. 
              Explore company cultures, benefits, and current job opportunities.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <span className="bg-white/20 px-3 py-1 rounded-full">{companiesData.length}+ Companies</span>
              <span className="bg-white/20 px-3 py-1 rounded-full">All Industries</span>
              <span className="bg-white/20 px-3 py-1 rounded-full">Verified Profiles</span>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-8">Featured Companies in {formattedLocation}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {companiesData.map((company) => (
              <div key={company.id} className="bg-white rounded-lg border p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center mb-4">
                  {company.logo_url && (
                    <img 
                      src={company.logo_url} 
                      alt={`${company.name} logo`}
                      className="w-12 h-12 rounded-lg mr-4"
                    />
                  )}
                  <div>
                    <h3 className="text-xl font-semibold">{company.name}</h3>
                    <p className="text-gray-600">{company.industry}</p>
                  </div>
                </div>
                <p className="text-gray-700 mb-4 line-clamp-3">{company.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">{company.size_range}</span>
                  <button className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">
                    View Profile
                  </button>
                </div>
              </div>
            ))}
          </div>

          {companiesData.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No companies found for {formattedLocation}. Check back later for updates.</p>
            </div>
          )}
        </div>
      </section>

      <section className="py-12 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose max-w-none">
            <h2>Business Ecosystem in {formattedLocation}</h2>
            <p>
              {formattedLocation} has developed into a thriving business hub with companies 
              ranging from innovative startups to established enterprises. The city offers 
              excellent infrastructure, talent pool, and business opportunities across various industries.
            </p>
            
            <h3>Key Industries</h3>
            <ul>
              <li>Information Technology & Software Development</li>
              <li>Financial Services & Fintech</li>
              <li>E-commerce & Digital Services</li>
              <li>Healthcare & Biotechnology</li>
              <li>Manufacturing & Engineering</li>
            </ul>

            <h3>Why Companies Choose {formattedLocation}</h3>
            <ul>
              <li>Access to skilled talent and educational institutions</li>
              <li>Strategic location and connectivity</li>
              <li>Government support and business-friendly policies</li>
              <li>Growing startup ecosystem and innovation culture</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CompaniesByLocation;
