import React, { useState } from 'react';
import { Search, Filter, MapPin, Clock, Building2, Users } from 'lucide-react';
import { MobileLayout } from '@/components/mobile/MobileLayout';
import { TalentXcelMobileHeader } from '@/components/mobile/TalentXcelMobileHeader';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

export const MobileSearch: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'jobs' | 'people' | 'companies'>('all');

  const searchSuggestions = [
    'React Developer',
    'Product Manager',
    'Data Scientist',
    'UI/UX Designer',
    'Full Stack Engineer',
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

  const mockResults = {
    jobs: [
      {
        id: 1,
        title: 'Senior React Developer',
        company: 'TechCorp',
        location: 'Mumbai, India',
        type: 'Full-time',
        posted: '2 days ago',
        logo: '/placeholder.svg'
      },
      {
        id: 2,
        title: 'Product Manager',
        company: 'StartupXYZ',
        location: 'Bangalore, India',
        type: 'Full-time',
        posted: '1 day ago',
        logo: '/placeholder.svg'
      }
    ],
    people: [
      {
        id: 1,
        name: 'Sarah Johnson',
        title: 'Senior Software Engineer at Google',
        location: 'San Francisco, CA',
        mutualConnections: 12,
        avatar: '/placeholder.svg'
      },
      {
        id: 2,
        name: 'Raj Patel',
        title: 'Product Manager at Microsoft',
        location: 'Seattle, WA',
        mutualConnections: 8,
        avatar: '/placeholder.svg'
      }
    ],
    companies: [
      {
        id: 1,
        name: 'Google',
        industry: 'Technology',
        employees: '100,000+ employees',
        followers: '25M followers',
        logo: '/placeholder.svg'
      }
    ]
  };

  const tabs = [
    { id: 'all', label: 'All', count: 142 },
    { id: 'jobs', label: 'Jobs', count: 89 },
    { id: 'people', label: 'People', count: 34 },
    { id: 'companies', label: 'Companies', count: 19 },
  ];

  return (
    <MobileLayout>
      <TalentXcelMobileHeader />
      
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
                {(activeTab === 'all' || activeTab === 'jobs') && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Jobs</h3>
                    {mockResults.jobs.map((job) => (
                      <Card key={job.id} className="mb-3">
                        <CardContent className="p-4">
                          <div className="flex items-start space-x-3">
                            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                              <Building2 className="h-6 w-6 text-gray-600" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900">{job.title}</h4>
                              <p className="text-sm text-gray-600">{job.company}</p>
                              <div className="flex items-center space-x-2 mt-1">
                                <MapPin className="h-3 w-3 text-gray-400" />
                                <span className="text-xs text-gray-500">{job.location}</span>
                                <Clock className="h-3 w-3 text-gray-400" />
                                <span className="text-xs text-gray-500">{job.posted}</span>
                              </div>
                              <Badge variant="secondary" className="mt-2 text-xs">
                                {job.type}
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                {(activeTab === 'all' || activeTab === 'people') && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">People</h3>
                    {mockResults.people.map((person) => (
                      <Card key={person.id} className="mb-3">
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                              <span className="text-white font-semibold">
                                {person.name.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900">{person.name}</h4>
                              <p className="text-sm text-gray-600">{person.title}</p>
                              <div className="flex items-center space-x-1 mt-1">
                                <Users className="h-3 w-3 text-gray-400" />
                                <span className="text-xs text-gray-500">
                                  {person.mutualConnections} mutual connections
                                </span>
                              </div>
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

                {(activeTab === 'all' || activeTab === 'companies') && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Companies</h3>
                    {mockResults.companies.map((company) => (
                      <Card key={company.id} className="mb-3">
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                              <Building2 className="h-6 w-6 text-gray-600" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900">{company.name}</h4>
                              <p className="text-sm text-gray-600">{company.industry}</p>
                              <p className="text-xs text-gray-500">{company.employees}</p>
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