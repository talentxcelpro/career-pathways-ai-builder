
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CompanyFollowButton } from '@/components/company/CompanyFollowButton';
import { Building2, MapPin, Users, Globe, Heart, Search, Award, Briefcase, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSmartAutoRefresh, REFRESH_INTERVALS } from '@/hooks/useAutoRefresh';
import { UniversalSearchBar } from '@/components/search/UniversalSearchBar';
import { SearchFilters } from '@/services/aiSearchService';
import { updateMetaTags } from '@/utils/metaTags';
import { MobileViabilityWrapper, MobileModuleHeader, MobileSection, MobileGrid } from '@/components/mobile/MobileViabilityWrapper';
import { MobileButton, MobileInput, MobileCard, MobileTypography } from '@/components/mobile/MobileOptimizedComponents';
import { useMobileOptimizations } from '@/hooks/useMobileOptimizations';

const Companies = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { isMobile } = useMobileOptimizations();

  const { data: companies, isLoading, refetch } = useQuery({
    queryKey: ['companies', searchTerm],
    queryFn: async () => {
      let query = supabase
        .from('companies')
        .select('*');
      
      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,industry.ilike.%${searchTerm}%,headquarters_location.ilike.%${searchTerm}%`);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  // Auto-refresh companies data every 30 seconds
  useSmartAutoRefresh(() => {
    refetch();
  }, REFRESH_INTERVALS.COMPANIES);

  const handleUniversalSearch = (query: string, aiFilters?: SearchFilters) => {
    if (aiFilters && aiFilters.query) {
      setSearchTerm(aiFilters.query);
    } else {
      setSearchTerm(query);
    }
  };

  // SEO meta tags and structured data
  React.useEffect(() => {
    updateMetaTags({
      title: 'Top Companies Hiring in India | Company Profiles & Jobs | TalentXcel',
      description: 'Explore 500+ top companies hiring in India. Get insights into company culture, salaries, interview process, and current job openings. Make informed career decisions.',
      url: `${window.location.origin}/companies`,
      keywords: ['top companies india', 'company profiles', 'employer reviews', 'company culture', 'hiring companies', 'career opportunities'],
      type: 'website',
      image: '/lovable-uploads/711de76d-0f05-4939-b8b5-4acd21eb3119.png'
    });

    // Add Organization structured data
    const organizationSchema = {
      "@context": "https://schema.org/",
      "@type": "CollectionPage",
      "name": "Top Companies - TalentXcel",
      "description": "Discover top companies hiring in India with detailed profiles and job opportunities",
      "url": `${window.location.origin}/companies`,
      "mainEntity": {
        "@type": "Organization",
        "name": "TalentXcel",
        "url": "https://talentxcel.in",
        "description": "India's AI-powered career platform connecting talent with opportunities"
      }
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(organizationSchema);
    script.id = 'companies-schema';
    
    const existing = document.getElementById('companies-schema');
    if (existing) existing.remove();
    
    document.head.appendChild(script);

    return () => {
      const schemaScript = document.getElementById('companies-schema');
      if (schemaScript) schemaScript.remove();
    };
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with TalentXcel branding */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <img 
              src="/lovable-uploads/6d89e12a-6a33-4059-acbe-49af3b255eb3.png" 
              alt="TalentXcel" 
              className="h-12 w-12 rounded-lg"
            />
            <div>
            <h1 className="text-2xl font-bold text-[#1E2A78] mb-1 font-display">
                Discover Top Companies Hiring Now
              </h1>
              <p className="text-text-secondary">
                Find your next opportunity with amazing companies - Powered by TalentXcel AI
              </p>
            </div>
          </div>
        </div>

        {/* AI-Powered Company Search with glassmorphism - more compact */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="bg-white/80 backdrop-blur-apple rounded-2xl shadow-apple-light p-4 border border-gray-100">
            <UniversalSearchBar
              searchType="companies"
              onSearch={handleUniversalSearch}
              placeholder="Try: 'fintech startups in Bangalore hiring developers'"
              showSuggestions={true}
              showFilters={true}
            />
          </div>
        </div>

        {/* Enterprise Solutions CTA */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-center text-white mb-12">
          <h2 className="text-2xl lg:text-3xl font-bold mb-4 font-display">
            Looking for Enterprise Solutions?
          </h2>
          <p className="text-lg mb-6 opacity-90">
            Discover our B2B services for internal mobility, skill gap analysis, talent analytics, and specialized recruitment
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              variant="secondary" 
              className="bg-white text-primary hover:bg-gray-100"
              onClick={() => window.location.href = '/enterprise/solutions'}
            >
              Explore Enterprise Solutions
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-white text-white hover:bg-white hover:text-primary"
              onClick={() => window.location.href = '/enterprise'}
            >
              Enterprise Dashboard
            </Button>
          </div>
        </div>

        {/* Companies Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-100 rounded-2xl h-80 shadow-apple-light"></div>
              </div>
            ))}
          </div>
        ) : companies && companies.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {companies.map((company) => (
              <Card key={company.id} className="group hover:shadow-apple-heavy transition-all duration-300 overflow-hidden border-0 bg-white/90 backdrop-blur-sm rounded-2xl">
                {/* Company Banner */}
                <div className="relative h-40 bg-gradient-to-r from-blue-500 to-purple-500 rounded-t-2xl">
                  {company.cover_image_url ? (
                    <img
                      src={company.cover_image_url}
                      alt={`${company.name} banner`}
                      className="w-full h-full object-cover rounded-t-2xl"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-t-2xl" />
                  )}
                  <div className="absolute inset-0 bg-black/10 rounded-t-2xl" />
                  
                  {/* Company Logo - Overlapping the banner */}
                  <div className="absolute -bottom-8 left-6">
                    {company.logo_url ? (
                      <img
                        src={company.logo_url}
                        alt={`${company.name} logo`}
                        className="w-20 h-20 rounded-2xl border-4 border-white shadow-apple-medium object-cover bg-white"
                      />
                    ) : (
                      <div className="w-20 h-20 bg-white rounded-2xl border-4 border-white shadow-apple-medium flex items-center justify-center">
                        <Building2 className="h-10 w-10 text-text-secondary" />
                      </div>
                    )}
                  </div>

                  {/* Follow Button */}
                  <div className="absolute top-4 right-4">
                    <Button variant="secondary" size="icon" className="bg-white/20 backdrop-blur-sm border-white/30 hover:bg-white/40 rounded-xl transition-all duration-200">
                      <Heart className="h-4 w-4 text-white" />
                    </Button>
                  </div>
                </div>

                <CardHeader className="pt-12 pb-4">
                  <div className="space-y-3">
                    <CardTitle className="text-2xl font-bold text-text-primary group-hover:text-primary transition-colors font-display">
                      {company.name}
                    </CardTitle>
                    <div className="flex flex-wrap gap-2">
                      {company.industry && (
                        <Badge variant="secondary" className="text-sm px-3 py-1 bg-gray-100 text-text-secondary border-0 rounded-xl">
                          {company.industry}
                        </Badge>
                      )}
                      {company.company_size && (
                        <Badge variant="outline" className="text-sm px-3 py-1 border-gray-200 text-text-secondary rounded-xl">
                          {company.company_size}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6 px-6 pb-6">
                  <CardDescription className="line-clamp-2 text-base leading-relaxed text-text-secondary">
                    {company.description || 'Innovative company committed to excellence and growth.'}
                  </CardDescription>
                  
                  <div className="space-y-3">
                    {company.headquarters_location && (
                      <div className="flex items-center space-x-3 text-text-secondary">
                        <MapPin className="h-5 w-5" />
                        <span className="text-base">{company.headquarters_location}</span>
                      </div>
                    )}
                    {company.founding_year && (
                      <div className="flex items-center space-x-3 text-text-secondary">
                        <Building2 className="h-5 w-5" />
                        <span className="text-base">Founded in {company.founding_year}</span>
                      </div>
                    )}
                    {company.website && (
                      <div className="flex items-center space-x-3">
                        <Globe className="h-5 w-5 text-text-secondary" />
                        <a 
                          href={company.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:text-primary/80 truncate text-base font-medium transition-colors"
                        >
                          Visit Website
                        </a>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-4">
                    <CompanyFollowButton 
                      companyId={company.id}
                      size="sm"
                      variant="outline"
                      showFollowersCount={false}
                    />
                     <div className="flex gap-3">
                       <Link to={`/company/${company.slug}`}>
                         <Button variant="outline" size="sm" className="rounded-xl border-gray-200 text-text-secondary hover:bg-gray-50">
                           View Profile
                         </Button>
                       </Link>
                      <Link to={`/jobs?company=${company.id}`}>
                        <Button size="sm" className="rounded-xl bg-[#28C76F] hover:bg-[#28C76F]/90 text-white shadow-apple-light">
                          View Jobs
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <Building2 className="h-20 w-20 text-gray-300 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-text-primary mb-3 font-display">No companies found</h3>
            <p className="text-xl text-text-secondary">Try adjusting your search criteria</p>
          </div>
        )}
        
        {/* Footer Note */}
        <div className="text-center py-8 mt-12">
          <p className="text-sm text-text-secondary">
            Powered by TalentXcel AI – India's Intelligent Career Platform
          </p>
        </div>
      </div>
    </div>
  );
};

export default Companies;
