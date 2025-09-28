import React, { useState, useEffect, useCallback } from 'react';
import { Search, Filter, MapPin, Clock, Building2, Users } from 'lucide-react';
import { MobileNavWrapper } from '@/components/layout/MobileNavWrapper';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface SearchResult {
  id: string;
  title: string;
  company: string;
  location: string;
  type: 'job' | 'person' | 'company';
}

export const MobileSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState({
    location: '',
    jobType: '',
    experience: ''
  });

  const [searchResults] = useState<SearchResult[]>([
    {
      id: '1',
      title: 'Senior Software Engineer',
      company: 'TechCorp',
      location: 'Bangalore, India',
      type: 'job'
    },
    {
      id: '2',
      title: 'John Doe',
      company: 'Product Manager at StartupXYZ',
      location: 'Mumbai, India',
      type: 'person'
    },
    {
      id: '3',
      title: 'Google Inc.',
      company: 'Technology Company',
      location: 'Mountain View, CA',
      type: 'company'
    }
  ]);

  const filteredResults = searchResults.filter(result => 
    result.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    result.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <MobileNavWrapper>
      <div className="bg-white native-app-style ios-scroll">
        {/* Search Bar */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 safe-area-top">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search jobs, people, companies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-gray-50 border-gray-200 touch-feedback"
              />
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowFilters(!showFilters)}
              className="touch-feedback"
            >
              <Filter className="w-4 h-4" />
            </Button>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="mt-4 space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Location</label>
                <Input
                  placeholder="Enter city..."
                  value={filters.location}
                  onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                  className="bg-gray-50 border-gray-200"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Job Type</label>
                <select
                  value={filters.jobType}
                  onChange={(e) => setFilters(prev => ({ ...prev, jobType: e.target.value }))}
                  className="w-full p-2 border border-gray-200 rounded-md bg-gray-50"
                >
                  <option value="">All Types</option>
                  <option value="full-time">Full-time</option>
                  <option value="part-time">Part-time</option>
                  <option value="contract">Contract</option>
                  <option value="remote">Remote</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Experience</label>
                <select
                  value={filters.experience}
                  onChange={(e) => setFilters(prev => ({ ...prev, experience: e.target.value }))}
                  className="w-full p-2 border border-gray-200 rounded-md bg-gray-50"
                >
                  <option value="">All Levels</option>
                  <option value="entry">Entry Level</option>
                  <option value="mid">Mid Level</option>
                  <option value="senior">Senior Level</option>
                  <option value="executive">Executive</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Search Results */}
        <div className="p-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              {/* Search Suggestions */}
              {searchTerm === '' && (
                <div className="space-y-4">
                  <div className="native-card p-4">
                    <h3 className="font-semibold text-gray-900 mb-3">Popular Searches</h3>
                    <div className="flex flex-wrap gap-2">
                      {['Software Engineer', 'Product Manager', 'Data Scientist', 'UI Designer', 'Marketing Manager'].map((term) => (
                        <button
                          key={term}
                          onClick={() => setSearchTerm(term)}
                          className="px-3 py-1.5 bg-gray-100 rounded-full text-sm text-gray-700 touch-feedback"
                        >
                          {term}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="native-card p-4">
                    <h3 className="font-semibold text-gray-900 mb-3">Recent Searches</h3>
                    <div className="space-y-2">
                      {['React Developer Bangalore', 'Remote Python Jobs', 'Startup Jobs Mumbai'].map((search, index) => (
                        <div key={index} className="flex items-center gap-3 py-2 touch-feedback">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{search}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Search Results */}
              {searchTerm && filteredResults.length > 0 && (
                <div className="space-y-3">
                  {filteredResults.map((result) => (
                    <div key={result.id} className="native-card p-4 touch-feedback">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                          {result.type === 'job' ? (
                            <Building2 className="w-5 h-5 text-gray-600" />
                          ) : result.type === 'person' ? (
                            <Users className="w-5 h-5 text-gray-600" />
                          ) : (
                            <Building2 className="w-5 h-5 text-gray-600" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 text-sm">{result.title}</h3>
                          <p className="text-sm text-gray-600 mt-1">{result.company}</p>
                          <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                            <MapPin className="w-3 h-3" />
                            <span>{result.location}</span>
                            {result.type === 'job' && (
                              <>
                                <span>•</span>
                                <Clock className="w-3 h-3" />
                                <span>Full-time</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* No Results */}
              {searchTerm && filteredResults.length === 0 && !isLoading && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">No results found</h3>
                  <p className="text-sm text-gray-600">Try adjusting your search terms or filters</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </MobileNavWrapper>
  );
};

export default MobileSearch;