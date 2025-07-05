
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Header */}
        <div className="text-center mb-4">
          <h1 className="text-xl font-bold text-gray-900 mb-2">Top Companies</h1>
          <p className="text-sm text-gray-600 max-w-2xl mx-auto">
            Discover amazing companies, learn about their culture, and find your next opportunity
          </p>
        </div>

        {/* AI-Powered Company Search */}
        <div className="max-w-2xl mx-auto mb-4">
          <UniversalSearchBar
            searchType="companies"
            onSearch={handleUniversalSearch}
            placeholder="Try: 'fintech startups in Bangalore hiring developers'"
            showSuggestions={true}
            showFilters={true}
          />
        </div>

        {/* Companies Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 rounded-lg h-64"></div>
              </div>
            ))}
          </div>
        ) : companies && companies.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {companies.map((company) => (
              <Card key={company.id} className="group hover:shadow-xl transition-all duration-300 overflow-hidden">
                {/* Company Banner */}
                <div className="relative h-32 bg-gradient-to-r from-blue-500 to-purple-500">
                  {company.cover_image_url ? (
                    <img
                      src={company.cover_image_url}
                      alt={`${company.name} banner`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500" />
                  )}
                  <div className="absolute inset-0 bg-black/20" />
                  
                  {/* Company Logo - Overlapping the banner */}
                  <div className="absolute -bottom-6 left-6">
                    {company.logo_url ? (
                      <img
                        src={company.logo_url}
                        alt={`${company.name} logo`}
                        className="w-16 h-16 rounded-xl border-4 border-white shadow-lg object-cover bg-white"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-white rounded-xl border-4 border-white shadow-lg flex items-center justify-center">
                        <Building2 className="h-8 w-8 text-gray-600" />
                      </div>
                    )}
                  </div>

                  {/* Follow Button */}
                  <div className="absolute top-4 right-4">
                    <Button variant="secondary" size="icon" className="bg-white/20 backdrop-blur-sm border-white/30 hover:bg-white/30">
                      <Heart className="h-4 w-4 text-white" />
                    </Button>
                  </div>
                </div>

                <CardHeader className="pt-8">
                  <div className="space-y-2">
                    <CardTitle className="text-xl group-hover:text-blue-600 transition-colors">
                      {company.name}
                    </CardTitle>
                    <div className="flex flex-wrap gap-2">
                      {company.industry && (
                        <Badge variant="secondary" className="text-xs">
                          {company.industry}
                        </Badge>
                      )}
                      {company.employee_count_range && (
                        <Badge variant="outline" className="text-xs">
                          {company.employee_count_range}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <CardDescription className="line-clamp-2 text-sm leading-relaxed">
                    {company.description || 'Innovative company committed to excellence and growth.'}
                  </CardDescription>
                  
                  <div className="space-y-2">
                    {company.location && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <MapPin className="h-4 w-4" />
                        <span>{company.location}</span>
                      </div>
                    )}
                    {company.founded_year && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Building2 className="h-4 w-4" />
                        <span>Founded in {company.founded_year}</span>
                      </div>
                    )}
                    {company.website && (
                      <div className="flex items-center space-x-2 text-sm">
                        <Globe className="h-4 w-4 text-gray-600" />
                        <a 
                          href={company.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline truncate"
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
                    <div className="flex gap-2">
                      <Link to={`/${company.slug}`}>
                        <Button variant="outline" size="sm">
                          View Profile
                        </Button>
                      </Link>
                      <Link to={`/jobs?company=${company.id}`}>
                        <Button size="sm">
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
          <div className="text-center py-12">
            <Building2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No companies found</h3>
            <p className="text-gray-600">Try adjusting your search criteria</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Companies;
