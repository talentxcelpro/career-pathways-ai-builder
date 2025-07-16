
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CompanyFollowButton } from '@/components/company/CompanyFollowButton';
import { Building2, MapPin, Users, Globe, Heart, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSmartAutoRefresh, REFRESH_INTERVALS } from '@/hooks/useAutoRefresh';
import { UniversalSearchBar } from '@/components/search/UniversalSearchBar';
import { SearchFilters } from '@/services/aiSearchService';

const Companies = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: companies, isLoading, refetch } = useQuery({
    queryKey: ['companies', searchTerm],
    queryFn: async () => {
      let query = supabase
        .from('companies')
        .select('*');
      
      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,industry.ilike.%${searchTerm}%,location.ilike.%${searchTerm}%`);
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

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with Apple-inspired styling - more compact and engaging */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-text-primary mb-2 font-display">
            Discover Top Companies
          </h1>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">
            Find your next opportunity with amazing companies
          </p>
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
                      {company.employee_count_range && (
                        <Badge variant="outline" className="text-sm px-3 py-1 border-gray-200 text-text-secondary rounded-xl">
                          {company.employee_count_range}
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
                    {company.location && (
                      <div className="flex items-center space-x-3 text-text-secondary">
                        <MapPin className="h-5 w-5" />
                        <span className="text-base">{company.location}</span>
                      </div>
                    )}
                    {company.founded_year && (
                      <div className="flex items-center space-x-3 text-text-secondary">
                        <Building2 className="h-5 w-5" />
                        <span className="text-base">Founded in {company.founded_year}</span>
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
                      <Link to={`/${company.slug}`}>
                        <Button variant="outline" size="sm" className="rounded-xl border-gray-200 text-text-secondary hover:bg-gray-50">
                          View Profile
                        </Button>
                      </Link>
                      <Link to={`/jobs?company=${company.id}`}>
                        <Button size="sm" className="rounded-xl shadow-apple-light">
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
      </div>
    </div>
  );
};

export default Companies;
