import React, { useState, useEffect, useCallback } from 'react';
import { Search, Filter, MapPin, Clock, Building2, Users } from 'lucide-react';
import { MobileLayout } from '@/components/mobile/MobileLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

interface Job {
  id: string;
  title: string;
  company_name: string;
  location: string;
  employment_type: string;
  created_at: string;
  companies?: {
    name: string;
    logo_url?: string;
  } | null;
}

interface Person {
  id: string;
  full_name: string;
  title?: string;
  location?: string;
  profile_picture_url?: string;
}

interface Company {
  id: string;
  name: string;
  industry?: string;
  logo_url?: string;
  description?: string;
}

export const MobileSearch: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'jobs' | 'people' | 'companies'>('all');
  const [loading, setLoading] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [counts, setCounts] = useState({ jobs: 0, people: 0, companies: 0 });
  const { toast } = useToast();

  const searchSuggestions = [
    'React Developer',
    'Product Manager', 
    'Data Scientist',
    'UI/UX Designer',
    'Full Stack Engineer',
    'DevOps Engineer',
    'Machine Learning',
    'Frontend Developer'
  ];

  const recentSearches = [
    'Senior Frontend Developer',
    'Remote Java Developer',
    'Marketing Manager Mumbai',
  ];

  const trendingTags = [
    'Remote Work',
    'AI/ML', 
    'Startup',
    'FinTech',
    'Senior Level',
    'Product Management',
  ];

  // Debounced search function
  const performSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setJobs([]);
      setPeople([]);
      setCompanies([]);
      setCounts({ jobs: 0, people: 0, companies: 0 });
      return;
    }

    setLoading(true);
    
    try {
      // Search jobs
      const { data: jobsData, error: jobsError } = await supabase
        .from('jobs')
        .select(`
          id,
          title,
          company_name,
          location,
          employment_type,
          created_at,
          companies!left (
            name,
            logo_url
          )
        `)
        .or(`title.ilike.%${query}%, company_name.ilike.%${query}%, location.ilike.%${query}%`)
        .eq('is_active', true)
        .eq('job_status', 'open')
        .limit(20);

      // Search people
      const { data: peopleData, error: peopleError } = await supabase
        .from('profiles')
        .select('id, full_name, title, location, profile_picture_url')
        .or(`full_name.ilike.%${query}%, title.ilike.%${query}%`)
        .limit(20);

      // Search companies  
      const { data: companiesData, error: companiesError } = await supabase
        .from('companies')
        .select('id, name, industry, logo_url, description')
        .or(`name.ilike.%${query}%, industry.ilike.%${query}%`)
        .limit(20);

      if (jobsError) {
        console.error('Jobs search error:', jobsError);
      } else {
        // Transform the data to match our interface
        const transformedJobs = (jobsData || []).map(job => ({
          ...job,
          companies: Array.isArray(job.companies) && job.companies.length > 0 
            ? job.companies[0] 
            : null
        }));
        setJobs(transformedJobs);
      }

      if (peopleError) {
        console.error('People search error:', peopleError);
      } else {
        setPeople(peopleData || []);
      }

      if (companiesError) {
        console.error('Companies search error:', companiesError);
      } else {
        setCompanies(companiesData || []);
      }

      // Update counts
      setCounts({
        jobs: jobsData?.length || 0,
        people: peopleData?.length || 0,
        companies: companiesData?.length || 0
      });

    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: "Search Error",
        description: "Failed to perform search. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Debounce search queries
  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, performSearch]);

  const totalCount = counts.jobs + counts.people + counts.companies;

  const tabs = [
    { id: 'all', label: 'All', count: totalCount },
    { id: 'jobs', label: 'Jobs', count: counts.jobs },
    { id: 'people', label: 'People', count: counts.people },
    { id: 'companies', label: 'Companies', count: counts.companies },
  ];

  return (
    <MobileLayout>
      <div className="bg-white">
        {/* Search Bar */}
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search jobs, people, companies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-12 h-11 bg-gray-50 border-0 rounded-full"
            />
            <Button
              size="sm"
              variant="ghost"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
            >
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Search Results or Suggestions */}
        {searchQuery ? (
          <div>
            {/* Search Tabs */}
            <div className="flex border-b bg-white sticky top-[60px] z-10">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 py-3 px-4 text-sm font-medium border-b-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500'
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </div>

            {/* Search Results */}
            <ScrollArea className="h-[calc(100vh-180px)]">
              <div className="p-4 space-y-4">
                {loading && (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                  </div>
                )}

                {!loading && (activeTab === 'all' || activeTab === 'jobs') && jobs.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Jobs ({counts.jobs})</h3>
                    {jobs.map((job) => (
                      <Card key={job.id} className="mb-3">
                        <CardContent className="p-4">
                          <div className="flex items-start space-x-3">
                            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                              {job.companies?.logo_url ? (
                                <img 
                                  src={job.companies.logo_url} 
                                  alt={job.companies.name}
                                  className="w-8 h-8 object-contain"
                                />
                              ) : (
                                <Building2 className="h-6 w-6 text-gray-600" />
                              )}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900">{job.title}</h4>
                              <p className="text-sm text-gray-600">
                                {job.companies?.name || job.company_name}
                              </p>
                              <div className="flex items-center space-x-2 mt-1">
                                <MapPin className="h-3 w-3 text-gray-400" />
                                <span className="text-xs text-gray-500">{job.location}</span>
                                <Clock className="h-3 w-3 text-gray-400" />
                                <span className="text-xs text-gray-500">
                                  {formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}
                                </span>
                              </div>
                              <Badge variant="secondary" className="mt-2 text-xs">
                                {job.employment_type}
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                {!loading && (activeTab === 'all' || activeTab === 'people') && people.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">People ({counts.people})</h3>
                    {people.map((person) => (
                      <Card key={person.id} className="mb-3">
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center overflow-hidden">
                              {person.profile_picture_url ? (
                                <img 
                                  src={person.profile_picture_url} 
                                  alt={person.full_name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span className="text-white font-semibold">
                                  {person.full_name.split(' ').map(n => n[0]).join('')}
                                </span>
                              )}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900">{person.full_name}</h4>
                              <p className="text-sm text-gray-600">{person.title || 'Professional'}</p>
                              {person.location && (
                                <div className="flex items-center space-x-1 mt-1">
                                  <MapPin className="h-3 w-3 text-gray-400" />
                                  <span className="text-xs text-gray-500">{person.location}</span>
                                </div>
                              )}
                            </div>
                            <Button size="sm" variant="outline">
                              Connect
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                {!loading && (activeTab === 'all' || activeTab === 'companies') && companies.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Companies ({counts.companies})</h3>
                    {companies.map((company) => (
                      <Card key={company.id} className="mb-3">
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                              {company.logo_url ? (
                                <img 
                                  src={company.logo_url} 
                                  alt={company.name}
                                  className="w-8 h-8 object-contain"
                                />
                              ) : (
                                <Building2 className="h-6 w-6 text-gray-600" />
                              )}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900">{company.name}</h4>
                              <p className="text-sm text-gray-600">{company.industry || 'Company'}</p>
                              {company.description && (
                                <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                  {company.description}
                                </p>
                              )}
                            </div>
                            <Button size="sm" variant="outline">
                              Follow
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                {!loading && searchQuery && totalCount === 0 && (
                  <div className="text-center py-8">
                    <Search className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No results found for "{searchQuery}"</p>
                    <p className="text-xs text-gray-400 mt-1">Try different keywords or check spelling</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        ) : (
          /* Search Suggestions */
          <ScrollArea className="h-[calc(100vh-120px)]">
            <div className="p-4 space-y-6">
              {/* Recent Searches */}
              {recentSearches.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Recent Searches</h3>
                  <div className="space-y-2">
                    {recentSearches.map((search, index) => (
                      <div
                        key={index}
                        className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50"
                        onClick={() => setSearchQuery(search)}
                      >
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-700">{search}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Search Suggestions */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Popular Searches</h3>
                <div className="space-y-2">
                  {searchSuggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50"
                      onClick={() => setSearchQuery(suggestion)}
                    >
                      <Search className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-700">{suggestion}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Trending Tags */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Trending</h3>
                <div className="flex flex-wrap gap-2">
                  {trendingTags.map((tag, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="cursor-pointer hover:bg-blue-100"
                      onClick={() => setSearchQuery(tag)}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </ScrollArea>
        )}
      </div>
    </MobileLayout>
  );
};

export default MobileSearch;